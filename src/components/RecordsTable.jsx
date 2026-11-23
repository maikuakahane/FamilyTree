import { useState } from 'react';
import { withObservables } from '@nozbe/watermelondb/react';
import database from '../database';
import { findRecord } from '../utils/displayUtils';
import { formatDate, formatPlace } from '../utils/displayUtils';
import BirthEditModal from './BirthEditModal';

const TABS = [
    { key: 'birth', label: 'Birth' },
    { key: 'death', label: 'Death' },
    { key: 'relationship', label: 'Relationship' },
    { key: 'citizenship', label: 'Citizenship' },
];


function RecordsTable({ birthRecords, people }) {
    const [activeTab, setActiveTab] = useState('birth');
    const [search, setSearch] = useState('');
    const [editingBirth, setEditingBirth] = useState(null);

    const renderBirthRow = (record) => {
        const person = findRecord(record.personIdR, people, 'personId');
        const mother = findRecord(record.motherIdR, people, 'personId');
        const father = findRecord(record.fatherIdR, people, 'personId');


        return (
            <tr key={record.id}>
                <td>{record.firstName} </td>
                <td>{record.lastName}</td>
                <td>{formatDate(record.birthDay, record.birthMonth, record.birthYear)}</td>
                <td>{formatPlace(record.birthTown, record.birthCounty, record.birthCountry)}</td>
                <td>{record.motherFirstName} {record.motherLastName}</td>
                <td>{record.fatherFirstName} {record.fatherLastName}</td>
                <td>{record.birthRegistryOffice}</td>
                <td>
                    {person
                        ? `${person.firstNameP} ${person.lastNameP}`
                        : record.personIdR
                            ? `${record.personIdR} (person missing)`
                            : 'Not linked'}
                </td>
                <td>
                    {mother
                        ? `${mother.firstNameP} ${mother.lastNameP}`
                        : record.motherIdR
                            ? `${record.motherIdR} (person missing)`
                            : 'Not linked'}
                </td>
                <td>
                    {father
                        ? `${father.firstNameP} ${father.lastNameP}`
                        : record.fatherIdR
                            ? `${record.fatherIdR} (person missing)`
                            : 'Not linked'}
                </td>
                <td>
                    <div className="action-buttons">
                        <button onClick={() => setEditingBirth(record)}>✎</button>
                        <button className="delete-btn">🗑</button>
                    </div>
                </td>

            </tr>
        );
    };


    return (
        <div className="people-list">
            {editingBirth && (
                <BirthEditModal birthRecord={editingBirth} onClose={() => setEditingBirth(null)} />
            )}
            <div className="people-list-header">
                <h2>Records</h2>
            </div>

            <div className="form-tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`form-tab ${activeTab === tab.key ? 'form-tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
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

            {/* Birth - Person Tab */}

            {activeTab === 'birth' && (

                <table className="people-table">
                    <tr>
                    <th>First Name</th>
                    <th>Surname</th>
                    <th>Date of Birth</th>
                    <th>Place of Birth</th>
                    <th>Mother's name</th>
                    <th>Father's name</th>
                    <th>Registry Book</th>
                    <th>Person Link</th>
                    <th>Mother Link</th>
                    <th>Father Link</th>
                    <th>Actions</th>
                    </tr>
                    <tbody>{birthRecords.map(renderBirthRow)}</tbody>

                    </table>
            )}
            

         </div>
    );
}

const enhance = withObservables([], () => ({
    birthRecords: database.collections.get('birth_records').query(),
    people: database.collections.get('people').query(),
}));

export default enhance(RecordsTable);