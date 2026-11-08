import { useState } from 'react';
import { withObservables } from '@nozbe/watermelondb/react';
import database from '../database';
import { saveToFile } from '../database';


function RelationshipModal({ person, relationships, allPeople, onClose }) {
    const [selectedPersonId, setSelectedPersonId] = useState('');
    const [relationshipType, setRelationshipType] = useState('parent');

    const handleAdd = async () => {
        if (!selectedPersonId) {
            alert('Please select a person.');
            return;
        }
        if (selectedPersonId === person.id) {
            alert('A person cannot have a relationship with themselves.');
            return;
        }
        const duplicate = relationships.find(
            (r) =>
                (r.person1Id === person.id && r.person2Id === selectedPersonId) ||
                (r.person1Id === selectedPersonId && r.person2Id === person.id)
        );
        if (duplicate) {
            alert('This relationship already exists.');
            return;
        }

        await database.write(async () => {
            await database.collections.get('relationships').create((r) => {
                r.person1Id = person.id;
                r.person2Id = selectedPersonId;
                r.relationshipType = relationshipType;
            });

            // Auto-create marriage record if spouse
            if (relationshipType === 'spouse') {
                await database.collections.get('marriages').create((m) => {
                    m.person1Id = person.id;
                    m.person2Id = selectedPersonId;
                    m.status = 'married';
                });
            }
        });

        await saveToFile();
        setSelectedPersonId('');
    };

    const handleDelete = async (relationship) => {
        if (window.confirm('Delete this relationship?')) {
            await database.write(async () => {
                await relationship.destroyPermanently();
            });
            await saveToFile();
        }
    };

    const getPersonName = (id) => {
        const found = allPeople.find((p) => p.id === id);
        return found ? `${found.firstName} ${found.lastName}` : 'Unknown';
    };

    // Filter out the current person from the dropdown
    const availablePeople = allPeople.filter((p) => p.id !== person.id);

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>Relationships — {person.firstName} {person.lastName}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                {/* Add Relationship */}
                <div className="modal-section">
                    <h3>Add Relationship</h3>
                    <div className="modal-form-row">
                        <select
                            value={relationshipType}
                            onChange={(e) => setRelationshipType(e.target.value)}
                        >
                            <option value="parent">Parent of</option>
                            <option value="child">Child of</option>
                            <option value="spouse">Spouse of</option>
                        </select>

                        <select
                            value={selectedPersonId}
                            onChange={(e) => setSelectedPersonId(e.target.value)}
                        >
                            <option value="">— Select person —</option>
                            {availablePeople.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.firstName} {p.lastName}
                                </option>
                            ))}
                        </select>

                        <button onClick={handleAdd}>Add</button>
                    </div>
                </div>

                {/* Existing Relationships */}
                <div className="modal-section">
                    <h3>Existing Relationships</h3>
                    {relationships.length === 0 ? (
                        <p className="empty-state">No relationships yet.</p>
                    ) : (
                        <table className="people-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Person</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {relationships.map((r) => {
                                    const otherId = r.person1Id === person.id ? r.person2Id : r.person1Id;
                                    return (
                                        <tr key={r.id}>
                                            <td>{r.relationshipType}</td>
                                            <td>{getPersonName(otherId)}</td>
                                            <td>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(r)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

const enhance = withObservables(['person'], ({ person }) => ({
    person,
    relationships: database.collections
        .get('relationships')
        .query(),
    allPeople: database.collections.get('people').query(),
}));

export default enhance(RelationshipModal);