const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 520,
    resizable: false,
    backgroundColor: '#000000',
    titleBarStyle: 'hiddenInset',
    vibrancy: 'dark',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

function getBinaryPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'pdf-unlock');
  }
  return path.join(__dirname, 'resources', 'pdf-unlock');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle('select-output', async (event, defaultName) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
  });

  if (result.canceled) {
    return null;
  }

  return result.filePath;
});

ipcMain.handle('unlock-pdf', async (event, { filePath, password, outputPath }) => {
  return new Promise((resolve) => {
    const binaryPath = getBinaryPath();
    const args = [filePath, password];
    if (outputPath) {
      args.push('-o', outputPath);
    }
    const process = spawn(binaryPath, args);

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        const match = stdout.match(/Saved unlocked PDF to (.+)/);
        const outputPath = match ? match[1].trim() : null;
        resolve({ success: true, outputPath, message: stdout.trim() });
      } else {
        resolve({ success: false, message: stdout.trim() || stderr.trim() || 'Unknown error' });
      }
    });

    process.on('error', (err) => {
      resolve({ success: false, message: `Failed to run: ${err.message}` });
    });
  });
});
