const db = require("../config/db");

class Candidate {

  static async findByPosition(position) { 
        try { const query = 'SELECT id, name, position, photo, password, role FROM candidates WHERE position = ?';
             const [rows] = await db.execute(query, [position]); return rows.length > 0 ? rows[0] : null; }
              catch (error) 
              { console.error("Error finding candidate by position:", error.message); 
                throw new Error("Database error during candidate lookup"); 
            }
         }

  // Find all candidates
  static async findAll() {
    try {
      const query = 'SELECT id, name, position, photo FROM candidates';
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      console.error("Error fetching candidates:", error.message);
      throw new Error("Database error during candidate lookup");
    }
  }

  // Get vote count
  static async getVoteCount() {
    try {
      const query = 'SELECT position, name, vote_count FROM candidates ORDER BY vote_count DESC';
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      console.error("Error fetching vote count:", error.message);
      throw new Error("Database error during vote count lookup");
    }
  }

  // Update vote count
  static async updateVoteCount(candidateId) {
    try {
      const query = 'UPDATE candidates SET vote_count = vote_count + 1 WHERE id = ?';
      await db.execute(query, [candidateId]);
    } catch (error) {
      console.error("Error updating vote count:", error.message);
      throw new Error("Database error during vote count update");
    }
  }

  // Add a new candidate
  static async create({ name, position, photo, password }) {
    try {
      const query = 'INSERT INTO candidates (name, position, photo, password, role) VALUES (?, ?, ?, ?, ?)';
      await db.execute(query, [name, position, photo, password, 'candidate']);
    } catch (error) {
      console.error("Error creating candidate:", error.message);
      throw new Error("Database error during candidate creation");
    }
  }

  static async findById(id) { 
    try {
       const query = 'SELECT id, name, position, photo, vote_count FROM candidates WHERE id = ?'; 
       const [rows] = await db.execute(query, [id]);
        return rows.length > 0 ? rows[0] : null; 
      } catch (error) { 
        console.error("Error finding candidate by ID:", error.message);
         throw new Error("Database error during candidate lookup"); 
        } 
      }

  static async update(id, updates) {
         try { 
          const query = 'UPDATE candidates SET name = ?, position = ?, photo = ? WHERE id = ?';
          await db.execute(query, [updates.name, updates.position, updates.photo,id]);
         } catch (error) {
           console.error("Error updating candidate:", error.message);
            throw new Error("Database error during candidate update"); 
          } 
        }
  
  static async search(query) { 
    try { 
      const sqlQuery = `SELECT id, name, position, photo, vote_count FROM candidates WHERE name LIKE ? OR position LIKE ?`; 
      const searchQuery = `%${query}%`; 
      const [rows] = await db.execute(sqlQuery, [searchQuery, searchQuery]); 
      return rows; } 
      catch (error) { 
        console.error("Error searching candidates:", error.message); 
        throw new Error("Database error during candidate search"); }
       
    }
    static async delete(id) { 
      try { const query = 'DELETE FROM candidates WHERE id = ?'; 
        await db.execute(query, [id]); 
      
      }
       catch (error) { 
        console.error("Error deleting candidate:", error.message); 
        throw new Error("Database error during candidate deletion"); 
      }
     } 

    static async approve(id) { 
      try { const query = 'UPDATE candidates SET approved = 1 WHERE id = ?';
         await db.execute(query, [id]); 
        } 
        catch (error) { 
          console.error("Error approving candidate:", error.message); 
          throw new Error("Database error during candidate approval"); 
        } 
      }
    
    static async count() {
     try { 
     const query = 'SELECT COUNT(*) as count FROM candidates'; 
     const [rows] = await db.execute(query); return rows[0].count; 
     } 
     catch (error) { 
     console.error("Error counting candidates:", error.message); 
     throw new Error("Database error during candidate count"); 
     } 
     }
}

module.exports = Candidate;
