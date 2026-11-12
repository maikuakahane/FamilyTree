import { useState } from 'react';
import { saveToFile } from '../database';
import { updateDeathRecord } from '../database/databaseFunctions';


export default function DeathEditModal({ deathRecord, onClose }) {
    const [activeTab, setActiveTab] = useState('death_per');

    const [form, setForm] = useState({
        // People table
        de_firstName: deathRecord?.firstName || '',
        de_lastName: deathRecord?.lastName || '',
        de_birthName: deathRecord?.birthName || '',
        de_birthDay: deathRecord?.birthDay || '',
        de_birthMonth: deathRecord?.birthMonth || '',
        de_birthYear: deathRecord?.birthYear || '',
        de_gender: deathRecord?.gender || 'unknown',
        de_birthTown: deathRecord?.birthTown || '',
        de_birthCounty: deathRecord?.birthCounty || '',
        de_birthCountry: deathRecord?.birthCountry || '',

        de_deathDay: deathRecord?.deathDay || '',
        de_deathMonth:  deathRecord?.deathMonth || '',
        de_deathYear: deathRecord?.deathYear || '',
        de_deathCounty: deathRecord?.deathCounty || '',
        de_deathCountry: deathRecord?.deathCountry || '',
        de_deathReason: deathRecord?.deathReason || '',

        // Address table
        de_addressStreet: deathRecord?.addressStreet || '',
        de_addressCounty: deathRecord?.addressCounty || '',
        de_addressCountry: deathRecord?.addressCountry || '',

        // Spouse's details
        de_spouseFirstName: deathRecord?.spouseFirstName || '',
        de_spouseLastName: deathRecord?.spouseLastName || '',
        de_spouseBirthName: deathRecord?.spouseBirthName || '',

        // Death records table
        de_deathRegistryOffice: deathRecord?.deathRegistryOffice || '',
        de_deathRegistryBook: deathRecord?.deathRegistryBook || '',
        de_deathRegistryVolume: deathRecord?.deathRegistryVolume || '',
        de_deathRegistryYear: deathRecord?.deathRegistryYear || '',
        de_deathRegistryPage: deathRecord?.deathRegistryPage || '',
        be_deathRegistryEntry: deathRecord?.deathRegistryEntry || '',
        // Religion
        de_deathReligion: deathRecord?.deathReligion || '',

    });


    const handleDatePick = (e) => {
        const [year, month, day] = e.target.value.split('-');
        setForm({ ...form, [e.target.name + 'Year']: year, [e.target.name + 'Month']: month, [e.target.name + 'Day']: day });

    };

    const ShowDatePick = (form, prefix) => {
        const year = form[prefix + 'Year']
        const month = form[prefix + 'Month']
        const day = form[prefix + 'Day']

        if (!year || !month || !day) return '';

        return year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');

    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    const handleSave = async () => {
        await updateDeathRecord({ deathRecord, form });
        await saveToFile();
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Edit Death — {deathRecord.firstName} {deathRecord.lastName}</h2>

                <div className="form-tabs">

                    <button
                        className={`form-tab ${activeTab === 'death_per' ? 'form-tab--active' : ''}`}
                        onClick={() => setActiveTab('death_per')}
                    >Death - Person</button>
                    <button
                        className={`form-tab ${activeTab === 'death_death' ? 'form-tab--active' : ''}`}
                        onClick={() => setActiveTab('death_death')}
                    >Death - Death</button>
                    <button
                        className={`form-tab ${activeTab === 'death_other' ? 'form-tab--active' : ''}`}
                        onClick={() => setActiveTab('death_other')}
                    >Death - Other</button>
                    <button
                        className={`form-tab ${activeTab === 'death_rec' ? 'form-tab--active' : ''}`}
                        onClick={() => setActiveTab('death_rec')}
                    >Death - Records</button>

                </div>

            
            {/* Birth - Person Tab */}
            {activeTab === 'death_per' && (
                <div className="form-tab-content">
                    <label>First Name *</label>
                    <input
                        name="de_firstName"
                        value={form.de_firstName}
                        onChange={handleChange}
                        placeholder="First name"
                        autoFocus
                    />
                    <label>Birth Name</label>
                    <input
                        name="de_birthName"
                        value={form.de_birthName}
                        onChange={handleChange}
                        placeholder="Birth name"
                    />
                    <label>Last Name</label>
                    <input
                        name="de_lastName"
                        value={form.de_lastName}
                        onChange={handleChange}
                        placeholder="Last name"
                    />
                    <label>Gender</label>
                    <select name="de_gender" value={form.de_gender} onChange={handleChange}>
                        <option value="unknown">Unknown</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                    <label>Date of Birth</label>
                    <input
                        name="de_death"
                        type="date"
                        value={ShowDatePick(form, 'de_death')}
                        onChange={handleDatePick}
                    />
                    <label>Town of Birth</label>
                    <input
                        name="de_birthTown"
                        value={form.de_birthTown}
                        onChange={handleChange}
                        placeholder="Town / City"
                    />
                    <label>County of Birth</label>
                    <input
                        name="de_birthCounty"
                        value={form.de_birthCounty}
                        onChange={handleChange}
                        placeholder="County"
                    />
                    <label>Country of Birth</label>
                    <input
                        name="de_birthCountry"
                        value={form.de_birthCountry}
                        onChange={handleChange}
                        placeholder="Country"
                    />
                </div>
            )}

            {/* Death - Death Tab */}
            {activeTab === 'death_death' && (
                <div className="form-tab-content">
                    <label>Date of Death</label>
                    <input
                        name="de_birth"
                        type="date"
                        value={ShowDatePick(form, 'de_birth')}
                        onChange={handleDatePick}
                    />
                    <label>Town of Death</label>
                    <input
                        name="de_deathCounty"
                        value={form.de_deathCounty}
                        onChange={handleChange}
                        placeholder="Town / City"
                    />
                    <label>County of Death</label>
                    <input
                        name="de_deathCountry"
                        value={form.de_deathCountry}
                        onChange={handleChange}
                        placeholder="County"
                    />
                    <label>Country of Death</label>
                    <input
                        name="de_deathCountry"
                        value={form.de_deathCountry}
                        onChange={handleChange}
                        placeholder="Country"
                    />
                    <label>Death Reason</label>
                    <input
                        name="de_deathReason"
                        value={form.de_deathReason}
                        onChange={handleChange}
                        placeholder="Death Reason"
                    />


                </div>
            )}

            {/* Death - Other Tab */}
            {activeTab === 'death_other' && (
                <div className="form-tab-content">
                    <label>Spouse's First Name</label>
                    <input
                        name="de_spouseFirstName"
                        value={form.de_spouseFirstName}
                        onChange={handleChange}
                        placeholder="First name"
                        autoFocus
                    />
                    <label>Spouse's Spouse Name</label>
                    <input
                        name="de_spouseLastName"
                        value={form.de_spouseLastName}
                        onChange={handleChange}
                        placeholder="Birth name"
                    />
                    <label>Spouse's Birth Name</label>
                    <input
                        name="de_spouseBirthName"
                        value={form.de_spouseBirthName}
                        onChange={handleChange}
                        placeholder="Last name"
                    />


                    <label>Last address</label>
                    <input
                        name="de_addressStreet"
                        value={form.de_addressStreet}
                        onChange={handleChange}
                        placeholder="Last address"
                    />
                    <label>County of Last address</label>
                    <input
                        name="de_addressCounty"
                        value={form.de_addressCounty}
                        onChange={handleChange}
                        placeholder="County"
                    />
                    <label>Country of Last address</label>
                    <input
                        name="de_addressCountry"
                        value={form.de_addressCountry}
                        onChange={handleChange}
                        placeholder="Country"
                    />
                   
                </div>
            )}

            {/* Death - Records Tab */}
            {activeTab === 'death_rec' && (
                <div className="form-tab-content">
                    <label>Registry Office</label>
                    <input
                        name="de_deathRegistryOffice"
                        value={form.de_deathRegistryOffice}
                        onChange={handleChange}
                        placeholder="Registry Office"

                    />
                    <label>Registry Book</label>
                    <input
                        name="de_deathRegistryBook"
                        value={form.de_deathRegistryBook}
                        onChange={handleChange}
                        placeholder="Registry Book"

                    />
                    <label>Registry Book Volume</label>
                    <input
                        name="de_deathRegistryVolume"
                        value={form.de_deathRegistryVolume}
                        onChange={handleChange}
                        placeholder="Registry Book Volume"

                    />
                    <label>Registry Book Year</label>
                    <input
                        name="de_deathRegistryYear"
                        value={form.de_deathRegistryYear}
                        onChange={handleChange}
                        placeholder="Registry Book Year"

                    />
                    <label>Registry Book Page</label>
                    <input
                        name="de_deathRegistryPage"
                        value={form.de_deathRegistryPage}
                        onChange={handleChange}
                        placeholder="Registry Book Page"

                    />
                    <label>Registry Book Entry</label>
                    <input
                        name="be_deathRegistryEntry"
                        value={form.be_deathRegistryEntry}
                        onChange={handleChange}
                        placeholder="Registry Book Entry"

                    />
                    <label>Religion</label>
                    <select name="de_deathReligion" value={form.de_deathReligion} onChange={handleChange}>
                        <option value="unknown">Unknown</option>
                        <option value="catholic">Catholic</option>
                        <option value="protestant">Protestant</option>
                        <option value="jewish">Jewish</option>
                        <option value="other">Other</option>
                        <option value="nota">Not Applicable</option>
                    </select>
                </div>
            )}

                <div className="form-buttons">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}