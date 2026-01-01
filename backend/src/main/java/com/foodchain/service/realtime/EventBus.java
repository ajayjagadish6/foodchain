package com.foodchain.service.realtime;

import com.foodchain.service.RealtimeHub.Envelope;

public interface EventBus {
    void publish(Envelope envelope);
}
