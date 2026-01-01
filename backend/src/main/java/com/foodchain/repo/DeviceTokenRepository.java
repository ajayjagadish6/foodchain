package com.foodchain.repo;

import com.foodchain.domain.DeviceToken;
import com.foodchain.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {
    Optional<DeviceToken> findByToken(String token);
    List<DeviceToken> findByUser(User user);
    void deleteByToken(String token);
}
