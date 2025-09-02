const db = require('./database.js');

function getAll(search) {
  return new Promise((resolve, reject) => {
    let sql = 'SELECT * FROM models WHERE is_deleted = 0';
    const params = [];

    if (search) {
      sql += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';

    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM models WHERE id = ? AND is_deleted = 0', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function create(title, originalname, filePath) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO models (title, original_name, file_path, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      [title, originalname, filePath],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

function updateFile(id, originalname, filePath) {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE models SET original_name = ?, file_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [originalname, filePath, id],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            }
        );
    });
}

function updateTitle(id, title) {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE models SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [title, id],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            }
        );
    });
}

function updateUsdz(id, usdzPath) {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE models SET usdz_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [usdzPath, id],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            }
        );
    });
}

function remove(id) {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE models SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [id],
            function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            }
        );
    });
}


module.exports = {
  getAll,
  getById,
  create,
  updateFile,
  updateTitle,
  updateUsdz,
  remove,
};
