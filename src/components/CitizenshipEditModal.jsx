import { useState } from 'react';
import { useDatabase } from '@nozbe/watermelondb/react';
import { saveToFile } from '../database';

export default function CitizenshipEditModal({ person, citizenship, onClose }) {
    const db = useDatabase();

    const [form, setForm] = useState({
        birthCitizenship: citizenship?.birthCitizenship || '',
        naturalisedCitizenship: citizenship?.naturalisedCitizenship || '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        await db.write(async () => {
            if (citizenship) {
                await citizenship.update(c => {
                    c.birthCitizenship = form.birthCitizenship;
                    c.naturalisedCitizenship = form.naturalisedCitizenship;
                });
            } else {
                await db.collections.get('citizenships').create(c => {
                    c.personId = person.id;
                    c.birthCitizenship = form.birthCitizenship;
                    c.naturalisedCitizenship = form.naturalisedCitizenship;
                });
            }
        });

        await saveToFile();
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Edit Citizenship — {person.firstName} {person.lastName}</h2>

                <div className="form-tab-content">
                    <label>Birth Citizenship</label>
                    <input
                        name="birthCitizenship"
                        value={form.birthCitizenship}
                        onChange={handleChange}
                        placeholder="e.g. British, French..."
                    />

                    <label>Naturalised Citizenship</label>
                    <input
                        name="naturalisedCitizenship"
                        value={form.naturalisedCitizenship}
                        onChange={handleChange}
                        placeholder="e.g. American, Australian..."
                    />
                </div>

                <div className="form-buttons">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}