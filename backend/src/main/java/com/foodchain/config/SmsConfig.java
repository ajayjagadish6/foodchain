package com.foodchain.config;

import com.foodchain.service.sms.LoggingSmsSender;
import com.foodchain.service.sms.SmsSender;
import com.foodchain.service.sms.TwilioSmsSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * SMS sender wiring. Defaults to a logging sender so the app runs without Twilio credentials.
 */
@Configuration
public class SmsConfig {

    @Bean
    public SmsSender smsSender(
            @Value("${foodchain.sms.enabled:false}") boolean enabled,
            @Value("${foodchain.sms.twilio.accountSid:}") String accountSid,
            @Value("${foodchain.sms.twilio.authToken:}") String authToken,
            @Value("${foodchain.sms.twilio.fromNumber:}") String fromNumber
    ) {
        if (enabled) {
            if (accountSid.isBlank() || authToken.isBlank() || fromNumber.isBlank()) {
                throw new IllegalStateException("SMS enabled but Twilio credentials are missing (accountSid/authToken/fromNumber)");
            }
            return new TwilioSmsSender(accountSid, authToken, fromNumber);
        }
        return new LoggingSmsSender();
    }
}
