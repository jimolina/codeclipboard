const vscode = acquireVsCodeApi();

const notesUl = document.getElementById("notes");
const copyAllBtn = document.getElementById("copyAll");
const clearBtn = document.getElementById("clear");

// Listen to messages from the host extension.
window.addEventListener("message", event => {
    const { type, notes } = event.data;

    if (type === "update") {
        notesUl.innerHTML = ""; // Clean list

        notes.forEach(note => {
            const li = document.createElement("li");

            // Display code without interpreting it
            const pre = document.createElement("pre");
            pre.textContent = note;

            li.appendChild(pre);
            notesUl.appendChild(li);
        });
    }
});

// Button Copy All
copyAllBtn.addEventListener("click", () => {
    vscode.postMessage({ type: "copyAll" });
});

// Button Clear
clearBtn.addEventListener("click", () => {
    vscode.postMessage({ type: "clear" });
});
