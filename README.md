# Student Management System (MERN)

A beginner-friendly student records app built with React, Vite, Express, Node.js, and MongoDB Atlas.

## Project folders

- `client/` — React frontend (Vite, ESLint)
- `server/` — Express API and Mongoose model
- `server/models/Student.js` — student document schema

## Prerequisites

Install Node.js and npm. Check them in the VS Code terminal:

```powershell
node -v
npm -v
```

## MongoDB Atlas setup (required before starting the API)

1. Sign in to MongoDB Atlas and create a free shared cluster.
2. In **Database Access**, create a database user and save its username and password securely.
3. In **Network Access**, add your current IP address. Avoid allowing access from everywhere for a class project unless your instructor specifically requires it.
4. Open **Connect** for your cluster, choose **Drivers**, and copy the connection string.
5. Open `server/.env` and replace the example value with your connection string. Replace `<password>` with the database user's password (URL-encode special characters) and add `/student_management` before the query options if it is not already present.
6. Never share or commit `server/.env`; it is excluded by `server/.gitignore`.

Example format (not a real credential):

```text
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@YOUR-CLUSTER.mongodb.net/student_management?retryWrites=true&w=majority
```

## Start the app

Open two VS Code terminals at the project root.

Terminal 1 — frontend:

```powershell
cd client
npm install
npm run dev
```

Open **http://localhost:5173**.

Terminal 2 — backend:

```powershell
cd server
npm install
npm start
```

The API runs at **http://localhost:5000**. The backend prints a MongoDB connection confirmation and `Server running on port 5000` after Atlas connects. If connection fails, check the URI, database user's credentials, and Atlas Network Access IP allowlist.

## Student API

- `GET /students` — list students
- `POST /students` — add a student; send JSON with `name`, `course`, and `age`
- `PUT /students/:id` — update a student using the MongoDB document ID
- `DELETE /students/:id` — remove a student using the MongoDB document ID

The React page loads records from the API and supports add, edit, and delete. Student data is stored in MongoDB Atlas.

## Create a zip for submission

Zip this project folder, but exclude both `node_modules` directories, `client/dist`, and `server/.env`. Include the source code, lockfiles, `server/.env.example`, and this README. Before submission, make sure the recipient understands they need their own Atlas connection string in `server/.env`.
