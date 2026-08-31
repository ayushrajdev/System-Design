interface Command {
    execute(): void;
    undo(): void;
}

// ------------------------------------
// Receiver
// ------------------------------------

class TextEditor {
    private content = '';

    write(text: string): void {
        this.content += text;

        console.log(`Added: "${text}"`);
    }

    delete(count: number): string {
        const deletedText = this.content.slice(-count);

        this.content = this.content.slice(0, this.content.length - count);

        console.log(`Deleted: "${deletedText}"`);

        return deletedText;
    }

    getContent(): string {
        return this.content;
    }
}

// ------------------------------------
// Concrete Command
// ------------------------------------

class WriteCommand implements Command {
    constructor(
        private editor: TextEditor,
        private text: string,
    ) {}

    execute(): void {
        this.editor.write(this.text);
    }

    undo(): void {
        this.editor.delete(this.text.length);
    }
}

// ------------------------------------
// Invoker / History
// ------------------------------------

class CommandHistory {
    private history: Command[] = [];

    execute(command: Command): void {
        command.execute();

        this.history.push(command);
    }

    undo(): void {
        const command = this.history.pop();

        if (!command) {
            console.log('Nothing to undo');
            return;
        }

        command.undo();
    }
}

// ------------------------------------
// Client
// ------------------------------------

const editor = new TextEditor();

let commandHistory = new CommandHistory();

const writeHello = new WriteCommand(editor, 'Hello');

const writeWorld = new WriteCommand(editor, ' World');


commandHistory.execute(writeHello);

commandHistory.execute(writeWorld);

console.log('Current:', editor.getContent());

commandHistory.undo();

console.log('After first undo:', editor.getContent());

commandHistory.undo();

console.log('After second undo:', editor.getContent());
