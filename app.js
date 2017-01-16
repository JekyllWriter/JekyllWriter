var electron = require('electron');
var app = electron.app
var fs = require('fs');
var http = require('http');
var BrowserWindow = electron.BrowserWindow;
var landingWindow = null;
var mainWindow = null;
var proxyConfig = null;
var ses = null;

const ipcMain = electron.ipcMain;

ipcMain.on('getUserDataDir', function(event) {
    event.returnValue = app.getPath('userData').replace(/\\/g, '/');
});

ipcMain.on('getTempDir', function(event) {
    event.returnValue = app.getPath('temp').replace(/\\/g, '/');
});

try {
    proxyConfig = fs.readFileSync(__dirname + '/proxy.conf');
    proxyConfig = JSON.parse(proxyConfig);

    var proxyType = proxyConfig.type;
    var proxyServer = proxyConfig.server;
    var proxyPort = proxyConfig.port;

    if (proxyType && proxyServer && proxyPort) {
        app.commandLine.appendSwitch('proxy-server', proxyType + '://' + proxyServer + ':' + proxyPort);
    }
} catch(e) {
    // no proxy
}

app.on('window-all-closed', function() {
    app.quit();
});

app.on('ready', function() {
    landingWindow = new BrowserWindow({
        width: 600,
        height: 200,
        minWidth: 600,
        minHeight: 200,
        maxWidth: 600,
        maxHeight: 200,
        frame: false,
        alwaysOnTop: true,
        transparent: false,
        skipTaskbar: true,
        icon: __dirname + '/images/logo512.png'
    });

    landingWindow.loadURL('file://' + __dirname + '/landing.html');

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        frame: false,
        show: false,
        icon: __dirname + '/images/logo512.png'
    });

    //mainWindow.webContents.openDevTools();

    mainWindow.loadURL('file://' + __dirname + '/app.html');

    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    setTimeout(function() {
        mainWindow.show();
        landingWindow.close();
    }, 2000);
});