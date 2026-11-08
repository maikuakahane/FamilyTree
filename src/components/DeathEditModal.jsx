import { useState, useEffect } from 'react';
import { useDatabase } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import { saveToFile } from '../database';

export default function DeathEditModal({ person, onClose }) {
    const database = useDatabase();

    const [form, setForm] = useState({
        // People table
        deceased: person.deceased || false,
        diedAt: person.diedAt
            ? new Date(person.diedAt).toISOString().split('T')[0]
            : '',
        deathTown: person.deathTown || '',
        deathCountry: person.deathCountry || '',
        deathCertificateObtained: person.deathCertificateObtained || false,
        // Death records table
        deathReason: '',
        deathRegistryOffice: '',
        deathRegistryBook: '',
        deathReligion: '',
    });

    const [deathRecordId, setDeathRecordId] = useState(null);

    // Load existing death record if present
    useEffect(() => {
        database.collections.get('death_records')
            .query(Q.where('person_id', person.id))
            .fetch()
            .then(records => {
                if (records.length > 0) {
                    const r = records[0];
                    setDeathRecordId(r.id);
                    setForm(prev => ({
                        ...prev,
                        deathReason: r.deathReason || '',
                        deathRegistryOffice: r.deathRegistryOffice || '',
                        deathRegistryBook: r.deathRegistryBook || '',
                        deathReligion: r.deathReligion || '',
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
                p.deceased = form.deceased;
                p.diedAt = form.diedAt ? new Date(form.diedAt).getTime() : null;
                p.deathTown = form.deathTown;
                p.deathCountry = form.deathCountry;
                p.deathCertificateObtained = form.deathCertificateObtained;
            });

            // Update or create death_records
            if (deathRecordId) {
                const existing = await database.collections.get('death_records').find(deathRecordId);
                await existing.update(r => {
                    r.diedAt = form.diedAt ? new Date(form.diedAt).getTime() : null;
                    r.deathTown = form.deathTown;
                    r.deathCountry = form.deathCountry;
                    r.deathReason = form.deathReason;
                    r.deathRegistryOffice = form.deathRegistryOffice;
                    r.deathRegistryBook = form.deathRegistryBook;
                    r.deathReligion = form.deathReligion;
                });
            } else {
                await database.collections.get('death_records').create(r => {
                    r.personId = person.id;
                    r.diedAt = form.diedAt ? new Date(form.diedAt).getTime() : null;
                    r.deathTown = form.deathTown;
                    r.deathCountry = form.deathCountry;
                    r.deathReason = form.deathReason;
                    r.deathRegistryOffice = form.deathRegistryOffice;
                    r.deathRegistryBook = form.deathRegistryBook;
                    r.deathReligion = form.deathReligion;
                });
            }
        });

        await saveToFile();
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Edit Death — {person.firstName} {person.lastName}</h2>

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

                    <label>Cause of Death</label>
                    <input
                        name="deathReason"
                        value={form.deathReason}
                        onChange={handleChange}
                        placeholder="Cause of death"
                    />

                    <label>Registry Office</label>
                    <input
                        name="deathRegistryOffice"
                        value={form.deathRegistryOffice}
                        onChange={handleChange}
                        placeholder="Registry office name"
                    />

                    <label>Registry Book</label>
                    <input
                        name="deathRegistryBook"
                        value={form.deathRegistryBook}
                        onChange={handleChange}
                        placeholder="Book / reference number"
                    />

                    <label>Religion at Death</label>
                    <input
                        name="deathReligon"
                        value={form.deathReligion}
                        onChange={handleChange}
                        placeholder="Religion"
                    />

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            name="deathCertificateObtained"
                            type="checkbox"
                            checked={form.deathCertificateObtained}
                            onChange={handleChange}
                        />
                        Death Certificate Obtained
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