package com.foodchain.service;

import com.foodchain.domain.DeviceToken;
import com.foodchain.domain.Role;
import com.foodchain.domain.User;
import com.foodchain.repo.DeviceTokenRepository;
import com.foodchain.repo.UserRepository;
import com.foodchain.service.sms.SmsSender;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Notifications:
 * - FCM Push (optional)
 * - SMS (recommended for prod; supports Twilio via env vars)
 */
@Service
public class NotificationService {

    private final DeviceTokenRepository tokenRepo;
    private final UserRepository userRepo;
    private final Optional<FirebaseMessaging> firebaseMessaging;
    private final SmsSender smsSender;

    private final boolean smsEnabled;
    private final boolean smsNotifyDriversNewTasks;

    public NotificationService(
            DeviceTokenRepository tokenRepo,
            UserRepository userRepo,
            Optional<FirebaseMessaging> firebaseMessaging,
            SmsSender smsSender,
            @Value("${foodchain.sms.enabled:false}") boolean smsEnabled,
            @Value("${foodchain.notifications.smsNotifyDriversNewTasks:false}") boolean smsNotifyDriversNewTasks
    ) {
        this.tokenRepo = tokenRepo;
        this.userRepo = userRepo;
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

    public void notifyDriversNewDelivery(long deliveryId) {
        // Push notifications to drivers (if enabled)
        List<User> drivers = userRepo.findByRole(Role.DRIVER);
        for (User d : drivers) {
            notifyUser(d, "New delivery available", "Delivery #" + deliveryId + " is ready to be claimed.", smsNotifyDriversNewTasks);
        }
    }

    public void notifyDeliveryStatus(long deliveryId, User donor, User recipient, User driver, String status) {
        String title = "Delivery update";
        String body = "Delivery #" + deliveryId + " is now " + status + ".";
        notifyUser(donor, title, body, true);
        notifyUser(recipient, title, body, true);
        if (driver != null) notifyUser(driver, title, body, true);
    }

    private void notifyUser(User user, String title, String body, boolean alsoSms) {
        if (user == null) return;

        // Push (FCM)
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
                    // If the token is invalid/expired, drop it.
                    tokenRepo.deleteByToken(dt.getToken());
                }
            }
        }

        // SMS
        if (smsEnabled && alsoSms && user.isPhoneVerified() && user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank()) {
            try {
                smsSender.sendSms(user.getPhoneNumber(), "FoodChain: " + body);
            } catch (Exception ignored) {
                // Non-fatal
            }
        }
    }
}
