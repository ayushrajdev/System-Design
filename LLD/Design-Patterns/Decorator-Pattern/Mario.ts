// ------------------------------------------------------------------
// 1. Component Interface – defines a common contract for all characters
// ------------------------------------------------------------------
interface Character {
  getAbilities(): string;
}

// ------------------------------------------------------------------
// 2. Concrete Component – basic Mario with no power‑ups
// ------------------------------------------------------------------
class Mario implements Character {
  getAbilities(): string {
    return "Mario";
  }
}

// ------------------------------------------------------------------
// 3. Abstract Decorator – "is‑a" Character and "has‑a" Character
// ------------------------------------------------------------------
abstract class CharacterDecorator implements Character {
  protected character: Character;   // the wrapped component

  constructor(character: Character) {
    this.character = character;
  }

  // Delegates to the wrapped component by default.
  // Subclasses override this to add new behaviour.
  getAbilities(): string {
    return this.character.getAbilities();
  }
}

// ------------------------------------------------------------------
// 4. Concrete Decorators – each adds a specific power‑up
// ------------------------------------------------------------------

// Height‑Increasing power‑up
class HeightUp extends CharacterDecorator {
  constructor(character: Character) {
    super(character);
  }

  getAbilities(): string {
    return this.character.getAbilities() + " with HeightUp";
  }
}

// Gun shooting power‑up
class GunPowerUp extends CharacterDecorator {
  constructor(character: Character) {
    super(character);
  }

  getAbilities(): string {
    return this.character.getAbilities() + " with Gun";
  }
}

// Star power‑up (temporary ability)
class StarPowerUp extends CharacterDecorator {
  constructor(character: Character) {
    super(character);
  }

  getAbilities(): string {
    return this.character.getAbilities() + " with Star Power (Limited Time)";
  }
}

// ------------------------------------------------------------------
// 5. Client code – creates and decorates a Mario character
// ------------------------------------------------------------------
function mainfn(): void {
  // Basic Mario
  let mario: Character = new Mario();
  console.log("Basic Character:", mario.getAbilities());

  // Add HeightUp
  mario = new HeightUp(mario);
  console.log("After HeightUp:", mario.getAbilities());

  // Add Gun
  mario = new GunPowerUp(mario);
  console.log("After GunPowerUp:", mario.getAbilities());

  // Add Star Power
  mario = new StarPowerUp(mario);
  console.log("After StarPowerUp:", mario.getAbilities());
}
