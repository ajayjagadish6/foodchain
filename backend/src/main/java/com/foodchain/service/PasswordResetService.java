package com.foodchain.service;

import com.foodchain.domain.PasswordResetToken;
import com.foodchain.domain.User;
import com.foodchain.repo.PasswordResetTokenRepository;
import com.foodchain.repo.UserRepository;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final int TOKEN_EXPIRY_HOURS = 2;

    private final UserRepository userRepo;
    private final PasswordResetTokenRepository tokenRepo;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${foodchain.app.baseUrl:http://localhost:5173}")
    private String baseUrl;

    @Value("${spring.mail.username:noreply@foodchain.app}")
    private String fromAddress;

    @Value("${foodchain.mail.enabled:false}")
    private boolean mailEnabled;

    public PasswordResetService(UserRepository userRepo,
                                PasswordResetTokenRepository tokenRepo,
                                PasswordEncoder passwordEncoder,
                                JavaMailSender mailSender) {
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    @Transactional
    public void requestReset(String email) {
        // Always return silently for unknown emails (prevents user enumeration)
        userRepo.findByEmail(email.toLowerCase()).ifPresent(user -> {
            String rawToken = generateToken();
            PasswordResetToken prt = new PasswordResetToken();
            prt.setUser(user);
            prt.setToken(rawToken);
            prt.setExpiresAt(Instant.now().plus(TOKEN_EXPIRY_HOURS, ChronoUnit.HOURS));
            prt.setUsed(false);
            tokenRepo.save(prt);

            String link = baseUrl + "/reset-password?token=" + rawToken;
            sendOrLog(user, link);
        });
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        PasswordResetToken prt = tokenRepo.findByToken(rawToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset link."));

        if (prt.isUsed()) throw new IllegalArgumentException("This reset link has already been used.");
        if (Instant.now().isAfter(prt.getExpiresAt())) throw new IllegalArgumentException("Reset link has expired.");

        User user = prt.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        prt.setUsed(true);
        tokenRepo.save(prt);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private String generateToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private void sendOrLog(User user, String link) {
        if (mailEnabled) {
            try {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setFrom(fromAddress);
                msg.setTo(user.getEmail());
                msg.setSubject("FoodChain – Reset your password");
                msg.setText("Hi " + user.getDisplayName() + ",\n\n"
                        + "Click the link below to reset your password. It expires in "
                        + TOKEN_EXPIRY_HOURS + " hours.\n\n" + link
                        + "\n\nIf you did not request this, you can ignore this email.\n\n"
                        + "– The FoodChain Team");
                mailSender.send(msg);
                log.info("Password reset email sent to {}", user.getEmail());
            } catch (Exception e) {
                log.error("Failed to send reset email to {}: {}", user.getEmail(), e.getMessage());
            }
        } else {
            // Dev / no-SMTP mode: print link so developers can test the flow
            log.info("===== PASSWORD RESET LINK (mail disabled) =====");
            log.info("User: {} ({})", user.getEmail(), user.getId());
            log.info("Link: {}", link);
            log.info("================================================");
        }
    }
}
