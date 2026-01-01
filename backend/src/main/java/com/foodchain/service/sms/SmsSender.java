package com.foodchain.service.sms;

public interface SmsSender {
    void sendSms(String toE164, String message);
}
