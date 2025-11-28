import * as vscode from 'vscode';
import { CodeClipboardPanel } from './panel';

export function activate(context: vscode.ExtensionContext) {

    // Temporary storage in memory.
    const notes: string[] = [];

    // Record command: add note.
    const addNoteCmd = vscode.commands.registerCommand('codeClipboard.addNote', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        const selection = editor.document.getText(editor.selection).trim();
        if (!selection) {
            vscode.window.showInformationMessage("No text selected.");
            return;
        }

        notes.push(selection);
        vscode.window.showInformationMessage(`Added to CodeClipboard: "${selection}"`);

        // Open or refresh the panel automatically.
        CodeClipboardPanel.show(context.extensionUri, notes);
    });

    // Show panel
    const showPanelCmd = vscode.commands.registerCommand('codeClipboard.showPanel', () => {
        CodeClipboardPanel.show(context.extensionUri, notes);
    });

    // Clean notes
    const clearNotesCmd = vscode.commands.registerCommand('codeClipboard.clearNotes', () => {
        notes.length = 0;
        CodeClipboardPanel.refresh(notes);
        vscode.window.showInformationMessage("CodeClipboard clean.");
    });

    context.subscriptions.push(addNoteCmd, showPanelCmd, clearNotesCmd);
}

export function deactivate() {}
