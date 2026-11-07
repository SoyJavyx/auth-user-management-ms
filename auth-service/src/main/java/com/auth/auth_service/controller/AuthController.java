package com.auth.auth_service.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import com.auth.auth_service.dto.AuthUserResponse;
import com.auth.auth_service.dto.LoginRequest;

@RestController
@RequestMapping({"/auth", "/api/auth"})
public class AuthController {

    private final RestTemplate restTemplate;

    // URL configurada por variable de entorno o application.properties
    @Value("${users.service.url:http://localhost:8082}")
    private String usersServiceUrl;

    public AuthController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // El Auth Service valida las credenciales preguntando a Users Service por HTTP
            String url = usersServiceUrl + "/users/validate";
            ResponseEntity<AuthUserResponse> response = restTemplate.postForEntity(url, loginRequest, AuthUserResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return ResponseEntity.ok(response.getBody());
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email o contraseña incorrectos");

        } catch (HttpClientErrorException.Unauthorized | HttpClientErrorException.BadRequest e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email o contraseña incorrectos");
        } catch (HttpStatusCodeException e) {
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email o contraseña incorrectos");
            }
            return ResponseEntity.status(e.getStatusCode()).body("Error en servicio de usuarios: " + e.getResponseBodyAsString());
        } catch (ResourceAccessException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("No fue posible conectar con el servicio de usuarios");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error en el servidor");
        }
    }
}
