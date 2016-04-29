/* Requires */
var electron = require('electron'),
    remote = require('remote'),
    shell = require("shell"),
    fs = require('fs'),
    https = require('https');
    yaml = require('js-yaml'),
    jQuery = $ = require('jQuery'),
    kramed = require('kramed'),
    GitHubApi = require("github"),
    CryptoJS = require('crypto-js'),
    AdmZip = require('adm-zip');

/* Path */
const ipcRenderer = require('electron').ipcRenderer;
_userdata = ipcRenderer.sendSync('getUserDataDir');
_temp = ipcRenderer.sendSync('getTempDir');

/* Context Menu */
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

/* Dialog */
const dialog = remote.dialog;

var template = [{
        label: 'File',
        submenu: [{
            label: 'New',
            accelerator: 'CmdOrCtrl+N',
            click: function() {
                $('#newPostAction').click();
            }
        }, {
            label: 'Open',
            accelerator: 'CmdOrCtrl+O',
            click: function() {
                $('#openPostAction').click();
            }
        }, {
            label: 'Save',
            accelerator: 'CmdOrCtrl+S',
            click: function() {
                $('#savePostAction').click();
            }
        }, {
            label: 'Preview',
            accelerator: 'CmdOrCtrl+P',
            click: function() {
                $('#previewAction').click();
            }
        }, {
            label: 'Publish',
            accelerator: 'CmdOrCtrl+Shift+P',
            click: function() {
                $('#publishAction').click();
            }
        }]
    }, {
        label: 'Edit',
        submenu: [{
            label: 'Undo',
            accelerator: 'CmdOrCtrl+Z',
            role: 'undo'
        }, {
            label: 'Redo',
            accelerator: 'CmdOrCtrl+Y',
            role: 'redo'
        }, {
            type: 'separator'
        }, {
            label: 'Copy',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy'
        }, {
            label: 'Cut',
            accelerator: 'CmdOrCtrl+X',
            role: 'cut'
        }, {
            label: 'Paste',
            accelerator: 'CmdOrCtrl+V',
            role: 'paste'
        }, {
            label: 'Select All',
            accelerator: 'CmdOrCtrl+A',
            role: 'selectall'
        }]
    }, {
        label: 'Window',
        role: 'window',
        submenu: [{
            label: 'Minimize',
            accelerator: 'CmdOrCtrl+M',
            role: 'minimize'
        }, {
            label: 'Close',
            accelerator: 'CmdOrCtrl+W',
            role: 'close'
        }]
    }, {
        label: 'Help',
        role: 'help',
        submenu: [{
            label: 'Learn More',
            click: function() { require('electron').shell.openExternal('http://www.jekyllwriter.com') }
        }]
}];

if (process.platform == 'darwin') {
  template.unshift({
    label: 'MoteDown',
    submenu: [{
        label: 'Services',
        role: 'services',
        submenu: []
    }, {
        type: 'separator'
    }, {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
    }, {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        role: 'hideothers'
    }, {
        label: 'Show All',
        role: 'unhide'
    }, {
        type: 'separator'
    }, {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() { app.quit(); }
    }]
  });
  // Window menu.
  template[3].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  );
}

menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

window.addEventListener('contextmenu', function (e) {
    e.preventDefault();

    var selectText = window.getSelection().toString().replace(/\n+/g, ' ');

    if (selectText && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && !e.target.readOnly) {
        var menu = new Menu();

        menu.append(new MenuItem({
            label: 'Undo',
            accelerator: 'CmdOrCtrl+Z',
            role: 'undo'
        }));

        menu.append(new MenuItem({
            label: 'Redo',
            accelerator: 'CmdOrCtrl+Y',
            role: 'redo'
        }));

        menu.append(new MenuItem({
            type: 'separator'
        }));

        menu.append(new MenuItem({
            label: 'Copy',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy'
        }));

        menu.append(new MenuItem({
            label: 'Cut',
            accelerator: 'CmdOrCtrl+X',
            role: 'cut'
        }));

        menu.append(new MenuItem({
            label: 'Paste',
            accelerator: 'CmdOrCtrl+V',
            role: 'paste'
        }));

        menu.append(new MenuItem({
            label: 'Select All',
            accelerator: 'CmdOrCtrl+A',
            role: 'selectall'
        }));

        menu.append(new MenuItem({
            type: 'separator'
        }));

        menu.append(new MenuItem({
            label: 'Search Google for "' + (selectText.length > 20 ? selectText.substr(0, 17) + '...' : selectText) + '"',
            click: function() {
                shell.openExternal('https://www.google.com/search?q=' + encodeURIComponent(selectText));
            }
        }));

        menu.popup(remote.getCurrentWindow());
    } else if ((e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && !e.target.readOnly) {
        var menu = new Menu();

        menu.append(new MenuItem({
            label: 'Undo',
            accelerator: 'CmdOrCtrl+Z',
            role: 'undo'
        }));

        menu.append(new MenuItem({
            label: 'Redo',
            accelerator: 'CmdOrCtrl+Y',
            role: 'redo'
        }));

        menu.append(new MenuItem({
            type: 'separator'
        }));

        menu.append(new MenuItem({
            label: 'Paste',
            accelerator: 'CmdOrCtrl+V',
            role: 'paste'
        }));

        menu.append(new MenuItem({
            label: 'Select All',
            accelerator: 'CmdOrCtrl+A',
            role: 'selectall'
        }));

        menu.popup(remote.getCurrentWindow());
    } else if (selectText) {
        var menu = new Menu();

        menu.append(new MenuItem({
            label: 'Copy',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy'
        }));

        menu.append(new MenuItem({
            label: 'Select All',
            accelerator: 'CmdOrCtrl+A',
            role: 'selectall'
        }));

        menu.append(new MenuItem({
            type: 'separator'
        }));

        menu.append(new MenuItem({
            label: 'Search Google for "' + (selectText.length > 20 ? selectText.substr(0, 17) + '...' : selectText) + '"',
            click: function() {
                shell.openExternal('https://www.google.com/search?q=' + encodeURIComponent(selectText));
            }
        }));

        menu.popup(remote.getCurrentWindow());
    }
}, false);

/* Google Maps */
var GOOGMAP;

function initMap() {
    GOOGMAP = new google.maps.Map(document.getElementById('googleMap'), {
        center: {lat: 0, lng: 0},
        zoom: 1,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    GOOGMAP.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    GOOGMAP.addListener('bounds_changed', function() {
        searchBox.setBounds(GOOGMAP.getBounds());
    });

    var markers = [];

    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];

        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            markers.push(new google.maps.Marker({
                map: GOOGMAP,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        GOOGMAP.fitBounds(bounds);
    });

    $('#pac-input').css('display', 'inline-block');
}

window.onload = function() {
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?libraries=places';
    $('body').append(script);
    $('body').addClass('loaded');
}