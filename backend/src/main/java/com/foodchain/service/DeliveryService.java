package com.foodchain.service;

import com.foodchain.domain.*;
import com.foodchain.repo.*;

import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepo;
    private final DeliveryLocationRepository locationRepo;
    private final UserRepository userRepo;
    private final RealtimePublisher realtimePublisher;
    private final NotificationService notificationService;

    public DeliveryService(DeliveryRepository deliveryRepo,
                           DeliveryLocationRepository locationRepo,
                           UserRepository userRepo,
                           RealtimePublisher realtimePublisher, NotificationService notificationService) {
        this.deliveryRepo = deliveryRepo;
        this.locationRepo = locationRepo;
        this.userRepo = userRepo;
        this.realtimePublisher = realtimePublisher;
        this.notificationService = notificationService;
    }

    public List<Delivery> listAvailableToday() {
        return deliveryRepo.findByStatusAndDayKeyOrderByCreatedAtDesc(DeliveryStatus.CREATED, LocalDate.now());
    }

    public Delivery getOrThrow(long id) {
        return deliveryRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Delivery not found"));
    }

    @Transactional
    public Delivery accept(long deliveryId, long driverUserId) {
        Delivery d = getOrThrow(deliveryId);
        if (d.getStatus() != DeliveryStatus.CREATED) throw new IllegalStateException("Not available");
        User driver = userRepo.findById(driverUserId).orElseThrow();
        d.setDriver(driver);
        d.setStatus(DeliveryStatus.CLAIMED);
        Delivery saved = deliveryRepo.save(d);
        realtimePublisher.broadcastDelivery(saved.getId(), "status", new StatusEvent(saved.getId(), saved.getStatus().name()));
        notificationService.notifyDeliveryStatus(saved.getId(), saved.getDonation().getDonor(), saved.getRequest().getRecipient(), saved.getDriver(), saved.getStatus().name());
        return saved;
    }

    @Transactional
    public Delivery pickedUp(long deliveryId, long driverUserId) {
        Delivery d = getOrThrow(deliveryId);
        if (d.getDriver() == null || d.getDriver().getId() != driverUserId) throw new IllegalStateException("Not your delivery");
        d.setStatus(DeliveryStatus.PICKED_UP);
        Delivery saved = deliveryRepo.save(d);
        realtimePublisher.broadcastDelivery(saved.getId(), "status", new StatusEvent(saved.getId(), saved.getStatus().name()));
        notificationService.notifyDeliveryStatus(saved.getId(), saved.getDonation().getDonor(), saved.getRequest().getRecipient(), saved.getDriver(), saved.getStatus().name());
        return saved;
    }

    @Transactional
    public Delivery delivered(long deliveryId, long driverUserId) {
        Delivery d = getOrThrow(deliveryId);
        if (d.getDriver() == null || d.getDriver().getId() != driverUserId) throw new IllegalStateException("Not your delivery");
        d.setStatus(DeliveryStatus.DELIVERED);
        Delivery saved = deliveryRepo.save(d);
        realtimePublisher.broadcastDelivery(saved.getId(), "status", new StatusEvent(saved.getId(), saved.getStatus().name()));
        notificationService.notifyDeliveryStatus(saved.getId(), saved.getDonation().getDonor(), saved.getRequest().getRecipient(), saved.getDriver(), saved.getStatus().name());
        return saved;
    }

    @Transactional
    public void addLocation(long deliveryId, long driverUserId, double lat, double lng) {
        Delivery d = getOrThrow(deliveryId);
        if (d.getDriver() == null || d.getDriver().getId() != driverUserId) throw new IllegalStateException("Not your delivery");
        DeliveryLocation loc = new DeliveryLocation();
        loc.setDelivery(d);
        loc.setLat(lat);
        loc.setLng(lng);
        locationRepo.save(loc);
        realtimePublisher.broadcastDelivery(d.getId(), "location", new LocationEvent(d.getId(), lat, lng));
    }

    public record StatusEvent(Long deliveryId, String status) {}
    public record LocationEvent(Long deliveryId, double lat, double lng) {}
}
