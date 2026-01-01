package com.foodchain.service.sms;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Default sender for local/dev: logs SMS contents instead of sending.
 */
public class LoggingSmsSender implements SmsSender {
    private static final Logger log = LoggerFactory.getLogger(LoggingSmsSender.class);

    @Override
    public void sendSms(String toE164, String message) {
        log.info("[SMS MOCK] to={} msg={}", toE164, message);
    }
}
