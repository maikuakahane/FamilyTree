const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronDB', {
    load: () => ipcRenderer.invoke('db:load'),
    save: (data) => ipcRenderer.invoke('db:save', data),
    exportFile: (data) => ipcRenderer.invoke('db:export', data),
    importFile: () => ipcRenderer.invoke('db:import'),
    savePDF: (payload) => ipcRenderer.invoke('pdf:save', payload),
    isElectron: true,
});