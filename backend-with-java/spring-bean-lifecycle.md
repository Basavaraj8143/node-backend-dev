# Spring Bean Lifecycle

---

# Table of Contents

1. IoC Container's Role
2. Setup & Example
3. Lifecycle Overview
4. Aware Interfaces
5. Initialization Callbacks
6. Destruction Callbacks
7. Singleton vs Prototype Lifecycle
8. @Lazy and Circular Dependency
9. Interview Questions

---

# 1. IoC Container's Role

In plain Java, **you** create and clean up objects.

In Spring, the **IoC container** owns the entire lifecycle:

```text
Instantiation → Dependency Injection → Initialization → Use → Destruction
```

The container doesn't receive ready-made objects. It reads **metadata** (from `AppConfig.java`, annotations, etc.) using **Java Reflection**.

```text
ClassName.class  →  constructors, methods, annotations
(no object instance needed)
```

---

# 2. Setup & Example

Maven dependency:

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>7.0.7</version>
</dependency>
```

Scenario: `OrderService` depends on `PaymentService`.

```java
@Component
public class PaymentService {
    public void pay() {
        System.out.println("Payment done");
    }
}

@Component
public class OrderService {

    private final PaymentService paymentService;

    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    public void placeOrder() {
        paymentService.pay();
    }
}
```

```java
@Configuration
@ComponentScan("com.example")
public class AppConfig { }
```

```java
public class Main {
    public static void main(String[] args) {
        ApplicationContext context =
            new AnnotationConfigApplicationContext(AppConfig.class);

        OrderService orderService = context.getBean(OrderService.class);
        orderService.placeOrder();
    }
}
```

---

# 3. Lifecycle Overview

```text
1. Container starts
        ↓
2. Reads bean definitions (scope, init needs)
        ↓
3. Instantiation (constructor)
        ↓
4. Dependency Injection
        ↓
5. Aware interfaces
        ↓
6. Initialization callbacks
        ↓
7. Bean ready for use
        ↓
8. Destruction callbacks (on container close)
```

---

# 4. Aware Interfaces

Let a bean access Spring internals by implementing a marker interface.

| Interface | Gives you |
|-----------|-----------|
| `BeanNameAware` | The bean's name in the container |
| `ApplicationContextAware` | Reference to the `ApplicationContext` |

```java
@Component
public class OrderService implements BeanNameAware, ApplicationContextAware {

    @Override
    public void setBeanName(String name) {
        System.out.println("Bean name: " + name);
    }

    @Override
    public void setApplicationContext(ApplicationContext ctx) {
        System.out.println("Context received");
    }
}
```

Called **after** dependency injection, **before** init callbacks.

---

# 5. Initialization Callbacks

Run custom logic **after** all properties/dependencies are set.

## Option 1: InitializingBean

```java
@Component
public class OrderService implements InitializingBean {

    @Override
    public void afterPropertiesSet() {
        System.out.println("InitializingBean init");
    }
}
```

Ties your class to a Spring interface.

---

## Option 2: Custom initMethod

```java
@Configuration
public class AppConfig {

    @Bean(initMethod = "setup")
    public OrderService orderService() {
        return new OrderService();
    }
}
```

```java
public class OrderService {
    public void setup() {
        System.out.println("Custom init");
    }
}
```

---

## Option 3: @PostConstruct (Recommended)

```java
@Component
public class OrderService {

    @PostConstruct
    public void init() {
        System.out.println("PostConstruct init");
    }
}
```

Clean, no Spring interface coupling. Uses `jakarta.annotation.PostConstruct`.

---

## Execution Order (if all are used)

```text
@PostConstruct
      ↓
InitializingBean.afterPropertiesSet()
      ↓
custom initMethod
```

---

# 6. Destruction Callbacks

Clean up resources (connections, files, threads) when the bean is removed.

## Option 1: DisposableBean

```java
@Component
public class OrderService implements DisposableBean {

    @Override
    public void destroy() {
        System.out.println("DisposableBean cleanup");
    }
}
```

## Option 2: Custom destroyMethod

```java
@Bean(destroyMethod = "cleanup")
public OrderService orderService() {
    return new OrderService();
}
```

## Option 3: @PreDestroy (Recommended)

```java
@Component
public class OrderService {

    @PreDestroy
    public void cleanup() {
        System.out.println("PreDestroy cleanup");
    }
}
```

## Execution Order

```text
@PreDestroy
      ↓
DisposableBean.destroy()
      ↓
custom destroyMethod
```

Triggered when the context closes:

```java
((AnnotationConfigApplicationContext) context).close();
```

---

# 7. Singleton vs Prototype Lifecycle

| | Singleton | Prototype |
|--|-----------|-----------|
| Creation | By container | By container |
| Init callbacks | Yes | Yes |
| Destroy callbacks | **Yes** | **No** |
| Managed | Full lifecycle | Creation only |

**Why Prototype isn't destroyed:** the container hands the object over and doesn't keep a reference. Tracking every instance would cause memory leaks. Cleanup is the caller's job.

---

# 8. @Lazy and Circular Dependency

## @Lazy

Delays bean creation until first request.

```java
@Component
@Lazy
public class ReportService { }
```

---

## Circular Dependency with Setter + @PostConstruct

When constructor injection can't resolve a cycle, setter injection lets Spring create both objects first, then wire them.

```java
@Component
public class A {

    private B b;

    @Autowired
    public void setB(B b) {
        this.b = b;
    }

    @PostConstruct
    public void init() {
        // safe: dependencies are injected by now
        b.hello();
    }
}
```

Note: this is a **workaround**. Refactoring to remove the cycle is the real fix (see circular dependency notes).

---

# 9. Interview Questions

## Q1

What are the main stages of the Spring Bean lifecycle?

**Answer:**

Container startup → read bean definitions → instantiation → dependency injection → Aware callbacks → initialization callbacks → ready → destruction callbacks.

---

## Q2

How does Spring read class metadata without an object?

**Answer:**

Using the Java Reflection API. `ClassName.class` exposes constructors, methods, and annotations without creating an instance.

---

## Q3

What are Aware interfaces?

**Answer:**

Interfaces like `BeanNameAware` and `ApplicationContextAware` that give a bean access to Spring infrastructure (its name, the context). Called after DI and before init callbacks.

---

## Q4

Three ways to run logic after bean initialization?

**Answer:**

`InitializingBean.afterPropertiesSet()`, a custom `initMethod`, and `@PostConstruct`. `@PostConstruct` is recommended since it doesn't couple code to Spring interfaces.

---

## Q5

Order of initialization callbacks?

**Answer:**

`@PostConstruct` → `afterPropertiesSet()` → custom `initMethod`.

---

## Q6

Three ways to run cleanup logic?

**Answer:**

`DisposableBean.destroy()`, a custom `destroyMethod`, and `@PreDestroy` (recommended).

---

## Q7

Why doesn't Spring call destroy callbacks on Prototype beans?

**Answer:**

The container doesn't hold references to prototype instances after handing them out. Tracking them would cause memory leaks, so cleanup is left to the caller.

---

## Q8

Why use `@PostConstruct` instead of the constructor for init logic?

**Answer:**

In the constructor, dependencies may not be injected yet (especially with setter/field injection). `@PostConstruct` runs after all injection is complete.

---

## Q9

What does `@Lazy` do?

**Answer:**

Delays bean creation until it's first requested, instead of creating singletons eagerly at startup.

---

## Q10

How can setter injection help with circular dependencies?

**Answer:**

Spring can instantiate both beans first (via constructors), then inject each into the other through setters. It works, but it's a workaround; refactoring to remove the cycle is the better design.
