package com.foodchain.repo;

import com.foodchain.domain.Donation;
import com.foodchain.domain.DonationStatus;
import com.foodchain.domain.User;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findByDonorOrderByCreatedAtDesc(User donor);
    List<Donation> findByStatusAndDayKey(DonationStatus status, LocalDate dayKey);
    List<Donation> findByDayKey(LocalDate dayKey);
}
