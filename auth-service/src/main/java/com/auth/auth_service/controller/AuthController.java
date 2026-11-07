package com.auth.auth_service.controller;

import com.auth.auth_service.dto.LoginRequest;
import com.auth.auth_service.dto.TokenResponse;
import com.auth.auth_service.entity.User;
import com.auth.auth_service.repository.UserRepository;
import com.auth.auth_service.security.JwtProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

   
    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtProvider jwtProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Buscar el usuario por email
            Optional<User> userOptional = userRepository.findByEmailIgnoreCase(loginRequest.getEmail());

            if (userOptional.isPresent()) {
                User user = userOptional.get();
                
                // Verificar la contraseña
                if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                    // Generar token JWT
                    String token = jwtProvider.generateToken(user.getEmail());
                    return ResponseEntity.ok(new TokenResponse(token));
                } else {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Contraseña incorrecta");
                }
            } else {
                // Usuario no encontrado
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario no encontrado");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error en el servidor");
        }
    }
}