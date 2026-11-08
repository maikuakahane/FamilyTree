const Field = ({ label, value }) => (
    <div className="cert-field">
        <div className="cert-field-label">{label}</div>
        <div className="cert-field-value">{value || '—'}</div>
    </div>
);

const Section = ({ title, children }) => (
    <div className="cert-section">
        <div className="cert-section-title">{title}</div>
        {children}
    </div>
);

function getRelationship(applicant, viewedPerson, relationships, allPeople) {
    if (applicant.id === viewedPerson.id) return 'Myself';

    const personMap = {};
    allPeople.forEach(p => (personMap[p.id] = p));

    const isSpouse = relationships.some(
        r => r.relationshipType === 'spouse' &&
            ((r.person1Id === applicant.id && r.person2Id === viewedPerson.id) ||
                (r.person2Id === applicant.id && r.person1Id === viewedPerson.id))
    );
    if (isSpouse) {
        return applicant.gender === 'male' ? 'Husband' : applicant.gender === 'female' ? 'Wife' : 'Spouse';
    }

    const getParents = (personId) =>
        relationships
            .filter(r => r.relationshipType === 'parent' && r.person2Id === personId)
            .map(r => r.person1Id);

    const getChildren = (personId) =>
        relationships
            .filter(r => r.relationshipType === 'parent' && r.person1Id === personId)
            .map(r => r.person2Id);

    const searchUp = (startId, targetId, depth = 0, visited = new Set()) => {
        if (startId === targetId) return depth;
        if (visited.has(startId)) return null;
        visited.add(startId);
        for (const parentId of getParents(startId)) {
            const result = searchUp(parentId, targetId, depth + 1, visited);
            if (result !== null) return result;
        }
        return null;
    };

    const searchDown = (startId, targetId, depth = 0, visited = new Set()) => {
        if (startId === targetId) return depth;
        if (visited.has(startId)) return null;
        visited.add(startId);
        for (const childId of getChildren(startId)) {
            const result = searchDown(childId, targetId, depth + 1, visited);
            if (result !== null) return result;
        }
        return null;
    };

    const isMale = applicant.gender === 'male';

    const descendantDepth = searchDown(viewedPerson.id, applicant.id);
    if (descendantDepth !== null) {
        if (descendantDepth === 1) return isMale ? 'Son' : 'Daughter';
        if (descendantDepth === 2) return isMale ? 'Grandson' : 'Granddaughter';
        if (descendantDepth === 3) return isMale ? 'Great-Grandson' : 'Great-Granddaughter';
        return 'Descendant in Direct Line';
    }

    const ancestorDepth = searchUp(viewedPerson.id, applicant.id);
    if (ancestorDepth !== null) {
        if (ancestorDepth === 1) return 'Parent';
        if (ancestorDepth === 2) return 'Grandparent';
        if (ancestorDepth === 3) return 'Great-Grandparent';
        return 'Ancestor in Direct Line';
    }

    return 'Other';
}

export default function MarriageCertificatePreview({
    person, spouse, marriage, father, mother,
    spouseFather, spouseMother,
    applicant, relationships, allPeople,
    onClose,
}) {
    const handlePrint = () => window.print();

    const husband = person.gender === 'female' ? spouse : person;
    const wife = person.gender === 'female' ? person : spouse;

    const husbandFather = person.gender === 'female' ? spouseFather : father;
    const husbandMother = person.gender === 'female' ? spouseMother : mother;
    const wifeFather = person.gender === 'female' ? father : spouseFather;
    const wifeMother = person.gender === 'female' ? mother : spouseMother;

    const relationship = applicant
        ? getRelationship(applicant, person, relationships, allPeople)
        : '—';

    return (
        <div className="modal-overlay">
            <div className="modal cert-modal">

                <div className="cert-toolbar no-print">
                    <h2>Marriage Certificate Application — Preview</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handlePrint} className="cert-print-btn">
                            🖨️ Print / Save as PDF
                        </button>
                        <button className="modal-close" onClick={onClose}>✕</button>
                    </div>
                </div>

                <div className="cert-document">

                    <div className="cert-header">
                        <h1 className="cert-title">APPLICATION FOR MARRIAGE CERTIFICATE</h1>
                        <p className="cert-subtitle">Family Tree Application — Official Request Form</p>
                        <p className="cert-date">Generated: {new Date().toLocaleDateString('en-GB')}</p>
                    </div>

                    <Section title="SECTION A — DETAILS OF MARRIAGE">
                        <div className="cert-field-row">
                            <Field
                                label="Date of Marriage"
                                value={marriage?.marriedAt ? new Date(marriage.marriedAt).toLocaleDateString('en-GB') : null}
                            />
                            <Field label="Place of Marriage" value={marriage?.marriagePlace} />
                        </div>
                    </Section>

                    <Section title="SECTION B — DETAILS OF THE SPOUSES">
                        <div className="cert-two-col">
                            <div className="cert-col">
                                <div className="cert-col-title">Husband</div>
                                <Field label="First Name" value={husband?.firstName} />
                                <Field label="Last Name" value={husband?.lastName} />
                                <Field label="Surname at Birth" value={husband?.birthName} />
                                <Field
                                    label="Date of Birth"
                                    value={husband?.bornAt ? new Date(husband.bornAt).toLocaleDateString('en-GB') : null}
                                />
                                <Field label="Place of Birth" value={husband?.birthPlace} />
                            </div>

                            <div className="cert-col">
                                <div className="cert-col-title">Wife</div>
                                <Field label="First Name" value={wife?.firstName} />
                                <Field label="Last Name" value={wife?.lastName} />
                                <Field label="Surname at Birth" value={wife?.birthName} />
                                <Field
                                    label="Date of Birth"
                                    value={wife?.bornAt ? new Date(wife.bornAt).toLocaleDateString('en-GB') : null}
                                />
                                <Field label="Place of Birth" value={wife?.birthPlace} />
                            </div>
                        </div>
                    </Section>

                    <Section title="SECTION C — DETAILS OF SPOUSES' PARENTS">
                        <div className="cert-field-row">
                            <Field
                                label="Husband's Father's Full Name"
                                value={husbandFather ? `${husbandFather.firstName} ${husbandFather.lastName}` : null}
                            />
                            <Field
                                label="Husband's Mother's Full Name and Surname at Birth"
                                value={husbandMother
                                    ? `${husbandMother.firstName} ${husbandMother.lastName}${husbandMother.birthName ? ` (${husbandMother.birthName})` : ''}`
                                    : null}
                            />
                        </div>
                        <div className="cert-field-row">
                            <Field
                                label="Wife's Father's Full Name"
                                value={wifeFather ? `${wifeFather.firstName} ${wifeFather.lastName}` : null}
                            />
                            <Field
                                label="Wife's Mother's Full Name and Surname at Birth"
                                value={wifeMother
                                    ? `${wifeMother.firstName} ${wifeMother.lastName}${wifeMother.birthName ? ` (${wifeMother.birthName})` : ''}`
                                    : null}
                            />
                        </div>
                    </Section>

                    <Section title="DETAILS OF THE PERSON WHO IS APPLYING">
                        <div className="cert-field-row">
                            <Field
                                label="Full Name"
                                value={applicant ? `${applicant.firstName} ${applicant.lastName}` : '—'}
                            />
                            <Field
                                label="Relationship to the Person on the Certificate"
                                value={relationship}
                            />
                        </div>
                    </Section>

                    <div className="cert-declaration">
                        <div className="cert-section-title">DECLARATION</div>
                        <p className="cert-section-note">
                            I declare that the information provided in this application is true and accurate to the best of my knowledge.
                        </p>
                        <div className="cert-signature-row">
                            <div className="cert-signature-box">
                                <div className="cert-signature-line" />
                                <div className="cert-signature-label">Signature of Applicant</div>
                            </div>
                            <div className="cert-signature-box">
                                <div className="cert-signature-line" />
                                <div className="cert-signature-label">Date</div>
                            </div>
                        </div>
                    </div>

                    <div className="cert-footer">
                        This document was generated by Family Tree Application. It is not an official government document.
                    </div>

                </div>
            </div>
        </div>
    );
}