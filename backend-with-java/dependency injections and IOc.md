# Spring Core — Loose Coupling, DI & IoC

---

# Table of Contents

1. The Problem: Tight Coupling
2. The Solution: Interfaces & Loose Coupling
3. Dependency Injection (DI)
4. Inversion of Control (IoC)
5. The Spring IoC Container
6. Interview Questions

---

# 1. The Problem: Tight Coupling

`OrderService` creates its own `EmailService` internally:

```java
class OrderService {

    private EmailService emailService = new EmailService(); // tightly coupled

    public void placeOrder(String item) {
        System.out.println("Order placed: " + item);
        emailService.sendNotification("Order confirmed");
    }
}
```

Problems:

- `OrderService` controls the creation of its dependency
- Want to switch to `SMSService`? You must **modify** `OrderService`
- Violates the **Open/Closed Principle**
- Hard to unit test — real emails fire during tests

---

# 2. The Solution: Interfaces & Loose Coupling

Introduce a `NotificationService` interface:

```java
interface NotificationService {
    void sendNotification(String message);
}

class EmailService implements NotificationService {
    public void sendNotification(String message) {
        System.out.println("Email sent: " + message);
    }
}

class SMSService implements NotificationService {
    public void sendNotification(String message) {
        System.out.println("SMS sent: " + message);
    }
}
```

`OrderService` now depends on the **abstraction**, not a concrete class:

```java
class OrderService {
    private NotificationService notificationService;

    // still creating internally — still a problem
    public OrderService() {
        this.notificationService = new EmailService();
    }
}
```

Better — but `OrderService` still calls `new EmailService()` internally.

---

# 3. Dependency Injection (DI)

Move object creation **outside** the class entirely.

---

## Constructor Injection (Preferred)

```java
class OrderService {

    private NotificationService notificationService;

    // dependency injected via constructor
    public OrderService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public void placeOrder(String item) {
        System.out.println("Order placed: " + item);
        notificationService.sendNotification("Order confirmed");
    }
}
```

```java
// main method wires everything
public static void main(String[] args) {
    NotificationService service = new EmailService();
    OrderService orderService = new OrderService(service);
    orderService.placeOrder("Laptop");
}
```

Swap to SMS — zero changes to `OrderService`:

```java
NotificationService service = new SMSService(); // only change here
OrderService orderService = new OrderService(service);
```

---

## Setter Injection

```java
class OrderService {

    private NotificationService notificationService;

    public void setNotificationService(NotificationService service) {
        this.notificationService = service;
    }
}
```

```java
OrderService orderService = new OrderService();
orderService.setNotificationService(new EmailService());
```

---

## Why DI Makes Testing Easy

```java
// Unit test — inject a mock, no real emails sent
NotificationService mockService = message ->
    System.out.println("Mock notification: " + message);

OrderService orderService = new OrderService(mockService);
orderService.placeOrder("Test Item");
```

---

# 4. Inversion of Control (IoC)

> The responsibility for object creation is shifted from the class itself to an external entity.

```text
Without IoC:
OrderService creates → EmailService
(class controls its dependencies)

With IoC:
main() creates → EmailService → injects into OrderService
(external entity controls dependencies)
```

The **flow of control is inverted** — the class no longer manages what it depends on.

---

# 5. The Spring IoC Container

In a real app, `main()` managing hundreds of beans becomes unmaintainable.

The **Spring IoC Container** takes over:

- Creates beans automatically
- Wires dependencies together
- Manages the full bean lifecycle

```java
// Without Spring — manual wiring in main()
NotificationService ns = new EmailService();
OrderService os = new OrderService(ns);

// With Spring — container handles everything
@Component
class EmailService implements NotificationService { ... }

@Component
class OrderService {
    @Autowired
    public OrderService(NotificationService ns) { ... }
}
```

Spring scans for `@Component`, creates instances, and injects them automatically — no `new` keyword needed.

```text
Spring IoC Container
      ↓
Scans @Component classes
      ↓
Creates Beans
      ↓
Wires Dependencies (@Autowired)
      ↓
Application ready
```

---

# 6. Interview Questions

## Q1

What is tight coupling and why is it a problem?

**Answer:**

When a class creates its own dependencies internally (e.g., `new EmailService()`). Changing the dependency requires modifying the class — violates OCP and makes testing hard.

---

## Q2

How do interfaces help achieve loose coupling?

**Answer:**

The class depends on an abstraction (interface) instead of a concrete class. Any implementation can be swapped in without modifying the dependent class.

---

## Q3

What is Dependency Injection?

**Answer:**

Moving object creation outside the class and passing (injecting) the dependency in — via constructor, setter, or field. The class receives what it needs rather than creating it.

---

## Q4

What is the difference between Constructor and Setter Injection?

**Answer:**

Constructor injection passes the dependency at object creation — preferred as it makes dependencies mandatory and the object always valid. Setter injection allows optional or late-binding dependencies.

---

## Q5

What is Inversion of Control (IoC)?

**Answer:**

The principle where control over object creation and dependency management is shifted from the class to an external entity (Spring IoC Container). The class no longer controls its own dependencies.

---

## Q6

What is the Spring IoC Container?

**Answer:**

The core of Spring Framework — it scans for annotated classes (`@Component`), creates Bean instances, wires dependencies (`@Autowired`), and manages the full lifecycle of objects so developers don't need to use `new` manually.

---

## Q7

Why does DI make unit testing easier?

**Answer:**

You can inject a mock or stub dependency instead of a real one during tests. For example, injecting a mock `NotificationService` means no real emails fire during test execution.

---

## Q8

What is a Bean in Spring?

**Answer:**

Any object whose lifecycle (creation, wiring, destruction) is managed by the Spring IoC Container. Typically annotated with `@Component`, `@Service`, `@Repository`, or `@Controller`.
