package com.foodchain.service;

import com.fasterxml.jackson.databind.JsonNode;
import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * In-process SSE emitter registry + dispatcher.
 *
 * Cross-instance fanout is handled by the EventBus + subscriber; this hub only manages local clients.
 */
@Component
public class RealtimeHub {

    private final ConcurrentHashMap<Long, Set<SseEmitter>> deliveryEmitters = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, Set<SseEmitter>> driverEmitters = new ConcurrentHashMap<>();

    public SseEmitter subscribeDelivery(long deliveryId) {
        SseEmitter emitter = new SseEmitter(0L);
        deliveryEmitters.computeIfAbsent(deliveryId, k -> ConcurrentHashMap.newKeySet()).add(emitter);
        emitter.onCompletion(() -> deliveryEmitters.getOrDefault(deliveryId, Set.of()).remove(emitter));
        emitter.onTimeout(() -> deliveryEmitters.getOrDefault(deliveryId, Set.of()).remove(emitter));
        return emitter;
    }

    public SseEmitter subscribeDriver(long driverUserId) {
        SseEmitter emitter = new SseEmitter(0L);
        driverEmitters.computeIfAbsent(driverUserId, k -> ConcurrentHashMap.newKeySet()).add(emitter);
        emitter.onCompletion(() -> driverEmitters.getOrDefault(driverUserId, Set.of()).remove(emitter));
        emitter.onTimeout(() -> driverEmitters.getOrDefault(driverUserId, Set.of()).remove(emitter));
        return emitter;
    }

    public void dispatch(Envelope env) {
        if (env.scope() == Envelope.Scope.DELIVERY) {
            sendToDelivery(env.deliveryId(), env.event(), env.data());
        } else {
            sendToAllDrivers(env.event(), env.data());
        }
    }

    private void sendToDelivery(long deliveryId, String event, JsonNode data) {
        for (SseEmitter emitter : deliveryEmitters.getOrDefault(deliveryId, Set.of())) {
            try {
                emitter.send(SseEmitter.event().name(event).data(data.toString()));
            } catch (IOException ex) {
                emitter.complete();
            }
        }
    }

    private void sendToAllDrivers(String event, JsonNode data) {
        for (var entry : driverEmitters.entrySet()) {
            for (SseEmitter emitter : entry.getValue()) {
                try {
                    emitter.send(SseEmitter.event().name(event).data(data.toString()));
                } catch (IOException ex) {
                    emitter.complete();
                }
            }
        }
    }

    public record Envelope(Scope scope, long deliveryId, String event, JsonNode data, String senderId) {
        public enum Scope { DELIVERY, DRIVERS }
    }
}
