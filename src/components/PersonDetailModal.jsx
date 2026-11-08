import { withObservables } from '@nozbe/watermelondb/react';
import { Q } from '@nozbe/watermelondb';
import database from '../database';
import MarriageCertificatePreview from './MarriageCertificatePreview';
import { displayDetails, formatDate, formatPlace } from '../utils/displayUtils';

const STATUS_LABELS = {
    engaged: 'Engaged',
    cohabiting: 'Cohabiting',
    married: 'Married',
    divorced: 'Divorced',
    widowed: 'Widowed',
};

const GENDER_LABELS = {
    male: 'Male',
    female: 'Female',
    unknown: 'Unknown',
};

function PersonDetailModal({ person, birthRecords, deathRecords, onClose }) {
    const details = displayDetails(person, birthRecords, deathRecords);

    return (
        <div className="modal-overlay">
            <div className="modal person-detail-modal">
                <div className="modal-header">
                    <h2>
                        {person.isOwner && <span style={{ marginRight: '6px' }}>👑</span>}
                        {details.firstName} {details.lastName}
                    </h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="person-detail-body">

                    {/* General */}
                    <div className="detail-section">
                        <h3>General</h3>
                        <div className="detail-grid">
                            <span className="detail-label">Full Name</span>
                            <span>{details.firstName} {details.lastName}</span>

                            {details.birthName && (
                                <>
                                    <span className="detail-label">Birth Name</span>
                                    <span>{details.birthName}</span>
                                </>
                            )}

                            <span className="detail-label">Gender</span>
                            <span>{GENDER_LABELS[details.gender] || 'Unknown'}</span>
                        </div>
                    </div>

                    {/* Birth */}
                    
                        <div className="detail-section">
                            <h3>Birth</h3>
                            <div className="detail-grid">

                                        <span className="detail-label">Date of Birth</span>
                                        <span>{formatDate(details.birthDay, details.birthMonth, details.birthYear)}</span>

                                        <span className="detail-label">Place of Birth</span>
                                        <span>{formatPlace(details.birthTown, details.birthCounty, details.birthCountry)}</span>

                            </div>
                        </div>
                    

                   

               
                </div>
            </div>
        </div>
    );
}

const enhance = withObservables(['person'], ({ person }) => ({
                person,
                birthRecords: database.collections.get('birth_records').query(),
            deathRecords: database.collections.get('death_records').query(),

}));

export default enhance(PersonDetailModal);