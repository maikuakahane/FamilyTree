import { useState } from 'react';
import { withObservables } from '@nozbe/watermelondb/react';
import database from '../database';
import { Q } from '@nozbe/watermelondb';
import BirthEditModal from './BirthEditModal';
import MarriageEditModal from './MarriageEditModal';
import DeathEditModal from './DeathEditModal';
import AddressEditModal from './AddressEditModal';
import CitizenshipEditModal from './CitizenshipEditModal';
import { calculateGenerationLabel } from '../utils/familyUtils';


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


function ResearchTable({ people, marriages, addresses, citizenships }) {
    const [search, setSearch] = useState('');
    const [editBirth, setEditBirth] = useState(null);
    const [editMarriage, setEditMarriage] = useState(null);
    const [editDeath, setEditDeath] = useState(null);
    const [editAddress, setEditAddress] = useState(null);
    const [editCitizenship, setEditCitizenship] = useState(null);

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

    const getMarriages = (personId) =>
        marriages.filter(m => m.person1Id === personId || m.person2Id === personId);

    const getCurrentAddress = (personId) =>
        addresses.find(a => a.personId === personId && !a.movedOutAt) || null;

    const getAddresses = (personId) =>
        addresses.filter(a => a.personId === personId);

    const getCitizenship = (personId) =>
        citizenships.find(c => c.personId === personId) || null;

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

    return (
        <div className="people-list">

            {/* Modals */}
            {editBirth && (
                <BirthEditModal
                    person={editBirth}
                    onClose={() => setEditBirth(null)}
                />
            )}
            {editMarriage && (
                <MarriageEditModal
                    person={editMarriage}
                    marriages={getMarriages(editMarriage.id)}
                    onClose={() => setEditMarriage(null)}
                />
            )}
            {editDeath && (
                <DeathEditModal
                    person={editDeath}
                    onClose={() => setEditDeath(null)}
                />
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

            <div className="people-list-header">
                <h2>Research</h2>
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
                <p className="empty-state">No family members yet.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table className="people-table">
                        <thead>
                            <tr>
                                <th rowSpan={2}>Full Name</th>
                                <th rowSpan={2}>Birth Surname</th>

                                <th colSpan={4} style={{ textAlign: 'center' }}>Birth</th>
                                <th colSpan={4} style={{ textAlign: 'center' }}>Marriage</th>
                                <th colSpan={4} style={{ textAlign: 'center' }}>Death</th>
                                <th colSpan={3} style={{ textAlign: 'center' }}>Current Address</th>
                                        <th colSpan={3} style={{ textAlign: 'center' }}>Citizenship</th>
                                        <th colSpan={1} style={{ textAlign: 'center' }}>Documents</th>

                            </tr>
                            <tr>
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
                                <th>Upload</th>

                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((person) => {
                                const personMarriages = getMarriages(person.id);
                                const currentAddress = getCurrentAddress(person.id);
                                const citizenship = getCitizenship(person.id);

                                return (
                                    <tr key={person.id}>
                                        {/* Name */}
                                        <td>
                                            {person.firstName} {person.lastName}
                                            {person.isOwner ? ' 👑' : ''}
                                        </td>
                                        <td>{person.birthName || '—'}</td>

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
                                                personMarriages.map(m =>
                                                    <div key={m.id}>{formatDate(m.marriedAt)}</div>
                                                )}
                                        </td>
                                        <td>
                                            {personMarriages.length === 0 ? '—' :
                                                personMarriages.map(m =>
                                                    <div key={m.id}>{formatPlace(m.marriageTown, m.marriageCountry)}</div>
                                                )}
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
                                    </tr>
                                );
                            })}
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

const EnhancedResearchTable = enhance(ResearchTable);
export default EnhancedResearchTable;