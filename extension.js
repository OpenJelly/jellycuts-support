const vscode = require("vscode");
const WebSocket = require("ws");
const path = require("path");
const port = 8080;
const internalIp = require('internal-ip');

const output = vscode.window.createOutputChannel("Jellycuts");
var cacheWS = null
var cacheWSS = null
output.show(true);

//onCommand:
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
            vscode.window.showInformationMessage(`Acitve Jellycuts Bridges have been closed`);
        } else {
            vscode.window.showInformationMessage(`There are no active connections to the Jellycuts Bridge`);
        }
    };
    context.subscriptions.push(vscode.commands.registerCommand(closeServerCommand, closeServerHandler));

    const runHandler = () => {
        if (cacheWS != null) {
            vscode.window.showInformationMessage(`Running Jellycut on connected device`);
            updateApp(cacheWS, "run")
        } else {
            vscode.window.showWarningMessage(`No bridge started or no connections to the current bridge`);
        }
    };

    context.subscriptions.push(vscode.commands.registerCommand("jellycuts-support.run", runHandler));

    const exportHandler = () => {
        if (cacheWS != null) {
            vscode.window.showInformationMessage(`Exporting Jellycut to Shortcuts`);
            updateApp(cacheWS, "export")
        } else {
            vscode.window.showWarningMessage(`No bridge started or no connections to the current bridge`);
        }
    };

    context.subscriptions.push(vscode.commands.registerCommand("jellycuts-support.export", exportHandler));
}

function updateApp(ws, type) {
    output.clear();
    const editor = vscode.window.activeTextEditor;
    var fileName = path.basename(editor.document.uri.fsPath);

    if (editor) {
        let document = editor.document;
        const documentText = document.getText();
        var dictionary = { "fileName": fileName, "text": documentText, "type": type }
        ws.send(JSON.stringify(dictionary));
    }
}

// this method is called when your extension is deactivated
function deactivate() {
    vscode.window.showInformationMessage(`Jellycuts bridge closed`);
}

module.exports = {
    activate,
    deactivate,
};