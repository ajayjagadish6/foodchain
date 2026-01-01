package com.foodchain.security;

import com.foodchain.domain.Delivery;
import com.foodchain.domain.Role;
import com.foodchain.repo.DeliveryRepository;
import org.springframework.stereotype.Component;

/**
 * Row-level access control for deliveries.
 */
@Component("deliverySecurity")
public class DeliverySecurity {

    private final DeliveryRepository deliveryRepo;

    public DeliverySecurity(DeliveryRepository deliveryRepo) {
        this.deliveryRepo = deliveryRepo;
    }

    public boolean canView(long deliveryId) {
        JwtUser user = CurrentUser.get();
        return canView(deliveryId, user);
    }

    public boolean canView(long deliveryId, JwtUser user) {
        Delivery d = deliveryRepo.findById(deliveryId).orElse(null);
        if (d == null) return false;
        if (user.role() == Role.ADMIN) return true;

        // Driver can view if assigned.
        if (user.role() == Role.DRIVER && d.getDriver() != null && d.getDriver().getId() == user.userId()) return true;

        // Donor can view if owns the donation.
        if (user.role() == Role.DONOR && d.getDonation() != null && d.getDonation().getDonor() != null
                && d.getDonation().getDonor().getId() == user.userId()) return true;

        // Recipient can view if owns the request.
        if (user.role() == Role.RECIPIENT && d.getRequest() != null && d.getRequest().getRecipient() != null
                && d.getRequest().getRecipient().getId() == user.userId()) return true;

        return false;
    }
}
