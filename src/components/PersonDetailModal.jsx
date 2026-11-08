import { withObservables } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import { useState } from 'react';
import database from '../database';
import MarriageCertificatePreview from './MarriageCertificatePreview';

const STATUS_LABELS = {
    engaged: 'Engaged',
    cohabiting: 'Cohabiting',
    married: 'Married',
    divorced: 'Divorced',
    widowed: 'Widowed',
};

const GENDER_LABELS = {
    male: 'Male',
    female: 'Female',
    unknown: 'Unknown',
};

function PersonDetailModal({ person, relationships, marriages, allPeople, allRelationships, onClose }) {
    const [showCertificate, setShowCertificate] = useState(false);

    const personMap = {};
    allPeople.forEach((p) => (personMap[p.id] = p));

    const getPersonName = (id) => {
        const p = personMap[id];
        return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
    };

    const parents = relationships.filter(
        (r) => r.person2Id === person.id && r.relationshipType === 'parent'
    );
    const children = relationships.filter(
        (r) => r.person1Id === person.id && r.relationshipType === 'parent'
    );
    const spouses = relationships.filter(
        (r) => (r.person1Id === person.id || r.person2Id === person.id) &&
            r.relationshipType === 'spouse'
    );

    const father = parents
        .map(r => personMap[r.person1Id])
        .find(p => p?.gender === 'male');

    const mother = parents
        .map(r => personMap[r.person1Id])
        .find(p => p?.gender === 'female');

    const firstSpouseId = spouses.length > 0
        ? (spouses[0].person1Id === person.id ? spouses[0].person2Id : spouses[0].person1Id)
        : null;
    const firstSpouse = firstSpouseId ? personMap[firstSpouseId] : null;
    const firstMarriage = marriages.length > 0 ? marriages[0] : null;

    // Find spouse's parents
    const spouseParents = firstSpouse
        ? relationships.filter(
            r => r.person2Id === firstSpouse.id && r.relationshipType === 'parent'
        )
        : [];

    const spouseFather = spouseParents
        .map(r => personMap[r.person1Id])
        .find(p => p?.gender === 'male');

    const spouseMother = spouseParents
        .map(r => personMap[r.person1Id])
        .find(p => p?.gender === 'female');

    // Find the owner as applicant
    const ownerPerson = allPeople.find(p => p.isOwner) || person;

    if (showCertificate) {
        return (
            <MarriageCertificatePreview
                person={person}
                spouse={firstSpouse}
                marriage={firstMarriage}
                father={father}
                mother={mother}
                spouseFather={spouseFather}
                spouseMother={spouseMother}
                applicant={ownerPerson}
                relationships={allRelationships}
                allPeople={allPeople}
                onClose={() => setShowCertificate(false)}
            />
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal person-detail-modal">
                <div className="modal-header">
                    <h2>
                        {person.isOwner && <span style={{ marginRight: '6px' }}>👑</span>}
                        {person.firstName} {person.lastName}
                    </h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="person-detail-body">

                    {/* General */}
                    <div className="detail-section">
                        <h3>General</h3>
                        <div className="detail-grid">
                            <span className="detail-label">Full Name</span>
                            <span>{person.firstName} {person.lastName}</span>

                            {person.birthName && (
                                <>
                                    <span className="detail-label">Birth Name</span>
                                    <span>{person.birthName}</span>
                                </>
                            )}

                            <span className="detail-label">Gender</span>
                            <span>{GENDER_LABELS[person.gender] || 'Unknown'}</span>
                        </div>
                    </div>

                    {/* Birth */}
                    {(person.bornAt || person.birthPlace) && (
                        <div className="detail-section">
                            <h3>Birth</h3>
                            <div className="detail-grid">
                                {person.bornAt && (
                                    <>
                                        <span className="detail-label">Date of Birth</span>
                                        <span>{new Date(person.bornAt).toLocaleDateString()}</span>
                                    </>
                                )}
                                {person.birthPlace && (
                                    <>
                                        <span className="detail-label">Place of Birth</span>
                                        <span>{person.birthPlace}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Parents */}
                    {parents.length > 0 && (
                        <div className="detail-section">
                            <h3>Parents</h3>
                            <div className="detail-list">
                                {parents.map((r) => (
                                    <div key={r.id} className="detail-list-item">
                                        {getPersonName(r.person1Id)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Children */}
                    {children.length > 0 && (
                        <div className="detail-section">
                            <h3>Children</h3>
                            <div className="detail-list">
                                {children.map((r) => (
                                    <div key={r.id} className="detail-list-item">
                                        {getPersonName(r.person2Id)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Marriages */}
                    {marriages.length > 0 && (
                        <div className="detail-section">
                            <h3>Marriages</h3>
                            <div className="detail-list">
                                {marriages.map((m) => {
                                    const otherId = m.person1Id === person.id ? m.person2Id : m.person1Id;
                                    return (
                                        <div key={m.id} className="detail-list-item">
                                            <span>{getPersonName(otherId)}</span>
                                            <span className="detail-badge">{STATUS_LABELS[m.status] || m.status}</span>
                                            {m.marriedAt && (
                                                <span className="detail-muted">
                                                    {new Date(m.marriedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                            {m.marriagePlace && (
                                                <span className="detail-muted">{m.marriagePlace}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Spouses without marriage records */}
                    {spouses.length > 0 && marriages.length === 0 && (
                        <div className="detail-section">
                            <h3>Spouses</h3>
                            <div className="detail-list">
                                {spouses.map((r) => {
                                    const otherId = r.person1Id === person.id ? r.person2Id : r.person1Id;
                                    return (
                                        <div key={r.id} className="detail-list-item">
                                            {getPersonName(otherId)}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                </div>

                {/* Certificate Button */}
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <button
                        onClick={() => setShowCertificate(true)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: '#4a90d9',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                        }}
                    >
                        📄 Apply for Marriage Certificate
                    </button>
                </div>

            </div>
        </div>
    );
}

const enhance = withObservables(['person'], ({ person }) => ({
    person,
    relationships: database.collections
        .get('relationships')
        .query(
            Q.or(
                Q.where('person1_id', person.id),
                Q.where('person2_id', person.id)
            )
        ),
    marriages: database.collections
        .get('marriages')
        .query(
            Q.or(
                Q.where('person1_id', person.id),
                Q.where('person2_id', person.id)
            )
        ),
    allPeople: database.collections.get('people').query(),
    allRelationships: database.collections.get('relationships').query(),
}));

export default enhance(PersonDetailModal);