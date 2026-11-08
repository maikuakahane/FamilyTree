import { useState } from 'react';
import { withObservables } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import database, { saveToFile } from '../database';

const STATUS_LABELS = {
    engaged: 'Engaged',
    cohabiting: 'Cohabiting',
    married: 'Married',
    divorced: 'Divorced',
    widowed: 'Widowed',
};

function MarriageModal({ person, marriages, allPeople, editingMarriage, onClose }) {
    const [selectedPersonId, setSelectedPersonId] = useState('');
    const [status, setStatus] = useState('married');
    const [marriedAt, setMarriedAt] = useState('');
    const [marriagePlace, setMarriagePlace] = useState('');
    const [divorcedAt, setDivorcedAt] = useState('');

    // Edit form state — pre-filled from editingMarriage
    const [editStatus, setEditStatus] = useState(editingMarriage?.status || 'married');
    const [editMarriedAt, setEditMarriedAt] = useState(
        editingMarriage?.marriedAt
            ? new Date(editingMarriage.marriedAt).toISOString().split('T')[0]
            : ''
    );
    const [editMarriagePlace, setEditMarriagePlace] = useState(editingMarriage?.marriagePlace || '');
    const [editDivorcedAt, setEditDivorcedAt] = useState(
        editingMarriage?.divorcedAt
            ? new Date(editingMarriage.divorcedAt).toISOString().split('T')[0]
            : ''
    );

    const handleAdd = async () => {
        if (!selectedPersonId) {
            alert('Please select a person.');
            return;
        }
        if (selectedPersonId === person.id) {
            alert('A person cannot marry themselves.');
            return;
        }

        await database.write(async () => {
            await database.collections.get('marriages').create((m) => {
                m.person1Id = person.id;
                m.person2Id = selectedPersonId;
                m.status = status;
                m.marriedAt = marriedAt ? new Date(marriedAt).getTime() : null;
                m.marriagePlace = marriagePlace;
                m.divorcedAt = divorcedAt ? new Date(divorcedAt).getTime() : null;
            });
        });

        await saveToFile();
        setSelectedPersonId('');
        setMarriedAt('');
        setMarriagePlace('');
        setDivorcedAt('');
    };

    const handleUpdate = async () => {
        await database.write(async () => {
            await editingMarriage.update((m) => {
                m.status = editStatus;
                m.marriedAt = editMarriedAt ? new Date(editMarriedAt).getTime() : null;
                m.marriagePlace = editMarriagePlace;
                m.divorcedAt = editDivorcedAt ? new Date(editDivorcedAt).getTime() : null;
            });
        });
        await saveToFile();
        onClose();
    };

    const handleDelete = async (marriage) => {
        if (window.confirm('Delete this marriage record?')) {
            await database.write(async () => {
                await marriage.destroyPermanently();
            });
            await saveToFile();
        }
    };

    const getPersonName = (id) => {
        const found = allPeople.find((p) => p.id === id);
        return found ? `${found.firstName} ${found.lastName}` : 'Unknown';
    };

    const availablePeople = allPeople.filter((p) => p.id !== person.id);
    const showDivorceDate = status === 'divorced' || status === 'widowed';
    const showEditDivorceDate = editStatus === 'divorced' || editStatus === 'widowed';

    // If opened from tree ✎ button, show edit form only
    if (editingMarriage) {
        const otherId = editingMarriage.person1Id === person.id
            ? editingMarriage.person2Id
            : editingMarriage.person1Id;

        return (
            <div className="modal-overlay">
                <div className="modal">
                    <div className="modal-header">
                        <h2>Edit Marriage — {person.firstName} {person.lastName} & {getPersonName(otherId)}</h2>
                        <button className="modal-close" onClick={onClose}>✕</button>
                    </div>

                    <div className="modal-section">
                        <div className="marriage-form">
                            <label>Status</label>
                            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>

                            <label>Date of Marriage</label>
                            <input
                                type="date"
                                value={editMarriedAt}
                                onChange={(e) => setEditMarriedAt(e.target.value)}
                            />

                            <label>Place of Marriage</label>
                            <input
                                type="text"
                                value={editMarriagePlace}
                                onChange={(e) => setEditMarriagePlace(e.target.value)}
                                placeholder="City, Country"
                            />

                            {showEditDivorceDate && (
                                <>
                                    <label>{editStatus === 'widowed' ? 'Date of Death of Spouse' : 'Date of Divorce'}</label>
                                    <input
                                        type="date"
                                        value={editDivorcedAt}
                                        onChange={(e) => setEditDivorcedAt(e.target.value)}
                                    />
                                </>
                            )}

                            <div className="form-buttons">
                                <button onClick={handleUpdate}>Save</button>
                                <button onClick={onClose}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Otherwise show full modal with add form and marriage history
    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>Marriages — {person.firstName} {person.lastName}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                {/* Add Marriage */}
                <div className="modal-section">
                    <h3>Add Marriage</h3>
                    <div className="marriage-form">
                        <label>Partner</label>
                        <select value={selectedPersonId} onChange={(e) => setSelectedPersonId(e.target.value)}>
                            <option value="">— Select person —</option>
                            {availablePeople.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.firstName} {p.lastName}
                                </option>
                            ))}
                        </select>

                        <label>Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>

                        <label>Date of Marriage</label>
                        <input
                            type="date"
                            value={marriedAt}
                            onChange={(e) => setMarriedAt(e.target.value)}
                        />

                        <label>Place of Marriage</label>
                        <input
                            type="text"
                            value={marriagePlace}
                            onChange={(e) => setMarriagePlace(e.target.value)}
                            placeholder="City, Country"
                        />

                        {showDivorceDate && (
                            <>
                                <label>{status === 'widowed' ? 'Date of Death of Spouse' : 'Date of Divorce'}</label>
                                <input
                                    type="date"
                                    value={divorcedAt}
                                    onChange={(e) => setDivorcedAt(e.target.value)}
                                />
                            </>
                        )}

                        <div className="form-buttons">
                            <button onClick={handleAdd}>Add</button>
                        </div>
                    </div>
                </div>

                {/* Marriage History */}
                <div className="modal-section">
                    <h3>Marriage History</h3>
                    {marriages.length === 0 ? (
                        <p className="empty-state">No marriage records yet.</p>
                    ) : (
                        <table className="people-table">
                            <thead>
                                <tr>
                                    <th>Partner</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Place</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {marriages.map((m) => {
                                    const otherId = m.person1Id === person.id ? m.person2Id : m.person1Id;
                                    return (
                                        <tr key={m.id}>
                                            <td>{getPersonName(otherId)}</td>
                                            <td>{STATUS_LABELS[m.status] || m.status}</td>
                                            <td>{m.marriedAt ? new Date(m.marriedAt).toLocaleDateString() : '—'}</td>
                                            <td>{m.marriagePlace || '—'}</td>
                                            <td>
                                                <button className="delete-btn" onClick={() => handleDelete(m)}>
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
    marriages: database.collections
        .get('marriages')
        .query(
            Q.or(
                Q.where('person1_id', person.id),
                Q.where('person2_id', person.id)
            )
        ),
    allPeople: database.collections.get('people').query(),
}));

export default enhance(MarriageModal);