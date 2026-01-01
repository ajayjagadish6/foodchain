package com.foodchain.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DonationDtos {
    public record CreateDonationRequest(
            @NotBlank String title,
            String description,
            @NotBlank String category,
            @NotBlank String quantity,
            @NotBlank String pickupAddress,
            @NotNull Double pickupLat,
            @NotNull Double pickupLng
    ) {}

    public record DonationView(
            Long id,
            String title,
            String description,
            String category,
            String quantity,
            String pickupAddress,
            double pickupLat,
            double pickupLng,
            String status
    ) {}
}
