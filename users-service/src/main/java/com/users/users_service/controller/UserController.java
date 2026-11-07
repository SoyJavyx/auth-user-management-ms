package com.users.users_service.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.users.users_service.dto.CreateUserRequest;
import com.users.users_service.dto.UserResponse;
import com.users.users_service.dto.ValidateUserRequest;
import com.users.users_service.service.DefaultUserService;

import java.util.List;

@RestController 
@RequestMapping({"/users", "/api/users"})
public class UserController {

    private final DefaultUserService userService;

    // Damos uso al servicio de usuario para poder utilizar sus metodos
    public UserController(DefaultUserService userService) {
        this.userService = userService;
    }

    // Crear un usuario
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody CreateUserRequest request) {
        UserResponse created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Actualizar un usuario
    @RequestMapping(value = {"/{id}", "update/{id}"}, method = {RequestMethod.PUT, RequestMethod.POST})
    public UserResponse updateUser(@PathVariable int id, @RequestBody CreateUserRequest request) {
        return userService.updateUser(id, request);
    }

    // Eliminar un usuario
    @RequestMapping(value = {"/{id}", "delete/{id}"}, method = {RequestMethod.DELETE, RequestMethod.GET})
    public UserResponse deleteUser(@PathVariable int id) {
        return userService.deleteUser(id);
    }

    // Buscar por Id
    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable int id) {
        return userService.getUserById(id);
    }

    // Buscar todos los usuarios
    @GetMapping({"", "/all"})
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    // Validar credenciales (utilizado por Auth Service por HTTP)
    @PostMapping("/validate")
    public ResponseEntity<?> validateUser(@RequestBody ValidateUserRequest request) {
        UserResponse user = userService.validateUser(request.getEmail(), request.getPassword());
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email o contraseña incorrectos");
    }
}
