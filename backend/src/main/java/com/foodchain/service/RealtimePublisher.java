package com.foodchain.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodchain.service.RealtimeHub.Envelope;
import com.foodchain.service.RealtimeHub.Envelope.Scope;
import com.foodchain.service.realtime.EventBus;
import org.springframework.stereotype.Component;

@Component
public class RealtimePublisher {

    private final EventBus eventBus;
    private final ObjectMapper objectMapper;

    public RealtimePublisher(EventBus eventBus, ObjectMapper objectMapper) {
        this.eventBus = eventBus;
        this.objectMapper = objectMapper;
    }

    public void broadcastDelivery(long deliveryId, String event, Object data) {
        Envelope env = new Envelope(Scope.DELIVERY, deliveryId, event, objectMapper.valueToTree(data), null);
        eventBus.publish(env);
    }

    public void broadcastToAllDrivers(String event, Object data) {
        Envelope env = new Envelope(Scope.DRIVERS, 0L, event, objectMapper.valueToTree(data), null);
        eventBus.publish(env);
    }
}
