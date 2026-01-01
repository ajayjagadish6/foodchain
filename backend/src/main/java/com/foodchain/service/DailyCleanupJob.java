package com.foodchain.service;

import com.foodchain.repo.DeliveryRepository;
import com.foodchain.repo.DonationRepository;
import com.foodchain.repo.FoodRequestRepository;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Clears out older data so only current-day data is tracked.
 * This aligns with the requirement to reset daily records. Configure cron via DAILY_CLEANUP_CRON.
 */
@Component
public class DailyCleanupJob {

    private final DonationRepository donationRepo;
    private final FoodRequestRepository requestRepo;
    private final DeliveryRepository deliveryRepo;

    public DailyCleanupJob(DonationRepository donationRepo,
                           FoodRequestRepository requestRepo,
                           DeliveryRepository deliveryRepo) {
        this.donationRepo = donationRepo;
        this.requestRepo = requestRepo;
        this.deliveryRepo = deliveryRepo;
    }

    @Scheduled(cron = "${foodchain.cleanup.cron}")
    public void cleanup() {
        // Delete anything not in today's day_key (simple MVP).
        LocalDate today = LocalDate.now();
        deliveryRepo.findAll().stream()
                .filter(d -> !today.equals(d.getDayKey()))
                .forEach(deliveryRepo::delete);
        donationRepo.findAll().stream()
                .filter(d -> !today.equals(d.getDayKey()))
                .forEach(donationRepo::delete);
        requestRepo.findAll().stream()
                .filter(r -> !today.equals(r.getDayKey()))
                .forEach(requestRepo::delete);
    }
}
