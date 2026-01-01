package com.foodchain.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UserDtos {

    public record MeView(
            long id,
            String email,
            String role,
            String displayName,
            String phoneNumber,
            boolean phoneVerified
    ) {}

    public record UpdateMeRequest(
            @NotBlank @Size(max = 120) String displayName,
            @NotBlank
            @Pattern(regexp = "^\+[1-9]\d{7,14}$", message = "Phone must be in E.164 format, e.g. +14155552671")
            String phoneNumber
    ) {}

    public record GenericResponse(String message) {}
}
