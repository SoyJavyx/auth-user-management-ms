# Sistema de Autenticación y Gestión de Usuarios

Este proyecto implementa una arquitectura de dos microservicios independientes y un frontend en Angular para la autenticación y administración (CRUD) de usuarios.

---

## 1. Arquitectura de la solución

La aplicación está dividida en tres componentes independientes:

```
[ Frontend: Angular ]  (Puerto 3000)
      |                \
      | POST /auth/login\ GET, POST, PUT, DELETE /users
      v                  v
[ Auth Service ] ---> [ Users Service ]  (Puerto 8082)
 (Puerto 8081)  HTTP         |
                       [ PostgreSQL ] (Puerto 5432)
```

- **Users Service (Puerto 8082):** Es el único servicio con acceso a la base de datos PostgreSQL. Administra el ciclo de vida de los usuarios (crear, listar, consultar, actualizar, eliminar) y valida credenciales comparando contraseñas cifradas con BCrypt a través del endpoint `POST /users/validate`.
- **Auth Service (Puerto 8081):** Microservicio encargado del inicio de sesión. No se conecta a ninguna base de datos; recibe la petición de login del usuario y consulta al Users Service mediante HTTP para validar las credenciales.
- **Frontend (Puerto 3000):** Aplicación SPA en Angular (Standalone Components y Signals) que ofrece la pantalla de login con validación en tiempo real y el panel de administración de usuarios protegido por guardias de navegación.

---

## 2. URLs de cada componente

| Componente | URL base | Descripción |
|---|---|---|
| **Frontend** | `http://localhost:3000` | Interfaz web de login y CRUD |
| **Auth Service** | `http://localhost:8081` | Endpoint `POST /auth/login` |
| **Users Service** | `http://localhost:8082` | Endpoints `/users` y `/users/validate` |
| **PostgreSQL** | `localhost:5432` | Base de datos `users_db` |
| **pgAdmin (opcional)** | `http://localhost:5050` | Administrador web de la base de datos |

---

## 3. Credenciales de acceso por defecto

Al arrancar por primera vez, el servicio de usuarios inicializa automáticamente un usuario administrador en la base de datos:

- **Email:** `admin@prueba.com`
- **Contraseña:** `Admin123`

---

## 4. Cómo levantar el proyecto paso a paso

### Requisitos previos
- Java JDK 17 o superior.
- Node.js 18 o superior y npm.
- Docker y Docker Compose (para la base de datos PostgreSQL).

---

### Paso 1: Levantar la base de datos PostgreSQL

Desde la raíz del proyecto:

```bash
# Iniciar el contenedor de PostgreSQL
docker compose up -d db
```

Verifica que el contenedor esté corriendo con `docker ps`.

---

### Paso 2: Iniciar Users Service (Puerto 8082)

Abre una terminal en la carpeta `users-service`:

```bash
cd users-service

# En Windows (PowerShell / CMD):
.\mvnw.cmd spring-boot:run

# En Linux / macOS:
./mvnw spring-boot:run
```

El servicio iniciará en el puerto 8082 y creará automáticamente el usuario inicial `admin@prueba.com`.

---

### Paso 3: Iniciar Auth Service (Puerto 8081)

Abre una nueva terminal en la carpeta `auth-service`:

```bash
cd auth-service

# En Windows (PowerShell / CMD):
.\mvnw.cmd spring-boot:run

# En Linux / macOS:
./mvnw spring-boot:run
```

El servicio iniciará en el puerto 8081 y se comunicará con el Users Service en `http://localhost:8082`.

---

### Paso 4: Iniciar el Frontend (Puerto 3000)

Abre una nueva terminal en la carpeta `frontend`:

```bash
cd frontend

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar servidor de desarrollo en el puerto 3000
npm start
```

Abre tu navegador en:
```
http://localhost:3000
```

---

### Opción alternativa: Ejecutar y depurar en Visual Studio Code

Si prefieres levantar los microservicios directamente desde VS Code:
1. Copia la plantilla `.vscode/launch.json.example` como `.vscode/launch.json`.
2. Si cambiaste la contraseña de base de datos en tu `.env`, ajústala en `DB_PASSWORD`.
3. En la pestaña **Ejecutar y depurar (Run and Debug)** de VS Code, ejecuta `UsersServiceApplication` y `AuthServiceApplication`.

---

## 5. Decisiones de diseño y posibles mejoras

### Decisiones tomadas:
1. **Desacoplamiento estricto de base de datos:** Solo `users-service` incluye dependencias JPA y JDBC hacia PostgreSQL. `auth-service` opera como cliente HTTP usando `RestTemplate`, manteniendo la URL de destino configurable mediante la variable de entorno `USERS_SERVICE_URL`.
2. **Seguridad y privacidad de contraseñas:**
   - Las contraseñas se almacenan cifradas con BCrypt.
   - Las respuestas de la API nunca exponen el hash ni el campo de la contraseña.
   - En el frontend, el formulario de edición no sobrescribe contraseñas si el campo se deja vacío, y el `localStorage` solo almacena los datos de sesión públicos (id, nombre, correo).
3. **Frontend modular con Angular moderno:**
   - Uso de componentes Standalone y Signals reactivos.
   - Guardian de rutas (`authGuard`) para impedir el acceso a pantallas privadas sin sesión local.
   - Interfaz sobria, funcional y limpia sin librerías pesadas ni dependencias innecesarias.

### Qué mejoraría con más tiempo:
1. **API Gateway:** Implementar Spring Cloud Gateway o Nginx para tener una única puerta de entrada hacia el frontend y enrutar el tráfico internamente.
2. **Seguridad robusta con tokens:** Incorporar tokens de sesión con expiración o JWT firmados con llaves asimétricas si los requerimientos de producción lo exigen.
3. **Paginación en backend:** Implementar `Pageable` en Users Service para soportar grandes volúmenes de usuarios en la tabla.
4. **Pruebas End-to-End:** Sumar pruebas automáticas con Cypress o Playwright que validen el flujo completo desde el login hasta la eliminación de usuarios en el navegador.
