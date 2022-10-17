// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import utils from './util';
import { imageSize } from 'image-size';
import * as path from 'path';

const child = require("child_process");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "shell-pic-bed" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('shell-pic-bed.helloWorld', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user

		// 获取总配置
		const props = vscode.workspace.getConfiguration("shellPicBed");

		// 获取本地照片存放的路径配置
		let localImagePath: any = props.get("pic-local-path");
		if (localImagePath === null || localImagePath === '') {
			vscode.window.showErrorMessage('请配置照片的本地存储路径，pic-local-path');
			return;
		}

		// 获取本地照片存放的路径配置
		let sshKey: any = props.get("ssh-key");
		if (localImagePath === null || localImagePath === '') {
			vscode.window.showErrorMessage('请配置照片的本地存储路径，pic-local-path');
			return;
		}

		// 获取本地照片存放的路径配置
		let user: any = props.get("server-user");
		console.log('user',user);
		
		if (localImagePath === null || localImagePath === '') {
			vscode.window.showErrorMessage('请配置照片的本地存储路径，pic-local-path');
			return;
		}

		// 获取本地照片存放的路径配置
		let serverImagePath: any = props.get("server-storage-path");
		if (localImagePath === null || localImagePath === '') {
			vscode.window.showErrorMessage('请配置照片的本地存储路径，pic-local-path');
			return;
		}

		// 获取本地照片存放的路径配置
		let serverDoamin: any = props.get("server-domain");
		if (localImagePath === null || localImagePath === '') {
			vscode.window.showErrorMessage('请配置照片的本地存储路径，pic-local-path');
			return;
		}

		// 获取本地照片存放的路径配置
		let accessImagePort: any = props.get("access-image-port");
		if (localImagePath === null || localImagePath === '') {
			vscode.window.showErrorMessage('请配置照片的本地存储路径，pic-local-path');
			return;
		}

		// 获取本地照片存放的路径配置
		let accessImagePath: any = props.get("access-image-url");
		if (localImagePath === null || localImagePath === '') {
			vscode.window.showErrorMessage('请配置照片的本地存储路径，pic-local-path');
			return;
		}

		// 确定本地照片路径
		let savePath = utils.getTmpFolder(localImagePath);
		// 创建图片名称
		savePath = path.resolve(savePath, `pic_${new Date().getTime()}_shell_pic_bed.png`);
		// 调用系统底层获取照片
		let images = await utils.getPasteImage(savePath);
		// 图片过滤
		images = images.filter(img => ['.jpg', '.jpeg', '.gif', '.bmp', '.png', '.webp', '.svg'].find(ext => img.endsWith(ext)));
		// 将全部照片拼合起来，格式如 a.png b.png
		const allImagePath = images.join(' ');

		// 执行shell脚本（scp）进行图片上传
		const shellPath = path.join(__dirname, '..', 'asserts/uploadPic.sh');
		await child.exec(`${shellPath} ${sshKey} ${user} ${serverDoamin} ${serverDoamin.replace('http://','').replace('https://','')} ${serverImagePath}  ${accessImagePort} ${accessImagePath}  ${allImagePath}`, function (err: any, sto: any) {
			console.log(sto);
			
			// 对shell脚本的输出结果进行截取
			let imageHttpPaths: string[] = sto.substring(sto.indexOf("Upload Success:") + "Upload Success:".length).split("\n");
			// 过滤，保留url
			imageHttpPaths = imageHttpPaths
				.filter(httpPath => httpPath !== '' && httpPath !== null)
				.map(httpPath => {
					return `![pic](${httpPath})`
				});

			console.log("finish", imageHttpPaths);

			// 如果有结果就将内容添加到markdown中
			if (imageHttpPaths.length > 0) {
				utils.insertToEnd(imageHttpPaths.length > 1 ? imageHttpPaths.join("\n") : imageHttpPaths[0])
			}
			vscode.window.showInformationMessage(sto);
		})
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
