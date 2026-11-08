import { useState, useEffect, useCallback } from 'react';
import database from '../database';
import { Q } from '@nozbe/watermelondb';
import { formatDate, formatPlace, formatAddress, findReligionKey } from '../utils/formatters';
import { t, headers, relations, labels, religions } from '../utils/i18n';
import BilingualLabel from './BilingualLabel';
import { calculateGenerationLabel } from '../utils/familyUtils';

const labelStyle = {
    padding: '8px 12px 8px 0',
    fontWeight: 'bold',
    width: '180px',
    borderBottom: '1px solid #eee',
    verticalAlign: 'top',
    color: '#000',
};

const valueStyle = {
    padding: '8px 0',
    borderBottom: '1px solid #eee',
    color: '#000',
};

const sectionStyle = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#000',
    margin: '20px 0 8px 0',
    paddingBottom: '4px',
    borderBottom: '2px solid #ccc',
};


const buildLabel = (steps, ownerGender) => {
    if (steps.length === 0) return 'self';

    const allUp = steps.every(s => s.direction === 'up');
    const allDown = steps.every(s => s.direction === 'down');
    const depth = steps.length;

    const isSibling = steps.length === 2 &&
        steps[0].direction === 'up' &&
        steps[1].direction === 'down';
    if (isSibling) return ownerGender === 'female' ? 'sister' : 'brother';

    const isSpouse = steps.length === 1 && steps[0].direction === 'spouse';
    if (isSpouse) return ownerGender === 'female' ? 'wife' : 'husband';

    // allUp means owner is BELOW target — owner is a descendant
    if (allUp) {
        if (depth === 1) return ownerGender === 'female' ? 'daughter' : 'son';
        if (depth === 2) return ownerGender === 'female' ? 'grandDaughter' : 'grandSon';
        return ownerGender === 'female' ? 'greatGrandDaughter' : 'greatGrandSon';
    }

    // allDown means owner is ABOVE target — owner is an ancestor
    if (allDown) {
        if (depth === 1) return ownerGender === 'female' ? 'mother' : 'father';
        if (depth === 2) return ownerGender === 'female' ? 'grandMother' : 'grandFather';
        return ownerGender === 'female' ? 'greatGrandMother' : 'greatGrandFather';
    }

    return steps[0].direction === 'up' ? 'ancestorInDirectLine' : 'descendantInDirectLine';
};

const deriveRelation = async (ownerId, targetId) => {
    const visited = new Set();
    const queue = [{ id: ownerId, steps: [] }];

    // fetch owner gender once upfront
    const owner = await database.collections.get('people').find(ownerId);
    const ownerGender = owner.gender;

    while (queue.length > 0) {
        const { id, steps } = queue.shift();
        if (id === targetId) return buildLabel(steps, ownerGender);
        if (visited.has(id)) continue;
        visited.add(id);

        // Travel up
        const parentRels = await database.collections
            .get('relationships')
            .query(Q.where('person2_id', id), Q.where('relationship_type', 'parent'))
            .fetch();
        for (const rel of parentRels) {
            const parent = await database.collections.get('people').find(rel.person1Id);
            queue.push({ id: parent.id, steps: [...steps, { direction: 'up', gender: parent.gender }] });
        }

        // Travel down
        const childRels = await database.collections
            .get('relationships')
            .query(Q.where('person1_id', id), Q.where('relationship_type', 'parent'))
            .fetch();
        for (const rel of childRels) {
            const child = await database.collections.get('people').find(rel.person2Id);
            queue.push({ id: child.id, steps: [...steps, { direction: 'down', gender: child.gender }] });
        }

        // Check spouse
        const marriageRels = await database.collections
            .get('marriages')
            .query(
                Q.or(
                    Q.where('person1_id', id),
                    Q.where('person2_id', id)
                )
            ).fetch();
        for (const m of marriageRels) {
            const spouseId = m.person1Id === id ? m.person2Id : m.person1Id;
            const spouse = await database.collections.get('people').find(spouseId);
            queue.push({ id: spouseId, steps: [...steps, { direction: 'spouse', gender: spouse.gender }] });
        }
    }

    return 'relative';
};

const loadMarriageRecord = async (marriageId) => {
    const records = await database.collections
        .get('marriage_records')
        .query(Q.where('marriage_id', marriageId))
        .fetch();
    return records[0] || null;
};

const PersonSection = ({ title, p, language }) => {
    if (!p) return null;
    return (
        <>
            <div style={sectionStyle}>{title}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#000' }}>
                <tbody>
                    <tr>
                        <BilingualLabel labelKey="lastName" language={language} style={labelStyle} />
                        <td style={valueStyle}>{p.lastName}</td>
                    </tr>
                    <tr>
                        <BilingualLabel labelKey="birthName" language={language} style={labelStyle} />
                        <td style={valueStyle}>{p.birthName || '—'}</td>
                    </tr>
                    <tr>
                        <BilingualLabel labelKey="firstName" language={language} style={labelStyle} />
                        <td style={valueStyle}>{p.firstName}</td>
                    </tr>
                    <tr>
                        <BilingualLabel labelKey="dateOfBirth" language={language} style={labelStyle} />
                        <td style={valueStyle}>{formatDate(p.bornAt)}</td>
                    </tr>
                    <tr>
                        <BilingualLabel labelKey="placeOfBirth" language={language} style={labelStyle} />
                        <td style={valueStyle}>{formatPlace(p.birthTown, p.birthCountry)}</td>
                    </tr>
                </tbody>
            </table>
        </>
    );
};


export default function MarriageCertificateModal({ person, marriages, onClose }) {
    const [activeTab, setActiveTab] = useState(0);
    const [spouses, setSpouses] = useState({});
    const [applicant, setApplicant] = useState(null);
    const [applicantAddress, setApplicantAddress] = useState(null);
    const [relation, setRelation] = useState('');
    const [language, setLanguage] = useState('en');
    const [marriageRecord, setMarriageRecord] = useState(null);
    const [generationLabel, setGenerationLabel] = useState('Gen 0');



    const cycleLanguage = useCallback(() => {
        setLanguage(l => {
            if (l === 'en') return 'cs';
            if (l === 'cs') return 'both';
            return 'en';
        });
    }, []);

    const currentMarriage = marriages[activeTab];
    const currentSpouse = currentMarriage ? spouses[currentMarriage.id] : null;

    const marriageRecordRelevant = currentMarriage?.marriedAt
        ? new Date(currentMarriage.marriedAt) < new Date('1950-01-01')
        : false;

    // Load spouses and then parents of both parties
    useEffect(() => {
        const load = async () => {
            const spouseResult = {};

            const results = await database.collections
                .get('people')
                .query(Q.where('is_owner', true))
                .fetch();
            const owner = results[0] || null;
            setApplicant(owner);

            if (currentMarriage) {
                const loadedMarriageRecord = await loadMarriageRecord(currentMarriage.id);
                setMarriageRecord(loadedMarriageRecord);
            }

            if (owner) {
                const relationLabel = await deriveRelation(owner.id, person.id);
                setRelation(relationLabel);

                const genLabel = await calculateGenerationLabel(owner.id, person.id);
                setGenerationLabel(genLabel);

                const addresses = await database.collections
                    .get('addresses')
                    .query(
                        Q.where('person_id', owner.id),
                        Q.sortBy('moved_in_at', Q.desc)
                    )
                    .fetch();
                setApplicantAddress(addresses[0] || null);
            }

            // Load each spouse
            for (const m of marriages) {
                const spouseId = m.person1Id === person.id ? m.person2Id : m.person1Id;
                try {
                    const spouse = await database.collections.get('people').find(spouseId);
                    spouseResult[m.id] = spouse;
                } catch {
                    spouseResult[m.id] = null;
                }
            }

            setSpouses(spouseResult);
        };

        load();
    }, [person.id, marriages]);
    

   

    const spouseName = (m) => {
        const s = spouses[m?.id];
        return s ? `${s.firstName} ${s.lastName}` : 'Loading...';
    };

    const handleSavePDF = async () => {
        const contentHTML = document.getElementById('certificate-print-area').innerHTML;
        const folderPath = `${generationLabel}/${person.firstName} ${person.lastName}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <style>
                    body { font-family: serif; padding: 40px; color: #000; }
                    table { width: 100%; border-collapse: collapse; font-size: 13px; }
                    td { padding: 8px 12px 8px 0; border-bottom: 1px solid #eee; vertical-align: top; }
                    td:first-child { font-weight: bold; width: 180px; }
                    h3, h4 { margin-bottom: 8px; }
                    .page-break { break-after: page; }
                </style>
            </head>
            <body>${contentHTML}</body>
            </html>
        `;
        const result = await window.electronDB.savePDF({
            html,
            defaultFileName: `marriage-certificate-${person.firstName}-${person.lastName}`,
            folderPath,
        });
        if (result.success) {
            console.log('Saved to', result.filePath);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: '680px', width: '100%' }}>

                {/* Modal header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                }}>
                    <h2 style={{ margin: 0 }}>Marriage Certificate Application</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={handleSavePDF}
                            style={{
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-input)',
                                borderRadius: '4px',
                                padding: '6px 14px',
                                cursor: 'pointer',
                                color: 'var(--text-primary)',
                                fontSize: '13px',
                            }}
                        >🖨 Save as PDF</button>
                        <button
                            onClick={cycleLanguage}
                            style={{
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-input)',
                                borderRadius: '4px',
                                padding: '6px 14px',
                                cursor: 'pointer',
                                fontSize: '13px',
                            }}
                        >
                            🌐 {language === 'both' ? 'EN / CS' : language.toUpperCase()}
                        </button>

                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '18px',
                                color: 'var(--text-secondary)',
                                lineHeight: 1,
                            }}
                        >✕</button>
                    </div>
                </div>

                {/* Marriage tabs if multiple */}
                {marriages.length > 1 && (
                    <div className="form-tabs">
                        {marriages.map((m, i) => (
                            <button
                                key={m.id}
                                className={`form-tab ${activeTab === i ? 'form-tab--active' : ''}`}
                                onClick={() => setActiveTab(i)}
                            >
                                {spouseName(m)}
                            </button>
                        ))}
                    </div>
                )}

                {/* Application preview */}
                <div
                    id="certificate-print-area"
                    style={{
                        background: 'white',
                        color: '#000',
                        padding: '32px',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                        maxHeight: '60vh',
                        overflowY: 'auto',
                    }}
                >
                    <div className="page-break">
                        <h3>{t('applicationTitle', language, headers)}</h3>
                        <h4>A: {t('designationTitle', language, headers)}</h4>
                        <h5>{t('marriageCertificateType', language, headers)}</h5>
                   
                    

                        {/* Person */}
                        <PersonSection title={t('sectionBTitle', language, headers)} p={person} language={language} />



                        {/* Spouse */}
                        <PersonSection title={t('sectionC2Title', language, headers)} p={currentSpouse} language={language} />

                        {/* Marriage details */}
                        <h4>D: {t('sectionDMTitle', language, headers)}</h4>
                        {currentMarriage && (
                            <>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#000' }}>
                                    <tbody>
                                        <tr>
                                            <BilingualLabel labelKey="dateOfMarriage" language={language} style={labelStyle} />
                                            <td style={valueStyle}>{formatDate(currentMarriage.marriedAt)}</td>
                                        </tr>
                                        <tr>
                                            <BilingualLabel labelKey="placeOfMarriage" language={language} style={labelStyle} />
                                            <td style={valueStyle}>{formatPlace(currentMarriage.marriageTown, currentMarriage.marriageCountry)}</td>
                                        </tr>
                                        <tr>
                                            <BilingualLabel labelKey="marriageReligionF" language={language} style={labelStyle} />
                                            <td style={valueStyle}>
                                                {marriageRecordRelevant
                                                    ? (() => {
                                                        const key = findReligionKey(marriageRecord?.marriageReligion, religions);
                                                        return key
                                                            ? t(key, language, religions)
                                                            : (marriageRecord?.marriageReligion || '—');
                                                    })()
                                                    : t('notApplicable', language, labels)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </>
                        )}

                    </div>
                    {/* Applicant */}
                    <h4>E: {t('sectionDTitle', language, headers)}</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#000' }}>
                        <tbody>
                            <tr>
                                <BilingualLabel labelKey="firstName" language={language} style={labelStyle} />
                                <td style={valueStyle}>{applicant?.firstName || '—'}</td>
                            </tr>
                            <tr>
                                <BilingualLabel labelKey="lastName" language={language} style={labelStyle} />
                                <td style={valueStyle}>{applicant?.lastName || '—'}</td>
                            </tr>
                            <tr>
                                <BilingualLabel labelKey="relationToPerson" language={language} style={labelStyle} />
                                <td style={valueStyle}>{relation ? t(relation, language, relations) : '—'}</td>
                            </tr>
                            <tr>
                                <BilingualLabel labelKey="cAddress" language={language} style={labelStyle} />
                                <td style={valueStyle}>
                                    {formatAddress(
                                        applicantAddress?.addressStreet,
                                        applicantAddress?.addressTown,
                                        applicantAddress?.addressCountry,
                                        applicantAddress?.addressCode
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <br />
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#000' }}>
                        <tbody>
                            <tr style={{ borderBottomStyle: 'dotted' }}>
                                <BilingualLabel labelKey="inPlace" language={language} style={labelStyle} />
                                <BilingualLabel labelKey="atDate" language={language} style={labelStyle} />
                            </tr>
                        </tbody>
                    </table>

                    <br />
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#000' }}>
                        <tbody>
                            <tr style={{ borderBottomStyle: 'dotted' }}>
                                <BilingualLabel labelKey="signature" language={language} style={labelStyle} />
                            </tr>
                        </tbody>
                    </table>

                    <br />
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#000' }}>
                        <tbody>
                            <tr style={{ borderBottomStyle: 'dotted' }}>
                                <td>Totožnost žadatele ověřena podle dokladu</td>
                            </tr>
                            <tr style={{ borderBottomStyle: 'dotted' }}>
                                <td style={{ width: '40%' }}>vydaného dne</td>
                                <td style={{ width: '30%' }}>kým</td>
                                <td style={{ width: '30%' }}>platného do</td>
                            </tr>
                            <tr style={{ borderBottomStyle: 'dotted' }}>
                                <td>Jméno, příjmení, funkce a podpis<br />konzulárního úředníka/ matrikáře</td>
                            </tr>
                            <tr style={{ borderBottomStyle: 'dotted' }}>
                                <td>Razítko zastupitelského/ matričního úřadu ČR</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="form-buttons" style={{ marginTop: '16px' }}>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}