package com.foodchain.service.sms;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

/**
 * Twilio SMS sender (enabled when SMS_ENABLED=true).
 */
public class TwilioSmsSender implements SmsSender {

    private final String fromE164;

    public TwilioSmsSender(String accountSid, String authToken, String fromE164) {
        this.fromE164 = fromE164;
        Twilio.init(accountSid, authToken);
    }

    @Override
    public void sendSms(String toE164, String message) {
        Message.creator(new PhoneNumber(toE164), new PhoneNumber(fromE164), message).create();
    }
}
