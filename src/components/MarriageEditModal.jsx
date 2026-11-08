import { useState, useEffect } from 'react';
import { useDatabase } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import { saveToFile } from '../database';
import database from '../database';

const STATUS_OPTIONS = ['engaged', 'cohabiting', 'married', 'divorced', 'widowed'];



export default function MarriageEditModal({ person, marriages, onClose }) {
    const db = useDatabase();
    const [activeTab, setActiveTab] = useState(0);
    const [spouseNames, setSpouseNames] = useState({});

    const [forms, setForms] = useState(
        marriages.map(m => ({
            marriageId: m.id,
            status: m.status || 'married',
            marriedAt: m.marriedAt
                ? new Date(m.marriedAt).toISOString().split('T')[0]
                : '',
            marriageTown: m.marriageTown || '',
            marriageCountry: m.marriageCountry || '',
            divorcedAt: m.divorcedAt
                ? new Date(m.divorcedAt).toISOString().split('T')[0]
                : '',
            marriageCertificateObtained: person.marriageCertificateObtained || false,
            marriageRegistryOffice: '',
            marriageRegistryBook: '',
            marriageRecordId: null,
            marriageReligion: '',
        }))
    );

    // Load spouse names
    useEffect(() => {
        const loadSpouseNames = async () => {
            const names = {};
            for (const m of marriages) {
                const spouseId = m.person1Id === person.id ? m.person2Id : m.person1Id;
                try {
                    const spouse = await database.collections.get('people').find(spouseId);
                    names[m.id] = `${spouse.firstName} ${spouse.lastName}`;
                } catch {
                    names[m.id] = 'Unknown';
                }
            }
            setSpouseNames(names);
        };
        loadSpouseNames();
    }, [marriages, person.id]);

    // Load marriage records
    useEffect(() => {
        marriages.forEach(async (m, i) => {
            const records = await db.collections.get('marriage_records')
                .query(Q.where('marriage_id', m.id))
                .fetch();

            if (records.length > 0) {
                const r = records[0];
                setForms(prev => prev.map((f, idx) => idx !== i ? f : {
                    ...f,
                    marriageRegistryOffice: r.marriageRegistryOffice || '',
                    marriageRegistryBook: r.marriageRegistryBook || '',
                    marriageReligion: r.marriageReligion || '',
                    marriageRecordId: r.id,
                }));
            }
        });
    }, []);

    const handleChange = (index, e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForms(prev => prev.map((f, i) =>
            i !== index ? f : { ...f, [e.target.name]: value }
        ));
    };

    const handleSave = async () => {
        await db.write(async () => {
            await person.update(p => {
                p.marriageCertificateObtained = forms.some(f => f.marriageCertificateObtained);
            });

            for (const form of forms) {
                const marriage = await db.collections.get('marriages').find(form.marriageId);
                await marriage.update(m => {
                    m.status = form.status;
                    m.marriedAt = form.marriedAt ? new Date(form.marriedAt).getTime() : null;
                    m.marriageTown = form.marriageTown;
                    m.marriageCountry = form.marriageCountry;
                    m.divorcedAt = form.divorcedAt ? new Date(form.divorcedAt).getTime() : null;
                });

                if (form.marriageRecordId) {
                    const existing = await db.collections.get('marriage_records').find(form.marriageRecordId);
                    await existing.update(r => {
                        r.marriageRegistryOffice = form.marriageRegistryOffice;
                        r.marriageRegistryBook = form.marriageRegistryBook;
                        r.marriageReligion = form.marriageReligion;
                    });
                } else {
                    await db.collections.get('marriage_records').create(r => {
                        r.person1Id = marriage.person1Id;
                        r.person2Id = marriage.person2Id;
                        r.marriageId = form.marriageId;
                        r.marriageRegistryOffice = form.marriageRegistryOffice;
                        r.marriageRegistryBook = form.marriageRegistryBook;
                        r.marriageReligion = form.marriageReligion;
                    });
                }
            }
        });

        await saveToFile();
        onClose();
    };

    const currentForm = forms[activeTab];

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Edit Marriage — {person.firstName} {person.lastName}</h2>

                {forms.length === 0 ? (
                    <p style={{ opacity: 0.6 }}>No marriage records found for this person.</p>
                ) : (
                    <>
                        {/* Spouse tabs */}
                        {forms.length > 1 && (
                            <div className="form-tabs">
                                {forms.map((form, i) => (
                                    <button
                                        key={form.marriageId}
                                        className={`form-tab ${activeTab === i ? 'form-tab--active' : ''}`}
                                        onClick={() => setActiveTab(i)}
                                    >
                                        {spouseNames[form.marriageId] || `Marriage ${i + 1}`}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Form for active marriage */}
                        {currentForm && (
                            <div className="form-tab-content">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={currentForm.status}
                                    onChange={(e) => handleChange(activeTab, e)}
                                >
                                    {STATUS_OPTIONS.map(s => (
                                        <option key={s} value={s}>
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </option>
                                    ))}
                                </select>

                                <label>Date of Marriage</label>
                                <input
                                    name="marriedAt"
                                    type="date"
                                    value={currentForm.marriedAt}
                                    onChange={(e) => handleChange(activeTab, e)}
                                />

                                <label>Town of Marriage</label>
                                <input
                                    name="marriageTown"
                                    value={currentForm.marriageTown}
                                    onChange={(e) => handleChange(activeTab, e)}
                                    placeholder="Town / City"
                                />

                                <label>Country of Marriage</label>
                                <input
                                    name="marriageCountry"
                                    value={currentForm.marriageCountry}
                                    onChange={(e) => handleChange(activeTab, e)}
                                    placeholder="Country"
                                />

                                <label>Date of Divorce</label>
                                <input
                                    name="divorcedAt"
                                    type="date"
                                    value={currentForm.divorcedAt}
                                    onChange={(e) => handleChange(activeTab, e)}
                                />

                                <label>Registry Office</label>
                                <input
                                    name="marriageRegistryOffice"
                                    value={currentForm.marriageRegistryOffice}
                                    onChange={(e) => handleChange(activeTab, e)}
                                    placeholder="Registry office name"
                                />

                                <label>Registry Book</label>
                                <input
                                    name="marriageRegistryBook"
                                    value={currentForm.marriageRegistryBook}
                                    onChange={(e) => handleChange(activeTab, e)}
                                    placeholder="Book / reference number"
                                    />

                                    <label>Religion at Marriage</label>
                                    <input
                                        name="marriageReligon"
                                        value={form.marriageReligion}
                                        onChange={handleChange}
                                        placeholder="Religion"
                                    />


                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        name="marriageCertificateObtained"
                                        type="checkbox"
                                        checked={currentForm.marriageCertificateObtained}
                                        onChange={(e) => handleChange(activeTab, e)}
                                    />
                                    Marriage Certificate Obtained
                                </label>
                            </div>
                        )}
                    </>
                )}

                <div className="form-buttons">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}