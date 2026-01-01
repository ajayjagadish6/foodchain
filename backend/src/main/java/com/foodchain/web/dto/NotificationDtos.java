package com.foodchain.web.dto;

import jakarta.validation.constraints.NotBlank;

public class NotificationDtos {
    public record RegisterTokenRequest(
            @NotBlank String token,
            String platform
    ) {}
}
