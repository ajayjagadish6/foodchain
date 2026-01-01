package com.foodchain.web;

import com.foodchain.security.CurrentUser;
import com.foodchain.service.DeliveryService;
import com.foodchain.web.dto.DeliveryDtos;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping("/available")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public List<DeliveryDtos.DeliverySummary> available() {
        return deliveryService.listAvailableToday().stream().map(Mapper::toSummary).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@deliverySecurity.canView(#id)")
    public DeliveryDtos.DeliverySummary get(@PathVariable long id) {
        return Mapper.toSummary(deliveryService.getOrThrow(id));
    }

    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public DeliveryDtos.DeliverySummary accept(@PathVariable long id) {
        var jwt = CurrentUser.get();
        return Mapper.toSummary(deliveryService.accept(id, jwt.userId()));
    }

    @PostMapping("/{id}/pickup")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public DeliveryDtos.DeliverySummary pickup(@PathVariable long id) {
        var jwt = CurrentUser.get();
        return Mapper.toSummary(deliveryService.pickedUp(id, jwt.userId()));
    }

    @PostMapping("/{id}/deliver")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public DeliveryDtos.DeliverySummary deliver(@PathVariable long id) {
        var jwt = CurrentUser.get();
        return Mapper.toSummary(deliveryService.delivered(id, jwt.userId()));
    }

    @PostMapping("/{id}/location")
    @PreAuthorize("hasRole('DRIVER') or hasRole('ADMIN')")
    public void location(@PathVariable long id, @Valid @RequestBody DeliveryDtos.LocationUpdate req) {
        var jwt = CurrentUser.get();
        deliveryService.addLocation(id, jwt.userId(), req.lat(), req.lng());
    }
}
