# Proxy Design Pattern

---

# Table of Contents

1. Core Concept
2. Standard UML
3. Virtual Proxy (Lazy Loading)
4. Protection Proxy (Access Control)
5. Remote Proxy (Network Communication)
6. Real-World Use Case — Microservices
7. Proxy vs Decorator vs Adapter
8. Quick Revision Summary
9. Interview Questions

---

# 1. Core Concept

A **structural** pattern that provides a **surrogate or placeholder** for another object to **control access** to it.

```text
Client  →  Proxy  →  Real Subject
```

The proxy sits between the client and the real object. The client doesn't know it's talking to a proxy.

## What a Proxy Can Do

- **Optimize resources** (delay creating heavy objects)
- **Enforce security** (check permissions)
- **Handle networking** (talk to remote objects)
- Add logging, caching, or validation around calls

---

# 2. Standard UML

```text
        <<interface>>
          ISubject
         + request()
              ▲
      ┌───────┴────────┐
 RealSubject      ProxySubject ◆──────> RealSubject
 + request()      + request()
```

- Both `RealSubject` and `ProxySubject` **implement the same interface**
- `ProxySubject` **holds a reference** to `RealSubject`
- Client codes against `ISubject` only

---

# 3. Virtual Proxy (Lazy Loading)

Controls access to **resource-heavy objects** by delaying their creation until needed.

## Example: Loading a Large Image

Creating `RealImage` loads the file from disk (expensive). We only want to pay that cost if the image is actually displayed.

### Step 1: Interface

```java
interface Image {
    void display();
}
```

### Step 2: Real Subject

```java
class RealImage implements Image {

    private final String fileName;

    public RealImage(String fileName) {
        this.fileName = fileName;
        loadFromDisk();                 // heavy work in constructor
    }

    private void loadFromDisk() {
        System.out.println("Loading " + fileName + " from disk...");
    }

    @Override
    public void display() {
        System.out.println("Displaying " + fileName);
    }
}
```

### Step 3: Proxy

```java
class ImageProxy implements Image {

    private final String fileName;
    private RealImage realImage;        // null until needed

    public ImageProxy(String fileName) {
        this.fileName = fileName;
    }

    @Override
    public void display() {
        if (realImage == null) {
            realImage = new RealImage(fileName);   // created on first use
        }
        realImage.display();
    }
}
```

### Step 4: Client

```java
public class Main {
    public static void main(String[] args) {

        Image image = new ImageProxy("photo.jpg");   // no disk load yet

        System.out.println("Proxy created");

        image.display();    // loads from disk + displays
        image.display();    // already loaded, just displays
    }
}
```

Output:

```text
Proxy created
Loading photo.jpg from disk...
Displaying photo.jpg
Displaying photo.jpg
```

### Flow

```text
display() called
      ↓
realImage == null?
   Yes → create RealImage (heavy load)
   No  → reuse existing
      ↓
realImage.display()
```

The heavy load happens **once**, and only if needed.

---

# 4. Protection Proxy (Access Control)

Restricts access to a resource based on **user permissions**.

## Example: Premium PDF Unlock

```java
class User {
    private final String name;
    private final boolean isPremium;

    public User(String name, boolean isPremium) {
        this.name = name;
        this.isPremium = isPremium;
    }

    public boolean isPremium() { return isPremium; }
    public String getName()    { return name; }
}
```

```java
interface DocumentReader {
    void unlockPDF();
}

class RealDocumentReader implements DocumentReader {
    @Override
    public void unlockPDF() {
        System.out.println("PDF unlocked");
    }
}
```

```java
class DocumentReaderProxy implements DocumentReader {

    private final RealDocumentReader reader = new RealDocumentReader();
    private final User user;

    public DocumentReaderProxy(User user) {
        this.user = user;
    }

    @Override
    public void unlockPDF() {
        if (user.isPremium()) {
            reader.unlockPDF();
        } else {
            System.out.println("Access denied: premium membership required");
        }
    }
}
```

```java
DocumentReader r1 = new DocumentReaderProxy(new User("Alice", true));
r1.unlockPDF();    // PDF unlocked

DocumentReader r2 = new DocumentReaderProxy(new User("Bob", false));
r2.unlockPDF();    // Access denied: premium membership required
```

The real reader contains **no permission logic**. The proxy handles it.

---

# 5. Remote Proxy (Network Communication)

A **local representative** for an object in a different address space or on another server.

The client calls methods as if the object were local. The proxy handles the network.

## Example: DataService

```java
interface DataService {
    String fetchData(String id);
}
```

```java
class DataServiceProxy implements DataService {

    private final String serverUrl;

    public DataServiceProxy(String serverUrl) {
        this.serverUrl = serverUrl;
    }

    @Override
    public String fetchData(String id) {
        // handles connection, request, and response
        System.out.println("Connecting to " + serverUrl);
        System.out.println("Sending request for id: " + id);
        return "Data for " + id;      // simulated remote response
    }
}
```

```java
DataService service = new DataServiceProxy("https://api.example.com");
String data = service.fetchData("42");     // looks like a local call
```

```text
Client → fetchData("42")
            ↓
      DataServiceProxy
            ↓  (HTTP / gRPC / RMI)
      Remote Server
            ↓
      Response back to client
```

Real-world forms: Java RMI stubs, gRPC client stubs, Feign clients in Spring.

---

# 6. Real-World Use Case — Microservices

`CartService` (Server 2) needs data from `UserService` (Server 1).

```text
CartService ──> UserProxy ──(network)──> UserService
 (client)      (remote proxy)             (real subject)
```

```java
interface UserService {
    User getUser(String userId);
}

class UserProxy implements UserService {

    private final String baseUrl;

    public UserProxy(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    @Override
    public User getUser(String userId) {
        // build HTTP request, send to Server 1, parse response
        return httpGet(baseUrl + "/users/" + userId);
    }
}

class CartService {

    private final UserService userService;     // could be proxy or local

    public CartService(UserService userService) {
        this.userService = userService;
    }

    public void checkout(String userId) {
        User user = userService.getUser(userId);   // no network details here
        // ...
    }
}
```

`CartService` has no idea the user data lives on another server. The proxy abstracts the inter-service communication.

---

# 7. Proxy vs Decorator vs Adapter

All three wrap another object, but the **intent** differs.

| Pattern | Intent | Interface |
|---------|--------|-----------|
| **Proxy** | **Control access** to the object | Same as the real subject |
| **Decorator** | **Add behavior** to the object | Same as the component |
| **Adapter** | **Convert** one interface to another | Different from the adaptee |

```text
Proxy:     "Should I let this call through, and when?"
Decorator: "Let me add something extra to this call."
Adapter:   "Let me translate this call into one you understand."
```

---

# 8. Quick Revision Summary

| Proxy Type | Purpose | Example |
|-----------|---------|---------|
| **Virtual** | Lazy-create heavy objects | `ImageProxy` loads image on first `display()` |
| **Protection** | Permission checks | `DocumentReaderProxy` checks `isPremium` |
| **Remote** | Represent a remote object | `DataServiceProxy` / `UserProxy` over the network |

```text
Definition: A surrogate or placeholder for another object to control access to it.
```
<img width="946" height="435" alt="image" src="https://github.com/user-attachments/assets/a40f56f9-2e82-4885-a22b-d45d716bb536" />


---

# 9. Interview Questions

## Q1

What is the Proxy pattern?

**Answer:**

A structural pattern that provides a surrogate or placeholder for another object to control access to it, without the client knowing it's not talking to the real object.

---

## Q2

What are the main components?

**Answer:**

A subject interface, a RealSubject that does the actual work, and a Proxy that implements the same interface and holds a reference to the RealSubject.

---

## Q3

What is a Virtual Proxy?

**Answer:**

A proxy that delays creating an expensive object until it's actually needed (lazy loading), such as loading a large image only when `display()` is first called.

---

## Q4

What is a Protection Proxy?

**Answer:**

A proxy that restricts access to the real object based on permissions, such as allowing `unlockPDF()` only for premium users.

---

## Q5

What is a Remote Proxy?

**Answer:**

A local representative for an object in another address space or server. It handles the network communication so the client can call methods as if they were local.

---

## Q6

How does Proxy help in microservices?

**Answer:**

A client service (e.g., `CartService`) calls a proxy (`UserProxy`) that handles HTTP/gRPC communication with another service. The client stays free of networking details.

---

## Q7

Proxy vs Decorator?

**Answer:**

Proxy controls access to an object (lazy loading, permissions, network). Decorator adds new behavior to an object. Structurally they look similar, but their intent differs.

---

## Q8

Proxy vs Adapter?

**Answer:**

A Proxy keeps the same interface as the real subject and controls access. An Adapter changes the interface so incompatible classes can work together.

---

## Q9

Why must the Proxy implement the same interface as the real subject?

**Answer:**

So the client can use either one interchangeably, without knowing whether it's talking to a proxy or the real object.

---

## Q10

Which SOLID principles does Proxy support?

**Answer:**

SRP (access control, lazy loading, or networking lives in the proxy, not the real class), OCP (add a proxy without changing the real subject), and DIP (client depends on the interface).

---

## Q11

Give real-world Java/Spring examples of Proxy.

**Answer:**

Java RMI stubs, `java.lang.reflect.Proxy`, Spring AOP proxies (for `@Transactional`, `@Cacheable`), Hibernate lazy-loaded entities, and Feign clients.

---

## Q12

What are the drawbacks of Proxy?

**Answer:**

Extra indirection and more classes, possible latency (especially remote proxies), and added complexity when the proxy logic grows large.
