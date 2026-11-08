export function getEventIds(person) {
    return {
        birthIdL: person.birthIdR,
        relationshipIdsL: person.relationshipIdsR,
        deathIdL: person.deathIdR,
    };
}

export function findRecord(id, records, idField) {
  return records.find((record) => record[idField] === id);

}

export function pickFirst(...values) {
    for (const value of values) {
        if (value !== null && value !== undefined && value !== '') return value;
    }
    return '';

}

export function pickFirstGroup(...groups) {
    for (const group of groups) {
        if (group && Object.values(group).some(value => value !== null && value !== undefined && value !== '')) return group;
    }
    return {};
}

export function getLinkedRecords(person, { birthRecords, deathRecords }) {
    const ids = getEventIds(person);
    const birth = findRecord(ids.birthIdL, birthRecords, 'birthRecordId');
    const death = findRecord(ids.deathIdL, deathRecords, 'deathRecordId');
    return { birth, death };
}

export function displayDetails(person, birthRecords, deathRecords) {

    const { birth, death } = getLinkedRecords(person, { birthRecords, deathRecords });
    const birthplace = pickFirstGroup(
        { town: birth?.birthTown, county: birth?.birthCounty, country: birth?.birthCountry },
        { town: death?.birthTown, county: death?.birthCounty, country: death?.birthCountry },
    );

    const birthday = pickFirstGroup(
        { day: birth?.birthDay, month: birth?.birthMonth, year: birth?.birthYear },
        { day: death?.birthDay, month: death?.birthMonth, year: death?.birthYear },
    );

    return {
        firstName: pickFirst(death?.firstName, birth?.firstName, person.firstNameP),
        lastName: pickFirst(death?.lastName, birth?.lastName, person.lastNameP),
        birthName: pickFirst(birth?.lastName, death?.birthName, person.birthNameP),
        gender: pickFirst(
            birth?.gender === 'unknown' ? undefined : birth?.gender,
            person.genderP,
        ),
        birthTown: birthplace.town,
        birthCounty: birthplace.county,
        birthCountry: birthplace.country,
        birthDay: birthday.day,
        birthMonth: birthday.month,
        birthYear: birthday.year,
    }
}

export function formatDate(day, month, year) {
    if (!day && !month && !year) return '—';
    const formattedDate = [day, month, year].map((part) => part || '?').join('/')
    
    return formattedDate;
}

export function formatPlace(town, county, country) {
    const formattedPlace = [town, county, country].filter(Boolean).join(', ');
    return formattedPlace || '—';
}