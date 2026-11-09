# Facade Design Pattern

---

# Table of Contents

1. Core Concept
2. Benefits
3. Example — Computer Boot-Up
4. Facade vs Adapter
5. Other Use Cases
6. Interview Questions

---

# 1. Core Concept

A **structural** pattern that provides a **single, simplified interface** to a complex subsystem.

## Without Facade

The client talks to every subsystem class directly.

```text
Client ──> A
Client ──> B
Client ──> C
Client ──> D
Client ──> E
```

Problems:

- Client must know **all** classes and the **correct order** of calls
- Tight coupling to every subsystem class
- Any subsystem change can break the client

## With Facade

```text
Client ──> Facade ──> A, B, C, D, E
```

The client talks **only to the Facade**. The Facade orchestrates the subsystem internally.

---

# 2. Benefits

| Benefit | Explanation |
|---------|-------------|
| **Simplification** | Hides the complexity of a large subsystem |
| **Decoupling** | Client no longer depends on individual subsystem classes |
| **Maintainability** | Subsystem changes are absorbed by the Facade |
| **Law of Demeter** | Client only talks to its immediate friend (the Facade), giving loose coupling |

---

# 3. Example — Computer Boot-Up

Booting a computer involves many subsystems in a specific order:

```text
Power Supply  →  Cooling System  →  CPU  →  Memory  →  Hard Drive  →  BIOS/OS
```

## Structure

```text
Client ──> ComputerFacade
                │
   ┌────────┬───┴────┬─────────┬───────────┬──────────┐
PowerSupply Cooling   CPU     Memory    HardDrive    BIOS
```

---

## Step 1: Subsystem Classes

```java
class PowerSupply {
    public void powerOn() {
        System.out.println("Power supply on");
    }
}

class CoolingSystem {
    public void startFans() {
        System.out.println("Cooling fans started");
    }
}

class CPU {
    public void initialize() {
        System.out.println("CPU initialized");
    }
}

class Memory {
    public void selfTest() {
        System.out.println("Memory self-test passed");
    }
}

class HardDrive {
    public void spinUp() {
        System.out.println("Hard drive spinning up");
    }
}

class BIOS {
    public void loadOS() {
        System.out.println("BIOS loading OS");
    }
}
```

---

## Step 2: Facade

Holds the subsystem objects and orchestrates the startup sequence.

```java
class ComputerFacade {

    private final PowerSupply powerSupply;
    private final CoolingSystem coolingSystem;
    private final CPU cpu;
    private final Memory memory;
    private final HardDrive hardDrive;
    private final BIOS bios;

    public ComputerFacade() {
        this.powerSupply = new PowerSupply();
        this.coolingSystem = new CoolingSystem();
        this.cpu = new CPU();
        this.memory = new Memory();
        this.hardDrive = new HardDrive();
        this.bios = new BIOS();
    }

    // single simplified method
    public void startComputer() {
        powerSupply.powerOn();
        coolingSystem.startFans();
        cpu.initialize();
        memory.selfTest();
        hardDrive.spinUp();
        bios.loadOS();
        System.out.println("Computer started");
    }
}
```

---

## Step 3: Client

```java
public class Main {
    public static void main(String[] args) {
        ComputerFacade computer = new ComputerFacade();
        computer.startComputer();
    }
}
```

Output:

```text
Power supply on
Cooling fans started
CPU initialized
Memory self-test passed
Hard drive spinning up
BIOS loading OS
Computer started
```

The client knows **nothing** about the six subsystem classes or their order.

---
<img width="927" height="687" alt="image" src="https://github.com/user-attachments/assets/7215ecec-db4c-4420-9d11-1257dd9634bf" />


## Flow

```text
client.startComputer()
        ↓
ComputerFacade
        ↓
powerOn → startFans → initialize → selfTest → spinUp → loadOS
```

---

## Tip: Better Design With Dependency Injection

Instead of creating subsystems inside the Facade, pass them in via the constructor. This makes the Facade easier to test (DIP).

```java
public ComputerFacade(PowerSupply ps, CoolingSystem cs, CPU cpu,
                      Memory mem, HardDrive hd, BIOS bios) {
    this.powerSupply = ps;
    this.coolingSystem = cs;
    this.cpu = cpu;
    this.memory = mem;
    this.hardDrive = hd;
    this.bios = bios;
}
```

---

# 4. Facade vs Adapter

Both introduce an intermediate class, but their **intent** differs.

| | Facade | Adapter |
|--|--------|---------|
| **Intent** | **Hide complexity**, simplify the interface | Make **incompatible interfaces** work together |
| Wraps | Many classes (a subsystem) | Usually one class |
| Interface | Creates a **new** simplified interface | Converts to an **existing expected** interface |
| Client expectation | Wants simplicity | Expects a specific interface |

```text
Facade:   Many complex classes → one simple entry point
Adapter:  Class with wrong interface → class with expected interface
```

---

# 5. Other Use Cases

| Use Case | Facade Method |
|----------|--------------|
| **Order placement** | `placeOrder()` → inventory + payment + shipping + notification |
| **Video conversion** | `convert(file)` → codec + audio mixer + bitrate reader |
| **Spring service layer** | A service coordinating multiple repositories and external clients |
| **Home theater** | `watchMovie()` → projector + sound system + lights + player |

## Order Facade Example

```java
class OrderFacade {

    private final InventoryService inventory;
    private final PaymentService payment;
    private final ShippingService shipping;
    private final NotificationService notification;

    public OrderFacade(InventoryService inventory, PaymentService payment,
                       ShippingService shipping, NotificationService notification) {
        this.inventory = inventory;
        this.payment = payment;
        this.shipping = shipping;
        this.notification = notification;
    }

    public void placeOrder(String item, double amount) {
        inventory.reserve(item);
        payment.charge(amount);
        shipping.schedule(item);
        notification.sendConfirmation();
    }
}
```

The client just calls `orderFacade.placeOrder(...)`.

---



# 6. Interview Questions

## Q1

What is the Facade pattern?

**Answer:**

A structural pattern that provides a single, simplified interface to a complex subsystem, so the client doesn't deal with the individual classes directly.

---

## Q2

What problem does it solve?

**Answer:**

Clients interacting with many interdependent classes face tight coupling and must know the correct call order. The Facade hides this and exposes one simple method.

---

## Q3

How does Facade relate to the Law of Demeter?

**Answer:**

The client only talks to its immediate friend (the Facade) instead of reaching into multiple subsystem classes, resulting in loose coupling.

---

## Q4

In the computer boot-up example, what does the Facade do?

**Answer:**

`ComputerFacade.startComputer()` calls the power supply, cooling system, CPU, memory, hard drive, and BIOS in the right order, so the client only calls one method.

---

## Q5

Facade vs Adapter?

**Answer:**

Facade hides complexity by offering a simplified interface to a subsystem. Adapter makes two incompatible interfaces work together by translating one to the other.

---

## Q6

Does a Facade prevent direct access to the subsystem?

**Answer:**

No. It's a convenience layer. Advanced clients can still use subsystem classes directly if they need finer control.

---

## Q7

What are the drawbacks of Facade?

**Answer:**

It can become a "god object" that knows too much and takes on too many responsibilities, and it can hide useful functionality of the subsystem.

---

## Q8

Which SOLID principles does Facade support?

**Answer:**

Mainly loose coupling and DIP when it depends on abstractions. Keep each Facade focused to avoid violating SRP.

---

## Q9

Give real-world examples of Facade.

**Answer:**

An order service coordinating inventory, payment, and shipping; a video converter hiding codec details; a home theater `watchMovie()` method; and service-layer classes in Spring apps.

---

## Q10

Facade vs Decorator?

**Answer:**

Facade simplifies access to a subsystem with a new interface. Decorator keeps the same interface and adds behavior to a single object.
