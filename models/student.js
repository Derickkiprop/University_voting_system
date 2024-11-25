const db = require("../config/db");

class Student {
  // Find student by email
  static async findByEmail(email) {
    try {
      const query = 'SELECT id, name, email, department, regNo, password, role FROM students WHERE email = ?';
      const [rows] = await db.execute(query, [email]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error finding student:", error.message);
      throw new Error("Database error during student lookup");
    }
  }

  // Create a new student
  static async create({ name, email, department, regNo, password }) {
    try {
      const query = 'INSERT INTO students (name, email, department, regNo, password,role) VALUES (?, ?, ?, ?, ?, ?)';
      await db.execute(query, [name, email, department, regNo, password,'student']);
    } catch (error) {
      console.error("Error creating student:", error.message);
      throw new Error("Database error during student creation");
    }
  }

  static async update(id, updates) { 
    try {
       const query = 'UPDATE students SET name = ?, email = ? WHERE id = ?'; 
       await db.execute(query, [updates.name, updates.email, id]); 
      } 
      catch (error) { 
        console.error("Error updating student:", error.message);
         throw new Error("Database error during student update"); 
        } 
      } 
      
  static async delete(id) { 
    try { 
    const query = 'DELETE FROM students WHERE id = ?'; 
    await db.execute(query, [id]);
   } 
   catch (error) { 
    console.error("Error deleting student:", error.message);
     throw new Error("Database error during student deletion"); 
    } 
  }

  static async count() {
     try { 
      const query = 'SELECT COUNT(*) as count FROM students';
       const [rows] = await db.execute(query); 
       return rows[0].count;
       } 
       catch (error) { 
        console.error("Error counting students:", error.message); 
        throw new Error("Database error during student count"); 
      } 
    }
}

module.exports = Student;
