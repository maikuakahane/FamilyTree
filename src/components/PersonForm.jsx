import { useState } from 'react';
import { useDatabase } from '@nozbe/watermelondb/react';
import { saveToFile } from '../database';

export default function PersonForm({ person, onSave, onCancel }) {
    const database = useDatabase();
    const isEditing = !!person;

    const [form, setForm] = useState({
        p_firstName: person?.firstNameP || '',
        p_lastName: person?.lastNameP || '',
        p_birthName: person?.birthNameP || '',
        p_gender: person?.genderP || 'unknown',
    });

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    const handleSubmit = async () => {
        if (!form.p_firstName || !form.p_lastName) {
            alert('First name and last name are required.');
            return;
        }

        const applyFields = (p) => {
            p.firstNameP = form.p_firstName;
            p.lastNameP = form.p_lastName;
            p.birthNameP = form.p_birthName;
            p.genderP = form.p_gender;
        };

        await database.write(async () => {
            if (isEditing) {
                await person.update(applyFields);
            } else {
                await database.collections.get('people').create(applyFields);
            }
        });

        await saveToFile();
        onSave();
    };

    return (
        <div className="form-container">
            <h2>{isEditing ? `Edit — ${person.firstNameP} ${person.lastNameP}` : 'Add Person'}</h2>

                <div className="form-tab-content">
                    <label>First Name *</label>
                    <input
                        name="p_firstName"
                        value={form.p_firstName}
                        onChange={handleChange}
                        placeholder="First name"
                    />
                    <label>Last Name *</label>
                    <input
                    name="p_lastName"
                    value={form.p_lastName}
                        onChange={handleChange}
                        placeholder="Last name"
                    />
                    <label>Birth Name</label>
                    <input
                    name="p_birthName"
                        value={form.p_birthName}
                        onChange={handleChange}
                        placeholder="Birth / maiden name"
                    />
                    <label>Gender</label>
                <select name="p_gender" value={form.p_gender} onChange={handleChange}>
                        <option value="unknown">Unknown</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>


            <div className="form-buttons">
                <button onClick={handleSubmit}>Save</button>
                <button onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}