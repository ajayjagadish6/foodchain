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
                d.getStatus().name()
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
                r.getStatus().name()
        );
    }

    public static DeliveryDtos.DeliverySummary toSummary(Delivery d) {
        String driverName = d.getDriver() == null ? null : d.getDriver().getDisplayName();
        return new DeliveryDtos.DeliverySummary(
                d.getId(),
                d.getStatus().name(),
                d.getDonation().getId(),
                d.getRequest().getId(),
                d.getDonation().getPickupAddress(),
                d.getDonation().getPickupLat(),
                d.getDonation().getPickupLng(),
                d.getRequest().getDropoffAddress(),
                d.getRequest().getDropoffLat(),
                d.getRequest().getDropoffLng(),
                d.getDonation().getDonor().getDisplayName(),
                d.getRequest().getRecipient().getDisplayName(),
                driverName
        );
    }
}
