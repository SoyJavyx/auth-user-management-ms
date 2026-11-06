package com.users.users_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

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

        // segunda configuracion, para que permita que cualquier peticion de internet pueda pasar
        configurator.authorizeHttpRequests(requests -> requests.anyRequest().permitAll());

        //tercera configuracion para empaquetar las configuraciones y construirlas
        SecurityFilterChain finalSetting = configurator.build();
        return finalSetting;
    }
}
