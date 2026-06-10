package com.foodchain.web;

import com.foodchain.domain.Donation;
import com.foodchain.domain.Role;
import com.foodchain.repo.DonationRepository;
import com.foodchain.repo.UserRepository;
import com.foodchain.security.CurrentUser;
import com.foodchain.service.MatchingService;
import com.foodchain.web.dto.DonationDtos;
import jakarta.validation.Valid;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationRepository donationRepo;
    private final UserRepository userRepo;
    private final MatchingService matchingService;

    public DonationController(DonationRepository donationRepo, UserRepository userRepo, MatchingService matchingService) {
        this.donationRepo = donationRepo;
        this.userRepo = userRepo;
        this.matchingService = matchingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('DONOR') or hasRole('ADMIN')")
    public DonationDtos.DonationView create(@Valid @RequestBody DonationDtos.CreateDonationRequest req) {
        var jwt = CurrentUser.get();
        var user = userRepo.findById(jwt.userId()).orElseThrow();

        Donation d = new Donation();
        d.setDonor(user);
        d.setTitle(req.title());
        d.setDescription(req.description());
        d.setCategory(req.category());
        d.setQuantity(req.quantity());
        d.setPickupAddress(req.pickupAddress());
        d.setPickupLat(req.pickupLat());
        d.setPickupLng(req.pickupLng());
        d.setServingCount(req.servingCount());
        d.setDietaryNotes(req.dietaryNotes());
        d.setPhotoUrl(req.photoUrl());
        if (req.pickupStart() != null && !req.pickupStart().isBlank()) {
            try { d.setPickupStart(LocalTime.parse(req.pickupStart())); } catch (DateTimeParseException ignored) {}
        }
        if (req.pickupEnd() != null && !req.pickupEnd().isBlank()) {
            try { d.setPickupEnd(LocalTime.parse(req.pickupEnd())); } catch (DateTimeParseException ignored) {}
        }

        Donation saved = donationRepo.save(d);

        // attempt match quickly
        matchingService.tryMatchNow();

        return Mapper.toView(saved);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('DONOR') or hasRole('ADMIN')")
    public List<DonationDtos.DonationView> mine() {
        var jwt = CurrentUser.get();
        var user = userRepo.findById(jwt.userId()).orElseThrow();
        return donationRepo.findByDonorOrderByCreatedAtDesc(user).stream().map(Mapper::toView).toList();
    }
}
