package com.foodchain.service;

import com.foodchain.domain.PhoneVerificationCode;
import com.foodchain.domain.User;
import com.foodchain.repo.PhoneVerificationCodeRepository;
import com.foodchain.repo.UserRepository;
import com.foodchain.service.sms.SmsSender;
import jakarta.transaction.Transactional;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PhoneVerificationService {

    private final SecureRandom random = new SecureRandom();

    private final PhoneVerificationCodeRepository pvcRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final SmsSender smsSender;

    private final Duration codeTtl;
    private final Duration resendCooldown;

    public PhoneVerificationService(
            PhoneVerificationCodeRepository pvcRepo,
            UserRepository userRepo,
            PasswordEncoder passwordEncoder,
            SmsSender smsSender,
            @Value("${foodchain.phoneVerification.codeTtlMinutes:10}") long codeTtlMinutes,
            @Value("${foodchain.phoneVerification.resendCooldownSeconds:45}") long resendCooldownSeconds
    ) {
        this.pvcRepo = pvcRepo;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.smsSender = smsSender;
        this.codeTtl = Duration.ofMinutes(codeTtlMinutes);
        this.resendCooldown = Duration.ofSeconds(resendCooldownSeconds);
    }

    /** Generates a new code (overwriting any previous one) and sends it via SMS. */
    @Transactional
    public void startVerification(long userId) {
        User user = userRepo.findById(userId).orElseThrow();
        if (user.getPhoneNumber() == null || user.getPhoneNumber().isBlank()) {
            throw new IllegalArgumentException("Phone number is required");
        }
        if (user.isPhoneVerified()) {
            // Already verified; nothing to do
            return;
        }

        String code = generateCode();
        Instant now = Instant.now();

        PhoneVerificationCode pvc = pvcRepo.findByUserId(userId).orElseGet(PhoneVerificationCode::new);
        pvc.setUser(user);
        pvc.setCodeHash(passwordEncoder.encode(code)); // BCrypt
        pvc.setExpiresAt(now.plus(codeTtl));
        pvc.setLastSentAt(now);
        pvc.setAttemptCount(0);
        pvcRepo.save(pvc);

        smsSender.sendSms(user.getPhoneNumber(), "FoodChain verification code: " + code + " (expires in " + codeTtl.toMinutes() + " min)");
    }

    /** Resends a code only if cooldown elapsed (generates a fresh code). */
    @Transactional
    public void resend(long userId) {
        User user = userRepo.findById(userId).orElseThrow();
        if (user.isPhoneVerified()) return;

        PhoneVerificationCode pvc = pvcRepo.findByUserId(userId).orElse(null);
        Instant now = Instant.now();
        if (pvc != null) {
            if (Duration.between(pvc.getLastSentAt(), now).compareTo(resendCooldown) < 0) {
                throw new IllegalStateException("Please wait before requesting another code");
            }
        }
        startVerification(userId);
    }

    @Transactional
    public void verify(long userId, String code) {
        User user = userRepo.findById(userId).orElseThrow();
        if (user.isPhoneVerified()) return;

        PhoneVerificationCode pvc = pvcRepo.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("No verification code requested"));

        Instant now = Instant.now();
        if (now.isAfter(pvc.getExpiresAt())) {
            throw new IllegalStateException("Verification code expired. Please request a new code.");
        }

        pvc.setAttemptCount(pvc.getAttemptCount() + 1);
        pvcRepo.save(pvc);

        if (!passwordEncoder.matches(code, pvc.getCodeHash())) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        user.setPhoneVerified(true);
        user.setPhoneVerifiedAt(now);
        userRepo.save(user);
        pvcRepo.deleteByUserId(userId);
    }

    private String generateCode() {
        int n = random.nextInt(1_000_000); // 0..999999
        return String.format("%06d", n);
    }
}
