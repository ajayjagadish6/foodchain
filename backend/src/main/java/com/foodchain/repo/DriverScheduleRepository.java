package com.foodchain.repo;

import com.foodchain.domain.DriverSchedule;
import com.foodchain.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverScheduleRepository extends JpaRepository<DriverSchedule, Long> {
    List<DriverSchedule> findByDriver(User driver);
    Optional<DriverSchedule> findByDriverAndDayOfWeek(User driver, String dayOfWeek);
    void deleteByDriver(User driver);
}
