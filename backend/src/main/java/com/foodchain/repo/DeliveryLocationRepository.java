package com.foodchain.repo;

import com.foodchain.domain.Delivery;
import com.foodchain.domain.DeliveryLocation;
import com.foodchain.domain.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DeliveryLocationRepository extends JpaRepository<DeliveryLocation, Long> {

    @Query(value = "select * from delivery_locations where delivery_id = ?1 order by recorded_at desc limit 1", nativeQuery = true)
    Optional<DeliveryLocation> findLatestForDelivery(long deliveryId);

    /** Most-recent GPS ping from any delivery this driver has ever worked. */
    @Query(value = "select dl.* from delivery_locations dl " +
                   "join deliveries d on d.id = dl.delivery_id " +
                   "where d.driver_id = ?1 " +
                   "order by dl.recorded_at desc limit 1", nativeQuery = true)
    Optional<DeliveryLocation> findLatestForDriver(long driverId);
}
