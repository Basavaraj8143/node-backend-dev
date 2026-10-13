# SOLID Design Principles — LSP, ISP & DIP

---

# Table of Contents

1. Liskov Substitution Principle (LSP) — Deep Dive
   - Signature Rules
   - Property Rules
   - Method Rules
2. Interface Segregation Principle (ISP)
3. Dependency Inversion Principle (DIP)
4. Quick Revision Summary
5. Interview Questions

---

# 1. Liskov Substitution Principle (LSP) — Deep Dive

## Recap

> Subclasses must be fully substitutable for their base classes without breaking program correctness.

LSP has three categories of rules to prevent violations.

---

## 1.1 Signature Rules

These govern how method signatures must be defined in child classes.

---

### Rule 1: Method Argument Rule

Child class method arguments must be the **same or broader** than the parent.

```java
class Parent {
    public void process(String input) { }
}

class Child extends Parent {
    // CORRECT — same type
    @Override
    public void process(String input) { }

    // CORRECT — broader type (Object is broader than String)
    public void process(Object input) { }

    // VIOLATION — narrower type (Integer is narrower than String)
    // public void process(Integer input) { }
}
```

Why: Client code passes a `String` expecting it to work. If the child demands a narrower type, the substitution breaks.

---

### Rule 2: Return Type Rule

Child class return types must be the **same or narrower** (covariant) than the parent.

```java
class Animal { }
class Dog extends Animal { }

class Parent {
    public Animal getAnimal() {
        return new Animal();
    }
}

class Child extends Parent {
    // CORRECT — narrower (covariant return type)
    @Override
    public Dog getAnimal() {
        return new Dog();
    }
}
```

Why: Client code expects an `Animal`. Getting a `Dog` (a subtype) is safe. Getting something broader would break expectations.

---

### Rule 3: Exception Rule

Child methods should only throw exceptions that are **same or narrower** than those in the parent.

```java
class Parent {
    public void execute() throws IOException { }
}

class Child extends Parent {

    // CORRECT — same exception
    @Override
    public void execute() throws IOException { }

    // CORRECT — narrower (FileNotFoundException is a subtype of IOException)
    @Override
    public void execute() throws FileNotFoundException { }

    // VIOLATION — broader exception
    // public void execute() throws Exception { }
}
```

Why: Client code catches `IOException`. If the child throws a broader `Exception`, the catch block misses it — runtime crash.

---

## 1.2 Property Rules

These govern how an object's state must behave in child classes.

---

### Rule 4: Class Invariant

Rules defined in the parent class must be **preserved** in all child classes.

Example:

Parent invariant: "balance cannot be negative."

```java
class BankAccount {
    protected double balance;

    public void withdraw(double amount) {
        if (balance - amount < 0) {
            throw new IllegalArgumentException("Insufficient funds");
        }
        balance -= amount;
    }
}

class SavingsAccount extends BankAccount {

    // CORRECT — preserves the invariant
    @Override
    public void withdraw(double amount) {
        if (balance - amount < 0) {
            throw new IllegalArgumentException("Insufficient funds");
        }
        balance -= amount;
    }

    // VIOLATION — breaks the invariant (allows negative balance)
    // public void withdraw(double amount) {
    //     balance -= amount;
    // }
}
```

---

### Rule 5: History Constraint

Once an immutable property is defined in the parent, the child **cannot weaken or change it**.

Example:

Parent defines a fixed account creation date (immutable after creation).

```java
class Account {
    private final String createdAt;

    public Account(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getCreatedAt() {
        return createdAt;
    }
}
```

A child class must not allow `createdAt` to be modified — doing so violates the history constraint.

---

## 1.3 Method Rules

These govern pre-conditions and post-conditions of methods.

---

### Rule 6: Pre-conditions Must Not Be Strengthened

The child cannot demand more from the caller than the parent does.

```java
class Parent {
    // Pre-condition: amount > 0
    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException();
        // ...
    }
}

class Child extends Parent {
    // VIOLATION — stronger pre-condition (amount > 100)
    @Override
    public void deposit(double amount) {
        if (amount <= 100) throw new IllegalArgumentException();
        // ...
    }
}
```

Client code passes `50` — it satisfies parent's rule but crashes in child.

---

### Rule 7: Post-conditions Must Not Be Weakened

The child must guarantee at least what the parent promised.

```java
class Parent {
    // Post-condition: returns list with at least 1 item
    public List<String> getItems() {
        return List.of("item1");
    }
}

class Child extends Parent {
    // VIOLATION — weaker post-condition (can return empty list)
    @Override
    public List<String> getItems() {
        return new ArrayList<>();
    }
}
```

Client code relies on the list having items — child breaks that guarantee.

---

# 2. Interface Segregation Principle (ISP)

## Concept

> Many client-specific interfaces are better than one general-purpose interface.

Don't force a class to implement methods it doesn't need.

---

## Violation Example

A single `Shape` interface with both 2D and 3D methods:

```java
interface Shape {
    double area();
    double volume();  // 2D shapes don't have volume!
}

class Square implements Shape {
    public double area() {
        return side * side;
    }

    // FORCED to implement — makes no sense for a 2D shape
    public double volume() {
        throw new UnsupportedOperationException("Square has no volume");
    }
}
```

`Square` is forced to implement `volume()` which is meaningless for it.

---

## Resolution

Split into client-specific interfaces:

```java
interface TwoDShape {
    double area();
}

interface ThreeDShape {
    double area();
    double volume();
}

class Square implements TwoDShape {
    private double side;

    public Square(double side) {
        this.side = side;
    }

    @Override
    public double area() {
        return side * side;
    }
}

class Cube implements ThreeDShape {
    private double side;

    public Cube(double side) {
        this.side = side;
    }

    @Override
    public double area() {
        return 6 * side * side;
    }

    @Override
    public double volume() {
        return side * side * side;
    }
}
```

Each class implements **only** what is relevant to it.

---

## ISP Flow

```text
Before ISP
Shape (area + volume)
      ↓
Square → forced to implement volume()
              ↓
       UnsupportedOperationException

After ISP
TwoDShape  (area only)   → Square implements this
ThreeDShape (area + volume) → Cube implements this
              ↓
       No forced methods
```

---

## Benefits

- No dummy or exception-throwing method implementations
- Interfaces stay focused and meaningful
- Easier to understand and test
- Changes to 3D logic don't affect 2D classes

---

# 3. Dependency Inversion Principle (DIP)

## Concept

> High-level modules should depend on **abstractions (interfaces)**, not on low-level modules.

Both high-level and low-level modules should depend on abstractions.

---

## Violation Example

`UserService` (high-level) directly depends on `MySQLDatabase` (low-level):

```java
class MySQLDatabase {
    public void save(String data) {
        System.out.println("Saving to MySQL: " + data);
    }
}

class UserService {
    private MySQLDatabase db = new MySQLDatabase();  // tightly coupled

    public void createUser(String name) {
        db.save(name);
    }
}
```

Problem:

```text
Switching to MongoDB
      ↓
Modify UserService
      ↓
Risk breaking business logic
```

---

## Resolution

Introduce a `Persistence` abstraction:

```java
// Abstraction
interface Persistence {
    void save(String data);
}

// Low-level module 1
class MySQLDatabase implements Persistence {
    @Override
    public void save(String data) {
        System.out.println("Saving to MySQL: " + data);
    }
}

// Low-level module 2
class MongoDB implements Persistence {
    @Override
    public void save(String data) {
        System.out.println("Saving to MongoDB: " + data);
    }
}

// High-level module — depends on abstraction, not concrete class
class UserService {
    private Persistence db;

    // Dependency injected from outside
    public UserService(Persistence db) {
        this.db = db;
    }

    public void createUser(String name) {
        db.save(name);
    }
}
```

Usage:

```java
Persistence db = new MongoDB();
UserService service = new UserService(db);
service.createUser("John");

// Swap to MySQL — zero changes to UserService
Persistence db2 = new MySQLDatabase();
UserService service2 = new UserService(db2);
```

---

## DIP Flow

```text
Before DIP
UserService → MySQLDatabase (hardcoded)
      ↓
Swap DB = modify UserService = risk

After DIP
UserService → Persistence (interface)
                   ↑
          MySQLDatabase  |  MongoDB
      ↓
Swap DB = new class only = zero risk
```

---

## Benefits

- Business logic is completely decoupled from infrastructure
- Swap any database, email provider, or service without touching high-level code
- Easier to unit test (inject mock implementations)
- Follows OCP naturally — new implementations, no modifications

---

# 4. Quick Revision Summary

## All 7 LSP Rules

| Category | Rule |
|----------|------|
| Signature | Method arguments: same or broader |
| Signature | Return types: same or narrower |
| Signature | Exceptions: same or narrower |
| Property | Class invariants must be preserved |
| Property | History constraints must be maintained |
| Method | Pre-conditions: must not be strengthened |
| Method | Post-conditions: must not be weakened |

---

## ISP in One Line

```text
Don't force a class to implement methods it will never use.
```

## DIP in One Line

```text
Depend on interfaces, not on concrete classes.
```

---

## All 5 SOLID Principles

| Letter | Principle | One-Line Rule |
|--------|-----------|---------------|
| S | Single Responsibility | One class, one reason to change |
| O | Open/Closed | Extend behavior, don't modify existing code |
| L | Liskov Substitution | Subtypes must honor the base class contract |
| I | Interface Segregation | Many specific interfaces over one fat interface |
| D | Dependency Inversion | Depend on abstractions, not concretions |

---

# 5. Interview Questions

## Q1

What are the three categories of LSP rules?

**Answer:**

Signature Rules (arguments, return types, exceptions), Property Rules (invariants, history constraints), and Method Rules (pre-conditions, post-conditions).

---

## Q2

What is the Method Argument Rule in LSP?

**Answer:**

Child class method arguments must be the same or broader than the parent's. Narrowing the argument type means client code that passes a valid parent-type argument may no longer work with the child.

---

## Q3

What is a covariant return type?

**Answer:**

A child method returning a narrower (more specific) type than the parent. Allowed in Java. For example, a parent returns `Animal` and the child returns `Dog`.

---

## Q4

What is a Class Invariant?

**Answer:**

A rule about an object's state that must always hold true. Example: "balance cannot be negative." Child classes must preserve all invariants defined by the parent.

---

## Q5

What is the pre-condition rule in LSP?

**Answer:**

A child class must not strengthen (make stricter) the pre-conditions of a method. If the parent accepts `amount > 0`, the child cannot require `amount > 100` — it would break client code that passes valid values.

---

## Q6

What is the Interface Segregation Principle?

**Answer:**

Many client-specific interfaces are better than one general-purpose interface. No class should be forced to implement methods it doesn't need.

---

## Q7

How does ISP apply to 2D and 3D shapes?

**Answer:**

A single `Shape` interface with both `area()` and `volume()` forces 2D shapes like `Square` to implement `volume()`, which is meaningless. Splitting into `TwoDShape` and `ThreeDShape` interfaces lets each class implement only what is relevant.

---

## Q8

What is the Dependency Inversion Principle?

**Answer:**

High-level modules should depend on abstractions (interfaces), not on low-level concrete implementations. Both should depend on the abstraction.

---

## Q9

How does DIP help when swapping databases?

**Answer:**

By depending on a `Persistence` interface, `UserService` never references `MySQLDatabase` or `MongoDB` directly. Swapping databases means creating a new class that implements `Persistence` — zero changes to the business logic.

---

## Q10

What is Dependency Injection and how does it relate to DIP?

**Answer:**

Dependency Injection is the technique of passing a dependency (like a database) into a class from outside rather than creating it internally. It enables DIP — the high-level class depends on the abstraction, and the concrete implementation is injected at runtime.

---

## Q11

What is the difference between ISP and SRP?

**Answer:**

SRP is about classes — a class should have one reason to change. ISP is about interfaces — an interface should not force clients to implement methods they don't use. SRP governs class design; ISP governs interface design.

---

## Q12

Why does DIP make unit testing easier?

**Answer:**

Because dependencies are injected via interfaces, tests can inject mock implementations instead of real databases or services. The class under test is completely isolated from infrastructure.
