# Spring IoC Container & Beans

---

# Table of Contents

1. The Problem — Manual Dependency Management
2. IoC Container & ApplicationContext
3. @Component & Component Scan
4. @Autowired & Constructor Injection
5. Resolving Ambiguity — @Primary & @Qualifier
6. @Bean in @Configuration
7. Bean Management Flow
8. ApplicationContext vs BeanFactory
9. Interview Questions

---

# 1. The Problem — Manual Dependency Management

```java
// Manual wiring — tightly coupled, hard to scale
PaymentService paymentService = new CardPayment();
OrderService orderService = new OrderService(paymentService);
```

In large apps with hundreds of beans, managing this manually is impossible.

Spring IoC Container takes over — no more `new` keyword.

---

# 2. IoC Container & ApplicationContext

**ApplicationContext** is the Spring IoC Container interface.

It manages:

- Bean creation
- Dependency wiring
- Bean lifecycle

```java
ApplicationContext context =
    new AnnotationConfigApplicationContext(AppConfig.class);

OrderService orderService = context.getBean(OrderService.class);
```

Spring uses Java's **Reflection API** under the hood to inspect classes, find annotations, and instantiate objects automatically.

---

# 3. @Component & Component Scan

`@Component` tells Spring to register the class as a bean.

```java
@Component
public class CardPayment implements PaymentService {
    public void pay(double amount) {
        System.out.println("Paid via Card: " + amount);
    }
}
```

Spring scans the classpath during startup:

```text
Component Scan
      ↓
Finds @Component classes
      ↓
Creates Bean definitions (metadata)
      ↓
Instantiates & registers beans
```

Enable scanning via:

```java
@Configuration
@ComponentScan("com.example")
public class AppConfig { }
```

In Spring Boot, `@SpringBootApplication` includes `@ComponentScan` automatically.

---

# 4. @Autowired & Constructor Injection

`@Autowired` tells Spring to inject a dependency.

---

## Constructor Injection (Recommended)

```java
@Component
public class OrderService {

    private final PaymentService paymentService;

    @Autowired  // optional in Spring 4.3+ if only one constructor
    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    public void placeOrder(double amount) {
        paymentService.pay(amount);
    }
}
```

Why constructor injection is preferred:

- Allows `final` fields — object is **immutable**
- Dependencies are **mandatory** — object can't be created without them
- Easy to test — just pass a mock via constructor, no Spring context needed

```java
// Unit test — no Spring needed
PaymentService mock = amount -> System.out.println("Mock pay");
OrderService service = new OrderService(mock);
```

---

## Field Injection (Avoid)

```java
@Component
public class OrderService {
    @Autowired
    private PaymentService paymentService; // not recommended
}
```

Problems: can't use `final`, harder to test, hides dependencies.

---

# 5. Resolving Ambiguity — @Primary & @Qualifier

When multiple beans implement the same interface, Spring doesn't know which to inject.

```java
@Component
public class CardPayment implements PaymentService { ... }

@Component
public class UpiPayment implements PaymentService { ... }
```

Spring throws: `NoUniqueBeanDefinitionException`

---

## Option 1: @Primary

Mark one as the default:

```java
@Component
@Primary
public class CardPayment implements PaymentService { ... }
```

Spring injects `CardPayment` by default.

---

## Option 2: @Qualifier

Specify exactly which bean to inject:

```java
@Component
public class OrderService {

    private final PaymentService paymentService;

    @Autowired
    public OrderService(@Qualifier("upiPayment") PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}
```

`@Qualifier` value = bean name (default: class name in camelCase).

---

# 6. @Bean in @Configuration

Use `@Bean` when you **can't annotate the class** with `@Component`:

- Third-party library classes
- Complex object construction logic

```java
@Configuration
public class AppConfig {

    @Bean
    public PaymentService paymentService() {
        // full control over instantiation
        CardPayment cp = new CardPayment();
        cp.setTimeout(5000);
        return cp;
    }

    @Bean
    public OrderService orderService() {
        return new OrderService(paymentService()); // manual wiring
    }
}
```

Spring calls these methods and registers the returned objects as beans.

---

# 7. Bean Management Flow

```text
Spring starts up
      ↓
Parses @Configuration / @ComponentScan
      ↓
Creates Bean Definitions (metadata)
      ↓
Resolves dependency order
      ↓
Instantiates beans
      ↓
Injects dependencies (@Autowired)
      ↓
Application ready
```

---

# 8. ApplicationContext vs BeanFactory

| Feature | BeanFactory | ApplicationContext |
|---------|-------------|-------------------|
| Bean creation | Lazy (on demand) | Eager (at startup) |
| Annotation support | Limited | Full |
| Event publishing | No | Yes |
| Internationalization | No | Yes |
| Use in production | Rarely | Always |

`ApplicationContext` extends `BeanFactory` — it is the standard choice.

---

# 9. Interview Questions

## Q1

What is the Spring IoC Container?

**Answer:**

The core of Spring that manages the lifecycle of objects (Beans) — creating, wiring, and destroying them automatically. Represented by the `ApplicationContext` interface.

---

## Q2

What is `@Component` and how does it work?

**Answer:**

Marks a class for Spring to detect and register as a Bean during Component Scan. Spring uses the Reflection API to find annotated classes and creates bean instances from them.

---

## Q3

Why is Constructor Injection preferred over Field Injection?

**Answer:**

Constructor injection allows `final` fields (immutability), makes dependencies explicit, and enables unit testing without a Spring context — just pass a mock via the constructor.

---

## Q4

What causes `NoUniqueBeanDefinitionException` and how do you fix it?

**Answer:**

Happens when multiple beans implement the same interface. Fix with `@Primary` (default bean) or `@Qualifier("beanName")` (explicit selection).

---

## Q5

What is the difference between `@Component` and `@Bean`?

**Answer:**

`@Component` is placed on your own class — Spring creates it automatically. `@Bean` is placed on a method inside a `@Configuration` class — used for third-party classes or when you need full control over instantiation.

---

## Q6

What is the Reflection API and why does Spring use it?

**Answer:**

Java's Reflection API lets code inspect and manipulate classes, fields, and methods at runtime. Spring uses it to read annotations, find constructors, and instantiate beans without the developer calling `new`.

---

## Q7

What is `@Qualifier` and when do you use it?

**Answer:**

Used alongside `@Autowired` to specify exactly which bean to inject when multiple candidates exist for the same interface. The value matches the bean name (default: class name in camelCase).

---

## Q8

What is the difference between `ApplicationContext` and `BeanFactory`?

**Answer:**

`BeanFactory` is the basic container with lazy bean initialization. `ApplicationContext` extends it with eager initialization, annotation support, event publishing, and i18n — it's the standard choice for all Spring applications.
