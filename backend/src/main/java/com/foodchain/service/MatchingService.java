package com.foodchain.service;

import com.foodchain.domain.*;
import com.foodchain.repo.*;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class MatchingService {

    private final DonationRepository donationRepo;
    private final FoodRequestRepository requestRepo;
    private final DeliveryRepository deliveryRepo;
    private final RealtimePublisher realtimePublisher;
    private final NotificationService notificationService;
    private final double maxDistanceKm;

    public MatchingService(DonationRepository donationRepo,
                           FoodRequestRepository requestRepo,
                           DeliveryRepository deliveryRepo,
                           RealtimePublisher realtimePublisher,
                           @Value("${foodchain.matching.maxDistanceKm}") double maxDistanceKm) {
        this.donationRepo = donationRepo;
        this.requestRepo = requestRepo;
        this.deliveryRepo = deliveryRepo;
        this.realtimePublisher = realtimePublisher;
        this.notificationService = notificationService;
        this.maxDistanceKm = maxDistanceKm;
    }

    /**
     * MVP: When a new donation/request is posted, attempt to find an open counterpart with same category and within radius.
     */
    @Transactional
    public Optional<Delivery> tryMatchNow() {
        LocalDate today = LocalDate.now();

        var openDonations = donationRepo.findByStatusAndDayKey(DonationStatus.OPEN, today);
        var openRequests = requestRepo.findByStatusAndDayKey(RequestStatus.OPEN, today);

        for (Donation d : openDonations) {
            Optional<FoodRequest> best = openRequests.stream()
                    .filter(r -> r.getCategory().equalsIgnoreCase(d.getCategory()))
                    .filter(r -> Geo.distanceKm(d.getPickupLat(), d.getPickupLng(), r.getDropoffLat(), r.getDropoffLng()) <= maxDistanceKm)
                    .min(Comparator.comparingDouble(r -> Geo.distanceKm(d.getPickupLat(), d.getPickupLng(), r.getDropoffLat(), r.getDropoffLng())));

            if (best.isPresent()) {
                FoodRequest r = best.get();
                // Create delivery
                Delivery delivery = new Delivery();
                delivery.setDonation(d);
                delivery.setRequest(r);
                delivery.setStatus(DeliveryStatus.CREATED);
                delivery.setDayKey(today);
                delivery = deliveryRepo.save(delivery);

                d.setStatus(DonationStatus.MATCHED);
                r.setStatus(RequestStatus.MATCHED);

                donationRepo.save(d);
                requestRepo.save(r);

                // Notify drivers (MVP broadcast)
                realtimePublisher.broadcastToAllDrivers("delivery_created", new DeliveryEvent(delivery.getId(), delivery.getStatus().name()));
                notificationService.notifyDriversNewDelivery(delivery.getId());

                return Optional.of(delivery);
            }
        }
        return Optional.empty();
    }

    public record DeliveryEvent(Long deliveryId, String status) {}
}
