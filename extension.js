// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const WebSocket = require("ws");
const ip = require("ip");
const path = require("path");
const { OutputFileType, createPrinter } = require("typescript");
const port = 8080;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

const output = vscode.window.createOutputChannel("Jellycuts");
var cacheWS = null
output.show(true);

function activate(context) {
  const wss = new WebSocket.Server({ port: port });
  wss.setMaxListeners(1);
  wss.setMaxListeners(1)

  vscode.window.showInformationMessage(
    `Jellycuts bridge opened on port ${ip.address()}:${port}`
  );

  wss.on("connection", function connection(ws, req) {
    cacheWS = ws
    vscode.window.showInformationMessage(`Client Connected -> ${req.connection.remoteAddress}`);

    ws.on("message", function incoming(message) {
      if(message == "run") {
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

  let runDisposable = vscode.commands.registerCommand('jellycuts-support.runOnDevice', () => {
    if (cacheWS != null) {
      updateApp(cacheWS, "run")
    }
  });

  context.subscriptions.push(runDisposable);
  
  let exportDisposable = vscode.commands.registerCommand('jellycuts-support.exportOnDevice', () => {
    if (cacheWS != null) {
      updateApp(cacheWS, "export")
    }
  });

  context.subscriptions.push(exportDisposable);
}

function updateApp(ws, type) {
  output.clear();
  const editor = vscode.window.activeTextEditor;
  var fileName = path.basename(editor.document.uri.fsPath);

  if (editor) {
    let document = editor.document;
    const documentText = document.getText();
    var dictionary = {"fileName": fileName, "text": documentText, "type": type}
    ws.send(JSON.stringify(dictionary));
    // vscode.window.showInformationMessage("Updated Server");
  }
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
  vscode.window.showInformationMessage(`Jellycuts bridge closed`);
}

module.exports = {
  activate,
  deactivate,
};
