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
            String recipientName,
            String driverName
    ) {}

    public record LocationUpdate(@NotNull Double lat, @NotNull Double lng) {}
}
