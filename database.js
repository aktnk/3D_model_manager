
const sqlite3 = require('sqlite3').verbose();
const DB_PATH = './3d_models.sqlite';

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    }

    console.log('Connected to the SQLite database.');

    db.serialize(() => {
        // Create the table with all columns if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            original_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT NULL,
            is_deleted INTEGER DEFAULT 0
        )`, (err) => {
            if (err) {
                return console.error("Error creating table", err.message);
            }

            // Check columns and add if they don't exist
            db.all("PRAGMA table_info(models)", (err, columns) => {
                if (err) {
                    return console.error("Error checking table info", err.message);
                }

                const columnNames = columns.map(col => col.name);

                // Check for 'title' column
                if (!columnNames.includes('title')) {
                    console.log('Adding "title" column to models table.');
                    db.run("ALTER TABLE models ADD COLUMN title TEXT", (err) => {
                        if (err) return console.error("Error adding title column", err.message);
                    });
                }

                // Check for 'updated_at' column
                if (!columnNames.includes('updated_at')) {
                    console.log('Adding "updated_at" column to models table.');
                    db.run("ALTER TABLE models ADD COLUMN updated_at DATETIME DEFAULT NULL", (err) => {
                        if (err) return console.error("Error adding updated_at column", err.message);
                    });
                }
            });
        });
    });
});

module.exports = db;
