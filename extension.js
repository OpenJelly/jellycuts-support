// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const WebSocket = require("ws");
const ip = require("ip");
const path = require("path");
const port = 8080;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

const watcher = vscode.workspace.createFileSystemWatcher("**/*.jelly");

function activate(context) {
  const wss = new WebSocket.Server({ port: port });
  vscode.window.showInformationMessage(`Jellycuts bridge opened on port ${ip.address()}:${port}`);

  wss.on("connection", function connection(ws) {
    vscode.window.showInformationMessage("New Connection to Webserver"); //In my opinion this should be called
    ws.on("message", function incoming(message) {
		let console = vscode.window.createOutputChannel("Jellycuts");
		console.appendLine(`${message}`)
    });

    watcher.onDidChange(() => {
		updateApp(ws);
    });
  });
}

function updateApp(ws) {
	const editor = vscode.window.activeTextEditor;
	var fileName = path.basename(editor.document.uri.fsPath);
	
	if (editor) {
		let document = editor.document;
		const documentText = document.getText();
		ws.send(`${fileName}\n${documentText}`);
		vscode.window.showInformationMessage("Updated Server");
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
