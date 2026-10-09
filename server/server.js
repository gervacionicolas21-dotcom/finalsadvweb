require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Student = require("./models/Student");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Express routes use the Mongoose Student model to read and write MongoDB documents.
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Could not load students.", error: error.message });
  }
});

app.post("/students", async (req, res) => {
  try {
    const { name, course, age } = req.body;
    if (!name?.trim() || !course?.trim() || age === undefined || age === "") {
      return res.status(400).json({ message: "Name, course, and age are required." });
    }

    const student = await Student.create({ name, course, age });
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: "Could not add student.", error: error.message });
  }
});

app.put("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, course, age } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "The student ID is not valid." });
    }
    if (!name?.trim() || !course?.trim() || age === undefined || age === "") {
      return res.status(400).json({ message: "Name, course, and age are required." });
    }

    const student = await Student.findByIdAndUpdate(
      id,
      { name, course, age },
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: "Could not update student.", error: error.message });
  }
});

app.delete("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "The student ID is not valid." });
    }

    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    res.json({ message: "Student deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not delete student.", error: error.message });
  }
});

async function startServer() {
  if (!process.env.MONGO_URI || !process.env.MONGO_URI.startsWith("mongodb")) {
    console.error("Set MONGO_URI in server/.env to your MongoDB Atlas connection string.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Could not connect to MongoDB. Check server/.env and Atlas network access.");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
