const express = require("express");
const http = require("http");
const path = require("path");

const app = express();
const port = 3000;

// Import routes
const modelRoutes = require('./routes/models');

// --- Middleware ---
app.use(express.static("public"));
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));
app.use(express.json());

// --- API Routes ---
app.use('/api/models', modelRoutes);

// --- Server Start ---
http.createServer(app).listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});