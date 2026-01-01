package com.foodchain.repo;

import com.foodchain.domain.PhoneVerificationCode;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhoneVerificationCodeRepository extends JpaRepository<PhoneVerificationCode, Long> {
    Optional<PhoneVerificationCode> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
