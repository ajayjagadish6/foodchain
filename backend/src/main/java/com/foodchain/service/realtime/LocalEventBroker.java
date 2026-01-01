package com.foodchain.service.realtime;

import com.foodchain.service.RealtimeHub;
import com.foodchain.service.RealtimeHub.Envelope;
import org.springframework.stereotype.Component;

@Component
public class LocalEventBroker {
    private final RealtimeHub hub;

    public LocalEventBroker(RealtimeHub hub) {
        this.hub = hub;
    }

    public void handle(Envelope env) {
        hub.dispatch(env);
    }
}
