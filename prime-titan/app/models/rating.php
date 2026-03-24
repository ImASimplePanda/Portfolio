<?php

class Rating {

    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // Obtener promedio y total de votos
    public function getAverageRating($productId) {
        $stmt = $this->db->prepare("
            SELECT 
                AVG(cantidad) AS average,
                COUNT(*) AS votes
            FROM rating
            WHERE idPr = ?
        ");
        $stmt->execute([$productId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Guardar voto
    public function saveVote($userId, $productId, $rating) {
        try {
            $stmt = $this->db->prepare("INSERT INTO rating (cantidad, idPr, idUs) VALUES (?, ?, ?)");
            return $stmt->execute([$rating, $productId, $userId]);
        } catch (PDOException $e) {
            error_log("Error en saveVote: " . $e->getMessage());
            return false;
        }
    }

    // Comprobar si el usuario ya votó
    public function userHasVoted($userId, $productId) {
        $stmt = $this->db->prepare("SELECT id FROM rating WHERE idUs = ? AND idPr = ?");
        $stmt->execute([$userId, $productId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
