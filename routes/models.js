const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../database.js');

// --- Multer Setup for File Uploads ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/models/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// GET all models, with optional search
router.get('/', (req, res) => {
  const { search } = req.query;
  let sql = 'SELECT * FROM models WHERE is_deleted = 0';
  const params = [];

  if (search) {
    sql += ' AND title LIKE ?';
    params.push(`%${search}%`);
  }

  sql += ' ORDER BY created_at DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ models: rows });
  });
});

// GET a single model by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get(
    'SELECT * FROM models WHERE id = ? AND is_deleted = 0',
    [id],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'Model not found' });
        return;
      }
      res.json({ model: row });
    }
  );
});

// POST a new model
router.post('/', upload.single('modelFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const { title } = req.body;
  const { originalname } = req.file;
  const relativePath = path.join('models', req.file.filename);

  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  db.run(
    `INSERT INTO models (title, original_name, file_path, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
    [title, originalname, relativePath],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        message: 'Model uploaded successfully!',
        modelId: this.lastID,
      });
    }
  );
});

// POST (update) an existing model's file
router.post('/:id/file', upload.single('modelFile'), (req, res) => {
  const { id } = req.params;
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded for update.' });
  }
  const { originalname } = req.file;
  const relativePath = path.join('models', req.file.filename);

  db.run(
    `UPDATE models SET original_name = ?, file_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [originalname, relativePath, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: `Model ${id} updated successfully!` });
    }
  );
});

// PUT (update) a model's title
router.put('/:id/title', (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  db.run(
    `UPDATE models SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [title, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res
          .status(404)
          .json({ error: `Model with id ${id} not found.` });
      }
      res.json({ message: `Model ${id}'s title updated successfully!` });
    }
  );
});

// POST (update) an existing model's usdz file
router.post('/:id/usdz', upload.single('usdzFile'), (req, res) => {
  const { id } = req.params;
  if (!req.file) {
    return res.status(400).json({ error: 'No usdz file uploaded for update.' });
  }
  const relativePath = path.join('models', req.file.filename);

  db.run(
    `UPDATE models SET usdz_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [relativePath, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res
          .status(404)
          .json({ error: `Model with id ${id} not found.` });
      }
      res.json({
        message: `Model ${id}'s usdz file updated successfully!`,
        usdz_path: relativePath,
      });
    }
  );
});

// DELETE a model (soft delete)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run(
    `UPDATE models SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res
          .status(404)
          .json({ error: `Model with id ${id} not found.` });
      }
      res.json({ message: `Model ${id} marked as deleted.` });
    }
  );
});

module.exports = router;
