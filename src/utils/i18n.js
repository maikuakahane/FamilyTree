export const languages = ['en', 'cs'];

export const labels = {
    en: {
        // Person
        firstName: 'First Name',
        lastName: 'Surname',
        birthName: 'Surname at Birth',
        gender: 'Gender',
        dateOfBirth: 'Date of Birth',
        placeOfBirth: 'Place of Birth',
        dateOfDeath: 'Date of Death',
        placeOfDeath: 'Place of Death',
        //Marriage
        dateOfMarriage: 'Date of Marriage',
        placeOfMarriage: 'Place of Marriage',
        // Parents
        father: 'Father',
        mother: 'Mother',
        // Address
        cAddress: 'Current address',
        street: 'Street',
        town: 'Town',
        country: 'Country',
        postcode: 'Postcode',
        // Applicant
        applicant: 'Applicant',
        relationToPerson: 'Relation to Person',
        //Signature zone
        inPlace:'In',
        atDate: 'date',
        signature: 'Sinature of applicant',
        //Records
        notApplicable: 'Not Applicable',
        birthReligionF: 'Religion at time of birth prior to 31.12.1949',
        marriageReligionF: 'Religion at time of marriage prior to 31.12.1949',
        deathReligionF: 'Religion at time of death prior to 31.12.1949',
    },
    cs: {
        // Person
        firstName: 'Jméno',
        lastName: 'Příjmení',
        birthName: 'Rodné příjmení',
        gender: 'Pohlaví',
        dateOfBirth: 'Datum narození',
        placeOfBirth: 'Místo narození',
        dateOfDeath: 'Datum umrtí',
        placeOfDeath: 'Místo umrtí',
        //Marriage
        dateOfMarriage: 'Datum uzavření manželství',
        placeOfMarriage: 'Místo uzavření manželství',
        // Parents
        father: 'Otec',
        mother: 'Matka',
        // Address
        cAddress: 'Nynější bydliště',
        street: 'Ulice',
        town: 'Město',
        country: 'Země',
        postcode: 'PSČ',
        // Applicant
        applicant: 'Žadatel',
        relationToPerson: 'Vztah k osobě',
        //Signature zone
        inPlace: 'V',
        atDate: 'dne',
        signature: 'Podpis žadatele',
        //Records
        notApplicable: 'Neuvádí se',
        birthReligionF: 'Náboženství v době narození u osob, které senarodily do 31. 12. 1949',
        marriageReligionF: 'Náboženství v době uzavření manželství uosob, které se uzavřeli manželství do 31.12.1949',
        deathReligionF: 'Náboženství v době úmrtí u osob, kterézemřeli do 31.12.1949',
    }
};

export const getLabel = (key, language) => {
    if (language === 'both') {
        return { en: labels.en[key], cs: labels.cs[key] };
    }
    return labels[language]?.[key] ?? key;
};

export const headers = {
    en: {
        applicationTitle: 'Questionnaire for application to send a registry certificate from CZ',
        designationTitle: 'Designation of Requested Certificate',
        sectionBTitle: 'Details of the person on the certificate',
        sectionC1Title: 'Details of parents of person listed in section B',
        sectionC2Title: 'Details of spouse of person listed in section B',
        sectionDTitle: 'Details of the person requesting issue of the certificate',
        sectionDMTitle: 'Details of marriage between persons listed in section B and C',
        birthCertificateType: 'Birth Certificate',
        marriageCertificateType: 'Marriage Certificate',
        deathCertificateType: 'Death Certificate',
    },
    cs: {
        applicationTitle: 'Dotazník k žádosti o zaslání matričního dokladu z ČR',
        designationTitle: 'Označení požadovaného dokladu',
        sectionBTitle: 'Údaje o osobě, které se žádaný doklad týká',
        sectionC1Title: 'Údaje o rodičích osoby uvedené v bodu B',
        sectionC2Title: 'Údaje o manželovi/manželce osoby uvedené v bodu B',
        sectionDTitle: 'Údaje o osobě, která žádá o vystavení dokladu',
        sectionDMTitle: 'Údaje o manželství uzavřené mezi osobami v bodech B a C',
        birthCertificateType: 'Rodný list',
        marriageCertificateType: 'Oddací list',
        deathCertificateType: 'Umrtní list',
    }
};

export const t = (key, language, dictionary = labels) => {
    if (language === 'both') {
        return `${dictionary.en[key]} / ${dictionary.cs[key]}`;
    }
    return dictionary[language]?.[key] ?? key;
};

export const relations = {
    en: {
        self: 'Same person',
        father: 'Father',
        mother: 'Mother',
        son: 'Son',
        daughter: 'Daughter',
        grandFather: 'Grandfather',
        grandMother: 'Grandmother',
        grandSon: 'Grandson',
        grandDaughter: 'Granddaughter',
        greatGrandFather: 'Great-Grandfather',
        greatGrandMother: 'Great-Grandmother',
        greatGrandSon: 'Great-Grandson',
        greatGrandDaughter: 'Great-Granddaughter',
        ancestorInDirectLine: 'Ancestor in Direct Line',
        descendantInDirectLine: 'Descendant in Direct Line',
        brother: 'Brother',
        sister: 'Sister',
        husband: 'Husband',
        wife: 'Wife',
    },
    cs: {
        self: 'Shodná osoba',
        father: 'Otec',
        mother: 'Matka',
        son: 'Syn',
        daughter: 'Dcera',
        grandFather: 'Dědeček',
        grandMother: 'Babička',
        grandSon: 'Vnuk',
        grandDaughter: 'Vnučka',
        greatGrandFather: 'Pradědeček',
        greatGrandMother: 'Prababička',
        greatGrandSon: 'Pravnuk',
        greatGrandDaughter: 'Pravnučka',
        ancestorInDirectLine: 'Předek v přímé linii',
        descendantInDirectLine: 'Potomek v přímé linii',
        brother: 'Bratr',
        sister: 'Sestra',
        husband: 'Manžel',
        wife: 'Manželka',
    }
};

        export const religions = {
    en: {
        relJew: 'Jewish',
        relCath: 'Catholic',
        relProt: 'Protestant',
        relOrth: 'Orthodox',
    },
    cs: {
        relJew: 'Židovské',
        relCath: 'Katolické',
        relProt: 'Evangelické',
        relOrth: 'Ortodoxní',
    }
};