<?php
class Exercise {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    // Obtener todos los ejercicios
    public function getAll() {
        $lang = $_SESSION['user']['language'] ?? 'es';
        $nameField = "name_" . $lang;

        $sql = "
            SELECT 
                id,
                COALESCE($nameField, name_es) AS name,
                muscle_group,
                image_url,
                is_recommended
            FROM exercises_library
            ORDER BY muscle_group ASC, name ASC
        ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Obtener un ejercicio por ID
    public function getById($id) {
        $sql = "SELECT * FROM exercises_library WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Crear nuevo ejercicio incluyendo recomendación
    public function create($name_es, $name_en, $muscle_group, $image_url, $is_recommended) {
        $sql = "INSERT INTO exercises_library (name_es, name_en, muscle_group, image_url, is_recommended) VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$name_es, $name_en, $muscle_group, $image_url, $is_recommended]);
    }

    // Actualizar ejercicio incluyendo recomendación
    public function update($id, $name_es, $name_en, $muscle_group, $image_url, $is_recommended) {
        $sql = "UPDATE exercises_library 
                SET name_es = ?, 
                    name_en = ?, 
                    muscle_group = ?, 
                    image_url = ?,
                    is_recommended = ?
                WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$name_es, $name_en, $muscle_group, $image_url, $is_recommended, $id]);
    }

    public function delete($id) {
        $sql = "DELETE FROM exercises_library WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$id]);
    }
}