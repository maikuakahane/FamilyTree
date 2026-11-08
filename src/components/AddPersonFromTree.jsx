import { useState } from 'react';
import { useDatabase } from '@nozbe/watermelondb/react';
import { saveToFile } from '../database';
import { Q } from '@nozbe/watermelondb';

export default function AddPersonFromTree({ relationshipType, relatedPersonId, gender, onSave, onCancel }) {
    const database = useDatabase();
    const [activeTab, setActiveTab] = useState('general');

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        birthName: '',
        gender: gender || 'unknown',
        email: '',
        // Birth
        bornAt: '',
        birthTown: '',
        birthCountry: '',
    });

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    const handleSubmit = async () => {
        if (!form.firstName || !form.lastName) {
            alert('First name and last name are required.');
            setActiveTab('general');
            return;
        }

        await database.write(async () => {
            const newPerson = await database.collections.get('people').create((p) => {
                p.firstName = form.firstName;
                p.lastName = form.lastName;
                p.birthName = form.birthName;
                p.gender = form.gender;
                p.email = form.email;
                p.bornAt = form.bornAt ? new Date(form.bornAt).getTime() : null;
                p.birthTown = form.birthTown;
                p.birthCountry = form.birthCountry;
            });

            if (relationshipType === 'parent') {
                await database.collections.get('relationships').create((r) => {
                    r.person1Id = newPerson.id;
                    r.person2Id = relatedPersonId;
                    r.relationshipType = 'parent';
                });

                // Check if child already has another parent
                const existingParentRels = await database.collections
                    .get('relationships')
                    .query(
                        Q.where('person2_id', relatedPersonId),
                        Q.where('relationship_type', 'parent')
                    ).fetch();

                const otherParentRel = existingParentRels.find(r => r.person1Id !== newPerson.id);

                if (otherParentRel) {
                    const otherParentId = otherParentRel.person1Id;

                    const existingSpouse = await database.collections
                        .get('relationships')
                        .query(
                            Q.or(
                                Q.and(Q.where('person1_id', newPerson.id), Q.where('person2_id', otherParentId)),
                                Q.and(Q.where('person1_id', otherParentId), Q.where('person2_id', newPerson.id))
                            ),
                            Q.where('relationship_type', 'spouse')
                        ).fetch();

                    if (existingSpouse.length === 0) {
                        await database.collections.get('relationships').create((r) => {
                            r.person1Id = otherParentId;
                            r.person2Id = newPerson.id;
                            r.relationshipType = 'spouse';
                        });
                        await database.collections.get('marriages').create((m) => {
                            m.person1Id = otherParentId;
                            m.person2Id = newPerson.id;
                            m.status = 'married';
                        });
                    }
                }

            } else if (relationshipType === 'child') {
                await database.collections.get('relationships').create((r) => {
                    r.person1Id = relatedPersonId;
                    r.person2Id = newPerson.id;
                    r.relationshipType = 'parent';
                });

                // Also link to spouse if one exists
                const spouseRelationships = await database.collections
                    .get('relationships')
                    .query(
                        Q.or(
                            Q.where('person1_id', relatedPersonId),
                            Q.where('person2_id', relatedPersonId)
                        )
                    ).fetch();

                const spouseRel = spouseRelationships.find(r => r.relationshipType === 'spouse');
                if (spouseRel) {
                    const spouseId = spouseRel.person1Id === relatedPersonId
                        ? spouseRel.person2Id
                        : spouseRel.person1Id;

                    await database.collections.get('relationships').create((r) => {
                        r.person1Id = spouseId;
                        r.person2Id = newPerson.id;
                        r.relationshipType = 'parent';
                    });
                }

            } else if (relationshipType === 'spouse') {
                await database.collections.get('relationships').create((r) => {
                    r.person1Id = relatedPersonId;
                    r.person2Id = newPerson.id;
                    r.relationshipType = 'spouse';
                });
                await database.collections.get('marriages').create((m) => {
                    m.person1Id = relatedPersonId;
                    m.person2Id = newPerson.id;
                    m.status = 'married';
                });
            }
        });

        await saveToFile();
        onSave();
    };

    const title = {
        parent: form.gender === 'female' ? 'Add Mother' : form.gender === 'male' ? 'Add Father' : 'Add Parent',
        child: form.gender === 'male' ? 'Add Son' : form.gender === 'female' ? 'Add Daughter' : 'Add Child',
        spouse: 'Add Spouse',
    }[relationshipType];

    return (
        <div className="form-container">
            <h2>{title}</h2>

            <div className="form-tabs">
                <button
                    className={`form-tab ${activeTab === 'general' ? 'form-tab--active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >General</button>
                <button
                    className={`form-tab ${activeTab === 'birth' ? 'form-tab--active' : ''}`}
                    onClick={() => setActiveTab('birth')}
                >Birth</button>
            </div>

            {activeTab === 'general' && (
                <div className="form-tab-content">
                    <label>First Name *</label>
                    <input
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="First name"
                    />
                    <label>Last Name *</label>
                    <input
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Last name"
                    />
                    <label>Birth Name</label>
                    <input
                        name="birthName"
                        value={form.birthName}
                        onChange={handleChange}
                        placeholder="Birth / maiden name"
                    />
                    <label>Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange}>
                        <option value="unknown">Unknown</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                    <label>Email</label>
                    <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email address"
                    />
                </div>
            )}

            {activeTab === 'birth' && (
                <div className="form-tab-content">
                    <label>Date of Birth</label>
                    <input
                        name="bornAt"
                        type="date"
                        value={form.bornAt}
                        onChange={handleChange}
                    />
                    <label>Town of Birth</label>
                    <input
                        name="birthTown"
                        value={form.birthTown}
                        onChange={handleChange}
                        placeholder="Town / City"
                    />
                    <label>Country of Birth</label>
                    <input
                        name="birthCountry"
                        value={form.birthCountry}
                        onChange={handleChange}
                        placeholder="Country"
                    />
                </div>
            )}

            <div className="form-buttons">
                <button onClick={handleSubmit}>Save</button>
                <button onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}