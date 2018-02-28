// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import vscode from 'vscode';
import Timeit from './components/TimeIt';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const timeIt = new Timeit();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let start = vscode.commands.registerCommand('extension.timeitStart', () => {
        timeIt.start();
    });
    let stop = vscode.commands.registerCommand('extension.timeitStop', () => {
        timeIt.stop()
    });
    let pause = vscode.commands.registerCommand('extension.timeitPause', () => {
        timeIt.pause()
    });
    let resume = vscode.commands.registerCommand('extension.timeitResume', () => {
        timeIt.resume()
    });
    let timeAdd = vscode.commands.registerCommand('extension.timeitExtra', () => {
        timeIt.addTime()
    });

    context.subscriptions.push(start);
    context.subscriptions.push(stop);
    context.subscriptions.push(pause);
    context.subscriptions.push(resume);
    context.subscriptions.push(timeAdd);
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    console.log("Timeit extension disabled!");
}
exports.deactivate = deactivate;