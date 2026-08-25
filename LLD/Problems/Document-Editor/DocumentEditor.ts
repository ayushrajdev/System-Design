class DocumentElement {
    public content: string[] = [];
    render() {
        console.table(this.content);
    }
}
// class TextElement {
//     /**
//      *
//      */
//     constructor(public document: DocumentElement) {
//         this.document = document;
//     }
//     addText(content: string) {
//         this.document.content.push(content);
//     }
// }
// class ImageElement {
//     /**
//      *
//      */
//     constructor(public document: DocumentElement) {
//         this.document = document;
//     }
//     addImage(content: string) {
//         this.document.content.push(content);
//     }
// }

interface ImageElement {
    addImage(content: string): void;
}
interface TextElement {
    addText(content: string): void;
}
interface LineBreak {
    addLineBreak(): void;
}
interface TabSapce {
    addTabSpace(): void;
}
interface DbStorage {
    save(document: string[]): void;
}

class MongodbStorage implements DbStorage {
    save(document: string[]): void {
        console.log('saving the document to mongodb', document);
    }
}
class SqlStorage implements DbStorage {
    save(document: string[]): void {
        console.log('saving the document to mongodb', document);
    }
}

class DocumentEditor implements LineBreak, TabSapce, ImageElement, TextElement {
    document: DocumentElement;
    constructor(document: DocumentElement) {
        this.document = document;
    }
    addImage(content: string) {
        this.document.content.push(content);
    }
    addLineBreak() {
        this.document.content.push('\n');
    }
    addTabSpace() {
        this.document.content.push('\t');
    }
    addText(content: string) {
        this.document.content.push(content);
    }
}

function main() {
    const mongodb = new MongodbStorage()
    const sql = new SqlStorage()
    const doc = new DocumentElement();
    const editor = new DocumentEditor(doc);
    editor.addImage('image.png');
    editor.addLineBreak();
    editor.addText('hello world');
    editor.addTabSpace();
    editor.addTabSpace();
    editor.addText('google docs');
    editor.addLineBreak();
    mongodb.save(doc.content)
    sql.save(doc.content)
    doc.render();
}

main();
