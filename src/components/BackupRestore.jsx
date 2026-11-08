import { useState } from 'react';
import { exportToFile, importFromFile } from '../database';

export default function BackupRestore() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        setStatus(null);
        const result = await exportToFile();
        if (result.success) {
            setStatus({ type: 'success', message: `Exported successfully to ${result.filePath}` });
        } else if (result.reason !== 'Cancelled') {
            setStatus({ type: 'error', message: `Export failed: ${result.reason}` });
        }
        setLoading(false);
    };

    const handleImport = async () => {
        if (!window.confirm('Importing will replace all current data. Are you sure?')) return;
        setLoading(true);
        setStatus(null);
        const result = await importFromFile();
        if (result.success) {
            setStatus({ type: 'success', message: `Imported successfully — ${result.count} people loaded. Refreshing...` });
            setTimeout(() => window.location.reload(), 1500);
        } else if (result.reason !== 'Cancelled') {
            setStatus({ type: 'error', message: `Import failed: ${result.reason}` });
        }
        setLoading(false);
    };

    return (
        <div className="backup-container">
            <h2>Backup & Restore</h2>
            <p className="backup-description">
                Export your family tree to a JSON file to back it up or transfer it to another computer.
                Import a previously exported file to restore your data.
            </p>

            <div className="backup-cards">
                <div className="backup-card">
                    <h3>📤 Export</h3>
                    <p>Save your family tree to a JSON file on your computer or external drive.</p>
                    <button onClick={handleExport} disabled={loading}>
                        {loading ? 'Exporting...' : 'Export Family Tree'}
                    </button>
                </div>

                <div className="backup-card">
                    <h3>📥 Import</h3>
                    <p>Load a previously exported family tree JSON file. This will replace all current data.</p>
                    <button onClick={handleImport} disabled={loading} className="import-btn">
                        {loading ? 'Importing...' : 'Import Family Tree'}
                    </button>
                </div>
            </div>

            {status && (
                <div className={`backup-status backup-status--${status.type}`}>
                    {status.message}
                </div>
            )}
        </div>
    );
}