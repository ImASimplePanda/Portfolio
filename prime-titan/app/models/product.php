<?php
class Product {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    // Obtener todos los productos (respetando idioma con fallback)
    public function getAll() {
        $lang = $_SESSION['user']['language'] ?? 'es';

        $nameField = "name_" . $lang;
        $descField = "description_" . $lang;

        $sql = "
            SELECT 
                id,
                COALESCE($nameField, name_es) AS name,
                COALESCE($descField, description_es) AS description,
                price,
                stock,
                image,
                created_at
            FROM products
            ORDER BY id ASC
        ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Obtener un producto por ID (respetando idioma con fallback)
    public function getById($id) {
        $lang = $_SESSION['user']['language'] ?? 'es';

        $nameField = "name_" . $lang;
        $descField = "description_" . $lang;

        $sql = "
            SELECT 
                id,
                COALESCE($nameField, name_es) AS name,
                COALESCE($descField, description_es) AS description,
                price,
                stock,
                image,
                created_at
            FROM products
            WHERE id = ?
        ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Comprobar si existe un producto con ese nombre (en español)
    public function existsByName($name) {
        $stmt = $this->pdo->prepare("SELECT id FROM products WHERE name_es = :name LIMIT 1");
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

    // Actualizar un producto (solo nombre en español, de momento)
    public function update($id, $name, $price, $image) {
        $sql = "UPDATE products 
                SET name_es = :name, price = :price, image = :image 
                WHERE id = :id";

        $query = $this->pdo->prepare($sql);
        $query->bindParam(':name', $name);
        $query->bindParam(':price', $price);
        $query->bindParam(':image', $image);
        $query->bindParam(':id', $id, PDO::PARAM_INT);

        return $query->execute();
    }

    // Crear un producto (usa name_es como nombre principal)
    public function create($name, $price, $image) {

        // Comprobar si ya existe (por nombre en español)
        if ($this->existsByName($name)) {
            return false; 
        }

        // Insertar si no existe
        $sql = "INSERT INTO products (name_es, price, image) 
                VALUES (:name, :price, :image)";

        $query = $this->pdo->prepare($sql);
        $query->bindParam(':name', $name);
        $query->bindParam(':price', $price);
        $query->bindParam(':image', $image);

        return $query->execute();
    }

    // Obtener media de valoración de un producto
    public function getRatingAverage($productId) {
        $sql = "SELECT AVG(cantidad) AS media FROM votos WHERE idPr = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$productId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['media'] ?? 0;
    }

    // Obtener número de votos
    public function getRatingCount($productId) {
        $sql = "SELECT COUNT(*) AS total FROM votos WHERE idPr = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$productId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'] ?? 0;
    }

    // Comprobar si un usuario ya votó
    public function userHasRated($productId, $username) {
        $sql = "SELECT * FROM votos WHERE idPr = ? AND idUs = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$productId, $username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Insertar voto
    public function insertVote($productId, $username, $rating) {
        $sql = "INSERT INTO votos (cantidad, idPr, idUs) VALUES (?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$rating, $productId, $username]);
    }

    // Actualizar voto
    public function updateVote($productId, $username, $rating) {
        $sql = "UPDATE votos SET cantidad = ? WHERE idPr = ? AND idUs = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$rating, $productId, $username]);
    }


}
