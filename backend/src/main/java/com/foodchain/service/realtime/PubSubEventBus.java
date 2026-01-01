package com.foodchain.service.realtime;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodchain.service.RealtimeHub.Envelope;
import com.foodchain.service.RealtimeHub.Envelope.Scope;
import com.google.api.core.ApiFuture;
import com.google.cloud.pubsub.v1.Publisher;
import com.google.cloud.pubsub.v1.Subscriber;
import com.google.protobuf.ByteString;
import com.google.pubsub.v1.*;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Pub/Sub-based event fanout across Cloud Run instances.
 *
 * Important: To ensure EACH instance receives ALL events, we create a PER-INSTANCE subscription
 * (name includes HOSTNAME). The subscription is configured with an expiration policy to reduce leaks.
 *
 * Required IAM perms (service account):
 * - pubsub.topics.publish
 * - pubsub.subscriptions.create (and get)
 * - pubsub.subscriptions.delete (optional but recommended)
 */
public class PubSubEventBus implements EventBus {

    private static final Logger log = LoggerFactory.getLogger(PubSubEventBus.class);

    private final LocalEventBroker broker;
    private final ObjectMapper objectMapper;

    private final String projectId;
    private final String topicId;
    private final String subscriptionPrefix;
    private final String senderId;

    private Publisher publisher;
    private Subscriber subscriber;
    private String subscriptionId;

    public PubSubEventBus(
            LocalEventBroker broker,
            ObjectMapper objectMapper,
            String projectId,
            String topicId,
            String subscriptionPrefix
    ) {
        this.broker = broker;
        this.objectMapper = objectMapper;
        this.projectId = projectId;
        this.topicId = topicId;
        this.subscriptionPrefix = subscriptionPrefix;
        this.senderId = System.getenv().getOrDefault("HOSTNAME", UUID.randomUUID().toString());
    }

    @PostConstruct
    public void start() throws Exception {
        TopicName topicName = TopicName.of(projectId, topicId);

        publisher = Publisher.newBuilder(topicName).build();

        // Per-instance subscription for broadcast semantics
        subscriptionId = subscriptionPrefix + "-" + senderId;
        SubscriptionName subName = SubscriptionName.of(projectId, subscriptionId);

        try (var subAdmin = com.google.cloud.pubsub.v1.SubscriptionAdminClient.create()) {
            try {
                subAdmin.getSubscription(subName);
            } catch (Exception notFound) {
                // Create subscription with expiration policy (auto-delete after 1 day of inactivity)
                Subscription sub = Subscription.newBuilder()
                        .setName(subName.toString())
                        .setTopic(topicName.toString())
                        .setAckDeadlineSeconds(20)
                        .setExpirationPolicy(ExpirationPolicy.newBuilder().setTtl(com.google.protobuf.Duration.newBuilder().setSeconds(Duration.ofDays(1).getSeconds()).build()).build())
                        .build();
                subAdmin.createSubscription(sub);
                log.info("Created Pub/Sub subscription {}", subName);
            }
        }

        // Start subscriber
        subscriber = Subscriber.newBuilder(subName, (PubsubMessage message, com.google.cloud.pubsub.v1.AckReplyConsumer consumer) -> {
            try {
                String msgSender = message.getAttributesOrDefault("senderId", "");
                if (senderId.equals(msgSender)) {
                    consumer.ack();
                    return; // ignore our own messages (we dispatch locally on publish)
                }

                String json = message.getData().toStringUtf8();
                Envelope env = objectMapper.readValue(json, Envelope.class);
                broker.handle(env);
                consumer.ack();
            } catch (Exception ex) {
                log.warn("Pub/Sub event handling failed", ex);
                consumer.nack();
            }
        }).build();
        subscriber.startAsync().awaitRunning();
        log.info("Pub/Sub subscriber running for {}", subName);
    }

    @PreDestroy
    public void stop() {
        try {
            if (subscriber != null) subscriber.stopAsync().awaitTerminated(5, TimeUnit.SECONDS);
        } catch (Exception ignored) {}

        try {
            if (publisher != null) publisher.shutdown();
        } catch (Exception ignored) {}

        // Best-effort delete subscription to avoid leaks (expiration policy also helps)
        try (var subAdmin = com.google.cloud.pubsub.v1.SubscriptionAdminClient.create()) {
            if (subscriptionId != null) {
                subAdmin.deleteSubscription(SubscriptionName.of(projectId, subscriptionId));
                log.info("Deleted Pub/Sub subscription {}", subscriptionId);
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void publish(Envelope envelope) {
        try {
            // Dispatch locally immediately
            Envelope local = new Envelope(envelope.scope(), envelope.deliveryId(), envelope.event(), envelope.data(), senderId);
            broker.handle(local);

            String json = objectMapper.writeValueAsString(local);

            PubsubMessage msg = PubsubMessage.newBuilder()
                    .setData(ByteString.copyFromUtf8(json))
                    .putAttributes("senderId", senderId)
                    .build();

            ApiFuture<String> future = publisher.publish(msg);
            future.get(5, TimeUnit.SECONDS);
        } catch (Exception ex) {
            // Non-fatal
            log.warn("Pub/Sub publish failed", ex);
        }
    }
}
