import {getDB} from './db';

export const initDB = async () => {
  const db = await getDB();
  //await db.executeSql(`DROP TABLE IF EXISTS scan_logs`);ffff
  console.log('Initializing database...');
  await db.executeSql(`
  CREATE TABLE IF NOT EXISTS scan_logs (
    scan_id INTEGER PRIMARY KEY AUTOINCREMENT,

    tracking_id TEXT NOT NULL,
    qr_type TEXT CHECK (qr_type IN ('OUTER', 'INNER')),

    scanned_by INTEGER,
    scanned_phone TEXT,

    scan_datetime TEXT NOT NULL,

    latitude REAL,
    longitude REAL,

    scan_mode TEXT CHECK (scan_mode IN ('OFFLINE', 'ONLINE')),
    device_id TEXT,

    remarks TEXT,

    created_on TEXT DEFAULT (datetime('now')),
    created_by INTEGER,

    synced INTEGER DEFAULT 0
  );
`);
};
