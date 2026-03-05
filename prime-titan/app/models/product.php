<?php
class Product {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    // Obtener todos los productos
    public function getAll() {
        $stmt = $this->pdo->prepare("SELECT * FROM products ORDER BY id ASC");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Obtener un producto por ID 
    public function getById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Comprobar si existe un producto con ese nombre
    public function existsByName($name) {
        $stmt = $this->pdo->prepare("SELECT id FROM products WHERE name = :name LIMIT 1");
        $stmt->execute([':name' => $name]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ? true : false;
    }

    // Eliminar un producto
    public function delete($id) {
        $sql = "DELETE FROM products WHERE id = :id";
        $query = $this->pdo->prepare($sql);
        $query->bindParam(':id', $id, PDO::PARAM_INT);
        return $query->execute();
    }

    // Actualizar un producto
    public function update($id, $name, $price, $image) {
        $sql = "UPDATE products 
                SET name = :name, price = :price, image = :image 
                WHERE id = :id";

        $query = $this->pdo->prepare($sql);
        $query->bindParam(':name', $name);
        $query->bindParam(':price', $price);
        $query->bindParam(':image', $image);
        $query->bindParam(':id', $id, PDO::PARAM_INT);

        return $query->execute();
    }

    // Crear un producto (con validación de duplicados)
    public function create($name, $price, $image) {

        // Comprobar si ya existe
        if ($this->existsByName($name)) {
            return false; 
        }

        // Insertar si no existe
        $sql = "INSERT INTO products (name, price, image) 
                VALUES (:name, :price, :image)";

        $query = $this->pdo->prepare($sql);
        $query->bindParam(':name', $name);
        $query->bindParam(':price', $price);
        $query->bindParam(':image', $image);

        return $query->execute();
    }
}