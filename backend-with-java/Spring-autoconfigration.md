# Spring Boot — Auto-Configuration & Opinionated Defaults

---

# Table of Contents

1. Spring Core vs Spring Boot
2. Starters & Starter Parent
3. @SpringBootApplication
4. How Auto-Configuration Works
5. Practical Example
6. Interview Questions

---

# 1. Spring Core vs Spring Boot

Spring Boot is **not magic**. It's an **opinionated** framework: it picks sensible defaults so you don't configure everything by hand.

## Spring Core (Manual)

```java
@Configuration
@ComponentScan("com.example")
public class AppConfig { }

public class Main {
    public static void main(String[] args) {
        ApplicationContext context =
            new AnnotationConfigApplicationContext(AppConfig.class);

        OrderService service = context.getBean(OrderService.class);
        service.placeOrder();
    }
}
```

You manage the container, config class, component scan, and bean lookup.

## Spring Boot (Auto)

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

One annotation, one line. Container setup, scanning, and wiring are automatic.

---

# 2. Starters & Starter Parent

## Starter Dependencies

Instead of adding many libraries with versions, add one **starter**:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

It pulls in all needed **transitive dependencies**:

```text
spring-boot-starter-web
   ├── spring-webmvc
   ├── jackson (JSON)
   ├── embedded Tomcat
   └── spring-boot-starter (core + logging)
```

---

## Starter Parent

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>
```

Provides **version management**: all Spring-related dependencies are tested to work together, so you don't specify versions or track compatibility.

```text
Without parent: you pick versions for 20+ libraries
With parent:    one version, everything compatible
```

---

# 3. @SpringBootApplication

A combination of **three annotations**:

```java
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan
public @interface SpringBootApplication { }
```

| Annotation | Role |
|-----------|------|
| `@SpringBootConfiguration` | Marks the class as a config source (specialized `@Configuration`) |
| `@EnableAutoConfiguration` | Auto-creates beans based on classpath dependencies |
| `@ComponentScan` | Scans the base package and sub-packages for `@Component` classes |

## Package Rule

`@ComponentScan` starts from the **package of the main class**.

```text
com.example.demo          ← DemoApplication here
com.example.demo.service  ← scanned ✓
com.example.other         ← NOT scanned ✗
```

---

# 4. How Auto-Configuration Works

Spring Boot ships many `@AutoConfiguration` classes. Each one uses **conditional annotations** to decide whether to create its beans.

## Flow

```text
App starts
      ↓
@EnableAutoConfiguration loads candidate auto-config classes
      ↓
Each class checks its conditions
      ↓
Conditions pass → beans created
Conditions fail → skipped
```

---

## @ConditionalOnClass

Create the bean **only if a class exists on the classpath**.

```java
@AutoConfiguration
@ConditionalOnClass(DispatcherServlet.class)
public class WebMvcAutoConfiguration {
    // Web MVC beans created only if spring-web is on the classpath
}
```

This is why adding `spring-boot-starter-web` automatically gives you an **embedded Tomcat** and Spring MVC.

---

## @ConditionalOnMissingBean

Create the bean **only if you haven't defined your own**.

```java
@Bean
@ConditionalOnMissingBean
public ObjectMapper objectMapper() {
    return new ObjectMapper();   // default
}
```

Define your own and Boot backs off:

```java
@Configuration
public class MyConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        return mapper;   // yours wins
    }
}
```

---

## Summary

| Annotation | Bean created when... |
|-----------|---------------------|
| `@ConditionalOnClass` | A given class is on the classpath |
| `@ConditionalOnMissingBean` | You haven't defined that bean yourself |

```text
Sensible defaults + easy override = opinionated but flexible
```

## See What Was Auto-Configured

```properties
debug=true
```

Prints a **conditions report** showing which auto-configs matched and which didn't.

---

# 5. Practical Example

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
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        ApplicationContext context =
            SpringApplication.run(DemoApplication.class, args);

        context.getBean(OrderService.class).placeOrder();
    }
}
```

What Spring Boot did for you:

```text
Component scan found both @Component classes
      ↓
Created beans
      ↓
Injected PaymentService into OrderService
      ↓
No config class, no manual context creation
```

Add `spring-boot-starter-web` and Tomcat starts automatically through auto-configuration.

---

# 6. Interview Questions

## Q1

What does "opinionated" mean for Spring Boot?

**Answer:**

It provides sensible defaults and conventions so you don't configure everything manually, while still letting you override them.

---

## Q2

What is a Spring Boot Starter?

**Answer:**

A single dependency that bundles all libraries needed for a feature (e.g., `spring-boot-starter-web` for MVC, Jackson, and Tomcat), including compatible transitive dependencies.

---

## Q3

What does `spring-boot-starter-parent` do?

**Answer:**

Provides dependency version management so all Spring-related libraries are compatible, removing the need to specify versions manually.

---

## Q4

What three annotations make up `@SpringBootApplication`?

**Answer:**

`@SpringBootConfiguration`, `@EnableAutoConfiguration`, and `@ComponentScan`.

---

## Q5

What does `@EnableAutoConfiguration` do?

**Answer:**

Triggers Spring Boot to create beans automatically based on the dependencies on the classpath and the application's configuration.

---

## Q6

What does `@ConditionalOnClass` do?

**Answer:**

Creates a bean only if a specific class is present on the classpath — for example, Web MVC beans only when the web dependency exists.

---

## Q7

What does `@ConditionalOnMissingBean` do?

**Answer:**

Creates a default bean only if the user hasn't defined one. It lets you override Spring Boot's defaults by declaring your own bean.

---

## Q8

Why is a Tomcat server started when you add `spring-boot-starter-web`?

**Answer:**

The starter adds Tomcat and Spring MVC to the classpath. Auto-configuration classes detect them via `@ConditionalOnClass` and set up the embedded server automatically.

---

## Q9

Why might `@Component` classes in another package not be detected?

**Answer:**

`@ComponentScan` only scans the main class's package and its sub-packages. Classes outside that hierarchy need an explicit `scanBasePackages` setting.

---

## Q10

How can you check which auto-configurations were applied?

**Answer:**

Set `debug=true` in `application.properties` to print the conditions evaluation report.
