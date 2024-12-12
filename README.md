# University_voting_system

In the current political climate, student agents might easily be bought off to steal votes for a specific party. However, this technology handles and tabulates the votes, reducing the problem of inconsistent voting and promoting justice.

A web-based university voting system to facilitate student elections with administrative oversight. The system will include three user roles: Admin, Candidate, and Student. Key features include:

- Admin dashboard for managing candidates and students, including the ability to update or delete profiles
- Candidate approval process managed by admin
- One-time secure voting mechanism for students to ensure system integrity
- Candidate dashboard to view real-time vote counts and search for other candidates' results
- Student authentication and voting interface
- Candidate profiles and election information display

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)

  ## Description

This project demonstrates how to build a dynamic web app using:

- **Node.js** as the backend server
- **EJS** for rendering dynamic views (HTML templates)
- **MySQL** as the database to store and retrieve data

  ### Features:
- MySQL database connection and CRUD operations
- Dynamic content rendering using EJS
- Simple user interface that displays users from the database

 ## Installation

To get started with University_voting_system, follow these steps:

1. **Clone the repository**:
   
   https://github.com/Derickkiprop/University_voting_system.git

3. **Navigate to the project folder**:
   
   cd University_voting_system

4. **Install dependencies**:

npm install

4. **Set Up MySQL Database**:

3.1 Import the Database Schema

To set up the database, we have included a database.sql file inside the config folder. This file contains the necessary schema to create the database and admins,candidates  students and student_votes table.

Open MySQL Command Line or MySQL Client (e.g., MySQL Workbench, phpMyAdmin).

Create the database:

CREATE DATABASE university_voting

Import the SQL file:

**If you're using the MySQL command line**

you can run the following command to import the schema from the database.sql file:


mysql -u yourusername -p University_voting_system < config/database.sql


Replace yourusername with your MySQL username, and university_voting with the name of the database you just created.

**If you're using a MySQL client like MySQL Workbench**:

Open the database.sql file.

Execute the SQL script to create the users table and any other schema defined in the file.

3.2 **Check the  Tables**:

After importing the SQL file, you should have a admins,students,candidates, student_votes table in your university_voting database. You can verify by running:


USE university_voting;

SELECT * FROM candidates;

5. **Run the Project**:

Now, you're ready to start the application!

node app.js

This will start the Node.js server on port 3000 (or any port specified in the .env file). You can now open your browser and go to:

http://localhost:3000

### Troubleshooting:

Error: Cannot connect to MySQL:

Ensure that MySQL is running on your system and that you've correctly configured the .env file with the right credentials.

Page Not Found / Server Error:

Check that you've followed all the installation steps and that the MySQL database and table are correctly set up.


### Images of the landing page index.ejs and the admin,student and candidate views 

This is the landing page

![university voting system landing page](https://github.com/user-attachments/assets/e323a605-e9a8-4527-82b4-12b970e85647)


Admin registration page

![admin registration](https://github.com/user-attachments/assets/0bf2bc1b-7680-43ee-8180-bdb5abb87c25)


Admin login page

![admin login](https://github.com/user-attachments/assets/661bcbd2-53a9-43cf-916c-46408c55f630)

Admin dashboard page

![admin dashboard](https://github.com/user-attachments/assets/4f33befc-6af1-431a-9730-7958158b86bd)


Admin manage Candidates page

![manage candidates](https://github.com/user-attachments/assets/ba4a6319-d202-4af8-9c7c-6f283dd00e8c)


Admin manage students page

![manage students](https://github.com/user-attachments/assets/343da819-907e-4175-beb1-c926d493e653)


Candidate registration page

![candidate registration](https://github.com/user-attachments/assets/88af378b-3e25-448e-b25a-6e340681104b)


Candidate Login page

![candidate login](https://github.com/user-attachments/assets/4e22da66-e8a4-4216-a79e-40a1a5b0bc68)


Candidate dashboard page where they can check and track the progress of the votes during the voting process

![candidate dashboard](https://github.com/user-attachments/assets/265d7996-5e8b-4c18-b76d-4ef484a6ad1e)


Student registration page

![student registration](https://github.com/user-attachments/assets/4df62afb-e575-42eb-9661-2297b6123142)


Student login page

![student login](https://github.com/user-attachments/assets/d2e83f89-003d-4e52-b0a7-390478ab6552)


Student voting page where students cast their votes 

![student voting platform](https://github.com/user-attachments/assets/f2d14f33-2f23-4528-b9c6-8a255a569adf)
