"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const util_1 = require("./util");
const child = require("child_process");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "shell-pic-bed" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('shell-pic-bed.helloWorld', async () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        let images = await util_1.default.getPasteImage('/Users/mawen/Desktop/markdown/images/test.png');
        console.log(images);
        child.exec('/Users/mawen/Desktop/foo.sh', function (err, sto) {
            console.log(err);
            console.log(sto);
            vscode.window.showInformationMessage(err);
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map