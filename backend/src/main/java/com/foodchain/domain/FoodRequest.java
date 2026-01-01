package com.foodchain.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "requests")
public class FoodRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String quantity;

    @Column(name = "dropoff_address", nullable = false)
    private String dropoffAddress;

    @Column(name = "dropoff_lat", nullable = false)
    private double dropoffLat;

    @Column(name = "dropoff_lng", nullable = false)
    private double dropoffLng;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "day_key", nullable = false)
    private LocalDate dayKey;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (status == null) status = RequestStatus.OPEN;
        if (dayKey == null) dayKey = LocalDate.now();
    }

    // getters/setters
    public Long getId() { return id; }
    public User getRecipient() { return recipient; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public String getQuantity() { return quantity; }
    public String getDropoffAddress() { return dropoffAddress; }
    public double getDropoffLat() { return dropoffLat; }
    public double getDropoffLng() { return dropoffLng; }
    public RequestStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public LocalDate getDayKey() { return dayKey; }

    public void setId(Long id) { this.id = id; }
    public void setRecipient(User recipient) { this.recipient = recipient; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setCategory(String category) { this.category = category; }
    public void setQuantity(String quantity) { this.quantity = quantity; }
    public void setDropoffAddress(String dropoffAddress) { this.dropoffAddress = dropoffAddress; }
    public void setDropoffLat(double dropoffLat) { this.dropoffLat = dropoffLat; }
    public void setDropoffLng(double dropoffLng) { this.dropoffLng = dropoffLng; }
    public void setStatus(RequestStatus status) { this.status = status; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setDayKey(LocalDate dayKey) { this.dayKey = dayKey; }
}
