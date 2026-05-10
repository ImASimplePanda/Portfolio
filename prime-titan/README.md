-- =================================================
-- BASE DE DATOS: prime_titan_db
-- =================================================
CREATE DATABASE IF NOT EXISTS prime_titan_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE prime_titan_db;

-- -------------------------------------------------
-- 1. TABLA: users
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT 'default-avatar.png',
    role ENUM('normal','admin') NOT NULL DEFAULT 'normal',
    theme VARCHAR(10) DEFAULT 'light',
    language VARCHAR(5) DEFAULT 'es',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------
-- 2. TABLA: products
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- Contenido Multilenguaje
    name_es VARCHAR(100) NOT NULL,
    description_es TEXT,
    name_en VARCHAR(100),
    description_en TEXT,
    -- Datos comerciales
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    image VARCHAR(255) DEFAULT 'default-product.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------
-- 3. TABLA: wishlist
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
-- 4. TABLA: rating
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS rating (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cantidad INT NOT NULL DEFAULT 0,    
    idPr INT NOT NULL,                  
    idUs INT NOT NULL,                  
    UNIQUE KEY unique_user_product (idUs, idPr),
    CONSTRAINT fk_rating_product FOREIGN KEY (idPr) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rating_user FOREIGN KEY (idUs) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- -------------------------------------------------
-- 5. TABLA: exercises_library
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS exercises_library (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_es VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    muscle_group VARCHAR(50), 
    image_url VARCHAR(255),
    is_recommended TINYINT(1) DEFAULT 0
);

-- -------------------------------------------------
-- 6. TABLA: user_workouts
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS user_workouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    day_of_week TINYINT, -- 0 (Lunes) a 6 (Domingo)
    exercise_id INT NOT NULL,
    sets INT DEFAULT 3,
    reps VARCHAR(20) DEFAULT '8-10',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises_library(id) ON DELETE CASCADE
);

-- =================================================
-- INSERCIÓN DE DATOS INICIALES
-- =================================================

-- Productos
INSERT INTO products (name_es, description_es, name_en, description_en, price, stock, image) VALUES
('Proteína Whey', 'Proteína de suero para aumentar masa muscular.', 'Whey Protein', 'Whey protein to support muscle growth.', 29.99, 50, 'proteina-whey.jpg'),
('Creatina Monohidrato', 'Suplemento para mejorar fuerza y rendimiento.', 'Creatine Monohydrate', 'Supplement designed to improve strength and performance.', 19.99, 40, 'creatina.jpg'),
('Straps de Levantamiento', 'Straps resistentes para barra y mancuernas.', 'Lifting Straps', 'Durable straps for barbell and dumbbell training.', 9.99, 100, 'straps.jpg'),
('Cinturón de Pesas', 'Cinturón de soporte lumbar para levantamiento pesado.', 'Weightlifting Belt', 'Lumbar support belt for heavy lifting.', 24.99, 30, 'cinturon.jpg'),
('Guantes de Gimnasio', 'Guantes antideslizantes para entrenamientos seguros.', 'Gym Gloves', 'Non-slip gloves for safe and comfortable workouts.', 14.99, 60, 'guantes.jpg'),
('Banda Elástica', 'Bandas de resistencia para ejercicios de fuerza.', 'Resistance Band', 'Resistance bands for strength and mobility exercises.', 12.99, 80, 'banda.jpg'),
('Botella de Agua Deportiva', 'Botella de 1L para mantenerse hidratado.', 'Sports Water Bottle', '1-liter bottle to stay hydrated during training.', 7.99, 150, 'botella.jpg'),
('Rueda de Abdominales', 'Rueda para entrenar abdomen y core.', 'Ab Wheel', 'Ab wheel for core and abdominal training.', 15.99, 40, 'rueda-abs.jpg'),
('Rodilleras de Soporte', 'Rodilleras acolchadas para levantar peso.', 'Support Knee Sleeves', 'Padded knee sleeves for weightlifting support.', 18.99, 50, 'rodilleras.jpg'),
('Cuerda para Saltar', 'Cuerda de alta velocidad para cardio.', 'Jump Rope', 'High-speed rope for cardio training.', 8.99, 70, 'cuerda.jpg');

-- Ejercicios
INSERT INTO exercises_library (name_es, name_en, muscle_group, image_url, is_recommended) VALUES
('Press de Banca', 'Bench Press', 'pecho', 'bench_press.jpg', 1),
('Press Inclinado', 'Incline Press', 'pecho', 'incline_press.jpg', 0),
('Remo con Barra', 'Barbell Row', 'espalda', 'barbell_row.jpg', 1),
('Sentadilla', 'Squat', 'pierna', 'squat.jpg', 1),
('Extensión de Pierna', 'Leg Extension', 'pierna', 'leg_extension.jpg', 0),
('Peso Muerto Rumano', 'Romanian Deadlift', 'isquios', 'romanian_deadlift.jpg', 0),
('Press Militar', 'Military Press', 'hombro', 'military_press.jpg', 1),
('Curl de Bíceps', 'Bicep Curl', 'brazo', 'bicep_curl.jpg', 0);

-- Usuario Administrador
INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@example.com', '$2y$10$rfuRV.G2CmJJ.Ph4hJFP3eIB31sR8jqWuZPVU5JCpRMIwrOEufzoa', 'admin');

# Si el usuario admin no funciona

Abrir en el navegador el fichero app/test_hash.php . Este da un hash de la contraseña admin, utilizar ese hash para 
crear el usuario