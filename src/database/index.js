import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import schema from './schema';
import Person from './models/Person';
import Relationship from './models/Relationship';
import Marriage from './models/Marriage';
import Citizenship from './models/Citizenship';
import Address from './models/Address';
import BirthRecord from './models/BirthRecord';
import MarriageRecord from './models/MarriageRecord';
import DeathRecord from './models/DeathRecord';
import CitizenshipRecord from './models/CitizenshipRecord';

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
        Person, Relationship, Marriage,
        Citizenship, Address,
        BirthRecord, MarriageRecord, DeathRecord, CitizenshipRecord,
    ],
});

function isElectron() {
    return typeof window !== 'undefined' &&
        typeof window.electronDB !== 'undefined' &&
        window.electronDB.isElectron === true;
}

// ── Mappers ──
const mapPerson = (p) => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    birthName: p.birthName,
    gender: p.gender,
    email: p.email,
    bornAt: p.bornAt,
    birthTown: p.birthTown,
    birthCountry: p.birthCountry,
    deceased: p.deceased || false,
    diedAt: p.diedAt,
    deathTown: p.deathTown,
    deathCountry: p.deathCountry,
    birthCertificateObtained: p.birthCertificateObtained || false,
    marriageCertificateObtained: p.marriageCertificateObtained || false,
    deathCertificateObtained: p.deathCertificateObtained || false,
    isOwner: p.isOwner || false,
});

const applyPerson = (record, p) => {
    record.firstName = p.firstName;
    record.lastName = p.lastName;
    record.birthName = p.birthName || '';
    record.gender = p.gender || 'unknown';
    record.email = p.email || '';
    record.bornAt = p.bornAt || null;
    record.birthTown = p.birthTown || '';
    record.birthCountry = p.birthCountry || '';
    record.deceased = p.deceased || false;
    record.diedAt = p.diedAt || null;
    record.deathTown = p.deathTown || '';
    record.deathCountry = p.deathCountry || '';
    record.birthCertificateObtained = p.birthCertificateObtained || false;
    record.marriageCertificateObtained = p.marriageCertificateObtained || false;
    record.deathCertificateObtained = p.deathCertificateObtained || false;
    record.isOwner = p.isOwner || false;
};

const mapRelationship = (r) => ({
    id: r.id,
    person1Id: r.person1Id,
    person2Id: r.person2Id,
    relationshipType: r.relationshipType,
});

const applyRelationship = (record, r) => {
    record.person1Id = r.person1Id;
    record.person2Id = r.person2Id;
    record.relationshipType = r.relationshipType;
};

const mapMarriage = (m) => ({
    id: m.id,
    person1Id: m.person1Id,
    person2Id: m.person2Id,
    status: m.status,
    marriedAt: m.marriedAt,
    marriageTown: m.marriageTown,
    marriageCountry: m.marriageCountry,
    divorcedAt: m.divorcedAt,
});

const applyMarriage = (record, m) => {
    record.person1Id = m.person1Id;
    record.person2Id = m.person2Id;
    record.status = m.status;
    record.marriedAt = m.marriedAt || null;
    record.marriageTown = m.marriageTown || '';
    record.marriageCountry = m.marriageCountry || '';
    record.divorcedAt = m.divorcedAt || null;
};

const mapCitizenship = (c) => ({
    id: c.id,
    personId: c.personId,
    birthCitizenship: c.birthCitizenship,
    naturalisedCitizenship: c.naturalisedCitizenship,
});

const applyCitizenship = (record, c) => {
    record.personId = c.personId;
    record.birthCitizenship = c.birthCitizenship || '';
    record.naturalisedCitizenship = c.naturalisedCitizenship || '';
};

const mapAddress = (a) => ({
    id: a.id,
    personId: a.personId,
    addressStreet: a.addressStreet,
    addressTown: a.addressTown,
    addressCountry: a.addressCountry,
    addressCode: a.addressCode,
    movedInAt: a.movedInAt,
    movedOutAt: a.movedOutAt,
});

const applyAddress = (record, a) => {
    record.personId = a.personId;
    record.addressStreet = a.addressStreet || '';
    record.addressTown = a.addressTown || '';
    record.addressCountry = a.addressCountry || '';
    record.addressCode = a.addressCode || '';
    record.movedInAt = a.movedInAt || null;
    record.movedOutAt = a.movedOutAt || null;
};

const mapBirthRecord = (b) => ({
    id: b.id,
    personId: b.personId,
    bornAt: b.bornAt,
    birthTown: b.birthTown,
    birthCountry: b.birthCountry,
    baptisedAt: b.baptisedAt,
    birthRegistryOffice: b.birthRegistryOffice,
    birthRegistryBook: b.birthRegistryBook,
    birthReligion: b.birthReligion,
});

const applyBirthRecord = (record, b) => {
    record.personId = b.personId;
    record.bornAt = b.bornAt || null;
    record.birthTown = b.birthTown || '';
    record.birthCountry = b.birthCountry || '';
    record.baptisedAt = b.baptisedAt || null;
    record.birthRegistryOffice = b.birthRegistryOffice || '';
    record.birthRegistryBook = b.birthRegistryBook || '';
    record.birthReligion = b.birthReligion || '';
};

const mapMarriageRecord = (m) => ({
    id: m.id,
    person1Id: m.person1Id,
    person2Id: m.person2Id,
    marriageId: m.marriageId,
    marriageRegistryOffice: m.marriageRegistryOffice,
    marriageRegistryBook: m.marriageRegistryBook,
    marriageReligion: m.marriageReligion,
});

const applyMarriageRecord = (record, m) => {
    record.person1Id = m.person1Id;
    record.person2Id = m.person2Id;
    record.marriageId = m.marriageId;
    record.marriageRegistryOffice = m.marriageRegistryOffice || '';
    record.marriageRegistryBook = m.marriageRegistryBook || '';
    record.marriageReligion = m.marriageReligion || '';
};

const mapDeathRecord = (d) => ({
    id: d.id,
    personId: d.personId,
    diedAt: d.diedAt,
    deathTown: d.deathTown,
    deathCountry: d.deathCountry,
    deathReason: d.deathReason,
    deathRegistryOffice: d.deathRegistryOffice,
    deathRegistryBook: d.deathRegistryBook,
    deathReligion: d.deathReligion,
});

const applyDeathRecord = (record, d) => {
    record.personId = d.personId;
    record.diedAt = d.diedAt || null;
    record.deathTown = d.deathTown || '';
    record.deathCountry = d.deathCountry || '';
    record.deathReason = d.deathReason || '';
    record.deathRegistryOffice = d.deathRegistryOffice || '';
    record.deathRegistryBook = d.deathRegistryBook || '';
    record.deathReligion = d.deathReligion || '';
};

const mapCitizenshipRecord = (c) => ({
    id: c.id,
    personId: c.personId,
    naturalisedAt: c.naturalisedAt,
    naturalisedType: c.naturalisedType,
    birthCitizenshipLost: c.birthCitizenshipLost || false,
});

const applyCitizenshipRecord = (record, c) => {
    record.personId = c.personId;
    record.naturalisedAt = c.naturalisedAt || null;
    record.naturalisedType = c.naturalisedType || '';
    record.birthCitizenshipLost = c.birthCitizenshipLost || false;
};

// ── saveToFile ──
export async function saveToFile() {
    if (!isElectron()) return;
    try {
        const people = await database.collections.get('people').query().fetch();
        const relationships = await database.collections.get('relationships').query().fetch();
        const marriages = await database.collections.get('marriages').query().fetch();
        const citizenships = await database.collections.get('citizenships').query().fetch();
        const addresses = await database.collections.get('addresses').query().fetch();
        const birthRecords = await database.collections.get('birth_records').query().fetch();
        const marriageRecords = await database.collections.get('marriage_records').query().fetch();
        const deathRecords = await database.collections.get('death_records').query().fetch();
        const citizenshipRecords = await database.collections.get('citizenship_records').query().fetch();

        const data = JSON.stringify({
            people: people.map(mapPerson),
            relationships: relationships.map(mapRelationship),
            marriages: marriages.map(mapMarriage),
            citizenships: citizenships.map(mapCitizenship),
            addresses: addresses.map(mapAddress),
            birthRecords: birthRecords.map(mapBirthRecord),
            marriageRecords: marriageRecords.map(mapMarriageRecord),
            deathRecords: deathRecords.map(mapDeathRecord),
            citizenshipRecords: citizenshipRecords.map(mapCitizenshipRecord),
        });

        await window.electronDB.save(data);
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

        const data = JSON.parse(raw);
        console.log('Loading', data.people.length, 'people and', data.relationships.length, 'relationships');

        await database.write(async () => {
            // Clear existing
            const existingPeople = await database.collections.get('people').query().fetch();
            const existingRelationships = await database.collections.get('relationships').query().fetch();
            const existingMarriages = await database.collections.get('marriages').query().fetch();
            const existingCitizenships = await database.collections.get('citizenships').query().fetch();
            const existingAddresses = await database.collections.get('addresses').query().fetch();
            const existingBirthRecords = await database.collections.get('birth_records').query().fetch();
            const existingMarriageRecords = await database.collections.get('marriage_records').query().fetch();
            const existingDeathRecords = await database.collections.get('death_records').query().fetch();
            const existingCitizenshipRecords = await database.collections.get('citizenship_records').query().fetch();

            for (const p of existingPeople) await p.destroyPermanently();
            for (const r of existingRelationships) await r.destroyPermanently();
            for (const m of existingMarriages) await m.destroyPermanently();
            for (const c of existingCitizenships) await c.destroyPermanently();
            for (const a of existingAddresses) await a.destroyPermanently();
            for (const b of existingBirthRecords) await b.destroyPermanently();
            for (const m of existingMarriageRecords) await m.destroyPermanently();
            for (const d of existingDeathRecords) await d.destroyPermanently();
            for (const c of existingCitizenshipRecords) await c.destroyPermanently();

            // Recreate
            for (const p of data.people) {
                await database.collections.get('people').create((record) => {
                    record._raw.id = p.id;
                    applyPerson(record, p);
                });
            }
            for (const r of data.relationships) {
                await database.collections.get('relationships').create((record) => {
                    record._raw.id = r.id;
                    applyRelationship(record, r);
                });
            }
            for (const m of (data.marriages || [])) {
                await database.collections.get('marriages').create((record) => {
                    record._raw.id = m.id;
                    applyMarriage(record, m);
                });
            }
            for (const c of (data.citizenships || [])) {
                await database.collections.get('citizenships').create((record) => {
                    record._raw.id = c.id;
                    applyCitizenship(record, c);
                });
            }
            for (const a of (data.addresses || [])) {
                await database.collections.get('addresses').create((record) => {
                    record._raw.id = a.id;
                    applyAddress(record, a);
                });
            }
            for (const b of (data.birthRecords || [])) {
                await database.collections.get('birth_records').create((record) => {
                    record._raw.id = b.id;
                    applyBirthRecord(record, b);
                });
            }
            for (const m of (data.marriageRecords || [])) {
                await database.collections.get('marriage_records').create((record) => {
                    record._raw.id = m.id;
                    applyMarriageRecord(record, m);
                });
            }
            for (const d of (data.deathRecords || [])) {
                await database.collections.get('death_records').create((record) => {
                    record._raw.id = d.id;
                    applyDeathRecord(record, d);
                });
            }
            for (const c of (data.citizenshipRecords || [])) {
                await database.collections.get('citizenship_records').create((record) => {
                    record._raw.id = c.id;
                    applyCitizenshipRecord(record, c);
                });
            }
        });

        console.log('Database loaded from file successfully.');
    } catch (e) {
        console.error('loadFromFile error:', e);
    }
}

// ── exportToFile ──
export async function exportToFile() {
    if (!isElectron()) return { success: false, reason: 'Not in Electron' };
    try {
        const people = await database.collections.get('people').query().fetch();
        const relationships = await database.collections.get('relationships').query().fetch();
        const marriages = await database.collections.get('marriages').query().fetch();
        const citizenships = await database.collections.get('citizenships').query().fetch();
        const addresses = await database.collections.get('addresses').query().fetch();
        const birthRecords = await database.collections.get('birth_records').query().fetch();
        const marriageRecords = await database.collections.get('marriage_records').query().fetch();
        const deathRecords = await database.collections.get('death_records').query().fetch();
        const citizenshipRecords = await database.collections.get('citizenship_records').query().fetch();

        const data = JSON.stringify({
            version: 2,
            exportedAt: new Date().toISOString(),
            people: people.map(mapPerson),
            relationships: relationships.map(mapRelationship),
            marriages: marriages.map(mapMarriage),
            citizenships: citizenships.map(mapCitizenship),
            addresses: addresses.map(mapAddress),
            birthRecords: birthRecords.map(mapBirthRecord),
            marriageRecords: marriageRecords.map(mapMarriageRecord),
            deathRecords: deathRecords.map(mapDeathRecord),
            citizenshipRecords: citizenshipRecords.map(mapCitizenshipRecord),
        }, null, 2);

        const result = await window.electronDB.exportFile(data);
        return result;
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
        if (!data.people || !data.relationships) {
            return { success: false, reason: 'Invalid file format' };
        }

        await database.write(async () => {
            const existingPeople = await database.collections.get('people').query().fetch();
            const existingRelationships = await database.collections.get('relationships').query().fetch();
            const existingMarriages = await database.collections.get('marriages').query().fetch();
            const existingCitizenships = await database.collections.get('citizenships').query().fetch();
            const existingAddresses = await database.collections.get('addresses').query().fetch();
            const existingBirthRecords = await database.collections.get('birth_records').query().fetch();
            const existingMarriageRecords = await database.collections.get('marriage_records').query().fetch();
            const existingDeathRecords = await database.collections.get('death_records').query().fetch();
            const existingCitizenshipRecords = await database.collections.get('citizenship_records').query().fetch();

            for (const p of existingPeople) await p.destroyPermanently();
            for (const r of existingRelationships) await r.destroyPermanently();
            for (const m of existingMarriages) await m.destroyPermanently();
            for (const c of existingCitizenships) await c.destroyPermanently();
            for (const a of existingAddresses) await a.destroyPermanently();
            for (const b of existingBirthRecords) await b.destroyPermanently();
            for (const m of existingMarriageRecords) await m.destroyPermanently();
            for (const d of existingDeathRecords) await d.destroyPermanently();
            for (const c of existingCitizenshipRecords) await c.destroyPermanently();

            for (const p of data.people) {
                await database.collections.get('people').create((record) => {
                    record._raw.id = p.id;
                    applyPerson(record, p);
                });
            }
            for (const r of data.relationships) {
                await database.collections.get('relationships').create((record) => {
                    record._raw.id = r.id;
                    applyRelationship(record, r);
                });
            }
            for (const m of (data.marriages || [])) {
                await database.collections.get('marriages').create((record) => {
                    record._raw.id = m.id;
                    applyMarriage(record, m);
                });
            }
            for (const c of (data.citizenships || [])) {
                await database.collections.get('citizenships').create((record) => {
                    record._raw.id = c.id;
                    applyCitizenship(record, c);
                });
            }
            for (const a of (data.addresses || [])) {
                await database.collections.get('addresses').create((record) => {
                    record._raw.id = a.id;
                    applyAddress(record, a);
                });
            }
            for (const b of (data.birthRecords || [])) {
                await database.collections.get('birth_records').create((record) => {
                    record._raw.id = b.id;
                    applyBirthRecord(record, b);
                });
            }
            for (const m of (data.marriageRecords || [])) {
                await database.collections.get('marriage_records').create((record) => {
                    record._raw.id = m.id;
                    applyMarriageRecord(record, m);
                });
            }
            for (const d of (data.deathRecords || [])) {
                await database.collections.get('death_records').create((record) => {
                    record._raw.id = d.id;
                    applyDeathRecord(record, d);
                });
            }
            for (const c of (data.citizenshipRecords || [])) {
                await database.collections.get('citizenship_records').create((record) => {
                    record._raw.id = c.id;
                    applyCitizenshipRecord(record, c);
                });
            }
        });

        await saveToFile();
        return { success: true, count: data.people.length };
    } catch (e) {
        console.error('importFromFile error:', e);
        return { success: false, reason: e.message };
    }
}

export default database;