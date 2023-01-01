const {
    app,
    BrowserWindow,
    nativeTheme,
    Menu,
    MenuItem,
    dialog
} = require('electron');
const path = require('path');
const fs = require('fs')
const fetch = require('electron-fetch');

const jokesDivider = '\n---------------------------------------\n';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 650,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        icon: path.join(__dirname, 'icons/icon.ico'),
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

nativeTheme.themeSource = 'dark';

const menu = new Menu();
menu.append(new MenuItem({
    label: 'Полезное',
    submenu: [{
        label: 'Автор',
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+D' : 'Alt+Shift+D',

        click: () => {
            dialog.showMessageBox({
                title: 'Автор',
                icon: path.join(__dirname, 'icons/github.ico'),
                message: 'Создано Ермаковым Максимом 01.01.2023\nGitHub: github.com/rsincara',
            })
        }
    },
        {
            label: 'Да или нет',
            accelerator: process.platform === 'darwin' ? 'Alt+Cmd+A' : 'Alt+Shift+A',
            click: () => {
                fetch.default('https://yesno.wtf/api').then((x) => x.json()).then(x => {
                    dialog.showMessageBox({
                        title: 'Ответ',
                        message: x.answer,
                    })
                })
            },
        },
        {
            label: 'Случайный анек',
            accelerator: process.platform === 'darwin' ? 'Alt+Cmd+S' : 'Alt+Shift+S',
            click: () => {
                fetch.default('https://baneks.ru/random').then(x => x.text()).then(x => {
                    const startIndex = x.indexOf(`<p>`) + '<p>'.length;
                    const endIndex = x.indexOf(`</p>`);
                    const result = x.slice(startIndex, endIndex).replaceAll(`<br />`, '\n');

                    dialog.showMessageBox({
                        title: 'Случайный анекдот',
                        buttons: ['Ахаха', 'Не смешно'],
                        message: result,
                    }).then((messageBoxResult ) => {
                        const isFunny = messageBoxResult.response === 0;

                        if (isFunny) {
                            fs.writeFileSync('funny jokes.txt', result + jokesDivider, {
                                encoding: "utf8",
                                flag: "a+",
                                mode: 0o666,
                            })
                        }
                    })
                        .catch((e) => {
                            console.log('Error: ', e);
                        })
                })
            },
        },
        {
            label: 'Случайный котек',
            accelerator: process.platform === 'darwin' ? 'Alt+Cmd+W' : 'Alt+Shift+W',
            click: () => {
                const win = new BrowserWindow({
                    width: 800,
                    height: 1080,
                    autoHideMenuBar: true,
                    icon: path.join(__dirname, 'icons/icon.ico')
                });
                win.loadURL('https://cataas.com/cat');
                win.show();
            },
        },
    ]
}))

Menu.setApplicationMenu(menu);


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
