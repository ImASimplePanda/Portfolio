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
                ROUND(AVG(cantidad), 1) AS average, 
                COUNT(*) AS votes 
            FROM rating 
            WHERE idPr = ?
        ");
        $stmt->execute([$productId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Si no hay votos, devolvemos 0 explícitamente
        if (!$result['average']) {
            return ['average' => 0, 'votes' => 0];
        }
        return $result;
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
