import { useState } from 'react';
import { withObservables } from '@nozbe/watermelondb/react';
import database from './database';
import PeopleTable from './components/PeopleTable';
import FamilyTree from './components/FamilyTree';
import BackupRestore from './components/BackupRestore';
import WelcomeScreen from './components/WelcomeScreen';


function App({ people }) {
    const [view, setView] = useState('list');

    if (!people || people.length === 0) {
        return <WelcomeScreen onComplete={() => setView('list')} />;
    }

    return (
        <div>
            <nav className="app-nav">
                <button
                    className={view === 'list' ? 'nav-active' : ''}
                    onClick={() => setView('list')}
                >People</button>
                <button
                    className={view === 'tree' ? 'nav-active' : ''}
                    onClick={() => setView('tree')}
                >Family Tree</button>
                <button
                    className={view === 'backup' ? 'nav-active' : ''}
                    onClick={() => setView('backup')}
                >Backup & Restore</button>
            </nav>

            {view === 'list' && <PeopleTable />}
            {view === 'tree' && <FamilyTree />}
            {view === 'backup' && <BackupRestore />}
        </div>
    );
}

const enhance = withObservables([], () => ({
    people: database.collections.get('people').query(),
}));

const EnhancedApp = enhance(App);
export default EnhancedApp;