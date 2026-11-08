import { useState, useEffect } from 'react';
import { useDatabase } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import { saveToFile } from '../database';

export default function BirthEditModal({ person, onClose }) {
    const database = useDatabase();

    const [form, setForm] = useState({
        // People table
        bornAt: person.bornAt
            ? new Date(person.bornAt).toISOString().split('T')[0]
            : '',
        birthTown: person.birthTown || '',
        birthCountry: person.birthCountry || '',
        birthCertificateObtained: person.birthCertificateObtained || false,
        // Birth records table
        baptisedAt: '',
        birthRegistryOffice: '',
        birthRegistryBook: '',
        birthReligion: '',
    });

    const [birthRecordId, setBirthRecordId] = useState(null);

    // Load existing birth record if present
    useEffect(() => {
        database.collections.get('birth_records')
            .query(Q.where('person_id', person.id))
            .fetch()
            .then(records => {
                if (records.length > 0) {
                    const r = records[0];
                    setBirthRecordId(r.id);
                    setForm(prev => ({
                        ...prev,
                        baptisedAt: r.baptisedAt
                            ? new Date(r.baptisedAt).toISOString().split('T')[0]
                            : '',
                        birthRegistryOffice: r.birthRegistryOffice || '',
                        birthRegistryBook: r.birthRegistryBook || '',
                        birthReligion: r.birthReligion || '',
                    }));
                }
            });
    }, [person.id]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    const handleSave = async () => {
        await database.write(async () => {
            // Update people table
            await person.update(p => {
                p.bornAt = form.bornAt ? new Date(form.bornAt).getTime() : null;
                p.birthTown = form.birthTown;
                p.birthCountry = form.birthCountry;
                p.birthCertificateObtained = form.birthCertificateObtained;
            });

            // Update or create birth_records
            if (birthRecordId) {
                const existing = await database.collections.get('birth_records').find(birthRecordId);
                await existing.update(r => {
                    r.bornAt = form.bornAt ? new Date(form.bornAt).getTime() : null;
                    r.birthTown = form.birthTown;
                    r.birthCountry = form.birthCountry;
                    r.baptisedAt = form.baptisedAt ? new Date(form.baptisedAt).getTime() : null;
                    r.birthRegistryOffice = form.birthRegistryOffice;
                    r.birthRegistryBook = form.birthRegistryBook;
                    r.birthReligion = form.birthReligion;
                });
            } else {
                await database.collections.get('birth_records').create(r => {
                    r.personId = person.id;
                    r.bornAt = form.bornAt ? new Date(form.bornAt).getTime() : null;
                    r.birthTown = form.birthTown;
                    r.birthCountry = form.birthCountry;
                    r.baptisedAt = form.baptisedAt ? new Date(form.baptisedAt).getTime() : null;
                    r.birthRegistryOffice = form.birthRegistryOffice;
                    r.birthRegistryBook = form.birthRegistryBook;
                    r.birthReligion = form.birthReligion;
                });
            }
        });

        await saveToFile();
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Edit Birth — {person.firstName} {person.lastName}</h2>

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

                    <label>Date of Baptism</label>
                    <input
                        name="baptisedAt"
                        type="date"
                        value={form.baptisedAt}
                        onChange={handleChange}
                    />

                    <label>Registry Office</label>
                    <input
                        name="birthRegistryOffice"
                        value={form.birthRegistryOffice}
                        onChange={handleChange}
                        placeholder="Registry office name"
                    />

                    <label>Registry Book</label>
                    <input
                        name="birthRegistryBook"
                        value={form.birthRegistryBook}
                        onChange={handleChange}
                        placeholder="Book / reference number"
                    />

                    <label>Religion at Birth</label>
                    <select name="birthReligion" value={form.birthReligion} onChange={handleChange}>
                        <option value="">— Select —</option>
                        <option value="Catholic">Catholic</option>
                        <option value="Protestant">Protestant</option>
                        <option value="Jewish">Jewish</option>
                        <option value="Orthodox">Orthodox</option>
                    </select>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            name="birthCertificateObtained"
                            type="checkbox"
                            checked={form.birthCertificateObtained}
                            onChange={handleChange}
                        />
                        Birth Certificate Obtained
                    </label>
                </div>

                <div className="form-buttons">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}