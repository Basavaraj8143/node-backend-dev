# Singleton Design Pattern

---

# Table of Contents

1. Core Concept
2. Basic Implementation
3. Thread Safety
4. Initialization Strategies
5. Use Cases
6. When to Avoid
7. Interview Questions

---

# 1. Core Concept

Ensures a class has **only one instance** and provides a **global access point** to it.

Normal object creation uses `new`, which calls the constructor.

Singleton blocks that:

```text
Private Constructor   →  nobody outside can call new
Static Instance       →  holds the single object
Static Accessor       →  getInstance() returns it
```

---

# 2. Basic Implementation

```java
public class Logger {

    // holds the single instance
    private static Logger instance;

    // private constructor — blocks `new Logger()`
    private Logger() { }

    // global access point
    public static Logger getInstance() {
        if (instance == null) {
            instance = new Logger();
        }
        return instance;
    }

    public void log(String message) {
        System.out.println("LOG: " + message);
    }
}
```

```java
Logger a = Logger.getInstance();
Logger b = Logger.getInstance();
System.out.println(a == b);   // true — same object
```

Problem: **not thread-safe**.

---

# 3. Thread Safety

## The Race Condition

```text
Thread 1: instance == null? → yes
Thread 2: instance == null? → yes   (before T1 finishes creating)
      ↓
Both create an instance → Singleton broken
```

---

## Fix 1: Synchronized Method

```java
public static synchronized Logger getInstance() {
    if (instance == null) {
        instance = new Logger();
    }
    return instance;
}
```

Safe, but **every call** takes the lock — slow.

---

## Fix 2: Double-Checked Locking

Check first, lock only if needed.

```java
public class Logger {

    private static volatile Logger instance;   // volatile is required

    private Logger() { }

    public static Logger getInstance() {
        if (instance == null) {                    // 1st check (no lock)
            synchronized (Logger.class) {
                if (instance == null) {            // 2nd check (with lock)
                    instance = new Logger();
                }
            }
        }
        return instance;
    }
}
```

Why it works:

- 1st check avoids locking once the instance exists
- 2nd check prevents two waiting threads from both creating it
- `volatile` stops instruction reordering that could expose a half-built object

---

# 4. Initialization Strategies

## Lazy Initialization

Instance created **on first request**.

```text
Pros: saves resources if never used
Cons: needs thread-safety handling
```

(All examples above are lazy.)

---

## Eager Initialization

Instance created **when the class loads**.

```java
public class ConfigManager {

    private static final ConfigManager instance = new ConfigManager();

    private ConfigManager() { }

    public static ConfigManager getInstance() {
        return instance;
    }
}
```

```text
Pros: inherently thread-safe, simple
Cons: wastes memory if object is heavy and never used
```

---

## Bill Pugh (Lazy + Thread-Safe, No Locks)

```java
public class DatabaseConnection {

    private DatabaseConnection() { }

    private static class Holder {
        private static final DatabaseConnection INSTANCE =
            new DatabaseConnection();
    }

    public static DatabaseConnection getInstance() {
        return Holder.INSTANCE;
    }
}
```

The inner class loads only when `getInstance()` is first called — JVM guarantees thread safety.

---

## Enum Singleton (Most Robust in Java)

```java
public enum AppConfig {
    INSTANCE;

    public String getEnv() {
        return "production";
    }
}
```

```java
AppConfig.INSTANCE.getEnv();
```

Safe against reflection and serialization attacks.

---

## Comparison

| Approach | Lazy | Thread-Safe | Notes |
|----------|------|-------------|-------|
| Basic | Yes | No | Avoid |
| Synchronized method | Yes | Yes | Slow |
| Double-checked locking | Yes | Yes | Needs `volatile` |
| Eager | No | Yes | Simple |
| Bill Pugh | Yes | Yes | Clean, no locks |
| Enum | No | Yes | Most robust |

---

# 5. Use Cases

Singletons act as a **single source of truth** or guard limited resources.

| Use Case | Why Singleton |
|----------|---------------|
| Logging system | All parts of the app write to the same destination |
| Database connection | Avoids costly multiple connection objects |
| Configuration manager | Every service sees the same settings |

---

# 6. When to Avoid

- Design needs **multiple distinct objects**
- Makes **unit testing harder** (global state, can't easily mock)
- Complicates **multi-threaded code**
- Hides dependencies (any class can grab it anywhere)

Use only when one global instance is logically required.

In Spring, prefer **singleton-scoped beans** + dependency injection instead of hand-written Singletons.

---

# Stack Memory: This is where all non-primitive data types (like standard variables: int, char, bool) are stored. It is used to manage method calls and local variables.
# Heap Memory: This is where dynamically created objects (such as instances of custom classes created using the new keyword) are stored.
When you declare an object (e.g., A* a = new A();), the pointer to that object is stored in the Stack, while the actual object instance itself is allocated in the Heap.

# 7. Interview Questions

## Q1

What is the Singleton pattern?

**Answer:**

A creational pattern that guarantees a class has exactly one instance and provides a global access point to it.

---

## Q2

What are the three parts of a Singleton implementation?

**Answer:**

Private constructor, a static instance variable, and a static accessor method (`getInstance()`).

---

## Q3

Why is the basic lazy Singleton not thread-safe?

**Answer:**

Two threads can pass the `instance == null` check at the same time and each create an object, breaking the single-instance guarantee.

---

## Q4

What is Double-Checked Locking?

**Answer:**

Check if the instance exists before locking, then check again inside the lock. Avoids the cost of locking on every call while staying thread-safe.

---

## Q5

Why is `volatile` needed in Double-Checked Locking?

**Answer:**

Without it, instruction reordering can let another thread see a partially constructed object. `volatile` ensures safe publication of the instance.

---

## Q6

Lazy vs Eager initialization?

**Answer:**

Lazy creates the instance on first use (saves resources, needs thread safety). Eager creates it at class load (naturally thread-safe, may waste memory).

---

## Q7

Why is an Enum the most robust Singleton in Java?

**Answer:**

The JVM guarantees one instance per enum constant and it is protected from reflection and serialization attacks that can break class-based Singletons.

---

## Q8

Give real-world uses of Singleton.

**Answer:**

Logging systems, database connection managers, and configuration managers.

---

## Q9

Why can Singletons make testing harder?

**Answer:**

They hold global state and are accessed statically, so it's hard to replace them with mocks and tests can affect each other.

---

## Q10

How does Spring's singleton scope differ from the Singleton pattern?

**Answer:**

The pattern enforces one instance per JVM/classloader via code. Spring's singleton scope gives one instance per `ApplicationContext`, managed by the container, and works with dependency injection.
