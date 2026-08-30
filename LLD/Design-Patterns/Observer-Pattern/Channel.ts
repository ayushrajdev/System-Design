interface ISubscriber {
    update(): void;
}

// Observable interface: a YouTube channel interface
interface IChannel {
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
    notifySubscribers(): void;
}

// Concrete Subject: a YouTube channel that observers can subscribe to
class Channel implements IChannel {
    private subscribers: ISubscriber[] = [];
    private name: string;
    private latestVideo: string = "";

    constructor(name: string) {
        this.name = name;
    }

    public subscribe(subscriber: ISubscriber): void {
        if (!this.subscribers.includes(subscriber)) {
            this.subscribers.push(subscriber);
        }
    }

    public unsubscribe(subscriber: ISubscriber): void {
        this.subscribers = this.subscribers.filter(sub => sub !== subscriber);
    }

    public notifySubscribers(): void {
        for (const sub of this.subscribers) {
            sub.update();
        }
    }

    public uploadVideo(title: string): void {
        this.latestVideo = title;
        console.log(`\n[${this.name} uploaded "${title}"]`);
        this.notifySubscribers();
    }

    public getVideoData(): string {
        return `\nCheckout our new Video : ${this.latestVideo}\n`;
    }
}

// Concrete Observer: represents a subscriber to the channel
class Subscriber implements ISubscriber {
    private name: string;
    private channel: Channel;

    constructor(name: string, channel: Channel) {
        this.name = name;
        this.channel = channel;
    }

    public update(): void {
        console.log(`Hey ${this.name},${this.channel.getVideoData()}`);
    }
}

// Execution / Main Function
function mainFn() {
    // Create a channel and subscribers
    const channel = new Channel("CoderArmy");

    const subs1 = new Subscriber("Varun", channel);
    const subs2 = new Subscriber("Tarun", channel);

    // Varun and Tarun subscribe to CoderArmy
    channel.subscribe(subs1);
    channel.subscribe(subs2);

    // Upload a video: both Varun and Tarun are notified
    channel.uploadVideo("Observer Pattern Tutorial");

    // Varun unsubscribes; Tarun remains subscribed
    channel.unsubscribe(subs1);

    // Upload another video: only Tarun is notified
    channel.uploadVideo("Decorator Pattern Tutorial");
}


