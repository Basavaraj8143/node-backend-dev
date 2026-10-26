# Spring Boot — Introduction

---

# Table of Contents

1. Client-Server Architecture
2. IP Addresses & Ports
3. Project Setup
4. Building Your First Endpoint
5. Interview Questions

---

# 1. Client-Server Architecture

```text
Browser (Client)
      ↓
HTTP Request
      ↓
Spring Boot App (Server)
      ↓
HTTP Response
      ↓
Browser renders result
```

On a local machine, the browser uses:

```text
localhost = 127.0.0.1
```

---

# 2. IP Addresses & Ports

Every device has an **IP address**.

**Port numbers** identify which application on that device handles the traffic.

```text
localhost:8080  →  Spring Boot app (default)
localhost:5432  →  PostgreSQL
localhost:6379  →  Redis
```

### Standard Public Ports

| Port | Protocol |
|------|----------|
| 80 | HTTP |
| 443 | HTTPS |
| 8080 | Spring Boot (default) |

A **reverse proxy** (e.g., Nginx) maps public port 80/443 → internal port 8080.

---

# 3. Project Setup

## Spring Initializr

Generate a project at [start.spring.io](https://start.spring.io)

Settings:

```text
Project   →  Maven
Language  →  Java
Dependency →  Spring Web
```

`Spring Web` includes:

- RESTful API support
- Embedded Apache Tomcat server

## Entry Point

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

---

# 4. Building Your First Endpoint

## Controller

```java
@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello World";
    }
}
```

Hit `http://localhost:8080/hello` → returns `Hello World`.

---

## Change Default Port

In `application.properties`:

```properties
server.port=9090
```

Now runs on `http://localhost:9090/hello`.

---

# 5. Interview Questions

## Q1

What is `localhost`?

**Answer:**

`localhost` maps to `127.0.0.1` — the loopback IP address of your own machine. Used to access a server running locally.

---

## Q2

Why does Spring Boot use port 8080 by default?

**Answer:**

Ports 80 and 443 are reserved for HTTP/HTTPS in production. 8080 is the conventional development alternative. It can be changed via `server.port` in `application.properties`.

---

## Q3

What does `@RestController` do?

**Answer:**

Marks the class as a REST API controller. Combines `@Controller` and `@ResponseBody` — every method's return value is written directly to the HTTP response body.

---

## Q4

What is a reverse proxy and why is it used?

**Answer:**

A server (e.g., Nginx) that sits in front of your app, receiving public traffic on port 80/443 and forwarding it to the internal app port (8080). Adds security, load balancing, and SSL termination.

---

## Q5

What does Spring Initializr do?

**Answer:**

Generates a pre-configured Spring Boot project with folder structure, build file, and selected dependencies — available at start.spring.io.

---

## Q6

Why is understanding Spring internals (IoC, DI) important even when using Spring Boot?

**Answer:**

Spring Boot's auto-configuration hides complexity. Without understanding Dependency Injection and IoC, debugging misconfigured beans or unexpected behavior becomes very difficult in real projects.
