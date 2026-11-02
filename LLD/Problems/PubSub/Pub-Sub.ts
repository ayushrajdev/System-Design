class Producer {
    private clients: Consumer[] = [];
    constructor(public id: number) {}
    emit(data: Record<string, any>) {
        this.clients.forEach((client: Consumer) => {
            client.listen(data);
        });
    }
    addClient(consumer: Consumer) {
        this.clients.push(consumer);
    }
}
class Consumer {
    constructor(
        public id: number,
        public producerId: number,
    ) {}
    listen(data: Record<string, any>) {}
}

function main() {
    const p = new Producer(1);
    const c1 = new Consumer(1, p.id);
    c1.listen = function (data: Record<string, any>) {
        console.log(`calling the listen of C1 with data of `, data);
    };
    const c2 = new Consumer(2, p.id);
    c2.listen = function (data: Record<string, any>) {
        console.log(`calling the listen of C2 with data of `, data);
    };
    console.log(c1, c2);
    p.addClient(c1);
    p.addClient(c2);
    p.emit({ noti: 'user uploaded new video' });
}
main();
// For any topic you ask, I’ll generally explain it in this order:

// Start from a realistic problem — what problem existed before the concept and why we needed a solution.
// Introduce the concept naturally — explain what the pattern/technology actually solves.
// Explain the internal execution chronologically — what happens first, why it happens, what happens next, and how the components interact.
// Build the code from scratch — rather than dropping a large code block without context.
// Explain each important piece of the code — especially why interfaces, classes, methods, dependencies, etc. are designed that way.
// Show the complete working implementation — preferably with a realistic scenario.
// Walk through actual execution — what happens when the program runs and what each method call does internally.
// Compare it with related concepts when useful, such as Decorator vs Proxy, Observer vs Pub/Sub, inheritance vs composition, etc.
// Cover real-world usage — where you'd actually encounter the concept in a backend/system.
// Finish with an interview-ready explanation so you can use the concept confidently in interviews.

// And most importantly, I'll keep connected paragraphs as the primary explanation style, rather than turning everything into short bullet points or diagrams.