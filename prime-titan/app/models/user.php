<?php

class User
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    // Busca un usuario por email o username

    public function findByEmailOrUsername($input) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE username = :input OR email = :input LIMIT 1");
        $stmt->execute(['input' => $input]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    // Obtiene un usuario por ID
     
    public function findById($id) {
        $stmt = $this->db->prepare(
            "SELECT id, username, email, avatar, created_at
             FROM users
             WHERE id = :id"
        );
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateAvatar($id, $avatar) {
        $query = "UPDATE users SET avatar = :avatar WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':avatar', $avatar);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }


}
