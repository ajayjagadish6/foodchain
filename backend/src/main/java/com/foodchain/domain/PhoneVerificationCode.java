package com.foodchain.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "phone_verification_codes")
public class PhoneVerificationCode {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "code_hash", nullable = false)
    private String codeHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "last_sent_at", nullable = false)
    private Instant lastSentAt;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (lastSentAt == null) lastSentAt = createdAt;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getCodeHash() { return codeHash; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getLastSentAt() { return lastSentAt; }
    public int getAttemptCount() { return attemptCount; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setCodeHash(String codeHash) { this.codeHash = codeHash; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setLastSentAt(Instant lastSentAt) { this.lastSentAt = lastSentAt; }
    public void setAttemptCount(int attemptCount) { this.attemptCount = attemptCount; }
}
