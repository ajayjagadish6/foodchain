package com.foodchain.service;

import com.foodchain.domain.DeliveryLocation;
import com.foodchain.domain.DeviceToken;
import com.foodchain.domain.DriverSchedule;
import com.foodchain.domain.Role;
import com.foodchain.domain.User;
import com.foodchain.repo.DeliveryLocationRepository;
import com.foodchain.repo.DeliveryRepository;
import com.foodchain.repo.DeviceTokenRepository;
import com.foodchain.repo.DriverScheduleRepository;
import com.foodchain.repo.UserRepository;
import com.foodchain.service.sms.SmsSender;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Notifications:
 *  - FCM Push (optional)
 *  - SMS (Twilio, optional)
 *
 * Smart driver dispatch:
 *  1. Filter by availability (driver_schedules covering current day + time).
 *     If a driver has no schedule rows they are treated as always available.
 *  2. Sort available drivers by distance from pickup location.
 *     Uses last known GPS ping, falling back to org_lat/org_lng, then "unknown".
 *  3. Notify the nearest MAX_NOTIFY_DRIVERS drivers (push + SMS).
 *     If no available drivers are found, falls back to all drivers.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final int MAX_NOTIFY_DRIVERS = 5;

    private final DeviceTokenRepository tokenRepo;
    private final UserRepository userRepo;
    private final DeliveryRepository deliveryRepo;
    private final DeliveryLocationRepository locationRepo;
    private final DriverScheduleRepository scheduleRepo;
    private final Optional<FirebaseMessaging> firebaseMessaging;
    private final SmsSender smsSender;

    private final boolean smsEnabled;
    private final boolean smsNotifyDriversNewTasks;

    public NotificationService(
            DeviceTokenRepository tokenRepo,
            UserRepository userRepo,
            DeliveryRepository deliveryRepo,
            DeliveryLocationRepository locationRepo,
            DriverScheduleRepository scheduleRepo,
            Optional<FirebaseMessaging> firebaseMessaging,
            SmsSender smsSender,
            @Value("${foodchain.sms.enabled:false}") boolean smsEnabled,
            @Value("${foodchain.notifications.smsNotifyDriversNewTasks:false}") boolean smsNotifyDriversNewTasks
    ) {
        this.tokenRepo = tokenRepo;
        this.userRepo = userRepo;
        this.deliveryRepo = deliveryRepo;
        this.locationRepo = locationRepo;
        this.scheduleRepo = scheduleRepo;
        this.firebaseMessaging = firebaseMessaging;
        this.smsSender = smsSender;
        this.smsEnabled = smsEnabled;
        this.smsNotifyDriversNewTasks = smsNotifyDriversNewTasks;
    }

    public void registerDeviceToken(long userId, String token, String platform) {
        tokenRepo.findByToken(token).ifPresentOrElse(existing -> {
            if (existing.getUser() == null || existing.getUser().getId() != userId) {
                existing.setUser(userRepo.findById(userId).orElseThrow());
            }
            if (platform != null && !platform.isBlank()) existing.setPlatform(platform);
            tokenRepo.save(existing);
        }, () -> {
            DeviceToken dt = new DeviceToken();
            dt.setUser(userRepo.findById(userId).orElseThrow());
            dt.setToken(token);
            if (platform != null && !platform.isBlank()) dt.setPlatform(platform);
            tokenRepo.save(dt);
        });
    }

    // ── Driver dispatch ───────────────────────────────────────────────────────

    public void notifyDriversNewDelivery(long deliveryId) {
        var delivery = deliveryRepo.findById(deliveryId).orElse(null);
        if (delivery == null) return;

        double pickupLat = delivery.getDonation().getPickupLat();
        double pickupLng = delivery.getDonation().getPickupLng();
        String pickupAddress = delivery.getDonation().getPickupAddress();

        String dayCode = dayCode(LocalDate.now().getDayOfWeek());
        LocalTime now = LocalTime.now();

        List<User> allDrivers = userRepo.findByRole(Role.DRIVER);

        // 1. Filter to available (schedule covers now, or no schedule at all)
        List<User> available = allDrivers.stream()
                .filter(d -> isAvailable(d, dayCode, now))
                .toList();

        // 2. Fall back to all drivers if nobody has set a schedule
        List<User> candidates = available.isEmpty() ? allDrivers : available;

        // 3. Sort by distance to pickup, notify nearest MAX_NOTIFY_DRIVERS
        List<User> nearest = candidates.stream()
                .sorted(Comparator.comparingDouble(d -> distanceToPickup(d, pickupLat, pickupLng)))
                .limit(MAX_NOTIFY_DRIVERS)
                .toList();

        log.info("Delivery #{}: notifying {}/{} available drivers (nearest first)",
                deliveryId, nearest.size(), candidates.size());

        String body = "Delivery #" + deliveryId + " ready for pickup at " + pickupAddress;
        for (User d : nearest) {
            notifyUser(d, "New delivery available", body, smsNotifyDriversNewTasks);
        }
    }

    private boolean isAvailable(User driver, String dayCode, LocalTime now) {
        List<DriverSchedule> schedules = scheduleRepo.findByDriver(driver);
        if (schedules.isEmpty()) return true; // no schedule set → always available
        return schedules.stream().anyMatch(s ->
                s.getDayOfWeek().equalsIgnoreCase(dayCode)
                && !now.isBefore(s.getStartTime())
                && !now.isAfter(s.getEndTime()));
    }

    private double distanceToPickup(User driver, double pickupLat, double pickupLng) {
        // Try last GPS ping from any previous delivery
        Optional<DeliveryLocation> last = locationRepo.findLatestForDriver(driver.getId());
        if (last.isPresent()) {
            return Geo.distanceKm(last.get().getLat(), last.get().getLng(), pickupLat, pickupLng);
        }
        // Fall back to org home-base address
        if (driver.getOrgLat() != null && driver.getOrgLng() != null) {
            return Geo.distanceKm(driver.getOrgLat(), driver.getOrgLng(), pickupLat, pickupLng);
        }
        // Unknown location — put at the end but still include in top-N
        return Double.MAX_VALUE;
    }

    private static String dayCode(DayOfWeek dow) {
        return dow.name().substring(0, 3); // MONDAY → MON
    }

    // ── Status notifications ──────────────────────────────────────────────────

    public void notifyDeliveryStatus(long deliveryId, User donor, User recipient, User driver, String status) {
        String title = "Delivery update";
        String body = "Delivery #" + deliveryId + " is now " + status + ".";
        notifyUser(donor, title, body, true);
        notifyUser(recipient, title, body, true);
        if (driver != null) notifyUser(driver, title, body, true);
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    private void notifyUser(User user, String title, String body, boolean alsoSms) {
        if (user == null) return;

        // FCM push
        if (firebaseMessaging.isPresent()) {
            var tokens = tokenRepo.findByUser(user);
            for (DeviceToken dt : tokens) {
                try {
                    Message msg = Message.builder()
                            .setToken(dt.getToken())
                            .setNotification(Notification.builder().setTitle(title).setBody(body).build())
                            .putData("userId", String.valueOf(user.getId()))
                            .build();
                    firebaseMessaging.get().send(msg);
                } catch (Exception ex) {
                    tokenRepo.deleteByToken(dt.getToken());
                }
            }
        }

        // SMS
        if (smsEnabled && alsoSms && user.isPhoneVerified()
                && user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank()) {
            try {
                smsSender.sendSms(user.getPhoneNumber(), "FoodChain: " + body);
            } catch (Exception ignored) { /* non-fatal */ }
        }
    }
}
