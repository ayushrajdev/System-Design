// Favor Composition over Inheritance: Instead of inheriting behaviors through subclassing, the Robot class uses composition ("has-a" relationship) by storing references to separate behavior objects (walkBehavior, talkBehavior, flyBehavior).

// Encapsulate What Varies: The behaviors that vary across robot models (walking, talking, and flying) are separated from the main Robot class into dedicated strategy interfaces.

// Program to Interfaces, Not Implementations: The Robot class declares fields of interface types (WalkableRobot, TalkableRobot, FlyableRobot) rather than concrete classes like NormalWalk or NoFly, enabling loose coupling and easy swapping.

// Single Responsibility Principle (SRP): Each strategy class (e.g., NormalTalk, NoWalk) has a single responsibility—handling one specific execution of a behavior.

// Open/Closed Principle (OCP): You can introduce new movement or speech behaviors (e.g., creating a SuperSonicFly class) without altering any existing Robot or strategy code.




// --- Strategy Interfaces ---
interface WalkableRobot {
    walk(): void;
}

interface TalkableRobot {
    talk(): void;
}

interface FlyableRobot {
    fly(): void;
}

// --- Concrete Strategies for Walk ---
class NormalWalk implements WalkableRobot {
    walk(): void {
        console.log('Walking normally...');
    }
}

class NoWalk implements WalkableRobot {
    walk(): void {
        console.log('Cannot walk.');
    }
}

// --- Concrete Strategies for Talk ---
class NormalTalk implements TalkableRobot {
    talk(): void {
        console.log('Talking normally...');
    }
}

class NoTalk implements TalkableRobot {
    talk(): void {
        console.log('Cannot talk.');
    }
}

// --- Concrete Strategies for Fly ---
class NormalFly implements FlyableRobot {
    fly(): void {
        console.log('Flying normally...');
    }
}

class NoFly implements FlyableRobot {
    fly(): void {
        console.log('Cannot fly.');
    }
}

// --- Robot Base Class ---
abstract class Robot {
    constructor(
        protected walkBehavior: WalkableRobot,
        protected talkBehavior: TalkableRobot,
        protected flyBehavior: FlyableRobot,
    ) {}

    walk(): void {
        this.walkBehavior.walk();
    }

    talk(): void {
        this.talkBehavior.talk();
    }

    fly(): void {
        this.flyBehavior.fly();
    }

    abstract projection(): void;
}

// --- Concrete Robot Types ---
class CompanionRobot extends Robot {
    constructor(w: WalkableRobot, t: TalkableRobot, f: FlyableRobot) {
        super(w, t, f);
    }

    projection(): void {
        console.log('Displaying friendly companion features...');
    }
}

class WorkerRobot extends Robot {
    constructor(w: WalkableRobot, t: TalkableRobot, f: FlyableRobot) {
        super(w, t, f);
    }

    projection(): void {
        console.log('Displaying worker efficiency stats...');
    }
}

// --- Execution ---
const robot1: Robot = new CompanionRobot(
    new NormalWalk(),
    new NormalTalk(),
    new NoFly(),
);
robot1.walk();
robot1.talk();
robot1.fly();
robot1.projection();

console.log('--------------------');

const robot2: Robot = new WorkerRobot(
    new NoWalk(),
    new NoTalk(),
    new NormalFly(),
);
robot2.walk();
robot2.talk();
robot2.fly();
robot2.projection();
