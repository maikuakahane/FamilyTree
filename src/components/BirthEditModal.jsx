import { useState } from 'react';
import { saveToFile } from '../database';
import { updateBirthRecord} from '../database/databaseFunctions';


export default function BirthEditModal({ birthRecord, onClose }) {
    const [activeTab, setActiveTab] = useState('birth_per');


    const [form, setForm] = useState({
        // Person's details
        be_firstName: birthRecord?.firstName || '',
        be_lastName: birthRecord?.lastName || '',
        be_gender: birthRecord?.gender || 'unknown',
        be_birthDay: birthRecord?.birthDay || '',
        be_birthMonth: birthRecord?.birthMonth || '',
        be_birthYear: birthRecord?.birthYear || '',
        be_birthTown: birthRecord?.birthTown || '',
        be_birthCounty: birthRecord?.birthCounty || '',
        be_birthCountry: birthRecord?.birthCountry || '',
        // Mother's details
        be_motherFirstName: birthRecord?.motherFirstName || '',
        be_motherLastName: birthRecord?.motherLastName || '',
        be_motherBirthName: birthRecord?.motherBirthName || '',
        be_motherBirthDay: birthRecord?.motherBirthDay || '',
        be_motherBirthMonth: birthRecord?.motherBirthMonth || '',
        be_motherBirthYear: birthRecord?.motherBirthYear || '',
        be_motherBirthTown: birthRecord?.motherBirthTown || '',
        be_motherBirthCounty: birthRecord?.motherBirthCounty || '',
        be_motherBirthCountry: birthRecord?.motherBirthCountry || '',
        // Father's details
        be_fatherFirstName: birthRecord?.fatherFirstName || '',
        be_fatherLastName: birthRecord?.fatherLastName || '',
        be_fatherBirthName: birthRecord?.fatherBirthName || '',
        be_fatherBirthDay: birthRecord?.fatherBirthDay || '',
        be_fatherBirthMonth: birthRecord?.fatherBirthMonth || '',
        be_fatherBirthYear: birthRecord?.fatherBirthYear || '',
        be_fatherBirthTown: birthRecord?.fatherBirthTown || '',
        be_fatherBirthCounty: birthRecord?.fatherBirthCounty || '',
        be_fatherBirthCountry: birthRecord?.fatherBirthCountry || '',
        // Birth and baptism details
        be_baptismDay: birthRecord?.baptismDay || '',
        be_baptismMonth: birthRecord?.baptismMonth || '',
        be_baptismYear: birthRecord?.baptismYear || '',
        // Birth registration details
        be_birthRegistryOffice: birthRecord?.birthRegistryOffice || '',
        be_birthRegistryBook: birthRecord?.birthRegistryBook || '',
        be_birthRegistryVolume: birthRecord?.birthRegistryVolume || '',
        be_birthRegistryYear: birthRecord?.birthRegistryYear || '',
        be_birthRegistryPage: birthRecord?.birthRegistryPage || '',
        be_birthRegistryEntry: birthRecord?.birthRegistryEntry || '',
        // Religion
        be_birthReligion: birthRecord?.birthReligion || 'unknown',

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
        await updateBirthRecord({ birthRecord, form });
        await saveToFile();
        onClose();
    };

    return (
        <div className="modal-overlay">
            
            <div className="modal">
                <h2>Edit Birth — {birthRecord.firstName} {birthRecord.lastName}</h2>
                <div className="form-tabs">

                    <button
                        className={`form-tab ${activeTab === 'birth_per' ? 'form-tab--active' : ''}`}
                        onClick={() => setActiveTab('birth_per')}
                    >Birth - Person</button>
                    <button
                        className={`form-tab ${activeTab === 'birth_mum' ? 'form-tab--active' : ''}`}
                        onClick={() => setActiveTab('birth_mum')}
                    >Birth - Mother</button>
                    <button
                        className={`form-tab ${activeTab === 'birth_dad' ? 'form-tab--active' : ''}`}
                        onClick={() => setActiveTab('birth_dad')}
                    >Birth - Father</button>
                    <button
                        className={`form-tab ${activeTab === 'birth_rec' ? 'form-tab--active' : ''}`}
                        onClick={() => setActiveTab('birth_rec')}
                    >Birth - Records</button>

                </div>
                {/* Birth - Person Tab */}
                {activeTab === 'birth_per' && (
                    <div className="form-tab-content">
                        <label>First Name *</label>
                        <input
                            name="be_firstName"
                            value={form.be_firstName}
                            onChange={handleChange}
                            placeholder="First name"
                            autoFocus
                        />
                        <label>Last Name</label>
                        <input
                            name="be_lastName"
                            value={form.be_lastName}
                            onChange={handleChange}
                            placeholder="Last name"
                        />
                        <label>Gender</label>
                        <select name="be_gender" value={form.be_gender} onChange={handleChange}>
                            <option value="unknown">Unknown</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        <label>Date of Birth</label>
                        <input
                            name="be_birth"
                            type="date"
                            value={ShowDatePick(form, 'be_birth')}
                            onChange={handleDatePick}
                        />
                        <label>Town of Birth</label>
                        <input
                            name="be_birthTown"
                            value={form.be_birthTown}
                            onChange={handleChange}
                            placeholder="Town / City"
                        />
                        <label>County of Birth</label>
                        <input
                            name="be_birthCounty"
                            value={form.be_birthCounty}
                            onChange={handleChange}
                            placeholder="County"
                        />
                        <label>Country of Birth</label>
                        <input
                            name="be_birthCountry"
                            value={form.be_birthCountry}
                            onChange={handleChange}
                            placeholder="Country"
                        />
                        </div>
                )}

                        {/* Birth - Mother Tab */}
                        {activeTab === 'birth_mum' && (
                            <div className="form-tab-content">
                                <label>First Name *</label>
                                <input
                                    name="be_motherFirstName"
                                    value={form.be_motherFirstName}
                                    onChange={handleChange}
                                    placeholder="Mother's first name"
                                    autoFocus
                                />
                                <label>Last Name *</label>
                                <input
                                    name="be_motherLastName"
                                    value={form.be_motherLastName}
                                    onChange={handleChange}
                                    placeholder="Mother's last name"
                                />
                                <label>Birth Name</label>
                                <input
                                    name="be_motherBirthName"
                                    value={form.be_motherBirthName}
                                    onChange={handleChange}
                                    placeholder="Mother's birth / maiden name"
                                />
                                <label>Date of Birth</label>
                                <input
                                    name="be_motherBirth"
                                    type="date"
                                    value={ShowDatePick(form, 'be_motherBirth')}
                                    onChange={handleDatePick}
                                />
                                <label>Town of Birth</label>
                                <input
                                    name="be_motherBirthTown"
                                    value={form.be_motherBirthTown}
                                    onChange={handleChange}
                                    placeholder="Town / City"
                                />
                                <label>County of Birth</label>
                                <input
                                    name="be_motherBirthCounty"
                                    value={form.be_motherBirthCounty}
                                    onChange={handleChange}
                                    placeholder="County"
                                />
                                <label>Country of Birth</label>
                                <input
                                    name="be_motherBirthCountry"
                                    value={form.be_motherBirthCountry}
                                    onChange={handleChange}
                                    placeholder="Country"
                                />
                            </div>
                        )}
                        {/* Birth - Father Tab */}
                        {activeTab === 'birth_dad' && (
                            <div className="form-tab-content">
                                <label>First Name *</label>
                                <input
                                    name="be_fatherFirstName"
                                    value={form.be_fatherFirstName}
                                    onChange={handleChange}
                                    placeholder="Father's first name"
                                    autoFocus
                                />
                                <label>Last Name *</label>
                                <input
                                    name="be_fatherLastName"
                                    value={form.be_fatherLastName}
                                    onChange={handleChange}
                                    placeholder="Father's last name"
                                />
                                <label>Birth Name</label>
                                <input
                                    name="be_fatherBirthName"
                                    value={form.be_fatherBirthName}
                                    onChange={handleChange}
                                    placeholder="Father's birth name"
                                />
                                <label>Date of Birth</label>
                                <input
                                    name="be_fatherBirth"
                                    type="date"
                                    value={ShowDatePick(form, 'be_fatherBirth')}
                                    onChange={handleDatePick}
                                />
                                <label>Town of Birth</label>
                                <input
                                    name="be_fatherBirthTown"
                                    value={form.be_fatherBirthTown}
                                    onChange={handleChange}
                                    placeholder="Town / City"
                                />
                                <label>County of Birth</label>
                                <input
                                    name="be_fatherBirthCounty"
                                    value={form.be_fatherBirthCounty}
                                    onChange={handleChange}
                                    placeholder="County"
                                />
                                <label>Country of Birth</label>
                                <input
                                    name="be_fatherBirthCountry"
                                    value={form.be_fatherBirthCountry}
                                    onChange={handleChange}
                                    placeholder="Country"
                                />
                            </div>
                        )}
                        {/* Birth - Records Tab */}
                        {activeTab === 'birth_rec' && (
                            <div className="form-tab-content">
                                <label>Registry Office</label>
                                <input
                                    name="be_birthRegistryOffice"
                                    value={form.be_birthRegistryOffice}
                                    onChange={handleChange}
                                    placeholder="Registry Office"
                                    
                                />
                                <label>Registry Book</label>
                                <input
                                    name="be_birthRegistryBook"
                                    value={form.be_birthRegistryBook}
                                    onChange={handleChange}
                                    placeholder="Registry Book"
                                    
                                />
                                <label>Registry Book Volume</label>
                                <input
                                    name="be_birthRegistryVolume"
                                    value={form.be_birthRegistryVolume}
                                    onChange={handleChange}
                                    placeholder="Registry Book Volume"
                                    
                                />
                                <label>Registry Book Year</label>
                                <input
                                    name="be_birthRegistryYear"
                                    value={form.be_birthRegistryYear}
                                    onChange={handleChange}
                                    placeholder="Registry Book Year"
                                    
                                />
                                <label>Registry Book Page</label>
                                <input
                                    name="be_birthRegistryPage"
                                    value={form.be_birthRegistryPage}
                                    onChange={handleChange}
                                    placeholder="Registry Book Page"
                                    
                                />
                                <label>Registry Book Entry</label>
                                <input
                                    name="be_birthRegistryEntry"
                                    value={form.be_birthRegistryEntry}
                                    onChange={handleChange}
                                    placeholder="Registry Book Entry"
                                    
                                />

                                <label>Date of Baptism</label>
                                <input
                                    name="be_baptism"
                                    type="date"
                                    value={ShowDatePick(form, 'be_baptism')}
                                    onChange={handleDatePick}
                                />
                                <label>Religion</label>
                                <select name="be_birthReligion" value={form.be_birthReligion} onChange={handleChange}>
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
