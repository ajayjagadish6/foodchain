package com.foodchain.web;

import com.foodchain.domain.DeliveryStatus;
import com.foodchain.domain.DonationStatus;
import com.foodchain.domain.RequestStatus;
import com.foodchain.repo.DeliveryRepository;
import com.foodchain.repo.DonationRepository;
import com.foodchain.repo.FoodRequestRepository;
import com.foodchain.repo.UserRepository;
import com.foodchain.web.dto.DeliveryDtos;
import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final DeliveryRepository deliveryRepo;
    private final DonationRepository donationRepo;
    private final FoodRequestRepository requestRepo;
    private final UserRepository userRepo;

    public AdminController(DeliveryRepository deliveryRepo,
                           DonationRepository donationRepo,
                           FoodRequestRepository requestRepo,
                           UserRepository userRepo) {
        this.deliveryRepo = deliveryRepo;
        this.donationRepo = donationRepo;
        this.requestRepo = requestRepo;
        this.userRepo = userRepo;
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        long totalDonations = donationRepo.count();
        long openDonations = donationRepo.findAll().stream().filter(d -> d.getStatus() == DonationStatus.OPEN).count();
        long totalRequests = requestRepo.count();
        long openRequests = requestRepo.findAll().stream().filter(r -> r.getStatus() == RequestStatus.OPEN).count();
        long totalDeliveries = deliveryRepo.count();
        long delivered = deliveryRepo.findAll().stream().filter(d -> d.getStatus() == DeliveryStatus.DELIVERED).count();
        long inProgress = deliveryRepo.findAll().stream()
                .filter(d -> d.getStatus() == DeliveryStatus.CLAIMED || d.getStatus() == DeliveryStatus.PICKED_UP)
                .count();
        long totalUsers = userRepo.count();

        return Map.of(
                "totalDonations", totalDonations,
                "openDonations", openDonations,
                "totalRequests", totalRequests,
                "openRequests", openRequests,
                "totalDeliveries", totalDeliveries,
                "deliveredCount", delivered,
                "inProgressCount", inProgress,
                "totalUsers", totalUsers
        );
    }

    @GetMapping("/deliveries")
    public List<DeliveryDtos.DeliverySummary> allDeliveries() {
        return deliveryRepo.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(Mapper::toSummary)
                .toList();
    }
}
