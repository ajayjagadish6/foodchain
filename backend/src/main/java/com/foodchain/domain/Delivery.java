package com.foodchain.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "deliveries")
public class Delivery {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "donation_id")
    private Donation donation;

    @OneToOne(optional = false)
    @JoinColumn(name = "request_id")
    private FoodRequest request;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private User driver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "day_key", nullable = false)
    private LocalDate dayKey;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
        if (status == null) status = DeliveryStatus.CREATED;
        if (dayKey == null) dayKey = LocalDate.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Donation getDonation() { return donation; }
    public FoodRequest getRequest() { return request; }
    public User getDriver() { return driver; }
    public DeliveryStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public LocalDate getDayKey() { return dayKey; }

    public void setId(Long id) { this.id = id; }
    public void setDonation(Donation donation) { this.donation = donation; }
    public void setRequest(FoodRequest request) { this.request = request; }
    public void setDriver(User driver) { this.driver = driver; }
    public void setStatus(DeliveryStatus status) { this.status = status; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public void setDayKey(LocalDate dayKey) { this.dayKey = dayKey; }
}
