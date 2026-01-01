package com.foodchain.repo;

import com.foodchain.domain.Delivery;
import com.foodchain.domain.DeliveryStatus;
import com.foodchain.domain.User;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    List<Delivery> findByDriverAndDayKeyOrderByUpdatedAtDesc(User driver, LocalDate dayKey);
    List<Delivery> findByStatusAndDayKeyOrderByCreatedAtDesc(DeliveryStatus status, LocalDate dayKey);
    List<Delivery> findByDayKey(LocalDate dayKey);
}
