import { useState } from 'react';
import { withObservables } from '@nozbe/watermelondb/react';
import database, { saveToFile } from '../database';
import { Q } from '@nozbe/watermelondb';
import { calculateGenerationLabel } from '../utils/familyUtils';

// General (person management) modals/forms
import PersonForm from './PersonForm';
import RelationshipModal from './RelationshipModal';
import MarriageModal from './MarriageModal';
import PersonDetailModal from './PersonDetailModal';

// Research edit modals
import BirthEditModal from './BirthEditModal';
import MarriageEditModal from './MarriageEditModal';
import DeathEditModal from './DeathEditModal';
import AddressEditModal from './AddressEditModal';
import CitizenshipEditModal from './CitizenshipEditModal';

// Certificate application modals
import BirthCertificateModal from './BirthCertificateModal';
import MarriageCertificateModal from './MarriageCertificateModal';
import DeathCertificateModal from './DeathCertificateModal';

const Tick = () => <span style={{ color: '#6dbf67', fontSize: '16px' }}>✓</span>;
const Cross = () => <span style={{ color: '#e05555', fontSize: '16px' }}>✗</span>;

const EditBtn = ({ onClick }) => (
    <button
        onClick={onClick}
        style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            opacity: 0.7,
            padding: '2px 4px',
            color: 'var(--text-primary)',
        }}
        title="Edit"
    >✎</button>
);

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

// Switch in the group selector. Mutually exclusive: handler enforces single-active.
const GroupSwitch = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={active ? 'nav-active' : ''}
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '999px',
            border: '1px solid var(--border, #ccc)',
            background: active ? 'var(--accent)' : 'transparent',
            color: active ? 'white' : 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '13px',
        }}
        aria-pressed={active}
    >
        <span
            style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: active ? 'white' : 'var(--border, #bbb)',
            }}
        />
        {label}
    </button>
);

const STATUS_LABELS = {
    engaged: 'Engaged',
    cohabiting: 'Cohabiting',
    married: 'Married',
    divorced: 'Divorced',
    widowed: 'Widowed',
};

const handleUploadDocument = async (person) => {
    const { filePaths, canceled } = await window.electronDB.openFile();
    if (canceled || !filePaths.length) return;

    const sourcePath = filePaths[0];
    const fileName = sourcePath.split('\\').pop().split('/').pop();

    // Load owner
    const ownerResults = await database.collections
        .get('people')
        .query(Q.where('is_owner', true))
        .fetch();
    const owner = ownerResults[0] || null;

    // Calculate generation
    const genLabel = owner
        ? await calculateGenerationLabel(owner.id, person.id)
        : 'Gen 0';

    const folderPath = `${genLabel}/${person.firstName} ${person.lastName}`;

    const result = await window.electronDB.copyDocument({
        sourcePath,
        folderPath,
        fileName,
    });

    if (result.success) {
        console.log('Document saved to', result.filePath);
    }
};

function PeopleTable({ people, marriages, addresses, citizenships }) {
    const [search, setSearch] = useState('');
    // Mutually exclusive group: 'general' | 'research' | 'certificates' | null
    const [group, setGroup] = useState('general');

    // General — full-screen forms/modals
    const [showAdd, setShowAdd] = useState(false);
    const [editingPerson, setEditingPerson] = useState(null);
    const [relationshipPerson, setRelationshipPerson] = useState(null);
    const [marriagePerson, setMarriagePerson] = useState(null);
    const [viewingPerson, setViewingPerson] = useState(null);

    // Research — overlay modals
    const [editBirth, setEditBirth] = useState(null);
    const [editMarriage, setEditMarriage] = useState(null);
    const [editDeath, setEditDeath] = useState(null);
    const [editAddress, setEditAddress] = useState(null);
    const [editCitizenship, setEditCitizenship] = useState(null);

    // Certificates — overlay modals
    const [birthModal, setBirthModal] = useState(null);
    const [marriageModal, setMarriageModal] = useState(null);
    const [deathModal, setDeathModal] = useState(null);

    if (!people) return <div className="people-list"><p>Loading...</p></div>;

    const toggleGroup = (g) => setGroup((prev) => (prev === g ? null : g));

    const filtered = people.filter((p) => {
        const term = search.toLowerCase();
        return (
            (p.firstName || '').toLowerCase().includes(term) ||
            (p.lastName || '').toLowerCase().includes(term) ||
            (p.birthName || '').toLowerCase().includes(term) ||
            (p.birthTown || '').toLowerCase().includes(term) ||
            (p.birthCountry || '').toLowerCase().includes(term)
        );
    });

    const getMarriages = (personId) =>
        marriages.filter(m => m.person1Id === personId || m.person2Id === personId);

    const getCurrentAddress = (personId) =>
        addresses.find(a => a.personId === personId && !a.movedOutAt) || null;

    const getAddresses = (personId) =>
        addresses.filter(a => a.personId === personId);

    const getCitizenship = (personId) =>
        citizenships.find(c => c.personId === personId) || null;

    const getRelationshipStatus = (personId) => {
        const m = getMarriages(personId)[0];
        if (!m) return '—';
        return STATUS_LABELS[m.status] || m.status || '—';
    };

    const formatDate = (timestamp) =>
        timestamp ? new Date(timestamp).toLocaleDateString('en-GB') : '—';

    const formatPlace = (town, country) => {
        const parts = [town, country].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : '—';
    };

    const formatAddress = (address) => {
        if (!address) return '—';
        const parts = [
            address.addressStreet,
            address.addressTown,
            address.addressCountry,
            address.addressCode,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : '—';
    };

    const handleDelete = async (person) => {
        if (window.confirm(`Delete ${person.firstName} ${person.lastName}?`)) {
            await database.write(async () => {
                await person.destroyPermanently();
            });
            await saveToFile();
        }
    };

    // --- Full-screen General forms/modals (replace the table, matching old PeopleList) ---
    if (showAdd) {
        return <PersonForm onSave={() => setShowAdd(false)} onCancel={() => setShowAdd(false)} />;
    }
    if (editingPerson) {
        return (
            <PersonForm
                person={editingPerson}
                onSave={() => setEditingPerson(null)}
                onCancel={() => setEditingPerson(null)}
            />
        );
    }
    if (relationshipPerson) {
        return <RelationshipModal person={relationshipPerson} onClose={() => setRelationshipPerson(null)} />;
    }
    if (marriagePerson) {
        return <MarriageModal person={marriagePerson} onClose={() => setMarriagePerson(null)} />;
    }
    if (viewingPerson) {
        return <PersonDetailModal person={viewingPerson} onClose={() => setViewingPerson(null)} />;
    }

    // Number of body columns for each group (used for header colSpans where needed).
    const showResearch = group === 'research';
    const showCertificates = group === 'certificates';
    const showGeneral = group === 'general';
    const grouped = showResearch || showCertificates; // uses a two-row header

    const renderHeader = () => {
        if (grouped) {
            return (
                <thead>
                    <tr>
                        <th rowSpan={2}>First Name</th>
                        <th rowSpan={2}>Surname</th>
                        <th rowSpan={2}>Birth Surname</th>
                        <th rowSpan={2}>Date of Birth</th>

                        {showResearch && (
                            <>
                                <th colSpan={4} style={{ textAlign: 'center' }}>Birth</th>
                                <th colSpan={4} style={{ textAlign: 'center' }}>Marriage</th>
                                <th colSpan={4} style={{ textAlign: 'center' }}>Death</th>
                                <th colSpan={3} style={{ textAlign: 'center' }}>Current Address</th>
                                <th colSpan={3} style={{ textAlign: 'center' }}>Citizenship</th>
                                <th colSpan={1} style={{ textAlign: 'center' }}>Documents</th>
                            </>
                        )}
                        {showCertificates && (
                            <>
                                <th colSpan={2} style={{ textAlign: 'center' }}>🏛 Birth Certificate</th>
                                <th colSpan={2} style={{ textAlign: 'center' }}>💍 Marriage Certificate</th>
                                <th colSpan={2} style={{ textAlign: 'center' }}>✝ Death Certificate</th>
                            </>
                        )}
                    </tr>
                    <tr>
                        {showResearch && (
                            <>
                                {/* Birth */}
                                <th>Date</th>
                                <th>Place</th>
                                <th title="Birth Certificate">🏛 Cert</th>
                                <th>Edit</th>
                                {/* Marriage */}
                                <th>Date</th>
                                <th>Place</th>
                                <th title="Marriage Certificate">💍 Cert</th>
                                <th>Edit</th>
                                {/* Death */}
                                <th>Date</th>
                                <th>Place</th>
                                <th title="Death Certificate">✝ Cert</th>
                                <th>Edit</th>
                                {/* Address */}
                                <th>Address</th>
                                <th>Since</th>
                                <th>Edit</th>
                                {/* Citizenship */}
                                <th>Birth</th>
                                <th>Naturalised</th>
                                <th>Edit</th>
                                {/* Documents */}
                                <th>Upload</th>
                            </>
                        )}
                        {showCertificates && (
                            <>
                                <th style={{ textAlign: 'center' }}>Obtained</th>
                                <th style={{ textAlign: 'center' }}>Apply</th>
                                <th style={{ textAlign: 'center' }}>Obtained</th>
                                <th style={{ textAlign: 'center' }}>Apply</th>
                                <th style={{ textAlign: 'center' }}>Obtained</th>
                                <th style={{ textAlign: 'center' }}>Apply</th>
                            </>
                        )}
                    </tr>
                </thead>
            );
        }

        // General or no group — single header row
        return (
            <thead>
                <tr>
                    <th>First Name</th>
                    <th>Surname</th>
                    <th>Birth Surname</th>
                    <th>Date of Birth</th>
                    {showGeneral && (
                        <>
                            <th>Relationship Status</th>
                            <th>Actions</th>
                        </>
                    )}
                </tr>
            </thead>
        );
    };

    const renderRow = (person) => {
        const personMarriages = getMarriages(person.id);
        const currentAddress = getCurrentAddress(person.id);
        const citizenship = getCitizenship(person.id);

        return (
            <tr key={person.id}>
                {/* Fixed columns */}
                <td>{person.firstName}{person.isOwner ? ' 👑' : ''}</td>
                <td>{person.lastName}</td>
                <td>{person.birthName || '—'}</td>
                <td>{formatDate(person.bornAt)}</td>

                {/* General */}
                {showGeneral && (
                    <>
                        <td>{getRelationshipStatus(person.id)}</td>
                        <td>
                            <div className="action-buttons">
                                <button onClick={() => setViewingPerson(person)}>🔍</button>
                                <button onClick={() => setEditingPerson(person)}>✎</button>
                                <button className="delete-btn" onClick={() => handleDelete(person)}>🗑</button>
                            </div>
                        </td>
                    </>
                )}

                {/* Research */}
                {showResearch && (
                    <>
                        {/* Birth */}
                        <td>{formatDate(person.bornAt)}</td>
                        <td>{formatPlace(person.birthTown, person.birthCountry)}</td>
                        <td style={{ textAlign: 'center' }}>
                            {person.birthCertificateObtained ? <Tick /> : <Cross />}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                            <EditBtn onClick={() => setEditBirth(person)} />
                        </td>

                        {/* Marriage */}
                        <td>
                            {personMarriages.length === 0 ? '—' :
                                personMarriages.map(m => <div key={m.id}>{formatDate(m.marriedAt)}</div>)}
                        </td>
                        <td>
                            {personMarriages.length === 0 ? '—' :
                                personMarriages.map(m => <div key={m.id}>{formatPlace(m.marriageTown, m.marriageCountry)}</div>)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                            {person.marriageCertificateObtained ? <Tick /> : <Cross />}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                            <EditBtn onClick={() => setEditMarriage(person)} />
                        </td>

                        {/* Death */}
                        <td>{person.deceased ? formatDate(person.diedAt) : '—'}</td>
                        <td>{person.deceased ? formatPlace(person.deathTown, person.deathCountry) : '—'}</td>
                        <td style={{ textAlign: 'center' }}>
                            {person.deathCertificateObtained ? <Tick /> : <Cross />}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                            <EditBtn onClick={() => setEditDeath(person)} />
                        </td>

                        {/* Address */}
                        <td>{formatAddress(currentAddress)}</td>
                        <td>{currentAddress ? formatDate(currentAddress.movedInAt) : '—'}</td>
                        <td style={{ textAlign: 'center' }}>
                            <EditBtn onClick={() => setEditAddress(person)} />
                        </td>

                        {/* Citizenship */}
                        <td>{citizenship?.birthCitizenship || '—'}</td>
                        <td>{citizenship?.naturalisedCitizenship || '—'}</td>
                        <td style={{ textAlign: 'center' }}>
                            <EditBtn onClick={() => setEditCitizenship(person)} />
                        </td>

                        {/* Documents */}
                        <td style={{ textAlign: 'center' }}>
                            <button
                                onClick={() => handleUploadDocument(person)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    opacity: 0.7,
                                    padding: '2px 4px',
                                    color: 'var(--text-primary)',
                                }}
                                title="Upload Document"
                            >📎</button>
                        </td>
                    </>
                )}

                {/* Certificates */}
                {showCertificates && (
                    <>
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
                    </>
                )}
            </tr>
        );
    };

    return (
        <div className="people-list">

            {/* Research overlay modals */}
            {editBirth && (
                <BirthEditModal person={editBirth} onClose={() => setEditBirth(null)} />
            )}
            {editMarriage && (
                <MarriageEditModal
                    person={editMarriage}
                    marriages={getMarriages(editMarriage.id)}
                    onClose={() => setEditMarriage(null)}
                />
            )}
            {editDeath && (
                <DeathEditModal person={editDeath} onClose={() => setEditDeath(null)} />
            )}
            {editAddress && (
                <AddressEditModal
                    person={editAddress}
                    addresses={getAddresses(editAddress.id)}
                    onClose={() => setEditAddress(null)}
                />
            )}
            {editCitizenship && (
                <CitizenshipEditModal
                    person={editCitizenship}
                    citizenship={getCitizenship(editCitizenship.id)}
                    onClose={() => setEditCitizenship(null)}
                />
            )}

            {/* Certificate overlay modals */}
            {birthModal && (
                <BirthCertificateModal person={birthModal} onClose={() => setBirthModal(null)} />
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
                <DeathCertificateModal person={deathModal} onClose={() => setDeathModal(null)} />
            )}

            <div className="people-list-header">
                <h2>Family Members</h2>
                <button onClick={() => setShowAdd(true)}>+ Add Person</button>
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: '8px',
                    margin: '8px 0',
                    flexWrap: 'wrap',
                }}
            >
                <GroupSwitch label="General" active={showGeneral} onClick={() => toggleGroup('general')} />
                <GroupSwitch label="Research" active={showResearch} onClick={() => toggleGroup('research')} />
                <GroupSwitch label="Certificates" active={showCertificates} onClick={() => toggleGroup('certificates')} />
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by name, town or country..."
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
                <p className="empty-state">No family members yet. Add one to get started!</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="people-table">
                        {renderHeader()}
                        <tbody>
                            {filtered.map(renderRow)}
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
    addresses: database.collections.get('addresses').query(),
    citizenships: database.collections.get('citizenships').query(),
}));

const EnhancedPeopleTable = enhance(PeopleTable);
export default EnhancedPeopleTable;
