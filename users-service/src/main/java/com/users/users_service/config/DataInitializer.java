package com.users.users_service.config;

import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.users.users_service.entity.User;
import com.users.users_service.repository.UserRepository;

@Configuration
public class DataInitializer {

    // Carga un usuario administrador inicial al iniciar la aplicacion si no existe
    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByEmailIgnoreCase("admin@prueba.com")) {
                User admin = new User();
                admin.setName("Administrador");
                admin.setEmail("admin@prueba.com");
                admin.setPassword(passwordEncoder.encode("Admin123"));
                admin.setCreatedAt(LocalDateTime.now());
                userRepository.save(admin);
                System.out.println("Usuario administrador inicial creado: admin@prueba.com");
            }
        };
    }
}
