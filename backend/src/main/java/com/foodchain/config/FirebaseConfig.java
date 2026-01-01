package com.foodchain.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Firebase Admin initialization for FCM.
 *
 * Enable by setting:
 *   FCM_ENABLED=true
 *   FCM_SERVICE_ACCOUNT_BASE64=<base64 of service account json>
 */
@Configuration
public class FirebaseConfig {

    @Bean
    @ConditionalOnProperty(prefix = "foodchain.notifications", name = "fcmEnabled", havingValue = "true")
    public FirebaseMessaging firebaseMessaging(
            @Value("${foodchain.notifications.fcmServiceAccountBase64:}") String saBase64
    ) throws Exception {
        if (saBase64 == null || saBase64.isBlank()) {
            throw new IllegalStateException("FCM is enabled but service account is missing (FCM_SERVICE_ACCOUNT_BASE64)");
        }

        byte[] jsonBytes = Base64.getDecoder().decode(saBase64.getBytes(StandardCharsets.UTF_8));
        GoogleCredentials creds = GoogleCredentials.fromStream(new ByteArrayInputStream(jsonBytes));

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(creds)
                .build();

        // Avoid duplicate init in dev/test contexts.
        FirebaseApp app = FirebaseApp.getApps().isEmpty() ? FirebaseApp.initializeApp(options) : FirebaseApp.getInstance();
        return FirebaseMessaging.getInstance(app);
    }
}
