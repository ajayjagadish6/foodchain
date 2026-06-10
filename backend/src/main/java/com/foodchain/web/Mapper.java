package com.foodchain.web;

import com.foodchain.domain.*;
import com.foodchain.web.dto.DeliveryDtos;
import com.foodchain.web.dto.DonationDtos;
import com.foodchain.web.dto.RequestDtos;

public final class Mapper {
    private Mapper() {}

    public static DonationDtos.DonationView toView(Donation d) {
        return new DonationDtos.DonationView(
                d.getId(),
                d.getTitle(),
                d.getDescription(),
                d.getCategory(),
                d.getQuantity(),
                d.getPickupAddress(),
                d.getPickupLat(),
                d.getPickupLng(),
                d.getStatus().name(),
                d.getServingCount(),
                d.getPickupStart() != null ? d.getPickupStart().toString() : null,
                d.getPickupEnd()   != null ? d.getPickupEnd().toString()   : null,
                d.getDietaryNotes(),
                d.getPhotoUrl()
        );
    }

    public static RequestDtos.RequestView toView(FoodRequest r) {
        return new RequestDtos.RequestView(
                r.getId(),
                r.getTitle(),
                r.getDescription(),
                r.getCategory(),
                r.getQuantity(),
                r.getDropoffAddress(),
                r.getDropoffLat(),
                r.getDropoffLng(),
                r.getStatus().name(),
                r.getServingCount(),
                r.getDietaryNotes()
        );
    }

    public static DeliveryDtos.DeliverySummary toSummary(Delivery d) {
        User driver = d.getDriver();
        Donation don = d.getDonation();
        FoodRequest req = d.getRequest();
        return new DeliveryDtos.DeliverySummary(
                d.getId(),
                d.getStatus().name(),
                don.getId(),
                req.getId(),
                don.getPickupAddress(),
                don.getPickupLat(),
                don.getPickupLng(),
                req.getDropoffAddress(),
                req.getDropoffLat(),
                req.getDropoffLng(),
                don.getDonor().getDisplayName(),
                don.getDonor().getPhoneNumber(),
                req.getRecipient().getDisplayName(),
                req.getRecipient().getPhoneNumber(),
                driver != null ? driver.getDisplayName() : null,
                driver != null ? driver.getPhoneNumber() : null,
                don.getTitle(),
                don.getCategory(),
                don.getQuantity(),
                don.getServingCount(),
                don.getDietaryNotes(),
                don.getPickupStart() != null ? don.getPickupStart().toString() : null,
                don.getPickupEnd()   != null ? don.getPickupEnd().toString()   : null
        );
    }
}
