package com.users.users_service.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Bean 
    public PasswordEncoder passwordEncoder() {
        BCryptPasswordEncoder encryptor = new BCryptPasswordEncoder();
        return encryptor;
    }

    @Bean 
    public SecurityFilterChain securityConfigutarion(HttpSecurity configurator) throws Exception {
        
        // priemra configuracion, la utilice para desactivar el bloqueo web para probar postman
        configurator.csrf(options -> options.disable());

        // Habilitar CORS para permitir peticiones desde el frontend Angular (puerto 3000 y 4200)
        configurator.cors(Customizer.withDefaults());

        // segunda configuracion, para que permita que cualquier peticion de internet pueda pasar
        configurator.authorizeHttpRequests(requests -> requests.anyRequest().permitAll());

        //tercera configuracion para empaquetar las configuraciones y construirlas
        SecurityFilterChain finalSetting = configurator.build();
        return finalSetting;
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
}
