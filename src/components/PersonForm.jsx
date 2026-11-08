import { useState } from 'react';
import { useDatabase } from '@nozbe/watermelondb/react';
import { saveToFile } from '../database';

export default function PersonForm({ person, onSave, onCancel }) {
    const database = useDatabase();
    const isEditing = !!person;
    const [activeTab, setActiveTab] = useState('general');

    const [form, setForm] = useState({
        firstName: person?.firstName || '',
        lastName: person?.lastName || '',
        birthName: person?.birthName || '',
        gender: person?.gender || 'unknown',
        email: person?.email || '',
        // Birth
        bornAt: person?.bornAt
            ? new Date(person.bornAt).toISOString().split('T')[0]
            : '',
        birthTown: person?.birthTown || '',
        birthCountry: person?.birthCountry || '',
        // Death
        deceased: person?.deceased || false,
        diedAt: person?.diedAt
            ? new Date(person.diedAt).toISOString().split('T')[0]
            : '',
        deathTown: person?.deathTown || '',
        deathCountry: person?.deathCountry || '',
        // Research
        birthCertificateObtained: person?.birthCertificateObtained || false,
        marriageCertificateObtained: person?.marriageCertificateObtained || false,
        deathCertificateObtained: person?.deathCertificateObtained || false,
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

        const applyFields = (p) => {
            p.firstName = form.firstName;
            p.lastName = form.lastName;
            p.birthName = form.birthName;
            p.gender = form.gender;
            p.email = form.email;
            p.bornAt = form.bornAt ? new Date(form.bornAt).getTime() : null;
            p.birthTown = form.birthTown;
            p.birthCountry = form.birthCountry;
            p.deceased = form.deceased;
            p.diedAt = form.diedAt ? new Date(form.diedAt).getTime() : null;
            p.deathTown = form.deathTown;
            p.deathCountry = form.deathCountry;
            p.birthCertificateObtained = form.birthCertificateObtained;
            p.marriageCertificateObtained = form.marriageCertificateObtained;
            p.deathCertificateObtained = form.deathCertificateObtained;
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
            <h2>{isEditing ? `Edit — ${person.firstName} ${person.lastName}` : 'Add Person'}</h2>

            {/* Tabs */}
            <div className="form-tabs">
                <button
                    className={`form-tab ${activeTab === 'general' ? 'form-tab--active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >General</button>
                <button
                    className={`form-tab ${activeTab === 'birth' ? 'form-tab--active' : ''}`}
                    onClick={() => setActiveTab('birth')}
                >Birth</button>
                <button
                    className={`form-tab ${activeTab === 'death' ? 'form-tab--active' : ''}`}
                    onClick={() => setActiveTab('death')}
                >Death</button>
                <button
                    className={`form-tab ${activeTab === 'contact' ? 'form-tab--active' : ''}`}
                    onClick={() => setActiveTab('contact')}
                >Contact</button>
                <button
                    className={`form-tab ${activeTab === 'research' ? 'form-tab--active' : ''}`}
                    onClick={() => setActiveTab('research')}
                >Research</button>
            </div>

            {/* General Tab */}
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
                </div>
            )}

            {/* Birth Tab */}
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

            {/* Death Tab */}
            {activeTab === 'death' && (
                <div className="form-tab-content">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            name="deceased"
                            type="checkbox"
                            checked={form.deceased}
                            onChange={handleChange}
                        />
                        Deceased
                    </label>
                    <label>Date of Death</label>
                    <input
                        name="diedAt"
                        type="date"
                        value={form.diedAt}
                        onChange={handleChange}
                    />
                    <label>Town of Death</label>
                    <input
                        name="deathTown"
                        value={form.deathTown}
                        onChange={handleChange}
                        placeholder="Town / City"
                    />
                    <label>Country of Death</label>
                    <input
                        name="deathCountry"
                        value={form.deathCountry}
                        onChange={handleChange}
                        placeholder="Country"
                    />
                </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
                <div className="form-tab-content">
                    <label>Email</label>
                    <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email address"
                    />
                </div>
            )}

            {/* Research Tab */}
            {activeTab === 'research' && (
                <div className="form-tab-content">
                    <label>Documents Obtained</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            name="birthCertificateObtained"
                            type="checkbox"
                            checked={form.birthCertificateObtained}
                            onChange={handleChange}
                        />
                        Birth Certificate
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            name="marriageCertificateObtained"
                            type="checkbox"
                            checked={form.marriageCertificateObtained}
                            onChange={handleChange}
                        />
                        Marriage Certificate
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            name="deathCertificateObtained"
                            type="checkbox"
                            checked={form.deathCertificateObtained}
                            onChange={handleChange}
                        />
                        Death Certificate
                    </label>
                </div>
            )}

            <div className="form-buttons">
                <button onClick={handleSubmit}>Save</button>
                <button onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}