const db = require("../config/db");

class Admin {
    static async findByUsername(username) {
        try {
            const query = 'SELECT id, username, password_hash FROM admins WHERE username = ?';
            const [rows] = await db.execute(query, [username]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Error finding admin by username:", error.message);
            throw new Error("Database error during admin lookup");
        }
    }

    static async update(id, updates) {
        try {
            const query = 'UPDATE admins SET username = ?, password_hash = ? WHERE id = ?';
            await db.execute(query, [updates.username, updates.password_hash, id]);
        } catch (error) {
            console.error("Error updating admin:", error.message);
            throw new Error("Database error during admin update");
        }
    }

    static async create({ username, password_hash }) {
        try {
            const query = 'INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)';
            await db.execute(query, [username, password_hash, 'admin']);
        } catch (error) {
            console.error("Error creating admin:", error.message);
            throw new Error("Database error during admin creation");
        }
    }
}

module.exports = Admin;
