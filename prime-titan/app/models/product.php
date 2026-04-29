<?php
class Product {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    // Obtener todos los productos (respetando idioma y marcando favoritos)
    public function getAll($user_id = 0) {
        $lang = $_SESSION['user']['language'] ?? 'es';
        $nameField = "name_" . $lang;
        $descField = "description_" . $lang;

        // Forzamos que $user_id sea un número
        $user_id = intval($user_id);

        $sql = "
            SELECT 
                p.id,
                COALESCE(p.$nameField, p.name_es) AS name,
                COALESCE(p.$descField, p.description_es) AS description,
                p.price,
                p.stock,
                p.image,
                p.created_at,
                (SELECT COUNT(*) FROM wishlist w WHERE w.product_id = p.id AND w.user_id = $user_id) AS is_favorite
            FROM products p
            ORDER BY p.id ASC
        ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Obtener un producto por ID (respetando idioma y marcando favorito)
    public function getById($id, $user_id = 0) {
        $lang = $_SESSION['user']['language'] ?? 'es';
        $nameField = "name_" . $lang;
        $descField = "description_" . $lang;

        $sql = "
            SELECT 
                p.id,
                COALESCE(p.$nameField, p.name_es) AS name,
                COALESCE(p.$descField, p.description_es) AS description,
                p.price,
                p.stock,
                p.image,
                p.created_at,
                (SELECT COUNT(*) FROM wishlist w WHERE w.product_id = p.id AND w.user_id = ?) AS is_favorite
            FROM products p
            WHERE p.id = ?
        ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$user_id, $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function existsByName($name) {
        $stmt = $this->pdo->prepare("SELECT id FROM products WHERE name_es = :name LIMIT 1");
        $stmt->execute([':name' => $name]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ? true : false;
    }

    public function delete($id) {
        $sql = "DELETE FROM products WHERE id = :id";
        $query = $this->pdo->prepare($sql);
        $query->bindParam(':id', $id, PDO::PARAM_INT);
        return $query->execute();
    }

    public function update($id, $name, $price, $image) {
        $sql = "UPDATE products SET name_es = :name, price = :price, image = :image WHERE id = :id";
        $query = $this->pdo->prepare($sql);
        $query->bindParam(':name', $name);
        $query->bindParam(':price', $price);
        $query->bindParam(':image', $image);
        $query->bindParam(':id', $id, PDO::PARAM_INT);
        return $query->execute();
    }

    public function create($name_es, $name_en, $description_es, $description_en, $price, $image) {
        if ($this->existsByName($name_es)) return false; 
        $sql = "INSERT INTO products (name_es, name_en, description_es, description_en, price, image) 
                VALUES (:name_es, :name_en, :description_es, :description_en, :price, :image)";
        $query = $this->pdo->prepare($sql);
        $query->bindParam(':name_es', $name_es);
        $query->bindParam(':name_en', $name_en);
        $query->bindParam(':description_es', $description_es);
        $query->bindParam(':description_en', $description_en);
        $query->bindParam(':price', $price);
        $query->bindParam(':image', $image);
        return $query->execute();
    }

    public function getRatingAverage($productId) {
        $sql = "SELECT AVG(cantidad) AS media FROM votos WHERE idPr = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$productId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['media'] ?? 0;
    }

    public function getRatingCount($productId) {
        $sql = "SELECT COUNT(*) AS total FROM votos WHERE idPr = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$productId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'] ?? 0;
    }

    public function userHasRated($productId, $username) {
        $sql = "SELECT * FROM votos WHERE idPr = ? AND idUs = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$productId, $username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function insertVote($productId, $username, $rating) {
        $sql = "INSERT INTO votos (cantidad, idPr, idUs) VALUES (?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$rating, $productId, $username]);
    }

    public function updateVote($productId, $username, $rating) {
        $sql = "UPDATE votos SET cantidad = ? WHERE idPr = ? AND idUs = ?";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([$rating, $productId, $username]);
    }
}