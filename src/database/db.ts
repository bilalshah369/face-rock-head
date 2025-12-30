import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export const getDB = async () => {
  return SQLite.openDatabase({
    name: 'scan_logs.db',
    location: 'default',
  });
};
export const insertScanLog = async (scan: {
  tracking_id: string;
  qr_type: 'OUTER' | 'INNER';
  centre_id: number;
  scanned_by?: number;
  scanned_phone?: string;
  scan_datetime: string;
  latitude?: number;
  longitude?: number;
  scan_mode: 'ONLINE' | 'OFFLINE';
  device_id?: string;
  remarks?: string;
  created_by?: number;
}): Promise<string | null> => {
  try {
    const db = await getDB();
    console.log('Inserting scan log:', scan.tracking_id);

    const [result] = await db.executeSql(
      `
      INSERT INTO scan_logs
      (
        tracking_id,
        qr_type,
        scanned_by,
        scanned_phone,
        scan_datetime,
        latitude,
        longitude,
        scan_mode,
        device_id,
        remarks,
        created_by,
        synced,centre_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0,?)
      `,
      [
        scan.tracking_id,
        scan.qr_type,
        scan.scanned_by ?? null,
        scan.scanned_phone ?? null,
        scan.scan_datetime,
        scan.latitude ?? null,
        scan.longitude ?? null,
        scan.scan_mode,
        scan.device_id ?? null,
        scan.remarks ?? null,
        scan.created_by ?? null,
        scan.centre_id ?? null,
      ],
    );

    //  SQLite auto-generated primary key
    const scanId = result.insertId;

    return scanId ? scanId.toString() : null;
  } catch (error) {
    console.error('Error inserting scan log:', error);
    return null;
  }
};

export const getPendingScans = async () => {
  const db = await getDB();
  const [result] = await db.executeSql(
    `SELECT * FROM scan_logs WHERE synced = 0`,
  );

  return result.rows.raw();
};
export const markAsSynced = async (scan_id: string) => {
  const db = await getDB();
  await db.executeSql(`UPDATE scan_logs SET synced = 1 WHERE scan_id = ?`, [
    scan_id,
  ]);
};

export const getScanHistory = async () => {
  const db = await getDB();
  const [result] = await db.executeSql(`
    SELECT *
    FROM scan_logs
    ORDER BY scan_datetime DESC
  `);

  return result.rows.raw();
};
