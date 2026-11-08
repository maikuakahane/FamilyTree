import { useState } from 'react';
import { withObservables } from '@nozbe/watermelondb/react';
import database from '../database';
import BirthCertificateModal from './BirthCertificateModal';
import MarriageCertificateModal from './MarriageCertificateModal';
import DeathCertificateModal from './DeathCertificateModal';

const Tick = () => <span style={{ color: '#6dbf67', fontSize: '16px' }}>✓</span>;
const Cross = () => <span style={{ color: '#e05555', fontSize: '16px' }}>✗</span>;

function CertificatesTable({ people, marriages }) {
    const [search, setSearch] = useState('');
    const [birthModal, setBirthModal] = useState(null); // person
    const [marriageModal, setMarriageModal] = useState(null); // person
    const [deathModal, setDeathModal] = useState(null); // person

    if (!people) return <div className="people-list"><p>Loading...</p></div>;

    const filtered = people.filter((p) => {
        const term = search.toLowerCase();
        return (
            (p.firstName || '').toLowerCase().includes(term) ||
            (p.lastName || '').toLowerCase().includes(term) ||
            (p.birthName || '').toLowerCase().includes(term)
        );
    });

    const getMarriages = (personId) =>
        marriages.filter(m => m.person1Id === personId || m.person2Id === personId);

    const formatDate = (timestamp) =>
        timestamp ? new Date(timestamp).toLocaleDateString('en-GB') : '—';

    const ApplyBtn = ({ label, onClick }) => (
        <button
            onClick={onClick}
            style={{
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '3px 10px',
                cursor: 'pointer',
                fontSize: '12px',
                whiteSpace: 'nowrap',
            }}
        >
            {label || 'Apply'}
        </button>
    );

    return (
        <div className="people-list">

            {/* Modals */}
            {birthModal && (
                <BirthCertificateModal
                    person={birthModal}
                    onClose={() => setBirthModal(null)}
                />
            )}
            {marriageModal && (
                <MarriageCertificateModal
                    person={marriageModal}
                    marriages={getMarriages(marriageModal.id)}
                    allPeople={people}
                    onClose={() => setMarriageModal(null)}
                />
            )}
            {deathModal && (
                <DeathCertificateModal
                    person={deathModal}
                    onClose={() => setDeathModal(null)}
                />
            )}

            <div className="people-list-header">
                <h2>Certificates</h2>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                    <button className="search-clear" onClick={() => setSearch('')}>✕</button>
                )}
            </div>

            {filtered.length === 0 && search ? (
                <p className="empty-state">No results for "{search}".</p>
            ) : filtered.length === 0 ? (
                <p className="empty-state">No family members yet.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="people-table">
                        <thead>
                            <tr>
                                <th rowSpan={2}>Full Name</th>
                                <th rowSpan={2}>Date of Birth</th>
                                <th colSpan={2} style={{ textAlign: 'center' }}>🏛 Birth Certificate</th>
                                <th colSpan={2} style={{ textAlign: 'center' }}>💍 Marriage Certificate</th>
                                <th colSpan={2} style={{ textAlign: 'center' }}>✝ Death Certificate</th>
                            </tr>
                            <tr>
                                <th style={{ textAlign: 'center' }}>Obtained</th>
                                <th style={{ textAlign: 'center' }}>Apply</th>
                                <th style={{ textAlign: 'center' }}>Obtained</th>
                                <th style={{ textAlign: 'center' }}>Apply</th>
                                <th style={{ textAlign: 'center' }}>Obtained</th>
                                <th style={{ textAlign: 'center' }}>Apply</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((person) => (
                                <tr key={person.id}>
                                    <td>
                                        {person.firstName} {person.lastName}
                                        {person.isOwner ? ' 👑' : ''}
                                    </td>
                                    <td>{formatDate(person.bornAt)}</td>

                                    {/* Birth Certificate */}
                                    <td style={{ textAlign: 'center' }}>
                                        {person.birthCertificateObtained ? <Tick /> : <Cross />}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <ApplyBtn onClick={() => setBirthModal(person)} />
                                    </td>

                                    {/* Marriage Certificate */}
                                    <td style={{ textAlign: 'center' }}>
                                        {person.marriageCertificateObtained ? <Tick /> : <Cross />}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <ApplyBtn onClick={() => setMarriageModal(person)} />
                                    </td>

                                    {/* Death Certificate */}
                                    <td style={{ textAlign: 'center' }}>
                                        {person.deathCertificateObtained ? <Tick /> : <Cross />}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <ApplyBtn onClick={() => setDeathModal(person)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const enhance = withObservables([], () => ({
    people: database.collections.get('people').query(),
    marriages: database.collections.get('marriages').query(),
}));

const EnhancedCertificatesTable = enhance(CertificatesTable);
export default EnhancedCertificatesTable;