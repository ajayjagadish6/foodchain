package com.foodchain.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodchain.service.realtime.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EventBusConfig {

    @Bean
    public EventBus eventBus(
            LocalEventBroker broker,
            ObjectMapper objectMapper,
            @Value("${foodchain.realtime.bus:inmemory}") String bus,
            @Value("${foodchain.realtime.pubsub.projectId:}") String projectId,
            @Value("${foodchain.realtime.pubsub.topicId:foodchain-events}") String topicId,
            @Value("${foodchain.realtime.pubsub.subscriptionPrefix:foodchain-events-sub}") String subscriptionPrefix
    ) {
        if ("pubsub".equalsIgnoreCase(bus)) {
            if (projectId == null || projectId.isBlank()) {
                throw new IllegalStateException("foodchain.realtime.pubsub.projectId is required when bus=pubsub");
            }
            return new PubSubEventBus(broker, objectMapper, projectId, topicId, subscriptionPrefix);
        }
        return new InMemoryEventBus(broker);
    }
}
