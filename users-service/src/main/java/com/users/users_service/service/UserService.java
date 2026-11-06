package com.users.users_service.service;

import com.users.users_service.dto.UserResponse;

import java.util.List;

import com.users.users_service.dto.CreateUserRequest;
import com.users.users_service.dto.UpdateUserRequest;

public interface UserService {

    UserResponse createUser(CreateUserRequest request);
    UserResponse getUserById(int id);
    UserResponse updateUser(int id, UpdateUserRequest request);
    UserResponse deleteUser(int id);
    List<UserResponse> getAllUsers();

}
