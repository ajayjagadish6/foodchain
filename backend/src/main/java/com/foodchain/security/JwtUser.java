package com.foodchain.security;

import com.foodchain.domain.Role;

public record JwtUser(long userId, String email, Role role) {}
