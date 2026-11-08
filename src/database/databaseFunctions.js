import { Q } from '@nozbe/watermelondb';
import { formatRef } from '../utils/refs';
import database from './index';

const PREFIXES = {
    person: 'P',
    birth: 'B',
    death: 'D',
    relationship: 'R',
    citizenship: 'C',
};

export async function nextRef(database, key) {
    if (!PREFIXES[key]) throw new Error(`nextRef: unknown key "${key}"`);
    const counters = database.collections.get('counters');

    const found = await counters.query(Q.where('key', key)).fetch();
    const counter = found[0]
        ?? await counters.create((c) => { c.key = key; c.value = 0; });

    await counter.update((c) => { c.value = c.value + 1; });

    return formatRef(PREFIXES[key], counter.value);
 
}

function toNumber(value) {
    if (value === '') return null;
    const num = Number(value);
    return num;
}

export async function createPerson({ firstNameP1, lastNameP1, birthNameP1, genderP1, isOwner1 }) {
    return database.write(async () => {
   
        const ref = await nextRef(database, 'person');
        const person = await database.collections.get('people').create((p) => {
            p.personId = ref;
            p.firstNameP = firstNameP1;
            p.lastNameP = lastNameP1;
            p.birthNameP = birthNameP1;
            p.genderP = genderP1;
            p.isOwner = isOwner1;
            p.generation = isOwner1 ? '0A' : null;
        });
        return person;
    });
}

export async function createBirthRecord({ firstNameB1, lastNameB1, genderB1, birthDayB1, birthMonthB1, birthYearB1, birthTownB1, birthCountyB1, birthCountryB1,
    motherFirstNameB1, motherLastNameB1, motherBirthNameB1, motherBirthDayB1, motherBirthMonthB1, motherBirthYearB1, motherBirthTownB1, motherBirthCountyB1, motherBirthCountryB1,
    fatherFirstNameB1, fatherLastNameB1, fatherBirthNameB1, fatherBirthDayB1, fatherBirthMonthB1, fatherBirthYearB1, fatherBirthTownB1, fatherBirthCountyB1, fatherBirthCountryB1, birthReligionB1,  }) {
    return database.write(async () => {

        const ref = await nextRef(database, 'birth');
        const birthRecord = await database.collections.get('birth_records').create((p) => {
            // Person's details
            p.firstName = firstNameB1;
            p.lastName = lastNameB1;
            p.gender = genderB1;
            p.birthDay = toNumber(birthDayB1);
            p.birthMonth = toNumber(birthMonthB1);
            p.birthYear = toNumber(birthYearB1);
            p.birthTown = birthTownB1;
            p.birthCounty = birthCountyB1;
            p.birthCountry = birthCountryB1;
            // Mother's details
            p.motherFirstName = motherFirstNameB1;
            p.motherLastName = motherLastNameB1;
            p.motherBirthName = motherBirthNameB1;
            p.motherBirthDay = toNumber(motherBirthDayB1);
            p.motherBirthMonth = toNumber(motherBirthMonthB1)
            p.motherBirthYear = toNumber(motherBirthYearB1);
            p.motherBirthTown = motherBirthTownB1;
            p.motherBirthCounty = motherBirthCountyB1;
            p.motherBirthCountry = motherBirthCountryB1;
            // Father's details
            p.fatherFirstName = fatherFirstNameB1;
            p.fatherLastName = fatherLastNameB1;
            p.fatherBirthName = fatherBirthNameB1;
            p.fatherBirthDay = toNumber(fatherBirthDayB1);
            p.fatherBirthMonth = toNumber(fatherBirthMonthB1);
            p.fatherBirthYear = toNumber(fatherBirthYearB1);
            p.fatherBirthTown = fatherBirthTownB1;
            p.fatherBirthCounty = fatherBirthCountyB1;
            p.fatherBirthCountry = fatherBirthCountryB1;
            // Religion
            p.birthReligion = birthReligionB1;
            //IDs
            p.birthRecordId = ref;
        });
        return birthRecord;
    });
}

export async function linkBirthRecord({ personIdB1, birthRecordIdB1 }) {
    return database.write(async () => {
        const foundDP = database.collections.get('people');
        const foundDB = database.collections.get('birth_records');

        const foundP = await foundDP.query(Q.where('person_id', personIdB1)).fetch();
        const foundB = await foundDB.query(Q.where('birth_record_id', birthRecordIdB1)).fetch();
        const person = foundP[0];
        const birthRecord = foundB[0];
        await person.update((p) => {
            p.birthIdR = birthRecordIdB1;
        });
        await birthRecord.update((b) => {
            b.personIdR = personIdB1;
        });
    });
}