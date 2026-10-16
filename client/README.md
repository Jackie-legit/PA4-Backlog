# PA3: Projects and Project Memberships

## ICSI 418Y Software Engineering

This full-stack application extends Programming Assignment 2 by adding project creation and project membership management.

## Technologies Used
- React and Vite (Frontend)
- Node.js and Express (Backend)
- MongoDB Atlas and Mongoose (Database)

## Features
- User signup and login
- Create projects with a name, description, status, and project lead
- Select project leads from registered users
- View saved projects
- Automatically add project leads as members
- Add and remove project members
- Prevent duplicate memberships
- Prevent removal of project leads
- Allow users to belong to multiple projects
- Display success and error messages

## Database Collections
- Users
- Projects
- ProjectMemberships

Projects reference registered users through `project_lead_id`. ProjectMemberships connect users and projects using `user_id` and `project_id`.

## How to Run the Application

### 1. Install Backend Dependencies

Open a terminal in the project folder:

```bash
cd server
npm install
```

Create a `.env` file in the `server` folder with the MongoDB connection configuration expected by `server.js`.

### 2. Start the Backend

```bash
node server.js
```

Backend: http://localhost:5001

### 3. Start the Frontend

Open a second terminal in the project folder:

```bash
cd client
npm install
npm run dev
```

Frontend: http://localhost:5173

### 4. Test the Application

Open the frontend in your browser. Register or log in, create projects, select project leads, and manage project memberships.

## Security

The `.env` file contains private configuration and must not be uploaded to GitHub. The `node_modules` folders should also be excluded from version control.