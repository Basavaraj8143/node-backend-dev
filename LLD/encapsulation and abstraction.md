# OOP Lecture 2 — Abstraction & Encapsulation

---

# Table of Contents

1. Why We Moved Beyond Procedural Programming
2. Entering Object-Oriented Programming
3. Modeling Real-World Entities in Code
4. Pillar 1 — Abstraction
5. Code-Based Abstraction: Abstract Classes & Interfaces
6. Benefits of Abstraction
7. Pillar 2 — Encapsulation
8. Access Modifiers
9. Benefits of Encapsulation
10. Interview Questions

---

# 1. Why We Moved Beyond Procedural Programming

---

## 1.1 Early Languages

### Machine Language (Binary)

Direct CPU instructions in 0s and 1s.

Drawbacks:

- Extremely error-prone — one bit flip breaks the program
- Tedious to write and maintain
- No abstraction — every detail is manual

---

### Assembly Language

Introduced mnemonics instead of raw bits.

Example:

```asm
MOV A, 61h
```

Still hardware-tied:

- Code changes with CPU architecture
- Very limited scalability for large systems

---

## 1.2 Procedural (Structured) Programming

### Features Introduced

- Functions for code reuse
- Control structures: `if-else`, `switch`, `for`, `while`
- Blocks for grouping statements

### Advantages

- Improved readability over assembly
- Modularized small to mid-size programs

### Limitations

**Poor Real-World Mapping:**

Difficult to model complex entities like a ride-booking system's users, drivers, and payments.

**Data Security Gaps:**

No built-in access control — everything is globally visible.

**Reusability & Scalability:**

Functions alone can't enforce consistent interfaces or safe extension.

---

# 2. Entering Object-Oriented Programming

## Core Idea

Model your application as **interacting objects** that mirror real-world entities.

---

## Benefits

- Natural mapping of domain concepts (User, Car, Ride)
- Secure data encapsulation — control who reads or modifies state
- Code reuse via inheritance and interfaces
- Scalability through loosely coupled modules

---

# 3. Modeling Real-World Entities in Code

## Key Terms

### Object

A real-world "thing" with attributes and behaviors.

---

### Class

A blueprint defining those attributes (fields) and behaviors (methods).

---

### Instance

A concrete object in memory, created from the class.

```text
Class (Blueprint)
      ↓
Instance (Actual Object in Memory)
```

---

# 4. Pillar 1 — Abstraction

## Definition

> Abstraction hides unnecessary implementation details from the client and exposes only what is essential to use an object's functionality.

---

## Real-World Analogies

### Driving a Car

What you do:

```text
Insert key
Press pedals
Turn steering wheel
```

What you don't need to know:

```text
How the fuel-injection system works
How the transmission synchronizes gears
How the engine control unit computes ignition timing
```

Abstraction provides a simple interface:

```text
start()
accelerate()
brake()
```

All mechanical complexity is hidden under the hood.

---

### Using a TV or Laptop

What you do:

```text
Press buttons on a remote
Click icons
```

What you don't need to know:

```text
How the display panel refreshes
How the CPU executes machine code
How the OS schedules tasks
```

A graphical interface abstracts away thousands of low-level operations.

---

## Language-Level Abstraction

Control structures like `if`, `for`, `while` let you express complex branching and loops without writing jump addresses or machine instructions.

```text
Your Code (if / for / while)
            ↓
       Compiler
            ↓
  Assembly / Machine Code
```

The compiler handles translation behind the scenes.

---

# 5. Code-Based Abstraction: Abstract Classes & Interfaces

## Abstract Class Example (C++)

```cpp
// Abstract interface for any Car type
class Car {
public:
    // Pure virtual methods - no implementation here
    virtual void startEngine() = 0;
    virtual void shiftGear(int newGear) = 0;
    virtual void accelerate() = 0;
    virtual void brake() = 0;
    virtual ~Car() {}
};
```

### Key Points

- `Car` declares **what** operations must exist but hides **how** they work
- No implementation lives in the abstract class — only signatures
- Clients use `Car*` pointers without needing concrete details

---

## Concrete Subclass

Each subclass provides its own implementation:

```cpp
class ElectricCar : public Car {
public:
    void startEngine() override {
        // Electric motor startup logic
    }
    void shiftGear(int newGear) override {
        // Single-speed transmission logic
    }
    void accelerate() override {
        // Instant torque delivery
    }
    void brake() override {
        // Regenerative braking logic
    }
};
```

Client code uses `Car*` and works with **any** subclass — `SportsCar`, `SUV`, `ElectricCar` — without modification.

---

# 6. Benefits of Abstraction

### Simplified Interfaces

Clients focus on **what** an object does, not **how** it does it.

---

### Ease of Maintenance

Internal changes (e.g., switching from a V6 to an electric motor) don't affect client code.

---

### Code Reuse

Multiple concrete classes implement the same abstract interface.

```text
Car (abstract)
      ↓
SportsCar
SUV
ElectricCar
```

---

### Reduced Complexity

Large systems are easier to reason about when broken into abstract modules.

---

# 7. Pillar 2 — Encapsulation

## Definition

> Encapsulation bundles an object's data (state) and the methods that operate on that data into a single unit, and controls access to its inner workings.

---

## 7.1 Two Facets of Encapsulation

### Logical Grouping

Data (fields) and behaviors (methods) that belong together live in the same "capsule" (class).

Example:

A `Car` class encapsulates:

```text
engineOn
currentSpeed
shiftGear()
accelerate()
```

All in one place.

---

### Data Security

Restrict direct external access to sensitive fields to prevent invalid or unsafe operations.

Example:

```text
You can read the car's odometer.
You cannot directly set it back to zero.
```

---

## 7.2 Real-World Analogies

### Medicine Capsule

The capsule holds both the medicine (data) and its protective shell (access control).

You swallow the capsule without exposing its contents directly.

---

### Car Odometer

You can view the mileage but cannot tamper with it via the dashboard interface.

---

## 7.3 Access Modifiers in C++

| Modifier | Accessible From |
|----------|----------------|
| `public` | Everywhere |
| `private` | Only within the class itself |
| `protected` | Class and its subclasses |

---

## Example

```cpp
class BankAccount {
private:
    double balance;   // hidden from outside

public:
    void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }

    double getBalance() {
        return balance;
    }
};
```

`balance` cannot be directly accessed or modified from outside.

All interaction goes through controlled public methods.

---

## 7.4 Getters & Setters with Validation

Purpose: Allow controlled mutation with checks, rather than exposing fields blindly.

```cpp
class Car {
private:
    int speed;

public:
    void setSpeed(int newSpeed) {
        if (newSpeed >= 0 && newSpeed <= 200) {
            speed = newSpeed;
        }
    }

    int getSpeed() {
        return speed;
    }
};
```

Invalid values are rejected before they corrupt internal state.

---

# 8. Benefits of Encapsulation

### Robustness

Prevents accidental or malicious misuse of internal state.

---

### Maintainability

Internal changes (e.g., adding new constraints) do not ripple into client code.

---

### Clear Contracts

Clients interact only via well-defined methods — the public API.

---

### Modularity

Code is organized into self-contained units, easing testing and reuse.

---

# 9. Interview Questions

## Q1

What are the four pillars of OOP?

**Answer:**

Abstraction, Encapsulation, Inheritance, Polymorphism.

---

## Q2

What is Abstraction?

**Answer:**

Hiding unnecessary implementation details and exposing only what is essential for the client to use an object's functionality.

---

## Q3

What is the difference between Abstraction and Encapsulation?

**Answer:**

Abstraction hides **complexity** — it defines what an object does.

Encapsulation hides **data** — it controls access to an object's internal state.

```text
Abstraction  →  hide HOW (implementation)
Encapsulation →  hide WHAT (internal data)
```

---

## Q4

What is a pure virtual function in C++?

**Answer:**

A function declared with `= 0` in an abstract class. It has no implementation in the base class and must be overridden by concrete subclasses.

```cpp
virtual void startEngine() = 0;
```

---

## Q5

Why can't you instantiate an abstract class?

**Answer:**

Because abstract classes contain pure virtual functions with no implementation. Instantiating them would leave those methods undefined, making the object unusable.

---

## Q6

What are access modifiers and why are they important?

**Answer:**

Keywords (`public`, `private`, `protected`) that control who can access class members. They enforce data security and define the public API of a class.

---

## Q7

Why use getters and setters instead of making fields public?

**Answer:**

Getters and setters allow validation before data is read or modified. Public fields expose raw state with no control, allowing invalid values to corrupt the object.

---

## Q8

What is the difference between a class and an instance?

**Answer:**

A class is the blueprint defining attributes and behaviors. An instance is a concrete object created from that blueprint, occupying actual memory.

---

## Q9

What were the main limitations of procedural programming that OOP solved?

**Answer:**

Poor real-world mapping (hard to model complex entities), data security gaps (no access control, everything globally visible), and poor reusability and scalability for large systems.

---

## Q10

Give a real-world analogy for Abstraction.

**Answer:**

Driving a car. You use the steering wheel, pedals, and ignition without knowing how the fuel injection system, transmission, or engine control unit work internally.

---

## Q11

Give a real-world analogy for Encapsulation.

**Answer:**

A car's odometer. You can view the mileage (read access) but cannot directly set it back to zero through the dashboard (write access is restricted).

---

## Q12

What is the benefit of the `protected` access modifier?

**Answer:**

It allows subclasses to access parent class members while still hiding those members from unrelated external code. Useful when designing class hierarchies using inheritance.
