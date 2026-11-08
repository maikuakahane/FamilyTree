import { useState } from 'react';
import { useDatabase } from '@nozbe/watermelondb/react';
import { saveToFile }  from '../database';

const emptyAddress = () => ({
  id:             null,
  addressStreet:  '',
  addressTown:    '',
  addressCountry: '',
  addressCode:    '',
  movedInAt:      '',
  movedOutAt:     '',
  isNew:          true,
});

export default function AddressEditModal({ person, addresses, onClose }) {
  const db = useDatabase();

  const [activeTab, setActiveTab] = useState(0);
  const [forms, setForms] = useState(
    addresses.length > 0
      ? addresses.map(a => ({
          id:             a.id,
          addressStreet:  a.addressStreet  || '',
          addressTown:    a.addressTown    || '',
          addressCountry: a.addressCountry || '',
          addressCode:    a.addressCode    || '',
          movedInAt:      a.movedInAt
                            ? new Date(a.movedInAt).toISOString().split('T')[0]
                            : '',
          movedOutAt:     a.movedOutAt
                            ? new Date(a.movedOutAt).toISOString().split('T')[0]
                            : '',
          isNew:          false,
        }))
      : [emptyAddress()]
  );

  const handleChange = (index, e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForms(prev => prev.map((f, i) =>
      i !== index ? f : { ...f, [e.target.name]: value }
    ));
  };

  const handleAddNew = () => {
    setForms(prev => [...prev, emptyAddress()]);
    setActiveTab(forms.length);
  };

  const handleDelete = async (index) => {
    const form = forms[index];
    if (!form.isNew && form.id) {
      if (!window.confirm('Delete this address?')) return;
      await db.write(async () => {
        const record = await db.collections.get('addresses').find(form.id);
        await record.destroyPermanently();
      });
      await saveToFile();
    }
    const newForms = forms.filter((_, i) => i !== index);
    setForms(newForms.length > 0 ? newForms : [emptyAddress()]);
    setActiveTab(Math.max(0, activeTab - 1));
  };

  const handleSave = async () => {
    await db.write(async () => {
      for (const form of forms) {
        const applyFields = (r) => {
          r.personId       = person.id;
          r.addressStreet  = form.addressStreet;
          r.addressTown    = form.addressTown;
          r.addressCountry = form.addressCountry;
          r.addressCode    = form.addressCode;
          r.movedInAt      = form.movedInAt  ? new Date(form.movedInAt).getTime()  : null;
          r.movedOutAt     = form.movedOutAt ? new Date(form.movedOutAt).getTime() : null;
        };

        if (form.isNew) {
          await db.collections.get('addresses').create(applyFields);
        } else {
          const existing = await db.collections.get('addresses').find(form.id);
          await existing.update(applyFields);
        }
      }
    });

    await saveToFile();
    onClose();
  };

  const tabLabel = (form, i) => {
    if (form.isNew) return '+ New';
    return form.addressTown || form.addressStreet || `Address ${i + 1}`;
  };

  const currentForm = forms[activeTab];

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Addresses — {person.firstName} {person.lastName}</h2>

        {/* Tabs */}
        <div className="form-tabs">
          {forms.map((form, i) => (
            <button
              key={i}
              className={`form-tab ${activeTab === i ? 'form-tab--active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {tabLabel(form, i)}
            </button>
          ))}
          <button
            className="form-tab"
            onClick={handleAddNew}
            style={{ color: 'var(--accent)' }}
          >
            + Add Address
          </button>
        </div>

        {/* Form */}
        {currentForm && (
          <div className="form-tab-content">
            <label>Street</label>
            <input
              name="addressStreet"
              value={currentForm.addressStreet}
              onChange={(e) => handleChange(activeTab, e)}
              placeholder="Street address"
            />

            <label>Town / City</label>
            <input
              name="addressTown"
              value={currentForm.addressTown}
              onChange={(e) => handleChange(activeTab, e)}
              placeholder="Town / City"
            />

            <label>Country</label>
            <input
              name="addressCountry"
              value={currentForm.addressCountry}
              onChange={(e) => handleChange(activeTab, e)}
              placeholder="Country"
            />

            <label>Post Code</label>
            <input
              name="addressCode"
              value={currentForm.addressCode}
              onChange={(e) => handleChange(activeTab, e)}
              placeholder="Post code / ZIP"
            />

            <label>Moved In</label>
            <input
              name="movedInAt"
              type="date"
              value={currentForm.movedInAt}
              onChange={(e) => handleChange(activeTab, e)}
            />

            <label>Moved Out</label>
            <input
              name="movedOutAt"
              type="date"
              value={currentForm.movedOutAt}
              onChange={(e) => handleChange(activeTab, e)}
            />

            {!currentForm.isNew && (
              <button
                onClick={() => handleDelete(activeTab)}
                style={{
                  marginTop:   '8px',
                  background:  '#e05555',
                  color:       'white',
                  border:      'none',
                  borderRadius: '4px',
                  padding:     '6px 12px',
                  cursor:      'pointer',
                }}
              >
                🗑 Delete This Address
              </button>
            )}
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