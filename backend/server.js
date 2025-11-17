// === IMPORTS ===
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const multer = require("multer");

// === APP SETUP ===
const app = express();
app.use(cors());               // Allow cross-origin requests
app.use(express.json());       // Parse JSON request bodies

// === DATABASE CONNECTION ===
const db = mysql.createConnection({
  host: "localhost",
  user: "root",              
  password: "tiger",           
  database: "excellence_academy" 
});

// Test the connection
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL database: excellence_academy");
  }
});

// === SIGNUP ROUTE ===
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into DB
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(sql, [username, hashedPassword], (err, result) => {
      if (err) {
        console.error("❌ Database error:", err);
        return res.status(500).json({
          error: "Database error",
          details: err.message,
        });
      }

      console.log("✅ New user saved:", username);
      res.json({ message: "User registered successfully!" });
    });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// === LOGIN ROUTE ===
// === LOGIN ROUTE ===
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Missing credentials" });

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    console.log(`✅ ${username} logged in successfully`);
    res.status(200).json({ 
      message: "Login successful!", 
      user: { username: user.username }
    });
  });
});
// === CONTACT ROUTE ===

app.post("/contact", (req, res) => {
  const { name, email, phone, message } = req.body;

  const sql = "INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, email, phone, message], (err, result) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    console.log("✅ Contact message saved!");
    res.json({ message: "Message sent successfully!" });
  });
});


// ======================
// NOTICE ROUTES
// ======================
app.post("/addNotice", (req, res) => {
  const { title, message } = req.body;

  if (!title || !message)
    return res.status(400).json({ error: "Both title and message are required" });

  const sql = "INSERT INTO notices (title, message) VALUES (?, ?)";
  db.query(sql, [title, message], (err) => {
    if (err) {
      console.error("❌ Database error (addNotice):", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json({ message: "✅ Notice added successfully!" });
  });
});

app.get("/getNotices", (req, res) => {
  const sql = "SELECT * FROM notices ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Database error (getNotices):", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json(results);
  });
});

// ======================
// NOTES UPLOAD ROUTES
// ======================
const fs = require("fs");
const path = require("path");


const uploadFolder = path.join(__dirname, "uploads");

// ✅ Ensure upload folder exists
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// ✅ Upload a note
app.post("/uploadNote", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const sql = "INSERT INTO notes (filename, filepath) VALUES (?, ?)";
  db.query(sql, [file.originalname, `/uploads/${file.filename}`], (err) => {
    if (err) {
      console.error("❌ Database error (uploadNote):", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json({ message: "✅ File uploaded successfully!" });
  });
});

// ✅ Fetch all notes
app.get("/getNotes", (req, res) => {
  const sql = "SELECT * FROM notes ORDER BY uploaded_at DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Database error (getNotes):", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json(results);
  });
});

// ✅ Make the uploads folder publicly accessible
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// === START SERVER ===
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
