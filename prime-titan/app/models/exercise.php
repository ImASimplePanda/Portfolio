<?php
class Exercise {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    // Obtener todos los ejercicios (con traducción automática a 'name')
    public function getAll() {
        // Detectamos el idioma tal como en Product
        $lang = $_SESSION['user']['language'] ?? 'es';
        $nameField = "name_" . $lang;

        $sql = "
            SELECT 
                id,
                COALESCE($nameField, name_es) AS name,
                muscle_group,
                image_url
            FROM exercises_library
            ORDER BY muscle_group ASC, name ASC
        ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Obtener un ejercicio por ID (para editar)
    public function getById($id) {
        $sql = "SELECT * FROM exercises_library WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Crear nuevo ejercicio
    public function create($name_es, $name_en, $muscle_group, $image_url) {
        $sql = "INSERT INTO exercises_library (name_es, name_en, muscle_group, image_url) VALUES (?, ?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$name_es, $name_en, $muscle_group, $image_url]);
    }

    // Actualizar ejercicio
    public function update($id, $name_es, $name_en, $muscle_group, $image_url) {
        $sql = "UPDATE exercises_library 
                SET name_es = ?, 
                    name_en = ?, 
                    muscle_group = ?, 
                    image_url = ? 
                WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$name_es, $name_en, $muscle_group, $image_url, $id]);
    }

    // Eliminar ejercicio
    public function delete($id) {
        $sql = "DELETE FROM exercises_library WHERE id = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$id]);
    }
}