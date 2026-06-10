package com.foodchain.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(name = "phone_verified", nullable = false)
    private boolean phoneVerified;

    @Column(name = "phone_verified_at")
    private Instant phoneVerifiedAt;

    @Column(name = "org_name", length = 255)
    private String orgName;

    @Column(name = "org_address", length = 255)
    private String orgAddress;

    @Column(name = "org_lat")
    private Double orgLat;

    @Column(name = "org_lng")
    private Double orgLng;

    @Column(name = "org_logo_url", length = 500)
    private String orgLogoUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public Role getRole() { return role; }
    public String getDisplayName() { return displayName; }
    public String getPhoneNumber() { return phoneNumber; }
    public boolean isPhoneVerified() { return phoneVerified; }
    public Instant getPhoneVerifiedAt() { return phoneVerifiedAt; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setRole(Role role) { this.role = role; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public void setPhoneVerified(boolean phoneVerified) { this.phoneVerified = phoneVerified; }
    public void setPhoneVerifiedAt(Instant phoneVerifiedAt) { this.phoneVerifiedAt = phoneVerifiedAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getOrgName() { return orgName; }
    public String getOrgAddress() { return orgAddress; }
    public Double getOrgLat() { return orgLat; }
    public Double getOrgLng() { return orgLng; }
    public String getOrgLogoUrl() { return orgLogoUrl; }

    public void setOrgName(String orgName) { this.orgName = orgName; }
    public void setOrgAddress(String orgAddress) { this.orgAddress = orgAddress; }
    public void setOrgLat(Double orgLat) { this.orgLat = orgLat; }
    public void setOrgLng(Double orgLng) { this.orgLng = orgLng; }
    public void setOrgLogoUrl(String orgLogoUrl) { this.orgLogoUrl = orgLogoUrl; }
}
