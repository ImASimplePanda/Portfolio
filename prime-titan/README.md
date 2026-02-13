# prime-titan
# base de datos

-- -------------------------------------------------
-- CREAR BASE DE DATOS
-- -------------------------------------------------
CREATE DATABASE IF NOT EXISTS prime_titan_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE prime_titan_db;

-- -------------------------------------------------
-- TABLA: USERS
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT 'default-avatar.png',
    role ENUM('normal','admin') NOT NULL DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------
-- TABLA: PRODUCTS
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    image VARCHAR(255) DEFAULT 'default-product.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------
-- TABLA: WISHLIST
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- -------------------------------------------------
-- TABLA: RATINGS
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- -------------------------------------------------
-- INSERTAR 10 PRODUCTOS DE GIMNASIO
-- -------------------------------------------------
INSERT INTO products (name, description, price, stock, image) VALUES
('Proteína Whey', 'Proteína de suero para aumentar masa muscular.', 29.99, 50, 'proteina-whey.jpg'),
('Creatina Monohidrato', 'Suplemento para mejorar fuerza y rendimiento.', 19.99, 40, 'creatina.jpg'),
('Straps de Levantamiento', 'Straps resistentes para barra y mancuernas.', 9.99, 100, 'creatina.jpg'),
('Cinturón de Pesas', 'Cinturón de soporte lumbar para levantamiento pesado.', 24.99, 30, 'creatina.jpg'),
('Guantes de Gimnasio', 'Guantes antideslizantes para entrenamientos seguros.', 14.99, 60, 'creatina.jpg'),
('Banda Elástica', 'Bandas de resistencia para ejercicios de fuerza.', 12.99, 80, 'creatina.jpg'),
('Botella de Agua Deportiva', 'Botella de 1L para mantenerse hidratado.', 7.99, 150, 'creatina.jpg'),
('Rueda de Abdominales', 'Rueda para entrenar abdomen y core.', 15.99, 40, 'creatina.jpg'),
('Rodilleras de Soporte', 'Rodilleras acolchadas para levantar peso.', 18.99, 50, 'creatina.jpg'),
('Cuerda para Saltar', 'Cuerda de alta velocidad para cardio.', 8.99, 70, 'creatina.jpg');

INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@example.com', '$2y$10$rfuRV.G2CmJJ.Ph4hJFP3eIB31sR8jqWuZPVU5JCpRMIwrOEufzoa', 'admin');


# Si el usuario admin no funciona

Abrir en el navegador el fichero app/test_hash.php . Este da un hash de la contraseña admin, utilizar ese hash para 
crear el usuario