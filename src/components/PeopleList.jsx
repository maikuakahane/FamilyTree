import { useState } from 'react';
import { withObservables } from '@nozbe/watermelondb/react';
import database, { saveToFile } from '../database';
import PersonForm from './PersonForm';
import RelationshipModal from './RelationshipModal';
import MarriageModal from './MarriageModal';
import PersonDetailModal from './PersonDetailModal';

function PeopleList({ people }) {
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editingPerson, setEditingPerson] = useState(null);
    const [relationshipPerson, setRelationshipPerson] = useState(null);
    const [marriagePerson, setMarriagePerson] = useState(null);
    const [viewingPerson, setViewingPerson] = useState(null);

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

    const Tick = () => <span style={{ color: '#6dbf67', fontSize: '16px' }}>✓</span>;
    const Cross = () => <span style={{ color: '#e05555', fontSize: '16px' }}>✗</span>;

    if (showAdd) {
        return (
            <PersonForm
                onSave={() => setShowAdd(false)}
                onCancel={() => setShowAdd(false)}
            />
        );
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
        return (
            <RelationshipModal
                person={relationshipPerson}
                onClose={() => setRelationshipPerson(null)}
            />
        );
    }

    if (marriagePerson) {
        return (
            <MarriageModal
                person={marriagePerson}
                onClose={() => setMarriagePerson(null)}
            />
        );
    }

    if (viewingPerson) {
        return (
            <PersonDetailModal
                person={viewingPerson}
                onClose={() => setViewingPerson(null)}
            />
        );
    }

    return (
        <div className="people-list">
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
                        <thead>
                            <tr>
                                {/* Person details */}
                                <th>First Name</th>
                                <th>Surname</th>
                                <th>Birth Surname</th>
                                <th>Date of Birth</th>
                                <th>Relationship Status</th>
                                {/* Certificates */}
                                <th title="Birth Certificate">🏛 Birth</th>
                                <th title="Marriage Certificate">💍 Marriage</th>
                                <th title="Death Certificate">✝ Death</th>
                                {/* Actions */}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((person) => (
                                <tr key={person.id}>
                                    <td>{person.firstName}</td>
                                    <td>{person.lastName}</td>
                                    <td>{person.birthName || '—'}</td>
                                    <td>
                                        {person.bornAt
                                            ? new Date(person.bornAt).toLocaleDateString('en-GB')
                                            : '—'}
                                    </td>
                                    <td>
                                        <RelationshipStatus personId={person.id} />
                                    </td>
                                    {/* Certificates */}
                                    <td style={{ textAlign: 'center' }}>
                                        {person.birthCertificateObtained ? <Tick /> : <Cross />}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {person.marriageCertificateObtained ? <Tick /> : <Cross />}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {person.deathCertificateObtained ? <Tick /> : <Cross />}
                                    </td>
                                    {/* Actions */}
                                    <td>
                                        <div className="action-buttons">
                                            <button onClick={() => setViewingPerson(person)}>
                                                🔍
                                            </button>
                                            <button onClick={() => setEditingPerson(person)}>
                                                ✎
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDelete(person)}
                                            >
                                                🗑
                                            </button>
                                        </div>
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

// Small sub-component to show marriage status
function RelationshipStatus({ personId }) {
    const [status, setStatus] = useState('—');

    useState(() => {
        database.collections.get('marriages')
            .query()
            .fetch()
            .then(marriages => {
                const match = marriages.find(m =>
                    m.person1Id === personId || m.person2Id === personId
                );
                if (match) {
                    const label = {
                        engaged: 'Engaged',
                        cohabiting: 'Cohabiting',
                        married: 'Married',
                        divorced: 'Divorced',
                        widowed: 'Widowed',
                    }[match.status] || match.status;
                    setStatus(label);
                }
            });
    }, [personId]);

    return <span>{status}</span>;
}

const enhance = withObservables([], () => ({
    people: database.collections.get('people').query(),
}));

const EnhancedPeopleList = enhance(PeopleList);
export default EnhancedPeopleList;