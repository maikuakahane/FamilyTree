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

export async function updateBirthRecord({ birthRecord, form }) {
    return database.write(async () => {
        await birthRecord.update(b => {
            // Person's details
            b.firstName = form.be_firstName;
            b.lastName = form.be_lastName;
            b.birthDay = toNumber(form.be_birthDay);
            b.birthMonth = toNumber(form.be_birthMonth);
            b.birthYear = toNumber(form.be_birthYear);
            b.gender = form.be_gender;
            b.birthTown = form.be_birthTown;
            b.birthCounty = form.be_birthCounty;
            b.birthCountry = form.be_birthCountry;
            // Mother's details
            b.motherFirstName = form.be_motherFirstName;
            b.motherLastName = form.be_motherLastName;
            b.motherBirthName = form.be_motherBirthName;
            b.motherBirthDay = toNumber(form.be_motherBirthDay);
            b.motherBirthMonth = toNumber(form.be_motherBirthMonth);
            b.motherBirthYear = toNumber(form.be_motherBirthYear);
            b.motherBirthTown = form.be_motherBirthTown;
            b.motherBirthCounty = form.be_motherBirthCounty;
            b.motherBirthCountry = form.be_motherBirthCountry;
            // Father's details
            b.fatherFirstName = form.be_fatherFirstName;
            b.fatherLastName = form.be_fatherLastName;
            b.fatherBirthName = form.be_fatherBirthName;
            b.fatherBirthDay = toNumber(form.be_fatherBirthDay);
            b.fatherBirthMonth = toNumber(form.be_fatherBirthMonth);
            b.fatherBirthYear = toNumber(form.be_fatherBirthYear);
            b.fatherBirthTown = form.be_fatherBirthTown;
            b.fatherBirthCounty = form.be_fatherBirthCounty;
            b.fatherBirthCountry = form.be_fatherBirthCountry;
            // Birth and baptism details
            b.baptismDay = toNumber(form.be_baptismDay);
            b.baptismMonth = toNumber(form.be_baptismMonth);
            b.baptismYear = toNumber(form.be_baptismYear);
            // Birth registration details
            b.birthRegistryOffice = form.be_birthRegistryOffice;
            b.birthRegistryBook = form.be_birthRegistryBook;
            b.birthRegistryVolume = form.be_birthRegistryVolume;
            b.birthRegistryYear = form.be_birthRegistryYear;
            b.birthRegistryPage = form.be_birthRegistryPage;
            b.birthRegistryEntry = form.be_birthRegistryEntry;
            // Religion
            b.birthReligion = form.be_birthReligion;

        });
    });
}

export async function updateDeathRecord({ deathRecord, form }) {
    return database.write(async () => {
        await deathRecord.update(d => {
            // Person's details
            d.firstName = form.de_firstName;
            d.lastName = form.de_lastName;
            d.birthName = form.de_birthName;
            d.birthDay = toNumber(form.de_birthDay);
            d.birthMonth = toNumber(form.de_birthMonth);
            d.birthYear = toNumber(form.de_birthYear);
            d.gender = form.de_gender;
            d.birthTown = form.de_birthTown;
            d.birthCounty = form.de_birthCounty;
            d.birthCountry = form.de_birthCountry;
            d.deathDay = toNumber(form.de_deathDay);
            d.deathMonth = toNumber(form.de_deathMonth);
            d.deathYear = toNumber(form.de_deathYear);
            d.deathTown = form.de_deathTown;
            d.deathCounty = form.de_deathCounty;
            d.deathCountry = form.de_deathCountry;
            d.deathReason = form.de_deathReason;
            d.addressStreet = form.de_addressStreet;
            d.addressCounty = form.de_addressCounty;
            d.addressCountry = form.de_addressCountry;
            // Spouse's details
            d.spouseFirstName = form.de_spouseFirstName;
            d.spouseLastName = form.de_spouseLastName;
            d.spouseBirthName = form.de_spouseBirthName;
            // Death registration details
            d.deathRegistryOffice = form.de_deathRegistryOffice;
            d.deathRegistryBook = form.de_deathRegistryBook;
            d.deathRegistryVolume = form.de_deathRegistryVolume;
            d.deathRegistryYear = form.de_deathRegistryYear;
            d.deathRegistryPage = form.de_deathRegistryPage;
            d.deathRegistryEntry = form.be_deathRegistryEntry;
            // Religion
            d.deathReligion = form.de_deathReligion;

        });
    });
}