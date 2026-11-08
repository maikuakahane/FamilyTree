import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import schema from './schema';
import Person from './models/person';
import BirthRecord from './models/birthRecord';
import RelationshipRecord from './models/relationshipRecord';
import DeathRecord from './models/deathRecord';
import CitizenshipRecord from './models/citizenshipRecord';
import Address from './models/address';
import Counter from './models/counter';
import { DEFAULTS } from './defaults';

const adapter = new LokiJSAdapter({
    schema,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
    onQuotaExceededError: (error) => { },
    onSetUpError: (error) => { },
});

const database = new Database({
    adapter,
    modelClasses: [
        Person, RelationshipRecord,
        Address, Counter,
        BirthRecord, DeathRecord, CitizenshipRecord,
    ],
});

function isElectron() {
    return typeof window !== 'undefined' &&
        typeof window.electronDB !== 'undefined' &&
        window.electronDB.isElectron === true;
}

// ── Snapshot: every table as plain objects ──
async function buildSnapshot() {
    const tables = {};
    for (const collection of Object.values(database.collections.map)) {
        const records = await collection.query().fetch();
        tables[collection.table] = records.map((record) => {
            const { _status, _changed, ...row } = record._raw;
            return row;
        });
    }
    return {
        format: 1,
        schemaVersion: schema.version,
        exportedAt: new Date().toISOString(),
        tables,
    };
}

// ── Fill blank columns with the default for that table ──
function withDefaults(table, row) {
    const defaults = DEFAULTS[table];
    if (!defaults) return row;
    const filled = { ...row };
    for (const [column, value] of Object.entries(defaults)) {
        if (filled[column] == null || filled[column] === '') filled[column] = value;
    }
    return filled;
}

// ── Restore: wipe the database and refill it from a snapshot ──
async function restoreSnapshot(data) {
    if (!data || !data.tables) throw new Error('Invalid backup file');

    await database.write(async () => {
        const collections = Object.values(database.collections.map);

        const doomed = [];
        for (const collection of collections) {
            const existing = await collection.query().fetch();
            existing.forEach((record) => doomed.push(record.prepareDestroyPermanently()));
        }
        await database.batch(...doomed);

        const created = [];
        for (const collection of collections) {
            const rows = data.tables[collection.table] ?? [];
            for (const row of rows) {
                created.push(collection.prepareCreateFromDirtyRaw(withDefaults(collection.table, row)));
            }
        }
        await database.batch(...created);
    });
}

// ── saveToFile ──
export async function saveToFile() {
    if (!isElectron()) return;
    try {
        const snapshot = await buildSnapshot();
        await window.electronDB.save(JSON.stringify(snapshot));
        console.log('Database saved to file.');
    } catch (e) {
        console.error('saveToFile error:', e);
    }
}

// ── loadFromFile ──
export async function loadFromFile() {
    if (!isElectron()) return;
    try {
        const raw = await window.electronDB.load();
        if (!raw) {
            console.log('No saved database found, starting fresh.');
            return;
        }
        await restoreSnapshot(JSON.parse(raw));
        console.log('Database loaded from file successfully.');
    } catch (e) {
        console.error('loadFromFile error:', e);
    }
}

// ── exportToFile ──
export async function exportToFile() {
    if (!isElectron()) return { success: false, reason: 'Not in Electron' };
    try {
        const snapshot = await buildSnapshot();
        return await window.electronDB.exportFile(JSON.stringify(snapshot, null, 2));
    } catch (e) {
        console.error('exportToFile error:', e);
        return { success: false, reason: e.message };
    }
}

// ── importFromFile ──
export async function importFromFile() {
    if (!isElectron()) return { success: false, reason: 'Not in Electron' };
    try {
        const raw = await window.electronDB.importFile();
        if (!raw) return { success: false, reason: 'Cancelled' };

        const data = JSON.parse(raw);
        if (!data.tables) return { success: false, reason: 'Invalid file format' };

        await restoreSnapshot(data);
        await saveToFile();
        return { success: true, count: data.tables.people?.length ?? 0 };
    } catch (e) {
        console.error('importFromFile error:', e);
        return { success: false, reason: e.message };
    }
}

export default database;