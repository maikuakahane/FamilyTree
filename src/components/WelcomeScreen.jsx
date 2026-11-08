import { useState } from 'react';
import { saveToFile } from '../database';
import { createPerson, createBirthRecord, linkBirthRecord } from '../database/databaseFunctions';

export default function WelcomeScreen({ onComplete }) {
    const [activeTab, setActiveTab] = useState('general');

    const [form, setForm] = useState({

            //A - Person entity
            p_firstName: '',
            p_lastName: '',
            p_birthName: '',
            p_gender: 'unknown',
        
            //B - Birth event entity
            // Person's details
            b_firstName: '',
            b_lastName: '',
            b_gender:'unknown',
            b_birthDay: '',
            b_birthMonth: '',
            b_birthYear: '',
            b_birthTown: '',
            b_birthCounty: '',
            b_birthCountry: '',
            // Mother's details
            b_motherFirstName: '',
            b_motherLastName: '',
            b_motherBirthName: '',
            b_motherBirthDay: '',
            b_motherBirthMonth: '',
            b_motherBirthYear: '',
            b_motherBirthTown: '',
            b_motherBirthCounty: '',
            b_motherBirthCountry: '',
            // Father's details
            b_fatherFirstName: '',
            b_fatherLastName: '',
            b_fatherBirthName: '',
            b_fatherBirthDay: '',
            b_fatherBirthMonth: '',
            b_fatherBirthYear: '',
            b_fatherBirthTown: '',
            b_fatherBirthCounty: '',
            b_fatherBirthCountry: '',
            // Religion
            b_birthReligion: 'unknown',
        
    });

    const handleDatePick = (e) => {
        const [year, month, day] = e.target.value.split('-');
        setForm({ ...form, [e.target.name + 'Year']: year, [e.target.name + 'Month']: month, [e.target.name + 'Day']: day });

    };

    const ShowDatePick = (form,prefix) => {
        const year = form[prefix + 'Year']
        const month = form[prefix + 'Month']
        const day = form[prefix + 'Day']
        const string = year + '-' + month + '-' + day

        if (!year || !month || !day) return '';

        return string;

    };

     const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
       setForm({ ...form, [e.target.name]: value });
    };

    const handleStart = async () => {
        if (!form.p_firstName || !form.p_lastName) {
            alert('First name and last name are required.');
         setActiveTab('general');
            return;
        }

        const person = await createPerson({
            firstNameP1: form.p_firstName,
            lastNameP1 : form.p_lastName,
            birthNameP1 : form.p_birthName,
            genderP1 : form.p_gender,
            isOwner1 : true,
        });

        const birth_record = await createBirthRecord({
            // Person's details
            firstNameB1: form.b_firstName,
            lastNameB1: form.b_lastName,
            genderB1: form.b_gender,
            birthDayB1: form.b_birthDay,
            birthMonthB1: form.b_birthMonth,
            birthYearB1: form.b_birthYear,
            birthTownB1: form.b_birthTown,
            birthCountyB1: form.b_birthCounty,
            birthCountryB1: form.b_birthCountry,
            // Mother's details
            motherFirstNameB1: form.b_motherFirstName,
            motherLastNameB1: form.b_motherLastName,
            motherBirthNameB1: form.b_motherBirthName,
            motherBirthDayB1: form.b_motherBirthDay,
            motherBirthMonthB1: form.b_motherBirthMonth,
            motherBirthYearB1: form.b_motherBirthYear,
            motherBirthTownB1: form.b_motherBirthTown,
            motherBirthCountyB1: form.b_motherBirthCounty,
            motherBirthCountryB1: form.b_motherBirthCountry,
            // Father's details
            fatherFirstNameB1: form.b_fatherFirstName,
            fatherLastNameB1: form.b_fatherLastName,
            fatherBirthNameB1: form.b_fatherBirthName,
            fatherBirthDayB1: form.b_fatherBirthDay,
            fatherBirthMonthB1: form.b_fatherBirthMonth,
            fatherBirthYearB1: form.b_fatherBirthYear,
            fatherBirthTownB1: form.b_fatherBirthTown,
            fatherBirthCountyB1: form.b_fatherBirthCounty,
            fatherBirthCountryB1: form.b_fatherBirthCountry,
            // Religion
            birthReligionB1: form.b_birthReligion,
        });

        await linkBirthRecord({
            personIdB1: person.personId,
            birthRecordIdB1 : birth_record.birthRecordId,

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

                </div>

                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="form-tab-content">
                        <label>First Name *</label>
                        <input
                            name="p_firstName"
                            value={form.p_firstName}
                            onChange={handleChange}
                            placeholder="Your first name"
                            autoFocus
                        />
                        <label>Last Name *</label>
                        <input
                            name="p_lastName"
                            value={form.p_lastName}
                            onChange={handleChange}
                            placeholder="Your last name"
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
                     )}

                {/* Birth - Person Tab */}
                {activeTab === 'birth_per' && (
                            <div className="form-tab-content">
                            <label>First Name *</label>
                        <input
                            name="b_firstName"
                            value={form.b_firstName}
                            onChange={handleChange}
                            placeholder="Your first name"
                            autoFocus
                        />
                        <label>Birth Name</label>
                        <input
                            name="b_lastName"
                            value={form.b_lastName}
                            onChange={handleChange}
                            placeholder="Your last name"
                        />
                        <label>Gender</label>
                        <select name="b_gender" value={form.b_gender} onChange={handleChange}>
                            <option value="unknown">Unknown</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        <label>Date of Birth</label>
                        <input
                            name="b_birth"
                            type="date"
                            value={ShowDatePick(form,'b_birth')}
                            onChange={handleDatePick}
                        />
                        <label>Town of Birth</label>
                        <input
                            name="b_birthTown"
                            value={form.b_birthTown}
                            onChange={handleChange}
                            placeholder="Town / City"
                            />
                        <label>County of Birth</label>
                        <input
                            name="b_birthCounty"
                            value={form.b_birthCounty}
                            onChange={handleChange}
                            placeholder="County"
                        />
                        <label>Country of Birth</label>
                        <input
                            name="b_birthCountry"
                            value={form.b_birthCountry}
                            onChange={handleChange}
                            placeholder="Country"
                            />
                            <label>Religion</label>
                            <select name="b_birthReligion" value={form.b_birthReligion} onChange={handleChange}>
                                <option value="unknown">Unknown</option>
                                <option value="catholic">Catholic</option>
                                <option value="protestant">Protestant</option>
                                <option value="jewish">Jewish</option>
                                <option value="other">Other</option>
                                <option value="nota">Not Applicable</option>
                            </select>
                        </div>
                   
                    )}

                    {/* Birth - Mother Tab */}
                    {activeTab === 'birth_mum' && (
                        <div className="form-tab-content">
                            <label>First Name *</label>
                            <input
                            name="b_motherFirstName"
                                value={form.b_motherFirstName}
                                onChange={handleChange}
                                placeholder="Your mother's first name"
                                autoFocus
                            />
                            <label>Last Name *</label>
                            <input
                            name="b_motherLastName"
                                value={form.b_motherLastName}
                                onChange={handleChange}
                            placeholder="Your mother's last name"
                            />
                            <label>Birth Name</label>
                            <input
                                name="b_motherBirthName"
                                value={form.b_motherBirthName}
                                onChange={handleChange}
                                placeholder="Your mother's birth / maiden name"
                            />
                            <label>Date of Birth</label>
                            <input
                            name="b_motherBirth"
                                type="date"
                            value={ShowDatePick(form, 'b_motherBirth')}
                                onChange={handleDatePick}
                            />
                            <label>Town of Birth</label>
                            <input
                            name="b_motherBirthTown"
                            value={form.b_motherBirthTown}
                                onChange={handleChange}
                                placeholder="Town / City"
                        />
                        <label>County of Birth</label>
                        <input
                            name="b_motherBirthCounty"
                            value={form.b_motherBirthCounty}
                            onChange={handleChange}
                            placeholder="County"
                        />
                            <label>Country of Birth</label>
                            <input
                            name="b_motherBirthCountry"
                            value={form.b_motherBirthCountry}
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
                            name="b_fatherFirstName"
                            value={form.b_fatherFirstName}
                            onChange={handleChange}
                            placeholder="Your father's first name"
                            autoFocus
                        />
                        <label>Last Name *</label>
                        <input
                            name="b_fatherLastName"
                            value={form.b_fatherLastName}
                            onChange={handleChange}
                            placeholder="Your father's last name"
                        />
                        <label>Birth Name</label>
                        <input
                            name="b_fatherBirthName"
                            value={form.b_fatherBirthName}
                            onChange={handleChange}
                            placeholder="Your father's birth / maiden name"
                        />
                        <label>Date of Birth</label>
                        <input
                            name="b_fatherBirth"
                            type="date"
                            value={ShowDatePick(form, 'b_fatherBirth')}
                            onChange={handleDatePick}
                        />
                        <label>Town of Birth</label>
                        <input
                            name="b_fatherBirthTown"
                            value={form.b_fatherBirthTown}
                            onChange={handleChange}
                            placeholder="Town / City"
                        />
                        <label>County of Birth</label>
                        <input
                            name="b_fatherBirthCounty"
                            value={form.b_fatherBirthCounty}
                            onChange={handleChange}
                            placeholder="County"
                        />
                        <label>Country of Birth</label>
                        <input
                            name="b_fatherBirthCountry"
                            value={form.b_fatherBirthCountry}
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