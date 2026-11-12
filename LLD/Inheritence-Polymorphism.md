# OOP Lecture 3 — Inheritance & Polymorphism

---

# Table of Contents

1. Recap — The Four Pillars
2. Inheritance
3. Polymorphism
4. Integrated Example — All Four Pillars
5. Quick Revision Summary
6. Interview Questions

---

# 1. Recap — The Four Pillars

| Pillar | Idea |
|--------|------|
| Abstraction | Hide implementation, expose what's essential |
| Encapsulation | Bundle data + methods, control access |
| **Inheritance** | Child class reuses and extends a parent class |
| **Polymorphism** | Same behavior, many forms |

This lecture covers the last two, using a consistent **Car** example.

---

# 2. Inheritance

Establishes a **parent-child (Is-A) relationship** between classes.

```text
ManualCar IS-A Car
ElectricCar IS-A Car
```

## Why Inheritance?

- **Code reuse**: common logic lives once in the parent
- **Specialization**: children add features unique to their type
- **Natural modeling** of real-world hierarchies

---

## Structure

```text
                  Car (parent)
        brand, model, isEngineOn, currentSpeed
   startEngine(), stopEngine(), accelerate(), brake()
                    ▲
          ┌─────────┴──────────┐
     ManualCar            ElectricCar
  + currentGear         + batteryPercentage
  + shiftGear()         + chargeBattery()
```

---

## Parent Class

Holds the **common** properties and behaviors.

```java
class Car {

    protected String brand;
    protected String model;
    protected boolean isEngineOn;
    protected int currentSpeed;

    public Car(String brand, String model) {
        this.brand = brand;
        this.model = model;
        this.isEngineOn = false;
        this.currentSpeed = 0;
    }

    public void startEngine() {
        isEngineOn = true;
        System.out.println(brand + " " + model + " engine started");
    }

    public void stopEngine() {
        isEngineOn = false;
        currentSpeed = 0;
        System.out.println(brand + " " + model + " engine stopped");
    }

    public void accelerate() {
        if (isEngineOn) {
            currentSpeed += 10;
            System.out.println("Speed: " + currentSpeed);
        }
    }

    public void brake() {
        currentSpeed = Math.max(0, currentSpeed - 10);
        System.out.println("Speed: " + currentSpeed);
    }
}
```

---

## Child Classes (Specialization)

```java
class ManualCar extends Car {

    private int currentGear;

    public ManualCar(String brand, String model) {
        super(brand, model);          // call parent constructor
        this.currentGear = 0;
    }

    public void shiftGear(int gear) {
        this.currentGear = gear;
        System.out.println("Shifted to gear " + gear);
    }
}

class ElectricCar extends Car {

    private int batteryPercentage;

    public ElectricCar(String brand, String model) {
        super(brand, model);
        this.batteryPercentage = 100;
    }

    public void chargeBattery() {
        batteryPercentage = 100;
        System.out.println("Battery charged to 100%");
    }
}
```

Each child **inherits** everything from `Car` and **adds** its own members.

```java
ManualCar mc = new ManualCar("Maruti", "Swift");
mc.startEngine();     // inherited from Car
mc.shiftGear(2);      // own method
```

---

## The `protected` Access Modifier

| Modifier | Same class | Child class | Outside world |
|----------|-----------|-------------|---------------|
| `private` | ✓ | ✗ | ✗ |
| `protected` | ✓ | ✓ | ✗ (except same package) |
| `public` | ✓ | ✓ | ✓ |

`protected` lets children use parent members while hiding them from outside code.

```java
class ElectricCar extends Car {
    public void showSpeed() {
        System.out.println(currentSpeed);   // allowed — protected in Car
    }
}
```

---

## Inheritance in Java — Key Rules

- Use `extends` for class inheritance
- `super(...)` calls the parent constructor (must be the first statement)
- Java supports **single inheritance** for classes (one parent only)
- Multiple inheritance of behavior is done through **interfaces**
- All classes implicitly extend `Object`

---

# 3. Polymorphism

> "Many forms" — the same behavior can produce different results.

Two types:

| Type | Also called | Mechanism | Resolved at |
|------|-------------|-----------|-------------|
| **Dynamic** | Runtime polymorphism | Method **overriding** | Runtime |
| **Static** | Compile-time polymorphism | Method **overloading** | Compile time |

---

## 3.1 Dynamic Polymorphism (Method Overriding)

A subclass provides its **own implementation** of a method defined in the parent.

In Java, all instance methods are **virtual by default** (C++ needs the `virtual` keyword).

```java
class Car {
    public void accelerate() {
        currentSpeed += 10;
        System.out.println("Car accelerating, speed: " + currentSpeed);
    }

    public void brake() {
        currentSpeed = Math.max(0, currentSpeed - 10);
        System.out.println("Car braking, speed: " + currentSpeed);
    }
}
```

```java
class ManualCar extends Car {

    @Override
    public void accelerate() {
        currentSpeed += 10;
        System.out.println("Manual car accelerating in gear " + currentGear
                           + ", speed: " + currentSpeed);
    }

    @Override
    public void brake() {
        currentSpeed = Math.max(0, currentSpeed - 15);
        System.out.println("Manual car braking, clutch engaged, speed: " + currentSpeed);
    }
}
```

```java
class ElectricCar extends Car {

    @Override
    public void accelerate() {
        if (batteryPercentage <= 0) {
            System.out.println("Battery empty! Cannot accelerate");
            return;
        }
        batteryPercentage -= 1;
        currentSpeed += 15;
        System.out.println("Electric car accelerating, speed: " + currentSpeed
                           + ", battery: " + batteryPercentage + "%");
    }

    @Override
    public void brake() {
        currentSpeed = Math.max(0, currentSpeed - 15);
        batteryPercentage = Math.min(100, batteryPercentage + 1);   // regenerative braking
        System.out.println("Regenerative braking, speed: " + currentSpeed
                           + ", battery: " + batteryPercentage + "%");
    }
}
```

## The Magic: Parent Reference, Child Object

```java
Car car1 = new ManualCar("Maruti", "Swift");
Car car2 = new ElectricCar("Tesla", "Model 3");

car1.accelerate();   // runs ManualCar's version
car2.accelerate();   // runs ElectricCar's version
```

```text
Same call:  car.accelerate()
Different behavior depending on the ACTUAL object type
```

The JVM picks the method at **runtime** (dynamic dispatch).

## Polymorphic Collections

```java
List<Car> garage = List.of(
    new ManualCar("Maruti", "Swift"),
    new ElectricCar("Tesla", "Model 3")
);

for (Car c : garage) {
    c.startEngine();
    c.accelerate();    // each car behaves in its own way
}
```

New car types need **no change** to this loop (OCP).

## Overriding Rules

- Same **name**, **parameters**, and compatible **return type**
- Cannot reduce visibility (public → protected is not allowed)
- `final` methods can't be overridden
- Use `@Override` so the compiler catches mistakes

---

## 3.2 Static Polymorphism (Method Overloading)

**Multiple methods with the same name** but **different parameters** in the same class.

```java
class Car {

    // Version 1: default increment
    public void accelerate() {
        currentSpeed += 10;
        System.out.println("Speed: " + currentSpeed);
    }

    // Version 2: custom increment
    public void accelerate(int speed) {
        currentSpeed += speed;
        System.out.println("Speed: " + currentSpeed);
    }
}
```

```java
car.accelerate();      // calls version 1
car.accelerate(30);    // calls version 2
```

The compiler decides which one to call from the **arguments** — hence "compile-time".

## Overloading Rules

- Parameters must differ in **number**, **type**, or **order**
- Changing only the **return type** is NOT overloading (compile error)

---

## Overriding vs Overloading

| | Overriding | Overloading |
|--|-----------|------------|
| Where | Parent ↔ child classes | Same class |
| Signature | Must be the **same** | Must **differ** |
| Resolved | Runtime | Compile time |
| Needs inheritance | Yes | No |
| Polymorphism type | Dynamic | Static |

---

# 4. Integrated Example — All Four Pillars

```java
// ABSTRACTION — defines WHAT a car does, hides HOW
abstract class Car {

    // ENCAPSULATION — data hidden, accessed via methods
    private final String brand;
    private final String model;
    protected int currentSpeed;
    protected boolean isEngineOn;

    public Car(String brand, String model) {
        this.brand = brand;
        this.model = model;
    }

    public String getBrand() { return brand; }
    public String getModel() { return model; }

    public void startEngine() {
        isEngineOn = true;
        System.out.println(brand + " " + model + " started");
    }

    // POLYMORPHISM (dynamic) — children provide their own versions
    public abstract void accelerate();
    public abstract void brake();

    // POLYMORPHISM (static) — overloaded version
    public void accelerate(int speed) {
        currentSpeed += speed;
        System.out.println("Speed: " + currentSpeed);
    }
}

// INHERITANCE — ElectricCar IS-A Car
class ElectricCar extends Car {

    private int batteryPercentage = 100;

    public ElectricCar(String brand, String model) {
        super(brand, model);
    }

    @Override
    public void accelerate() {
        currentSpeed += 15;
        batteryPercentage--;
        System.out.println("Electric accelerating: " + currentSpeed);
    }

    @Override
    public void brake() {
        currentSpeed = Math.max(0, currentSpeed - 15);
        batteryPercentage++;
        System.out.println("Regenerative braking: " + currentSpeed);
    }
}

class ManualCar extends Car {

    private int currentGear = 1;

    public ManualCar(String brand, String model) {
        super(brand, model);
    }

    public void shiftGear(int gear) {
        currentGear = gear;
    }

    @Override
    public void accelerate() {
        currentSpeed += 10;
        System.out.println("Manual accelerating in gear " + currentGear
                           + ": " + currentSpeed);
    }

    @Override
    public void brake() {
        currentSpeed = Math.max(0, currentSpeed - 10);
        System.out.println("Manual braking: " + currentSpeed);
    }
}
```

```java
public class Main {
    public static void main(String[] args) {

        Car car = new ElectricCar("Tesla", "Model 3");   // parent ref, child object

        car.startEngine();
        car.accelerate();        // overriding (dynamic)
        car.accelerate(25);      // overloading (static)
        car.brake();
    }
}
```

| Pillar | Where it appears |
|--------|-----------------|
| Abstraction | `abstract class Car`, abstract `accelerate()`/`brake()` |
| Encapsulation | `private` brand/model with getters |
| Inheritance | `ElectricCar extends Car` |
| Polymorphism | Overriding (`accelerate()`) + overloading (`accelerate(int)`) |

---

# 5. Quick Revision Summary

```text
Inheritance   →  child reuses & extends parent (Is-A)
Overriding    →  child redefines parent method (runtime)
Overloading   →  same name, different params (compile time)
protected     →  visible to children, hidden from outside
super         →  access parent constructor/methods
```

---

# 6. Interview Questions

## Q1

What is Inheritance?

**Answer:**

A mechanism where a child class acquires the properties and behaviors of a parent class, establishing an Is-A relationship and enabling code reuse.

---

## Q2

What is the `protected` access modifier?

**Answer:**

Members are accessible within the class, its subclasses, and (in Java) the same package, but not from unrelated outside code.

---

## Q3

What is Polymorphism?

**Answer:**

"Many forms": the same method call produces different behavior depending on the object or the arguments. It comes as dynamic (overriding) and static (overloading).

---

## Q4

Overriding vs Overloading?

**Answer:**

Overriding redefines a parent's method in a child with the same signature and is resolved at runtime. Overloading defines multiple methods with the same name but different parameters in one class and is resolved at compile time.

---

## Q5

What is dynamic method dispatch?

**Answer:**

When an overridden method is called through a parent reference, the JVM decides at runtime which version to run based on the actual object type.

---

## Q6

Why are methods "virtual" by default in Java?

**Answer:**

Unlike C++, Java doesn't need a `virtual` keyword. All non-`static`, non-`final`, non-`private` instance methods can be overridden and use runtime dispatch.

---

## Q7

Can you overload a method by changing only the return type?

**Answer:**

No. Overloading requires different parameter lists. A different return type alone causes a compile error.

---

## Q8

Does Java support multiple inheritance?

**Answer:**

Not for classes (a class can extend only one parent). Multiple inheritance of type is achieved through interfaces.

---

## Q9

What does `super` do?

**Answer:**

It refers to the parent class. `super(...)` calls the parent constructor (first statement in the child constructor), and `super.method()` calls the parent's version of a method.

---

## Q10

How do the four OOP pillars work together in the Car example?

**Answer:**

Abstraction defines `Car` with abstract behaviors. Encapsulation hides data like brand and model. Inheritance lets `ElectricCar` and `ManualCar` extend `Car`. Polymorphism lets each override `accelerate()` and `brake()` while callers use a `Car` reference.

---

## Q11

How does polymorphism support the Open/Closed Principle?

**Answer:**

New subclasses can be added and used through the parent type without changing existing code, so the system is extended without modification.

---

## Q12

What happens if you mark a method `final`?

**Answer:**

Subclasses can't override it. Marking a class `final` prevents it from being extended at all.
