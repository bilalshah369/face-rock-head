import {getDB} from './db';

export const initDB = async () => {
  const db = await getDB();
  //await db.executeSql(`DROP TABLE IF EXISTS scan_logs`);
  console.log('Initializing database...');
  await db.executeSql(`
  CREATE TABLE IF NOT EXISTS scan_logs (
    scan_id INTEGER PRIMARY KEY AUTOINCREMENT,

    tracking_id TEXT NOT NULL,
    qr_type TEXT CHECK (qr_type IN ('OUTER', 'INNER')),
    centre_id integer,
    name TEXT,

    scanned_by INTEGER,
    scanned_phone TEXT,

    scan_datetime TEXT NOT NULL,

    latitude REAL,
    longitude REAL,

    scan_mode TEXT CHECK (scan_mode IN ('OFFLINE', 'ONLINE')),
    device_id TEXT,

    remarks TEXT,
    face_status TEXT,

    created_on TEXT DEFAULT (datetime('now')),
    created_by INTEGER,

    synced INTEGER DEFAULT 0
    
  );
`);
  // 🔴 REQUIRED FOR UPSERT
  await db.executeSql(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_scan_logs_tracking_id
    ON scan_logs(tracking_id);
  `);
};
