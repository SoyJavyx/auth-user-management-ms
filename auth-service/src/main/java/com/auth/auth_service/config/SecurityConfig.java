package com.auth.auth_service.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration 
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        
        // Permitir peticiones de PostMan
        http.csrf(csrf -> csrf.disable());
        
        // Habilitar CORS para permitir peticiones desde el frontend Angular (puerto 3000 y 4200)
        http.cors(Customizer.withDefaults());
        
        // Dejar pasar cualquier petición de internet
        http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // Cliente HTTP para comunicarse con el microservicio de usuarios
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
