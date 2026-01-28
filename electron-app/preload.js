const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: () => ipcRenderer.invoke('select-file'),
  selectOutput: (defaultName) => ipcRenderer.invoke('select-output', defaultName),
  unlockPdf: (filePath, password, outputPath) => ipcRenderer.invoke('unlock-pdf', { filePath, password, outputPath })
});
