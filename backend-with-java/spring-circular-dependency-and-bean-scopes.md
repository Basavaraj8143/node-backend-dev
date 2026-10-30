# Spring — Circular Dependency, Bean Scopes & Initialization

---

# Table of Contents

1. Circular Dependency
2. Ineffective Fixes (Design Smells)
3. Best Practice — Refactor
4. Bean Scopes
5. Eager vs Lazy Initialization
6. Interview Questions

---

# 1. Circular Dependency

Occurs when two or more beans depend on each other.

```java
@Component
class A {
    private final B b;
    public A(B b) { this.b = b; }
}

@Component
class B {
    private final A a;
    public B(A a) { this.a = a; }
}
```

```text
A needs B
   ↓
B needs A
   ↓
A needs B ...  (infinite cycle)
```

Spring cannot create either bean and throws:

```text
BeanCurrentlyInCreationException
```

---

# 2. Ineffective Fixes (Design Smells)

## Setter / Field Injection

```java
@Component
class A {
    @Autowired
    private B b;   // field injection
}
```

These can "work" because Spring injects an **early reference** after creating the object.

But they only **mask** the problem.

```text
Circular dependency = design smell
      ↓
Classes are doing too much
      ↓
Violates Single Responsibility Principle
```

Spring Boot 2.6+ blocks circular references by default.

---

# 3. Best Practice — Refactor

Break the cycle by moving shared logic to a **third service**.

```text
Before:   A ⇄ B

After:    A → C ← B
```

```java
@Component
class C {
    public void sharedLogic() { ... }
}

@Component
class A {
    private final C c;
    public A(C c) { this.c = c; }
}

@Component
class B {
    private final C c;
    public B(C c) { this.c = c; }
}
```

Dependency chain is now **linear** — no cycle.

---

# 4. Bean Scopes

## Singleton (Default)

One instance per `ApplicationContext`.

```java
@Component
@Scope("singleton")
class ConfigService { }
```

```text
getBean() → same object every time
```

Best for **stateless** beans (services, repositories).

---

## Prototype

New instance **every time** the bean is requested.

```java
@Component
@Scope("prototype")
class ShoppingCart { }
```

```text
getBean() → new object each call
```

Best for **stateful** objects.

---

## Comparison

| | Singleton | Prototype |
|--|-----------|-----------|
| Instances | One per container | New per request |
| Default | Yes | No |
| Use for | Stateless beans | Stateful beans |
| Lifecycle managed by Spring | Fully | Creation only (no destroy) |

---

# 5. Eager vs Lazy Initialization

## Eager (Default for Singleton)

Beans are created **at container startup**.

```text
App starts → all singletons created
      ↓
Misconfiguration? App fails immediately
```

Benefit: **Fail-Fast** behavior — errors caught at startup, not at runtime.

---

## Lazy

Bean created only on **first request**.

```java
@Component
@Lazy
class HeavyService { }
```

Benefits:

- Faster startup
- Saves memory for rarely used beans

---

## @Lazy to Mitigate Circular Dependency

Injects a **proxy** instead of the real bean:

```java
@Component
class A {
    private final B b;

    public A(@Lazy B b) {   // proxy injected, real B created on first use
        this.b = b;
    }
}
```

Still a workaround — refactoring is the real fix.

---

## Global Lazy Initialization

In `application.properties`:

```properties
spring.main.lazy-initialization=true
```

Applies to all beans in the Spring Boot app.

Trade-off: faster startup, but errors surface at runtime instead of startup.

---

# 6. Interview Questions

## Q1

What is a circular dependency?

**Answer:**

When two or more beans depend on each other (A needs B, B needs A), so Spring cannot create either one. Results in `BeanCurrentlyInCreationException`.

---

## Q2

Why is fixing circular dependency with setter/field injection a bad idea?

**Answer:**

It masks the problem using early references. The cycle remains and signals a design flaw — classes are tightly coupled and violating Single Responsibility.

---

## Q3

What is the best way to resolve a circular dependency?

**Answer:**

Refactor. Move shared logic into a third independent service so both classes depend on it, making the dependency chain linear.

---

## Q4

Difference between Singleton and Prototype scope?

**Answer:**

Singleton: one shared instance per container (default). Prototype: a new instance on every request. Use Singleton for stateless beans, Prototype for stateful ones.

---

## Q5

What is Fail-Fast in Spring?

**Answer:**

Because singleton beans are eagerly created at startup, configuration errors (missing beans, cycles) crash the app immediately instead of failing later during a user request.

---

## Q6

What does `@Lazy` do?

**Answer:**

Delays bean creation until first use. When used on an injection point, Spring injects a proxy and creates the real bean only when a method is called.

---

## Q7

How do you enable lazy initialization globally?

**Answer:**

Set `spring.main.lazy-initialization=true` in `application.properties`.

---

## Q8

Does Spring manage the full lifecycle of Prototype beans?

**Answer:**

No. Spring creates and wires them, but does not manage destruction. Cleanup callbacks like `@PreDestroy` are not called for prototype beans.
