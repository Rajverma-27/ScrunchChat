import { app, BrowserWindow, ipcMain, session } from 'electron';
import * as path from 'path';

// Define environment state
const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: '#0f0f23',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    // Load Vite dev server in development
    mainWindow.loadURL('http://localhost:5173').catch(console.error);
    // Open Developer Tools so the user can see the running HTML/Code
    mainWindow.webContents.openDevTools();
  } else {
    // Load built index.html in production
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html')).catch(console.error);
  }

  // Manage window state when maximize/unmaximize happens
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window:state-changed', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window:state-changed', false);
  });
}

// Ensure single instance lock for the app if needed, otherwise proceed
app.whenReady().then(() => {
  // Set up strong Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const csp = isDev 
      ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:5173; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://localhost:5173 http://localhost:5173;"
      : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';";
      
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
      }
    });
  });

  // Setup IPC Handlers for Window Controls
  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.handle('window:close', () => {
    mainWindow?.close();
  });

  ipcMain.handle('window:isMaximized', () => {
    return mainWindow?.isMaximized() ?? false;
  });

  // Example placeholder implementations for the APIs exposed in preload.
  // In a full implementation, these would map to proper modules/services.
  ipcMain.handle('app:getVersion', () => app.getVersion());
  ipcMain.handle('app:getPlatform', () => process.platform);

  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
