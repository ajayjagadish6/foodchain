package com.foodchain.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "device_tokens", uniqueConstraints = {
        @UniqueConstraint(name = "uk_device_token_token", columnNames = {"token"})
})
public class DeviceToken {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 512)
    private String token;

    @Column(nullable = false, length = 32)
    private String platform = "web";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getToken() { return token; }
    public String getPlatform() { return platform; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setToken(String token) { this.token = token; }
    public void setPlatform(String platform) { this.platform = platform; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
