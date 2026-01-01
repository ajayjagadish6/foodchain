package com.foodchain.service.realtime;

import com.foodchain.service.RealtimeHub.Envelope;

public class InMemoryEventBus implements EventBus {

    private final LocalEventBroker broker;

    public InMemoryEventBus(LocalEventBroker broker) {
        this.broker = broker;
    }

    @Override
    public void publish(Envelope envelope) {
        broker.handle(envelope);
    }
}
