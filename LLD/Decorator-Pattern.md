# Decorator Design Pattern

---

# Table of Contents

1. Core Concept
2. The Problem: Class Explosion
3. The Decorator Solution
4. Key Relationships
5. Implementation — Mario Example
6. Real-World Use Cases
7. Interview Questions

---

# 1. Core Concept

A **structural** pattern that attaches additional responsibilities to an object **dynamically at runtime**, without complex inheritance hierarchies.

```text
Composition over Inheritance
```

You **wrap** an object with decorators instead of subclassing it.

---

# 2. The Problem: Class Explosion

Game example: Mario can gain power-ups.

## Inheritance Approach

```text
Mario
 ├── MarioWithHeight
 ├── MarioWithGun
 ├── MarioWithStar
 ├── MarioWithHeightAndGun
 ├── MarioWithHeightAndStar
 ├── MarioWithGunAndStar
 └── MarioWithHeightGunAndStar
```

Each new feature **doubles** the number of combinations.

```text
3 features  →  7 subclasses
4 features  →  15 subclasses
n features  →  2ⁿ − 1 subclasses
```

Unmanageable, and every combination is fixed at compile time.

---

# 3. The Decorator Solution

Create one small decorator per feature and **stack them** at runtime.

```text
StarPower( GunPower( HeightUp( Mario ) ) )
```

```text
3 features  →  3 decorator classes
4 features  →  4 decorator classes
```

Any combination, in any order, with no new classes.

---

# 4. Key Relationships

## Is-A

The decorator **implements the same interface** as the component.

```text
Decorator IS-A Character
```

So a decorated object can be used anywhere a plain one can, and decorators can wrap other decorators.

## Has-A

The decorator **holds a reference** to the component it wraps.

```text
Decorator HAS-A Character
```

It delegates to the wrapped object, then adds its own behavior before or after.

---

# 5. Implementation — Mario Example

## Structure

```text
        <<interface>>
          Character
              ▲
     ┌────────┴─────────┐
   Mario         CharacterDecorator (abstract)  ◇──> Character
                          ▲
        ┌─────────────────┼──────────────────┐
  HeightUpDecorator  GunPowerDecorator  StarPowerDecorator
```

---

## Step 1: Base Interface

```java
interface Character {
    String getAbilities();
}
```

## Step 2: Concrete Component

```java
class Mario implements Character {
    @Override
    public String getAbilities() {
        return "Mario";
    }
}
```

## Step 3: Abstract Decorator

```java
abstract class CharacterDecorator implements Character {

    protected final Character character;   // HAS-A

    public CharacterDecorator(Character character) {
        this.character = character;
    }
}
```

## Step 4: Concrete Decorators

```java
class HeightUpDecorator extends CharacterDecorator {

    public HeightUpDecorator(Character character) {
        super(character);
    }

    @Override
    public String getAbilities() {
        return character.getAbilities() + " with height up";
    }
}

class GunPowerDecorator extends CharacterDecorator {

    public GunPowerDecorator(Character character) {
        super(character);
    }

    @Override
    public String getAbilities() {
        return character.getAbilities() + " with gun";
    }
}

class StarPowerDecorator extends CharacterDecorator {

    public StarPowerDecorator(Character character) {
        super(character);
    }

    @Override
    public String getAbilities() {
        return character.getAbilities() + " with star power";
    }
}
```

---

## Usage

```java
Character mario = new Mario();
mario = new HeightUpDecorator(mario);
mario = new GunPowerDecorator(mario);
mario = new StarPowerDecorator(mario);

System.out.println(mario.getAbilities());
// Mario with height up with gun with star power
```

## Call Chain

```text
StarPower.getAbilities()
    → calls GunPower.getAbilities()
        → calls HeightUp.getAbilities()
            → calls Mario.getAbilities()  returns "Mario"
        ← appends " with height up"
    ← appends " with gun"
← appends " with star power"
```

Outermost decorator is called first, then delegates inward; results build up on the way back.

---

## Adding a New Power-Up

```java
class FirePowerDecorator extends CharacterDecorator {

    public FirePowerDecorator(Character character) {
        super(character);
    }

    @Override
    public String getAbilities() {
        return character.getAbilities() + " with fire";
    }
}
```

No change to existing classes — **OCP** satisfied.

---

# 6. Real-World Use Cases

| Use Case | How Decorator Is Used |
|----------|----------------------|
| **Text editors** | Wrap text with `Bold`, `Italic`, `Underline` dynamically |
| **Backend validation** | Wrap input with `EmailValidatorDecorator`, `SQLInjectionDecorator`, etc. |
| **Java I/O** | `new BufferedReader(new InputStreamReader(new FileInputStream(f)))` |
| **Logging / caching wrappers** | Add logging or caching around a service without modifying it |

## Java I/O Example

```java
InputStream in = new FileInputStream("data.txt");
in = new BufferedInputStream(in);          // adds buffering
in = new GZIPInputStream(in);              // adds decompression
```

Each wrapper adds one responsibility to the same `InputStream` interface.

## Validation Example

```java
interface Validator {
    boolean validate(String input);
}

class BaseValidator implements Validator {
    public boolean validate(String input) { return input != null; }
}

class EmailValidatorDecorator implements Validator {
    private final Validator wrapped;

    public EmailValidatorDecorator(Validator wrapped) { this.wrapped = wrapped; }

    public boolean validate(String input) {
        return wrapped.validate(input) && input.contains("@");
    }
}

class SQLInjectionDecorator implements Validator {
    private final Validator wrapped;

    public SQLInjectionDecorator(Validator wrapped) { this.wrapped = wrapped; }

    public boolean validate(String input) {
        return wrapped.validate(input) && !input.contains("DROP TABLE");
    }
}
```

```java
Validator v = new SQLInjectionDecorator(
                  new EmailValidatorDecorator(
                      new BaseValidator()));

v.validate("john@gmail.com");   // true
```

---

# 7. Interview Questions

## Q1

What is the Decorator pattern?

**Answer:**

A structural pattern that adds responsibilities to an object dynamically by wrapping it in decorator objects that share the same interface, instead of using subclassing.

---

## Q2

What problem does it solve?

**Answer:**

Class explosion. With inheritance, every combination of features needs its own subclass (2ⁿ − 1 for n features). Decorators need only one class per feature and can be combined freely at runtime.

---

## Q3

Explain the Is-A and Has-A relationships in Decorator.

**Answer:**

Is-A: the decorator implements the same interface as the component, so it can replace it. Has-A: the decorator holds a reference to the wrapped component and delegates to it.

---

## Q4

How does the call chain work when decorators are stacked?

**Answer:**

The outermost decorator's method is called first, which delegates to the next wrapped object, down to the base component. Results are then built up as each decorator adds its behavior on the way back.

---

## Q5

How does Decorator follow OCP?

**Answer:**

New features are added by creating new decorator classes. Existing components and decorators stay unchanged.

---

## Q6

Decorator vs Inheritance?

**Answer:**

Inheritance adds behavior statically at compile time and causes class explosion. Decorator adds behavior dynamically at runtime through composition and allows flexible combinations.

---

## Q7

Why does the abstract decorator implement the interface AND hold a reference to it?

**Answer:**

Implementing the interface lets decorators be used wherever the component is expected (and wrap each other). Holding a reference lets it delegate to the wrapped object.

---

## Q8

Give real-world examples of Decorator.

**Answer:**

Text styling (bold/italic/underline), validator chains, Java I/O streams (`BufferedInputStream`, `GZIPInputStream`), and logging or caching wrappers.

---

## Q9

What are the drawbacks of Decorator?

**Answer:**

Many small classes, harder debugging through long wrapper chains, and order of wrapping can change behavior.

---

## Q10

Decorator vs Strategy?

**Answer:**

Decorator wraps an object to **add** behavior layered on top of it. Strategy **swaps** one algorithm for another inside an object. Decorators stack; strategies are replaced.
