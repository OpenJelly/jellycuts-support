const vscode = require("vscode");
const WebSocket = require("ws");
const path = require("path");
const port = 8080;
const internalIp = require('internal-ip');
const fs = require('fs')

const output = vscode.window.createOutputChannel("Jellycuts");
var cacheWS = null
var cacheWSS = null
output.show(true);

/* MARK: Initializing file system watcher to update available projects */
let watcher = vscode.workspace.createFileSystemWatcher("**/*.jelly");
watcher.onDidChange(uri => {
    updateApp(cacheWS, "get")
})
watcher.onDidCreate(uri => {
    updateApp(cacheWS, "get")
})
watcher.onDidDelete(uri => {
    updateApp(cacheWS, "get")
})

function activate(context) {

    const runServerCommand = 'jellycuts-support.runserver';

    const runServerHandler = () => {
        const wss = new WebSocket.Server({ port: port });
        cacheWSS = wss
        wss.setMaxListeners(1);

        vscode.window.showInformationMessage(
            `Jellycuts bridge opened on port ${internalIp.v4.sync()}:${port}`
        );

        wss.on("connection", function connection(ws, req) {
            vscode.window.showInformationMessage(`Client Connected -> ${req.connection.remoteAddress}`);
            cacheWS = ws

            ws.on("message", function incoming(message) {
                if (message == "run") {
                    updateApp(ws, "run")
                } else if (message == 'get') {
                    updateApp(ws, "get")
                } else if (message == "export") {
                    updateApp(ws, "export")
                } else if (message == "download") {
                    updateApp(ws, "download")
                } else if (message == "closing") {
                    vscode.window.showInformationMessage(`Client Disconnected -> ${req.connection.remoteAddress}`);
                    cacheWS = null
                } else if (message != "ping") {
                    output.append(`${message}\n`);
                }
            });
        });
    };
    context.subscriptions.push(vscode.commands.registerCommand(runServerCommand, runServerHandler));

    const closeServerCommand = 'jellycuts-support.closeserver';

    const closeServerHandler = () => {
        if (cacheWS != null) {
            for (const client of cacheWSS.clients) {
                client.close();
            }
            vscode.window.showInformationMessage(`All acitve Jellycuts Bridge connections have been closed`);
        } else {
            // vscode.window.showInformationMessage(`There are no active connections to the Jellycuts Bridge`);
        }
        cacheWSS.close()
        vscode.window.showInformationMessage(`Closed Jellycuts Bridge`);
    };
    context.subscriptions.push(vscode.commands.registerCommand(closeServerCommand, closeServerHandler));

    // const runHandler = () => {
    //     if (cacheWS != null) {
    //         vscode.window.showInformationMessage(`Running Jellycut on connected device`);
    //         updateApp(cacheWS, "run")
    //     } else {
    //         vscode.window.showWarningMessage(`No bridge started or no connections to the current bridge`);
    //     }
    // };

    // context.subscriptions.push(vscode.commands.registerCommand("jellycuts-support.run", runHandler));

    // const exportHandler = () => {
    //     if (cacheWS != null) {
    //         vscode.window.showInformationMessage(`Exporting Jellycut to Shortcuts`);
    //         updateApp(cacheWS, "export")
    //     } else {
    //         vscode.window.showWarningMessage(`No bridge started or no connections to the current bridge`);
    //     }
    // };

    // context.subscriptions.push(vscode.commands.registerCommand("jellycuts-support.export", exportHandler));
}

function updateApp(ws, type) {
    if (type != 'get') {
        output.clear();
        const editor = vscode.window.activeTextEditor;
        var fileName = path.basename(editor.document.uri.fsPath);

        if (editor) {
            let document = editor.document;
            const documentText = document.getText();
            var dictionary = { "fileName": fileName, "text": documentText, "type": type }
            ws.send(JSON.stringify(dictionary));
        }
    } else {
        vscode.workspace.findFiles('**/*.jelly').then((uri => {
                console.log('Updating Files')
                let files = []
                uri.forEach(element => {
                    try {
                        const data = fs.readFileSync(element.fsPath, 'utf8')
                        files.push({ 'path': element.path, 'name': path.basename(element.path).replace('.jelly', ''), 'text': data })
                    } catch (err) {
                        console.error(err)
                    }
                });
                var dictionary = { "type": 'receiveFiles', 'files': files }
                ws.send(JSON.stringify(dictionary))
            }))
            // ws.send(JSON.stringify(dictionary));
    }
}
/*
struct JFile: Codable {
    var path: String
    var name: String
    var text: String
}
*/
// this method is called when your extension is deactivated
function deactivate() {
    vscode.window.showInformationMessage(`Jellycuts bridge closed`);
}

module.exports = {
    activate,
    deactivate,
};