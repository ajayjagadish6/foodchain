package com.foodchain.repo;

import com.foodchain.domain.User;
import com.foodchain.domain.Role;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByRole(Role role);

    Optional<User> findByEmail(String email);
}
