import * as vscode from 'vscode';

export class CodeClipboardPanel {
    public static currentPanel: CodeClipboardPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _notes: string[];

    static show(extensionUri: vscode.Uri, notes: string[]) {
        if (CodeClipboardPanel.currentPanel) {
            CodeClipboardPanel.currentPanel._notes = notes;
            CodeClipboardPanel.currentPanel.update();
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            "codeClipboardPanel",
            "CodeClipboard",
            vscode.ViewColumn.Beside,
            { enableScripts: true }
        );

        panel.iconPath = vscode.Uri.joinPath(extensionUri, "media", "code-clipboard-vsc-icon.svg");

        CodeClipboardPanel.currentPanel = new CodeClipboardPanel(panel, extensionUri, notes);
    }

    static refresh(notes: string[]) {
        if (CodeClipboardPanel.currentPanel) {
            CodeClipboardPanel.currentPanel._notes = notes;
            CodeClipboardPanel.currentPanel.update();
        }
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, notes: string[]) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._notes = notes;

        this._panel.webview.html = this.getHtml();

        // Receive messages from the webview
        this._panel.webview.onDidReceiveMessage(msg => {
            if (msg.type === 'copyAll') {
                vscode.env.clipboard.writeText(this._notes.join('\n'));
                vscode.window.showInformationMessage("Copied everything to the clipboard.");
            }
            if (msg.type === 'clear') {
                this._notes.length = 0;
                this.update();
            }
        });

        // Call update immediately so that the WebView receives the notes.
        this.update();

        // Clear reference on close
        this._panel.onDidDispose(() => {
            CodeClipboardPanel.currentPanel = undefined;
        });
    }

    private update() {
        this._panel.webview.postMessage({
            type: 'update',
            notes: this._notes
        });
    }

    private getHtml(): string {
        const scriptUri = this._panel.webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "panel.js")
        );

        const styleUri = this._panel.webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "panel.css")
        );

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <link rel="stylesheet" href="${styleUri}">
                <title>CodeClipboard</title>
            </head>
            <body>
                <h2>CodeClipboard</h2>
                <button id="copyAll">Copy All</button>
                <button id="clear">Clear</button>
                <ul id="notes"></ul>
                <script src="${scriptUri}"></script>
            </body>
            </html>
        `;
    }
}
