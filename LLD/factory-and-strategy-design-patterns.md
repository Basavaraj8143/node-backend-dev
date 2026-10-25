# Factory Design Patterns & Strategy Pattern

---

# Table of Contents

1. The Essence of Factory Patterns
2. Simple Factory
3. Factory Method Pattern
4. Abstract Factory Pattern
5. Strategy Pattern
6. Factory vs Strategy — Key Comparison
7. Quick Revision Summary
8. Interview Questions

---

# 1. The Essence of Factory Patterns

## Core Motivation

Factory patterns implement **decoupling** between:

```text
Business Logic
      ↕  (decoupled)
Object Creation Logic
```

Without factories:

```java
// Client knows about every concrete class
if (type.equals("basic")) {
    burger = new BasicBurger();
} else if (type.equals("standard")) {
    burger = new StandardBurger();
}
// scattered everywhere in client code
```

With factories:

```java
// Client knows nothing about concrete classes
Burger burger = BurgerFactory.create(type);
```

---

## Principles Upheld

### Single Responsibility Principle

Object creation logic lives in one dedicated place — not scattered across client code.

### Open/Closed Principle

Add new object types by adding new factory subclasses, not by modifying existing code.

### Encapsulation of `new`

The client never calls `new ConcreteClass()` directly — the factory handles it.

---

# 2. Simple Factory

## Definition

A dedicated class that creates objects based on a provided type or parameter.

Not an official GoF design pattern — more of a programming idiom.

---

## Mechanism

Uses conditional logic (if-else or switch) to return the correct subclass.

---

## Example: Burger Shop

```java
// Product hierarchy
abstract class Burger {
    public abstract void prepare();
}

class BasicBurger extends Burger {
    public void prepare() {
        System.out.println("Preparing Basic Burger");
    }
}

class StandardBurger extends Burger {
    public void prepare() {
        System.out.println("Preparing Standard Burger");
    }
}

class PremiumBurger extends Burger {
    public void prepare() {
        System.out.println("Preparing Premium Burger");
    }
}
```

```java
// Simple Factory
class BurgerFactory {

    public static Burger create(String type) {
        if (type.equals("basic")) {
            return new BasicBurger();
        } else if (type.equals("standard")) {
            return new StandardBurger();
        } else if (type.equals("premium")) {
            return new PremiumBurger();
        }
        throw new IllegalArgumentException("Unknown burger type: " + type);
    }
}
```

```java
// Client code
Burger burger = BurgerFactory.create("standard");
burger.prepare();
```

---

## Flow

```text
Client
   ↓
BurgerFactory.create("premium")
   ↓
if-else / switch
   ↓
new PremiumBurger()
   ↓
returns Burger (abstract type)
```

---

## Limitation

Adding a new burger type requires **modifying** `BurgerFactory` — violates OCP.

This is why Factory Method exists.

---

# 3. Factory Method Pattern

## Definition

Defines an interface for creating an object, but allows **subclasses to decide which class to instantiate**.

The factory itself becomes an abstract class or interface.

---

## Difference from Simple Factory

| | Simple Factory | Factory Method |
|--|----------------|----------------|
| Factory type | Concrete class | Abstract class / Interface |
| Polymorphism | No | Yes |
| OCP compliance | No | Yes |
| Extensibility | Modify existing | Add new subclass |

---

## Example: Franchise Model

```java
// Product hierarchy
abstract class Burger {
    public abstract void prepare();
}

class NormalBurger extends Burger {
    public void prepare() {
        System.out.println("Preparing Normal Burger");
    }
}

class WheatBurger extends Burger {
    public void prepare() {
        System.out.println("Preparing Wheat Burger");
    }
}
```

```java
// Abstract Factory (interface)
interface BurgerFactory {
    Burger createBurger();
}
```

```java
// Concrete Factory 1
class SinkBurger implements BurgerFactory {
    @Override
    public Burger createBurger() {
        return new NormalBurger();
    }
}

// Concrete Factory 2
class KingBurger implements BurgerFactory {
    @Override
    public Burger createBurger() {
        return new WheatBurger();
    }
}
```

```java
// Client code — chooses factory at runtime
BurgerFactory factory = new KingBurger();
Burger burger = factory.createBurger();
burger.prepare();
```

---

## Flow

```text
Client selects factory at runtime
          ↓
   BurgerFactory (interface)
     ↙           ↘
SinkBurger    KingBurger
     ↓               ↓
NormalBurger    WheatBurger
```

---

## Adding a New Franchise

```java
// New factory — zero changes to existing code
class HealthBurger implements BurgerFactory {
    @Override
    public Burger createBurger() {
        return new VeganBurger();
    }
}
```

OCP satisfied — extend by addition, not modification.

---

# 4. Abstract Factory Pattern

## Definition

Provides an interface for creating **families of related or dependent objects** without specifying their concrete classes.

One factory manages **multiple product types**.

---

## Core Concept

```text
AbstractFactory
      ↓
createBurger()   +   createGarlicBread()
```

Products from the same factory are **guaranteed compatible**.

---

## Example: Meal Factory

```java
// Product families
abstract class Burger {
    public abstract void prepare();
}

abstract class GarlicBread {
    public abstract void bake();
}
```

```java
class NormalBurger extends Burger {
    public void prepare() {
        System.out.println("Normal Burger ready");
    }
}

class WheatBurger extends Burger {
    public void prepare() {
        System.out.println("Wheat Burger ready");
    }
}

class NormalGarlicBread extends GarlicBread {
    public void bake() {
        System.out.println("Normal Garlic Bread baked");
    }
}

class WheatGarlicBread extends GarlicBread {
    public void bake() {
        System.out.println("Wheat Garlic Bread baked");
    }
}
```

```java
// Abstract Factory interface
interface MealFactory {
    Burger createBurger();
    GarlicBread createGarlicBread();
}
```

```java
// Concrete Factory 1 — Normal family
class SinkMealFactory implements MealFactory {
    @Override
    public Burger createBurger() {
        return new NormalBurger();
    }

    @Override
    public GarlicBread createGarlicBread() {
        return new NormalGarlicBread();
    }
}

// Concrete Factory 2 — Wheat family
class KingMealFactory implements MealFactory {
    @Override
    public Burger createBurger() {
        return new WheatBurger();
    }

    @Override
    public GarlicBread createGarlicBread() {
        return new WheatGarlicBread();
    }
}
```

```java
// Client code
MealFactory factory = new KingMealFactory();
Burger burger = factory.createBurger();
GarlicBread bread = factory.createGarlicBread();
burger.prepare();
bread.bake();
// Guaranteed: both are Wheat variant — compatible family
```

---

## Flow

```text
Client picks factory
         ↓
   MealFactory (interface)
    ↙              ↘
SinkMealFactory   KingMealFactory
  ↓        ↓        ↓          ↓
Normal   Normal   Wheat      Wheat
Burger   Bread    Burger     Bread
(same family — always compatible)
```

---

## Key Advantage

Without Abstract Factory:

```text
Client picks NormalBurger + WheatGarlicBread
→ Incompatible products
→ Inconsistent experience
```

With Abstract Factory:

```text
Client picks KingMealFactory
→ Gets WheatBurger + WheatGarlicBread
→ Always a compatible family
```

---

# 5. Strategy Pattern

## Definition

Defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime.

Focus: **behavioral variation**, not object creation.

---

## Example: Robot with Interchangeable Behaviors

```java
// Strategy interfaces
interface Talkable {
    void talk();
}

interface Walkable {
    void walk();
}

interface Flyable {
    void fly();
}
```

```java
// Concrete strategies
class NormalTalk implements Talkable {
    public void talk() {
        System.out.println("Robot talking normally");
    }
}

class RobotWalk implements Walkable {
    public void walk() {
        System.out.println("Robot walking on two legs");
    }
}

class JetFly implements Flyable {
    public void fly() {
        System.out.println("Robot flying with jet pack");
    }
}
```

```java
// Robot — behavior injected at runtime (Dependency Injection)
class Robot {
    private Talkable talkStrategy;
    private Walkable walkStrategy;
    private Flyable flyStrategy;

    public Robot(Talkable t, Walkable w, Flyable f) {
        this.talkStrategy = t;
        this.walkStrategy = w;
        this.flyStrategy = f;
    }

    public void talk() { talkStrategy.talk(); }
    public void walk() { walkStrategy.walk(); }
    public void fly()  { flyStrategy.fly();  }
}
```

```java
// Client code
Robot robot = new Robot(
    new NormalTalk(),
    new RobotWalk(),
    new JetFly()
);

robot.talk();
robot.walk();
robot.fly();
```

---

## Key Points

### Composition over Inheritance

Robot doesn't extend a `TalkingRobot` or `FlyingRobot`.

It holds strategy objects — behaviors are plugged in.

---

### Dependency Injection

Strategies are passed via constructor — Robot doesn't create them.

```text
Robot doesn't know HOW to talk
      ↓
It delegates to talkStrategy.talk()
```

---

### Swapping Behavior at Runtime

```java
robot = new Robot(
    new SilentTalk(),   // swap strategy
    new RobotWalk(),
    new JetFly()
);
```

No change to `Robot` class itself.

---

# 6. Factory vs Strategy — Key Comparison

## Common Confusion

Both use interfaces.

Both promote decoupling.

But they solve **different problems**.

---

## The Distinction

| | Factory Pattern | Strategy Pattern |
|--|----------------|-----------------|
| Focus | **Object creation** | **Behavioral variation** |
| Question answered | Which object to create? | Which algorithm to use? |
| When used | Instantiation logic is complex | Behavior needs to change at runtime |
| Objects involved | Produces new objects | Works with already-created objects |

---

## They Work Together

```text
Strategy Pattern
      ↓
Robot needs a Talkable strategy object
      ↓
Who creates it?
      ↓
Factory Pattern
      ↓
StrategyFactory.create("normal") → new NormalTalk()
```

Factory creates the strategies.

Strategy uses them.

---

## Flow

```text
Factory Pattern
      ↓
Creates the right strategy object
      ↓
Strategy Pattern
      ↓
Injects it into Robot
      ↓
Robot delegates behavior to it
```

---

# 7. Quick Revision Summary

## Three Factory Variants

| Pattern | What it does | Key Structure |
|---------|-------------|---------------|
| Simple Factory | Creates objects via if-else | One concrete factory class |
| Factory Method | Subclasses decide what to create | Abstract factory + concrete subclasses |
| Abstract Factory | Creates families of related objects | Interface with multiple create methods |

## When to Use Which

```text
Need to centralize creation of one product type
      → Simple Factory

Need OCP + polymorphic creation of one product
      → Factory Method

Need to create compatible families of products
      → Abstract Factory

Need to swap behavior at runtime
      → Strategy Pattern
```

---

# 8. Interview Questions

## Q1

What is the primary motivation for using Factory patterns?

**Answer:**

To decouple business logic from object creation logic. The client never calls `new ConcreteClass()` directly — the factory centralizes instantiation and shields the client from concrete class details.

---

## Q2

What is the difference between Simple Factory and Factory Method?

**Answer:**

Simple Factory is a single concrete class using if-else to return objects — violates OCP since adding types requires modifying it. Factory Method makes the factory itself abstract — new product types are added by creating new factory subclasses, satisfying OCP.

---

## Q3

What is the Factory Method Pattern?

**Answer:**

Defines an interface for object creation but lets subclasses decide which class to instantiate. Introduces polymorphism to the creation process — each concrete factory subclass creates a specific product type.

---

## Q4

What problem does Abstract Factory solve that Factory Method doesn't?

**Answer:**

Abstract Factory creates **families of related objects** and guarantees they are compatible. Factory Method handles one product type. If you need a Burger and GarlicBread that must both be the "Wheat" variant, Abstract Factory ensures that consistency.

---

## Q5

What is the Strategy Pattern?

**Answer:**

Defines a family of interchangeable algorithms, encapsulates each one, and allows them to be swapped at runtime. It focuses on behavioral variation, not object creation.

---

## Q6

How does Dependency Injection relate to the Strategy Pattern?

**Answer:**

Strategies are passed into the object via constructor or setter rather than being created inside it. The object delegates behavior to the injected strategy — it doesn't know how the behavior works, just that it can call it.

---

## Q7

What is the key difference between Factory Pattern and Strategy Pattern?

**Answer:**

Factory focuses on **object creation** — which instance to create. Strategy focuses on **behavioral variation** — which algorithm to use at runtime. Factory creates objects; Strategy changes what those objects do.

---

## Q8

How do Factory and Strategy patterns complement each other?

**Answer:**

Strategy assumes strategy objects are already created. Factory handles how those strategy objects are created. Combined: Factory creates the right strategy, which is then injected into the class that uses it.

---

## Q9

How does the Factory Method Pattern follow OCP?

**Answer:**

Adding a new product type means creating a new factory subclass — zero changes to existing factories or client code. The abstraction (factory interface) stays closed for modification; new behavior is added through extension.

---

## Q10

What is Composition over Inheritance in the context of Strategy?

**Answer:**

Instead of creating subclasses like `FlyingRobot` or `TalkingRobot`, the `Robot` class holds strategy objects as fields. Behaviors are plugged in dynamically rather than baked into a rigid inheritance hierarchy.

---

## Q11

Why would you use Abstract Factory in a UI theming system?

**Answer:**

A `LightThemeFactory` would create `LightButton`, `LightTextField`, etc., while a `DarkThemeFactory` creates `DarkButton`, `DarkTextField`. The client picks one factory and gets a fully compatible set of UI components — no mixing light buttons with dark text fields.

---

## Q12

What SOLID principles do Factory patterns uphold?

**Answer:**

Single Responsibility (creation logic in one place), Open/Closed (add new types via new classes), and Dependency Inversion (client depends on abstract factory interface, not concrete classes).
