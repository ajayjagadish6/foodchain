package com.foodchain.web;

import com.foodchain.domain.Role;
import com.foodchain.security.DeliverySecurity;
import com.foodchain.security.JwtService;
import com.foodchain.service.RealtimeHub;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * NOTE: Browser EventSource cannot set Authorization headers. For MVP, these endpoints accept
 * a JWT via query param (?token=...). In production, prefer session cookies + CSRF protection,
 * a WS gateway, or SSE over fetch with bearer tokens.
 */
@RestController
@RequestMapping("/api/stream")
public class StreamController {

    private final RealtimeHub hub;
    private final JwtService jwtService;
    private final DeliverySecurity deliverySecurity;

    public StreamController(RealtimeHub hub, JwtService jwtService, DeliverySecurity deliverySecurity) {
        this.hub = hub;
        this.jwtService = jwtService;
        this.deliverySecurity = deliverySecurity;
    }

    @GetMapping("/deliveries/{deliveryId}")
    public SseEmitter delivery(@PathVariable long deliveryId, @RequestParam String token) {
        var user = jwtService.parse(token);
        if (!deliverySecurity.canView(deliveryId, user)) {
            throw new IllegalArgumentException("Forbidden");
        }
        return hub.subscribeDelivery(deliveryId);
    }

    @GetMapping("/driver/tasks")
    public SseEmitter driverTasks(@RequestParam String token) {
        var user = jwtService.parse(token);
        if (user.role() != Role.DRIVER && user.role() != Role.ADMIN) {
            throw new IllegalArgumentException("Driver role required");
        }
        return hub.subscribeDriver(user.userId());
    }
}
