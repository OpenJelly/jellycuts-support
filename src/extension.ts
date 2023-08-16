// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Server, WebSocket } from "ws";
var ips = require('ips');
var result = ips();

const port: number = 7035;

let server: Server | undefined = undefined;
let webSocket: WebSocket | undefined = undefined;

let outputView = vscode.window.createOutputChannel("Jellycuts");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log("Jellycuts Support has started. To start the web server ise the command Start Bridge Server.");

	let startServer = vscode.commands.registerCommand('jellycuts-support.startServer', () => {
		logWorking('Jellycuts Bridge Server Starting Activation...');
		server = new Server({ port: port });
		  
		server.on('connection', function connection(ws: WebSocket) {
			logInfo("Connection Started");
			webSocket = ws;

			ws.on('error', function error(error: { message: any; }) {
				logError(`An error occurred on the web socket ${error.message}`);
			});
		  
			ws.on('message', function message(string: string) {
				if (string === "pull") {
					let docText = getDocumentText();
					ws.send(docText);
				}
			});

			ws.on('close', function close() {
				logInfo("A Connection was closed");
			  });
		});
		  
		logInfo(`Jellycuts bridge opened on port ${result.local}:${port}`);

		outputView.show();
	});

	let stopServer = vscode.commands.registerCommand('jellycuts-support.stopServer', () => {
		logWorking('Jellycuts Bridge Server Closing...');
		server?.close();
		server = undefined;

		logInfo(`Jellycuts bridge closed`);
	});


	context.subscriptions.push(startServer, stopServer);
}

function logError(error: string) {
	vscode.window.showErrorMessage(`❌ ${error}`);
}

function logWorking(info: string) {
	vscode.window.showInformationMessage(`⚙️ ${info}`);
}

function logInfo(info: string) {
	vscode.window.showInformationMessage(`✅ ${info}`);
}

function getDocumentText() {
	if (vscode.window.activeTextEditor !== undefined) {
		let editor = vscode.window.activeTextEditor;
		let text = editor.document.getText();

		console.log(`Text ${text}`);

		return text;
	} else {
		logError("❌ Unable  to get document text. Make sure you have a document loaded.");
		return "";
	}
}

// This method is called when your extension is deactivated
export function deactivate() { }
