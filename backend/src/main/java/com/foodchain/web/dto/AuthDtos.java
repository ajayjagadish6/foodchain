package com.foodchain.web.dto;

import com.foodchain.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record LoginResponse(String token) {}

    public record RegisterRequest(
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotBlank @Size(max = 120) String displayName,
            Role role,
            @NotBlank
            @Pattern(regexp = "^\\+[1-9]\\d{7,14}$", message = "Phone must be in E.164 format, e.g. +14155552671")
            String phoneNumber
    ) {}

    public record RegisterResponse(String message) {}

    public record VerifyPhoneRequest(
            @Email @NotBlank String email,
            @NotBlank @Pattern(regexp = "^\\d{6}$", message = "Code must be 6 digits") String code
    ) {}

    public record ResendPhoneRequest(@Email @NotBlank String email) {}

    public record GenericResponse(String message) {}
}
