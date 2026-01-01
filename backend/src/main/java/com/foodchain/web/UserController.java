package com.foodchain.web;

import com.foodchain.repo.UserRepository;
import com.foodchain.security.CurrentUser;
import com.foodchain.service.PhoneVerificationService;
import com.foodchain.web.dto.UserDtos;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepo;
    private final PhoneVerificationService phoneVerificationService;

    public UserController(UserRepository userRepo, PhoneVerificationService phoneVerificationService) {
        this.userRepo = userRepo;
        this.phoneVerificationService = phoneVerificationService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDtos.MeView> me() {
        var principal = CurrentUser.get();
        var u = userRepo.findById(principal.userId()).orElseThrow();
        return ResponseEntity.ok(new UserDtos.MeView(
                u.getId(),
                u.getEmail(),
                u.getRole().name(),
                u.getDisplayName(),
                u.getPhoneNumber(),
                u.isPhoneVerified()
        ));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDtos.GenericResponse> updateMe(@Valid @RequestBody UserDtos.UpdateMeRequest req) {
        var principal = CurrentUser.get();
        var u = userRepo.findById(principal.userId()).orElseThrow();

        boolean phoneChanged = !req.phoneNumber().equals(u.getPhoneNumber());

        u.setDisplayName(req.displayName());
        u.setPhoneNumber(req.phoneNumber());

        if (phoneChanged) {
            u.setPhoneVerified(false);
            u.setPhoneVerifiedAt(null);
        }

        userRepo.save(u);

        if (phoneChanged) {
            phoneVerificationService.startVerification(u.getId());
            return ResponseEntity.ok(new UserDtos.GenericResponse("Profile updated. Verification code sent via SMS."));
        }

        return ResponseEntity.ok(new UserDtos.GenericResponse("Profile updated."));
    }

    @PostMapping("/me/resend-phone")
    public ResponseEntity<UserDtos.GenericResponse> resendPhone() {
        var principal = CurrentUser.get();
        phoneVerificationService.resend(principal.userId());
        return ResponseEntity.ok(new UserDtos.GenericResponse("Verification code sent."));
    }
}
