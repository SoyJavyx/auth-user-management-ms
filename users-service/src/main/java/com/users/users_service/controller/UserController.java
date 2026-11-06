package com.users.users_service.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.users.users_service.dto.CreateUserRequest;
import com.users.users_service.dto.UserResponse;
import com.users.users_service.service.DefaultUserService;

import java.util.List;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController 
@RequestMapping ("/api/users")
public class UserController {

    private final DefaultUserService userService;

    //Damos uso al servicio de usuario para poder utilizar sus metodos
    public UserController(DefaultUserService userService) {
        this.userService = userService;
    }

    //Crear un usuario
    @PostMapping
    public UserResponse createUser(@RequestBody CreateUserRequest request) {
        return userService.createUser(request);
    }

    //Actualizar un usuario
    @RequestMapping(value = "update/{id}")
    public UserResponse updateUser(@PathVariable int id, @RequestBody CreateUserRequest request) {
        return userService.updateUser(id, request);
    }

    //Eliminar un usuario
    @RequestMapping(value = "delete/{id}")
    public UserResponse deleteUser(@PathVariable int id) {
        return userService.deleteUser(id);
    }

    //Buscar por Id
    @RequestMapping("/{id}")
    public UserResponse getUserById(@PathVariable int id) {
        return userService.getUserById(id);
    }

    //Buscar todos los usuarios
    @RequestMapping("/all")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    
}
