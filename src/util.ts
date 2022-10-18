import * as vscode from 'vscode';
import { spawn, exec } from 'child_process';
import { tmpdir } from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import i18n from './i18n/index';

let locale = i18n();

function editorEdit(selection: vscode.Selection | vscode.Position | undefined | null, text: string) :Promise<boolean> {
    return new Promise((resolve, reject) => {
        vscode.window.activeTextEditor?.edit(editBuilder => {
            if(selection) {
                editBuilder.replace(selection, text);
            }
        }).then(resolve);
    });
}

function insertToEnd(text: string) :Promise<boolean> {
    return new Promise((resolve, reject) => {
        let linenumber = vscode.window.activeTextEditor?.document.lineCount || 1;
        let pos = vscode.window.activeTextEditor?.document.lineAt(linenumber - 1).range.end || new vscode.Position(0, 0);
        vscode.window.activeTextEditor?.edit(editBuilder => {
            editBuilder.insert(pos, text);
        }).then(resolve);
    });
}

function getTmpFolder(savePath:string) {
    if (!fs.existsSync(savePath)) { fs.mkdirSync(savePath); }
    return savePath;
}

function getPasteImage(imagePath: string) : Promise<string[]>{
    return new Promise((resolve, reject) => {
        if (!imagePath) { return; }

        let platform = process.platform;
        if (platform === 'win32') {
            // Windows
            const scriptPath = path.join(__dirname, '..', '..' , 'asserts/pc.ps1');

            let command = "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
            let powershellExisted = fs.existsSync(command);
            let output = '';
            if (!powershellExisted) {
                command = "powershell";
            }

            const powershell = spawn(command, [
                '-noprofile',
                '-noninteractive',
                '-nologo',
                '-sta',
                '-executionpolicy', 'unrestricted',
                '-windowstyle', 'hidden',
                '-file', scriptPath,
                imagePath
            ]);
            // the powershell can't auto exit in windows 7 .
            let timer = setTimeout(() => powershell.kill(), 2000);

            powershell.on('error', (e: any) => {
                if (e.code === 'ENOENT') {
                    vscode.window.showErrorMessage(locale['powershell_not_found']);
                } else {
                    vscode.window.showErrorMessage(e);
                }
            });

            powershell.on('exit', function (code, signal) {
                // console.debug('exit', code, signal);
            });
            powershell.stdout.on('data', (data) => {
                data.toString().split('\n').forEach((d: string | string[]) => output += (d.indexOf('Active code page:') < 0 ? d + '\n' : ''));
                clearTimeout(timer);
                timer = setTimeout(() => powershell.kill(), 2000);
            });
            powershell.on('close', (code) => {
                resolve(output.trim().split('\n').map(i => i.trim()));
            });
        }
        else if (platform === 'darwin') {
            console.log('mac...',__dirname);
            
            // Mac
            let scriptPath = path.join(__dirname, '..', 'asserts/mac.applescript');
            console.log('scriptPath...',scriptPath);
            console.log('imagePath',imagePath);
            
            let ascript = spawn('osascript', [scriptPath, imagePath]);
            ascript.on('error', (e: any) => {
                vscode.window.showErrorMessage(e);
            });
            ascript.on('exit', (code, signal) => {
                // console.debug('exit', code, signal);
            });
            ascript.stdout.on('data', (data) => {
                console.log('data',data);
                resolve(data.toString().trim().split('\n'));
            });
        } else {
            // Linux

            let scriptPath = path.join(__dirname, '..', '..' , 'asserts/linux.sh');

            let ascript = spawn('sh', [scriptPath, imagePath]);
            ascript.on('error', (e: any) => {
                vscode.window.showErrorMessage(e);
            });
            ascript.on('exit', (code, signal) => {
                // console.debug('exit',code,signal);
            });
            ascript.stdout.on('data', (data) => {
                let result = data.toString().trim();
                if (result === "no xclip") {
                    vscode.window.showInformationMessage(locale['install_xclip']);
                    return;
                }
                let match = decodeURI(result).trim().match(/((\/[^\/]+)+\/[^\/]*?\.(jpg|jpeg|gif|bmp|png))/g);
                resolve(match || []);
            });
        }
    });
}

export default {
    editorEdit,
    insertToEnd,
    getTmpFolder,
    getPasteImage
};