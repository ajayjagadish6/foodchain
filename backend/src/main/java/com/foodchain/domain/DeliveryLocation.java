package com.foodchain.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "delivery_locations")
public class DeliveryLocation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "delivery_id")
    private Delivery delivery;

    @Column(nullable = false)
    private double lat;

    @Column(nullable = false)
    private double lng;

    @Column(name = "recorded_at", nullable = false, updatable = false)
    private Instant recordedAt;

    @PrePersist
    public void prePersist() {
        if (recordedAt == null) recordedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Delivery getDelivery() { return delivery; }
    public double getLat() { return lat; }
    public double getLng() { return lng; }
    public Instant getRecordedAt() { return recordedAt; }

    public void setId(Long id) { this.id = id; }
    public void setDelivery(Delivery delivery) { this.delivery = delivery; }
    public void setLat(double lat) { this.lat = lat; }
    public void setLng(double lng) { this.lng = lng; }
    public void setRecordedAt(Instant recordedAt) { this.recordedAt = recordedAt; }
}
