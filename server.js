
const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('./database.js');

const app = express();
const port = 3000;

// --- Middleware ---
app.use(express.static('public'));
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

// POST a new model
app.post('/api/models', upload.single('modelFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    const { title } = req.body;
    const { originalname, path: filePath } = req.file;
    const relativePath = path.relative('public', filePath);

    if (!title) {
        // This is a server-side validation, though the client should also prevent this.
        return res.status(400).json({ error: 'Title is required.' });
    }

    db.run(`INSERT INTO models (title, original_name, file_path) VALUES (?, ?, ?)`, [title, originalname, relativePath], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Model uploaded successfully!', modelId: this.lastID });
    });
});

// POST (update) an existing model
app.post('/api/models/:id', upload.single('modelFile'), (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded for update.' });
    }
    const { originalname, path: filePath } = req.file;
    const relativePath = path.relative('public', filePath);

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
    db.run(`UPDATE models SET is_deleted = 1 WHERE id = ?`, [id], function(err) {
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
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
});
