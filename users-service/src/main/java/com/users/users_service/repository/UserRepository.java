package com.users.users_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.users.users_service.entity.User;

/* Con esta interfaz se comunicada con la base de datos, agregue metodos 
basicos: buscar al usuario por correo y verificar si el correo existe */

public interface UserRepository extends JpaRepository<User, Integer> {
/* En el metodo buscar utilizo Optional que funciona para almacenar un
valor o estar vacio, se utiliza para evitar referencias nulas
esta informacion la encontre en :https://www.baeldung.com/java-optional */
Optional<User> findByEmailIgnoreMayus(String email);

boolean existsByEmailIgnoreMayus(String email);

}
