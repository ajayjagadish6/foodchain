package com.foodchain.web;

import com.foodchain.domain.Role;
import com.foodchain.domain.User;
import com.foodchain.repo.UserRepository;
import com.foodchain.security.JwtService;
import com.foodchain.service.PhoneVerificationService;
import com.foodchain.web.dto.AuthDtos;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PhoneVerificationService phoneVerificationService;

    public AuthController(
            UserRepository userRepo,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            PhoneVerificationService phoneVerificationService
    ) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.phoneVerificationService = phoneVerificationService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthDtos.RegisterResponse> register(@Valid @RequestBody AuthDtos.RegisterRequest req) {
        if (req.role() == null) throw new IllegalArgumentException("Role is required");
        if (req.role() == Role.ADMIN) throw new IllegalArgumentException("ADMIN cannot be self-registered");

        if (userRepo.findByEmail(req.email()).isPresent()) {
            throw new IllegalStateException("Email already registered");
        }

        User u = new User();
        u.setEmail(req.email().toLowerCase());
        u.setPasswordHash(passwordEncoder.encode(req.password()));
        u.setRole(req.role());
        u.setDisplayName(req.displayName());
        u.setPhoneNumber(req.phoneNumber());
        u.setPhoneVerified(false);
        u.setPhoneVerifiedAt(null);
        u = userRepo.save(u);

        phoneVerificationService.startVerification(u.getId());

        return ResponseEntity.ok(new AuthDtos.RegisterResponse("Registered. Verification code sent via SMS."));
    }

    @PostMapping("/verify-phone")
    public ResponseEntity<AuthDtos.GenericResponse> verifyPhone(@Valid @RequestBody AuthDtos.VerifyPhoneRequest req) {
        var user = userRepo.findByEmail(req.email().toLowerCase()).orElseThrow(() -> new IllegalArgumentException("Unknown email"));
        phoneVerificationService.verify(user.getId(), req.code());
        return ResponseEntity.ok(new AuthDtos.GenericResponse("Phone number verified. You can now log in."));
    }

    @PostMapping("/resend-phone")
    public ResponseEntity<AuthDtos.GenericResponse> resendPhone(@Valid @RequestBody AuthDtos.ResendPhoneRequest req) {
        var user = userRepo.findByEmail(req.email().toLowerCase()).orElseThrow(() -> new IllegalArgumentException("Unknown email"));
        phoneVerificationService.resend(user.getId());
        return ResponseEntity.ok(new AuthDtos.GenericResponse("Verification code sent."));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDtos.LoginResponse> login(@Valid @RequestBody AuthDtos.LoginRequest req) {
        var user = userRepo.findByEmail(req.email().toLowerCase()).orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        if (!user.isPhoneVerified()) {
            throw new IllegalStateException("Phone not verified");
        }
        String token = jwtService.createToken(user.getId(), user.getEmail(), user.getRole());
        return ResponseEntity.ok(new AuthDtos.LoginResponse(token));
    }
}
