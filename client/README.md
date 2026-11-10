# PA4: User Stories and Project Backlog

## ICSI 418Y Software Engineering

### Project Description

This full-stack application extends Programming Assignments 2 and 3 by adding user story management and a project backlog.

The application allows registered users to create projects, manage project memberships, and organize user stories within individual projects. Each user story can be assigned to a project member, given a priority, and tracked through different development statuses.

## Technologies Used

- **Frontend:** React, Vite, JavaScript, HTML, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose
- **Version Control:** Git and GitHub

## Features

### PA2: User Authentication

- User signup and login
- Store registered users in MongoDB
- Validate user information
- Display success and error messages

### PA3: Projects and Project Memberships

- Create projects with a name, description, status, and project lead
- Select project leads from registered users
- View saved projects
- Automatically add project leads as members
- Add and remove project members
- Prevent duplicate memberships
- Prevent removal of project leads
- Allow users to belong to multiple projects

### PA4: User Stories and Project Backlog

- Create user stories for existing projects
- Enter a story title and description
- Set story priority to High, Medium, or Low
- Automatically assign new stories the status To Do
- Change story status to To Do, In Progress, or Done
- Assign stories to project members or leave them unassigned
- View all user stories belonging to a selected project
- View story details, including descriptions
- Edit existing user stories
- Delete user stories with confirmation
- Display updated backlog information after changes
- Store user stories in MongoDB
- Prevent assigning stories to users outside the selected project
- Prevent removing members who still have assigned user stories
- Display validation errors and success messages

## Database Collections

The application uses four MongoDB collections.

### 1. Users

Stores registered user information, including first name, last name, username, and authentication information.

### 2. Projects

Stores project information, including:

- Project name
- Description
- Status
- Project lead ID

### 3. ProjectMemberships

Stores relationships between users and projects using:

- `project_id`
- `user_id`

### 4. UserStories

Stores individual user stories using:

- `_id`: MongoDB-generated ObjectId
- `project_id`: Reference to the associated project
- `title`: User story title
- `description`: User story description
- `priority`: High, Medium, or Low
- `status`: To Do, In Progress, or Done
- `assigned_user_id`: Reference to an assigned user or null

Each user story belongs to one project.

## How to Run the Application

### 1. Install Backend Dependencies

Open a terminal in the main project folder.

```bash
cd server
npm install
```

### 2. Configure MongoDB

Create a `.env` file inside the `server` folder.

Add the MongoDB connection configuration required by `server.js`.

Use your own MongoDB Atlas connection string and keep database credentials private.

### 3. Start the Backend

From the `server` folder, run:

```bash
node server.js
```

The backend runs at:

http://localhost:5001

A successful connection should display messages indicating that the server is running and MongoDB is connected.

### 4. Start the Frontend

Open another terminal in the main project folder.

```bash
cd client
npm install
npm run dev
```

The frontend runs at:

http://localhost:5173

Open this address in your browser.

## Preparing Test Data

Programming Assignment 4 requires test data demonstrating project management, membership rules, and user story functionality.

### Step 1: Create Registered Users

Register at least three users.

Example users:

- User 1: Test User One
- User 2: Test User Two
- User 3: Test User Three

### Step 2: Create Projects

Create at least two projects.

Example:

**Project 1: Student Task Management System**

Description: An application that helps university students organize assignments and manage academic tasks.

**Project 2: Website Redesign**

Description: A project focused on improving the design and usability of a website.

Assign project leads and add at least one additional project member.

### Step 3: Create User Stories

Create at least five user stories across the two projects.

Example test data:

| Project | User Story | Priority | Status | Assignment |
|---|---|---|---|---|
| Student Task Management System | User Login and Authentication | High | In Progress | Assigned |
| Student Task Management System | Create Student Tasks | High | To Do | Assigned |
| Student Task Management System | View Task Dashboard | Medium | Done | Unassigned |
| Website Redesign | Improve Homepage Layout | Medium | In Progress | Assigned |
| Website Redesign | Add Mobile Responsive Design | Low | To Do | Unassigned |

Use the application's editing feature to change story statuses after creation.

### Step 4: Test Membership Rules

Verify that:

- Users can only be assigned stories in projects where they are members.
- The assignment dropdown includes the project lead and other current project members.
- Users who are not members of a project cannot be assigned its stories.
- Members with assigned stories cannot be removed until their stories are reassigned, unassigned, or deleted.
- Project leads cannot be removed.
- Assignments in other projects do not prevent removal from the selected project.

### Step 5: Test User Story Management

Verify that:

- User stories can be created successfully.
- New stories initially have the status To Do.
- Stories appear in the correct project backlog.
- Story details can be viewed.
- Story titles, descriptions, priorities, statuses, and assignments can be edited.
- Completed stories can be reopened.
- Stories can be deleted after confirmation.
- Canceling deletion leaves the story unchanged.
- Invalid information produces an error message.
- Changes remain saved after refreshing the page.
- Switching projects displays only stories belonging to the selected project.

## Video Demonstration

Record a 3–5 minute Zoom demonstration showing:

1. Creating a user story and assigning it to a project member.
2. Switching between two projects and viewing their backlogs.
3. Editing a user story, changing its status, and updating its assignment.
4. Deleting a story with confirmation and refreshing the page.
5. Demonstrating validation errors and member-removal restrictions.
6. Showing the UserStories collection in MongoDB, including ObjectId references.
7. Briefly explaining the React frontend, Express backend, MongoDB storage, and validation logic.

## Security

- Keep the `.env` file private.
- Do not upload MongoDB credentials to GitHub.
- Exclude `node_modules` from version control.
- Use `.gitignore` to protect private configuration files.

## Submission

Submit the following through Brightspace:

- GitHub repository URL containing the completed application
- 3–5 minute Zoom video demonstration