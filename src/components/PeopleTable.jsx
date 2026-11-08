import { useState } from 'react';
import { withObservables } from '@nozbe/watermelondb/react';
import database, { saveToFile } from '../database';
import { Q } from '@nozbe/watermelondb';
// import { calculateGenerationLabel } from '../utils/familyUtils';
import { displayDetails, formatDate, formatPlace } from '../utils/displayUtils';

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
import BirthRecord from '../database/models/birthRecord';

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

//const handleUploadDocument = async (person) => {
//    const { filePaths, canceled } = await window.electronDB.openFile();
//    if (canceled || !filePaths.length) return;

//    const sourcePath = filePaths[0];
//    const fileName = sourcePath.split('\\').pop().split('/').pop();

//    // Load owner
//    const ownerResults = await database.collections
//        .get('people')
//        .query(Q.where('is_owner', true))
//        .fetch();
//    const owner = ownerResults[0] || null;

//    // Calculate generation
//    const genLabel = owner
//        ? await calculateGenerationLabel(owner.id, person.id)
//        : 'Gen 0';

//    const folderPath = `${genLabel}/${person.firstName} ${person.lastName}`;

//    const result = await window.electronDB.copyDocument({
//        sourcePath,
//        folderPath,
//        fileName,
//    });

//    if (result.success) {
//        console.log('Document saved to', result.filePath);
//    }
//};

function PeopleTable({ people, birthRecords, relationshipRecords, deathRecords, citizenshipRecords, addresses }) {
    const [search, setSearch] = useState('');
    // Mutually exclusive group: 'general' | 'research' | 'certificates' | null

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

    const renderHeader = () => {
       
        return (
            <thead>
                <tr>
                    <th>First Name</th>
                    <th>Surname</th>
                    <th>Birth Surname</th>
                    <th>Date of Birth</th>
                    <th>Place of Birth</th>
                    <th>Relationship Status</th>
                    <th>Actions</th>
                     
                                  </tr>
            </thead>
        );
    };

    const renderRow = (person) => {
        const details = displayDetails(person, birthRecords, deathRecords);

        return (
            <tr key={person.id}>
                {/* Fixed columns */}
                <td>{details.firstName}{person.isOwner ? ' 👑' : ''}</td>
                <td>{details.lastName}</td>
                <td>{details.birthName || '—'}</td>
                <td>{formatDate(details.birthDay, details.birthMonth, details.birthYear)}</td>
                <td>{formatPlace(details.birthTown, details.birthCounty, details.birthCountry)}</td>
                <td>Not yet implemented</td>
                        <td>
                            <div className="action-buttons">
                                <button onClick={() => setViewingPerson(person)}>🔍</button>
                                <button onClick={() => setEditingPerson(person)}>✎</button>
                        <button onClick={() => setEditBirth(person)}>Birth Edit</button>
                        <button onClick={() => setEditMarriage(person)}>Marriage Edit</button>
                        <button onClick={() => setEditDeath(person)}>Death Edit</button>
                        <button onClick={() => setBirthModal(person)}>Birth Cert</button>
                        <button onClick={() => setMarriageModal(person)}>Marriage Cert</button>
                        <button onClick={() => setDeathModal(person)}>Death Cert</button>
                        <button className="delete-btn" onClick={() => handleDelete(person)}>🗑</button>

                            </div>
                        </td>
            </tr>
        );
    };

    return (
        <div className="people-list">

            {/* Research overlay modals */}
            {editBirth && (
                <BirthEditModal person={editBirth} onClose={() => setEditBirth(null)} />
            )}
{/*             {editMarriage && (
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
            )} */}

            {/* Certificate overlay modals */}
            {birthModal && (
                <BirthCertificateModal person={birthModal} onClose={() => setBirthModal(null)} />
            )}
            {/* {marriageModal && (
                <MarriageCertificateModal
                    person={marriageModal}
                    marriages={getMarriages(marriageModal.id)}
                    allPeople={people}
                    onClose={() => setMarriageModal(null)}
                />
            )} */}
            {deathModal && (
                <DeathCertificateModal person={deathModal} onClose={() => setDeathModal(null)} />
            )}

            <div className="people-list-header">
                <h2>Family Members</h2>
                <button onClick={() => setShowAdd(true)}>+ Add Person</button>
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
    birthRecords: database.collections.get('birth_records').query(),
    relationshipRecords: database.collections.get('relationship_records').query(),
    deathRecords: database.collections.get('death_records').query(),
    citizenshipRecords: database.collections.get('citizenship_records').query(),
    addresses: database.collections.get('addresses').query(),

}));

const EnhancedPeopleTable = enhance(PeopleTable);
export default EnhancedPeopleTable;
