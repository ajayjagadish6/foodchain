package com.foodchain.repo;

import com.foodchain.domain.FoodRequest;
import com.foodchain.domain.RequestStatus;
import com.foodchain.domain.User;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoodRequestRepository extends JpaRepository<FoodRequest, Long> {
    List<FoodRequest> findByRecipientOrderByCreatedAtDesc(User recipient);
    List<FoodRequest> findByStatusAndDayKey(RequestStatus status, LocalDate dayKey);
    List<FoodRequest> findByDayKey(LocalDate dayKey);
}
