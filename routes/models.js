const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const repository = require('../models.repository.js');

// --- Multer Setup ---
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

// --- API Routes ---

// GET all models
router.get('/', async (req, res) => {
  try {
    const models = await repository.getAll(req.query.search);
    res.json({ models });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single model by ID
router.get('/:id', async (req, res) => {
  try {
    const model = await repository.getById(req.params.id);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    res.json({ model });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new model
router.post('/', upload.single('modelFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  try {
    const { originalname, filename } = req.file;
    const relativePath = path.join('models', filename);
    const modelId = await repository.create(title, originalname, relativePath);
    res.status(201).json({
      message: 'Model uploaded successfully!',
      modelId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST (update) an existing model's file
router.post('/:id/file', upload.single('modelFile'), async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded for update.' });
    }

    try {
        const { originalname, filename } = req.file;
        const relativePath = path.join('models', filename);
        const changes = await repository.updateFile(id, originalname, relativePath);
        if (changes === 0) {
            return res.status(404).json({ error: `Model with id ${id} not found.` });
        }
        res.json({ message: `Model ${id} updated successfully!` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT (update) a model's title
router.put('/:id/title', async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required.' });
    }

    try {
        const changes = await repository.updateTitle(id, title);
        if (changes === 0) {
            return res.status(404).json({ error: `Model with id ${id} not found.` });
        }
        res.json({ message: `Model ${id}'s title updated successfully!` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST (update) an existing model's usdz file
router.post('/:id/usdz', upload.single('usdzFile'), async (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ error: 'No usdz file uploaded for update.' });
    }

    try {
        const relativePath = path.join('models', req.file.filename);
        const changes = await repository.updateUsdz(id, relativePath);
        if (changes === 0) {
            return res.status(404).json({ error: `Model with id ${id} not found.` });
        }
        res.json({
            message: `Model ${id}'s usdz file updated successfully!`,
            usdz_path: relativePath,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a model (soft delete)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const changes = await repository.remove(id);
        if (changes === 0) {
            return res.status(404).json({ error: `Model with id ${id} not found.` });
        }
        res.json({ message: `Model ${id} marked as deleted.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;