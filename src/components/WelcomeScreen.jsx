import { useState } from 'react';
import { useDatabase } from '@nozbe/watermelondb/react';
import { saveToFile } from '../database';

export default function WelcomeScreen({ onComplete }) {
    const database = useDatabase();
    const [activeTab, setActiveTab] = useState('general');

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        birthName: '',
        gender: 'unknown',
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

    const handleStart = async () => {
        if (!form.firstName || !form.lastName) {
            alert('First name and last name are required.');
            setActiveTab('general');
            return;
        }

        await database.write(async () => {
            await database.collections.get('people').create((p) => {
                p.firstName = form.firstName;
                p.lastName = form.lastName;
                p.birthName = form.birthName;
                p.gender = form.gender;
                p.email = form.email;
                p.bornAt = form.bornAt ? new Date(form.bornAt).getTime() : null;
                p.birthTown = form.birthTown;
                p.birthCountry = form.birthCountry;
                p.isOwner = true;
            });
        });

        await saveToFile();
        onComplete();
    };

    return (
        <div className="welcome-container">
            <div className="welcome-card">

                <div className="welcome-header">
                    <span className="welcome-icon">🌳</span>
                    <h1>Family Tree</h1>
                    <p>Start by adding yourself to begin building your family tree.</p>
                </div>

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
                </div>

                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="form-tab-content">
                        <label>First Name *</label>
                        <input
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            placeholder="Your first name"
                            autoFocus
                        />
                        <label>Last Name *</label>
                        <input
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            placeholder="Your last name"
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

                <div className="form-buttons">
                    <button onClick={handleStart}>Start Family Tree</button>
                </div>

            </div>
        </div>
    );
}