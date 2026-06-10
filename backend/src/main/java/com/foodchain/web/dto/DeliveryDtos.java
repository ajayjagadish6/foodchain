package com.foodchain.web.dto;

import jakarta.validation.constraints.NotNull;

public class DeliveryDtos {
    public record DeliverySummary(
            Long id,
            String status,
            Long donationId,
            Long requestId,
            String pickupAddress,
            double pickupLat,
            double pickupLng,
            String dropoffAddress,
            double dropoffLat,
            double dropoffLng,
            String donorName,
            String donorPhone,
            String recipientName,
            String recipientPhone,
            String driverName,
            String driverPhone,
            // food details
            String donationTitle,
            String category,
            String quantity,
            Integer servingCount,
            String dietaryNotes,
            String pickupStart,
            String pickupEnd
    ) {}

    public record LocationUpdate(@NotNull Double lat, @NotNull Double lng) {}
}
