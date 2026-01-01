package com.foodchain.web;

import com.foodchain.domain.FoodRequest;
import com.foodchain.repo.FoodRequestRepository;
import com.foodchain.repo.UserRepository;
import com.foodchain.security.CurrentUser;
import com.foodchain.service.MatchingService;
import com.foodchain.web.dto.RequestDtos;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    private final FoodRequestRepository requestRepo;
    private final UserRepository userRepo;
    private final MatchingService matchingService;

    public RequestController(FoodRequestRepository requestRepo, UserRepository userRepo, MatchingService matchingService) {
        this.requestRepo = requestRepo;
        this.userRepo = userRepo;
        this.matchingService = matchingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('RECIPIENT') or hasRole('ADMIN')")
    public RequestDtos.RequestView create(@Valid @RequestBody RequestDtos.CreateRequest req) {
        var jwt = CurrentUser.get();
        var user = userRepo.findById(jwt.userId()).orElseThrow();

        FoodRequest r = new FoodRequest();
        r.setRecipient(user);
        r.setTitle(req.title());
        r.setDescription(req.description());
        r.setCategory(req.category());
        r.setQuantity(req.quantity());
        r.setDropoffAddress(req.dropoffAddress());
        r.setDropoffLat(req.dropoffLat());
        r.setDropoffLng(req.dropoffLng());

        FoodRequest saved = requestRepo.save(r);

        matchingService.tryMatchNow();

        return Mapper.toView(saved);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('RECIPIENT') or hasRole('ADMIN')")
    public List<RequestDtos.RequestView> mine() {
        var jwt = CurrentUser.get();
        var user = userRepo.findById(jwt.userId()).orElseThrow();
        return requestRepo.findByRecipientOrderByCreatedAtDesc(user).stream().map(Mapper::toView).toList();
    }
}
