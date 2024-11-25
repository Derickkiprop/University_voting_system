const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/student');

// Show the registration page 
exports.showRegisterPage = (req, res) => { res.render('auth/register'); }; 

// Show the login page 
exports.showLoginPage = (req, res) => { res.render('auth/login'); };

// Register a new student
exports.register = async (req, res) => {
    const { name, email, department, regNo, password } = req.body;

    if (!name || !email || !department || !regNo || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newStudent = {
            name,
            email,
            department,
            regNo,
            password: hashedPassword
        };

        await Student.create(newStudent);
        res.status(201).json({ message: 'Student registered successfully', student: newStudent });
    } catch (error) {
        res.status(500).json({ message: 'Error registering student', error });
    }
};

// Student login 
exports.login = async (req, res) => { 
    const { email, password } = req.body; 
    if (!email || !password) 
        {
             return res.status(400).json({ message: 'All fields are required' });
             } 
    try { 
    const student = await Student.findByEmail(email); 
    if (!student) 
        { 
            return res.status(400).json({ message: 'Invalid email or password' }); 
        } 
    const isMatch = await bcrypt.compare(password, student.password);
     if (!isMatch) { 
        return res.status(400).json({ message: 'Invalid email or password' });
     } 
     // Store student info in session
      req.session.user = { id: student.id, email: student.email, role: student.role};
       res.redirect('/vote/voting'); 
    } catch (error) { 
        res.status(500).json({ message: 'Error logging in', error });
     } 
    };