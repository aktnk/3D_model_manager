const express = require('express');
const https = require('https');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const db = require('./database.js');

const app = express();
const port = 3000;

// --- HTTPS Options ---
const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certs/server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'certs/server.crt'))
};

// --- Middleware ---
app.use(express.static('public'));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use(express.json());

// --- Multer Setup for File Uploads ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/models/');
    },
    filename: function (req, file, cb) {
        // Use a timestamp and original name to create a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- API Routes ---

// GET all models, with optional search
app.get('/api/models', (req, res) => {
    const { search } = req.query;
    let sql = "SELECT * FROM models WHERE is_deleted = 0";
    const params = [];

    if (search) {
        sql += " AND title LIKE ?";
        params.push(`%${search}%`);
    }

    sql += " ORDER BY created_at DESC";

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ models: rows });
    });
});

// GET a single model by ID
app.get('/api/models/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM models WHERE id = ? AND is_deleted = 0", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Model not found' });
            return;
        }
        res.json({ model: row });
    });
});


// POST a new model
app.post('/api/models', upload.single('modelFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    const { title } = req.body;
    const { originalname } = req.file;
    // store path relative to public dir
    const relativePath = path.join('models', req.file.filename);


    if (!title) {
        // This is a server-side validation, though the client should also prevent this.
        return res.status(400).json({ error: 'Title is required.' });
    }

    db.run(`INSERT INTO models (title, original_name, file_path, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`, [title, originalname, relativePath], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Model uploaded successfully!', modelId: this.lastID });
    });
});

// POST (update) an existing model's file
app.post('/api/models/:id/file', upload.single('modelFile'), (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded for update.' });
    }
    const { originalname } = req.file;
    const relativePath = path.join('models', req.file.filename);

    db.run(`UPDATE models SET original_name = ?, file_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [originalname, relativePath, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: `Model ${id} updated successfully!` });
    });
});

// PUT (update) a model's title
app.put('/api/models/:id/title', (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required.' });
    }

    db.run(`UPDATE models SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [title, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: `Model with id ${id} not found.`});
        }
        res.json({ message: `Model ${id}'s title updated successfully!` });
    });
});


// DELETE a model (soft delete)
app.delete('/api/models/:id', (req, res) => {
    const { id } = req.params;
    db.run(`UPDATE models SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: `Model with id ${id} not found.`});
        }
        res.json({ message: `Model ${id} marked as deleted.` });
    });
});

// --- Server Start ---
https.createServer(httpsOptions, app).listen(port, () => {
    console.log(`Server running at https://localhost:${port}`);
});