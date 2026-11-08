const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = !app.isPackaged;

const sanitiseName = (name) =>
    name.replace(/[<>:"/\\|?*]/g, '').trim();

function getDbPath() {
    const documentsPath = app.getPath('documents');
    const folderPath = path.join(documentsPath, 'FamilyTree');
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    return path.join(folderPath, 'familytree.db');
}

ipcMain.handle('db:load', () => {
    const dbPath = getDbPath();
    if (fs.existsSync(dbPath)) {
        return fs.readFileSync(dbPath, 'utf-8');
    }
    return null;
});

ipcMain.handle('db:save', (event, data) => {
    const dbPath = getDbPath();
    fs.writeFileSync(dbPath, data, 'utf-8');
    return true;
});

// IPC: Export to user-chosen location
ipcMain.handle('db:export', async (event, data) => {
    const { filePath, canceled } = await dialog.showSaveDialog({
        title: 'Export Family Tree',
        defaultPath: 'familytree-backup.json',
        filters: [{ name: 'JSON', extensions: ['json'] }],
    });
    if (canceled || !filePath) return { success: false };
    fs.writeFileSync(filePath, data, 'utf-8');
    return { success: true, filePath };
});

// IPC: Import from user-chosen location
ipcMain.handle('db:import', async () => {
    const { filePaths, canceled } = await dialog.showOpenDialog({
        title: 'Import Family Tree',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile'],
    });
    if (canceled || filePaths.length === 0) return null;
    const data = fs.readFileSync(filePaths[0], 'utf-8');
    return data;
});

// IPC:Save to PDF
ipcMain.handle('pdf:save', async (event, { html, defaultFileName, folderPath }) => {

    const segments = folderPath.split('/').map(s => s.replace(/[<>:"/\\|?*]/g, '').trim());
    const safeFolder = segments.join(path.sep);

    // Step 1: Build the automatic save path
    const documentsBase = path.join(path.dirname(process.execPath), 'documents');
    const targetFolder = path.join(documentsBase, safeFolder);

    // Create the folder structure if it doesn't exist

    fs.mkdirSync(targetFolder, { recursive: true });

    const filePath = path.join(targetFolder, `${defaultFileName}.pdf`);

    // Step 2: Create a hidden window
    const printWin = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Step 3: Load the HTML string
    await printWin.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
    );

    // Step 4: Print to PDF and save
    const pdfBuffer = await printWin.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4',
    });

    printWin.close();
    fs.writeFileSync(filePath, pdfBuffer);

    return { success: true, filePath };
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
        },
    });

    if (isDev) {
        win.loadURL('http://localhost:55286');
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
        win.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});