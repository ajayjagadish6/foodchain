package com.foodchain.web;

import com.foodchain.security.CurrentUser;
import com.foodchain.service.NotificationService;
import com.foodchain.web.dto.NotificationDtos;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('DONOR','RECIPIENT','DRIVER','ADMIN')")
    public void register(@Valid @RequestBody NotificationDtos.RegisterTokenRequest req) {
        var jwt = CurrentUser.get();
        notificationService.registerToken(jwt.userId(), req.token(), req.platform());
    }
}
