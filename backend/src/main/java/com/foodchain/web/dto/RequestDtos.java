package com.foodchain.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RequestDtos {
    public record CreateRequest(
            @NotBlank String title,
            String description,
            @NotBlank String category,
            @NotBlank String quantity,
            @NotBlank String dropoffAddress,
            @NotNull Double dropoffLat,
            @NotNull Double dropoffLng,
            Integer servingCount,
            String dietaryNotes
    ) {}

    public record RequestView(
            Long id,
            String title,
            String description,
            String category,
            String quantity,
            String dropoffAddress,
            double dropoffLat,
            double dropoffLng,
            String status,
            Integer servingCount,
            String dietaryNotes
    ) {}
}
