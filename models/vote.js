const db = require('../config/db');

class Vote {
    static async findByStudentAndPosition(studentId, position) {
        const [rows] = await db.execute(
            'SELECT * FROM student_votes WHERE student_id = ? AND position = ?',
            [studentId, position]
        );
        return rows;
    }

    static async create(studentId, candidateId, position) {
        await db.execute(
            'INSERT INTO student_votes (student_id, candidate_id, position) VALUES (?, ?, ?)',
            [studentId, candidateId, position]
        );
    }

    static async countVotes() {
        const [rows] = await db.execute(
            'SELECT candidate_id, COUNT(*) as votes FROM student_votes GROUP BY candidate_id'
        );
        return rows;
    }

    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM student_votes');
        return rows;
    }
}

module.exports = Vote;
