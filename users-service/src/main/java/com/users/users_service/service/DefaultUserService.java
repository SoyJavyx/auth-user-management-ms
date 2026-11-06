package com.users.users_service.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.users.users_service.dto.CreateUserRequest;
import com.users.users_service.dto.UserResponse;
import com.users.users_service.entity.User;
import com.users.users_service.repository.UserRepository;

@Service 
public class DefaultUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DefaultUserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse createUser(CreateUserRequest request) {
        try{
            boolean emailExists = userRepository.existsByEmailIgnoreCase(request.getEmail());
            
            if (emailExists) {
                throw new RuntimeException("El correo ya está registrado");
            }

            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            
            String encodedPassword = passwordEncoder.encode(request.getPassword());
            user.setPassword(encodedPassword);

            user.setCreatedAt(java.time.LocalDateTime.now());
            
            User savedUser = userRepository.save(user);
            return mapToResponse(savedUser);


        } catch (Exception e) {
            throw new RuntimeException("Error al crear el usuario: " + e.getMessage());
        }
    }

    public UserResponse getUserById(int id) {
        try{
            Optional<User> userOptional = userRepository.findById(id);
            if (!userOptional.isPresent()) {
                throw new RuntimeException("Usuario no encontrado");
            }
            User user = userOptional.get();
            return mapToResponse(user);
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener el usuario: " + e.getMessage());
        }
    }

    public UserResponse updateUser(int id, CreateUserRequest request) {
        try{
            Optional<User> user = userRepository.findById(id);
            if (!user.isPresent()) {
                throw new RuntimeException("Usuario no encontrado");
            }
            User userAux = user.get();
            userAux.setName(request.getName());
            userAux.setEmail(request.getEmail());
          if(request.getPassword() != null && !request.getPassword().isEmpty()) {

                String encodedPassword = passwordEncoder.encode(request.getPassword());
                userAux.setPassword(encodedPassword);
            }
            User updatedUser = userRepository.save(userAux);
            return mapToResponse(updatedUser);
        } catch (Exception e) {
            throw new RuntimeException("Error al actualizar el usuario: " + e.getMessage());
        }
    }

    public UserResponse deleteUser(int id) {
        try{
            Optional<User> userOptional = userRepository.findById(id);
            if (!userOptional.isPresent()) {
                throw new RuntimeException("Usuario no encontrado");
            }
            User user = userOptional.get();
            UserResponse value = mapToResponse(user);
            userRepository.delete(user);
            return value;

        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar el usuario: " + e.getMessage());
        }
    }
    
    public List<UserResponse> getAllUsers() {
        try{
          List<User> users = userRepository.findAll();
          List<UserResponse> usersList = new ArrayList<>();

          for (User user : users) {
              UserResponse userAux = mapToResponse(user);
              usersList.add(userAux);
          }
          return usersList;

        } catch (Exception e) {
            throw new RuntimeException("Error al obtener los usuarios: " + e.getMessage());
        }
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
