package com.foodchain.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "donations")
public class Donation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "donor_id")
    private User donor;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String quantity;

    @Column(name = "pickup_address", nullable = false)
    private String pickupAddress;

    @Column(name = "pickup_lat", nullable = false)
    private double pickupLat;

    @Column(name = "pickup_lng", nullable = false)
    private double pickupLng;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "day_key", nullable = false)
    private LocalDate dayKey;

    @Column(name = "serving_count")
    private Integer servingCount;

    @Column(name = "pickup_start")
    private LocalTime pickupStart;

    @Column(name = "pickup_end")
    private LocalTime pickupEnd;

    @Column(name = "dietary_notes", length = 255)
    private String dietaryNotes;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (status == null) status = DonationStatus.OPEN;
        if (dayKey == null) dayKey = LocalDate.now();
    }

    // getters/setters
    public Long getId() { return id; }
    public User getDonor() { return donor; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public String getQuantity() { return quantity; }
    public String getPickupAddress() { return pickupAddress; }
    public double getPickupLat() { return pickupLat; }
    public double getPickupLng() { return pickupLng; }
    public DonationStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public LocalDate getDayKey() { return dayKey; }

    public void setId(Long id) { this.id = id; }
    public void setDonor(User donor) { this.donor = donor; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setCategory(String category) { this.category = category; }
    public void setQuantity(String quantity) { this.quantity = quantity; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }
    public void setPickupLat(double pickupLat) { this.pickupLat = pickupLat; }
    public void setPickupLng(double pickupLng) { this.pickupLng = pickupLng; }
    public void setStatus(DonationStatus status) { this.status = status; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setDayKey(LocalDate dayKey) { this.dayKey = dayKey; }

    public Integer getServingCount() { return servingCount; }
    public LocalTime getPickupStart() { return pickupStart; }
    public LocalTime getPickupEnd() { return pickupEnd; }
    public String getDietaryNotes() { return dietaryNotes; }

    public void setServingCount(Integer servingCount) { this.servingCount = servingCount; }
    public void setPickupStart(LocalTime pickupStart) { this.pickupStart = pickupStart; }
    public void setPickupEnd(LocalTime pickupEnd) { this.pickupEnd = pickupEnd; }
    public void setDietaryNotes(String dietaryNotes) { this.dietaryNotes = dietaryNotes; }

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
}
