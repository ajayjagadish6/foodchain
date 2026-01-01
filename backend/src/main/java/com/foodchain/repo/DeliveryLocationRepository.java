package com.foodchain.repo;

import com.foodchain.domain.Delivery;
import com.foodchain.domain.DeliveryLocation;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DeliveryLocationRepository extends JpaRepository<DeliveryLocation, Long> {

    @Query(value = "select * from delivery_locations where delivery_id = ?1 order by recorded_at desc limit 1", nativeQuery = true)
    Optional<DeliveryLocation> findLatestForDelivery(long deliveryId);
}
