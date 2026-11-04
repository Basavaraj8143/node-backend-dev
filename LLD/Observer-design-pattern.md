# Observer Design Pattern

---

# Table of Contents

1. Core Concept
2. Polling vs Pushing
3. Architecture (UML)
4. Implementation — YouTube Channel Example
5. Design Considerations
6. Real-World Applications
7. Interview Questions

---

# 1. Core Concept

A **behavioral** pattern that creates a **one-to-many** relationship between objects.

> When one object (**Observable / Subject**) changes state, all its dependents (**Observers**) are notified and updated automatically.

## YouTube Analogy

```text
YouTube Channel  →  Observable (Subject)
Subscribers      →  Observers

Channel uploads a video
        ↓
All subscribers get notified
```

---

# 2. Polling vs Pushing

## Polling (Inefficient)

Observers repeatedly ask the observable if anything changed.

```text
Subscriber: "New video?"  → No
Subscriber: "New video?"  → No
Subscriber: "New video?"  → No
Subscriber: "New video?"  → Yes
```

Wastes CPU and network calls.

## Pushing (Preferred)

The observable notifies observers **only when a change occurs**.

```text
Channel uploads video
        ↓
Channel pushes notification to subscribers
```

The Observer pattern uses **pushing**.

---

# 3. Architecture (UML)

Two main interfaces:

```text
┌──────────────────────┐        ┌──────────────────────┐
│   <<interface>>      │        │   <<interface>>      │
│   IObservable        │        │   IObserver          │
├──────────────────────┤        ├──────────────────────┤
│ + subscribe(o)       │        │ + update(...)        │
│ + unsubscribe(o)     │        └──────────▲───────────┘
│ + notifyObservers()  │                   │
└──────────▲───────────┘          ┌────────┴────────┐
           │                      │  Subscriber     │
┌──────────┴───────────┐          └─────────────────┘
│  YouTubeChannel      │
├──────────────────────┤
│ - subscribers: List  │◇─────────> IObserver
└──────────────────────┘
```

The concrete observable keeps a **list of observers**. On a state change, it loops through the list and calls each observer's `update()`.

---

# 4. Implementation — YouTube Channel Example

## Interfaces

```java
interface Observer {
    void update(String videoTitle);
}

interface Observable {
    void subscribe(Observer o);
    void unsubscribe(Observer o);
    void notifyObservers(String videoTitle);
}
```

## Concrete Observable

```java
class YouTubeChannel implements Observable {

    private final String name;
    private final List<Observer> subscribers = new ArrayList<>();

    public YouTubeChannel(String name) {
        this.name = name;
    }

    @Override
    public void subscribe(Observer o) {
        subscribers.add(o);
    }

    @Override
    public void unsubscribe(Observer o) {
        subscribers.remove(o);
    }

    @Override
    public void notifyObservers(String videoTitle) {
        for (Observer o : subscribers) {
            o.update(videoTitle);
        }
    }

    // business logic — triggers the notification
    public void uploadVideo(String title) {
        System.out.println(name + " uploaded: " + title);
        notifyObservers(title);
    }
}
```

## Concrete Observer

```java
class Subscriber implements Observer {

    private final String username;

    public Subscriber(String username) {
        this.username = username;
    }

    @Override
    public void update(String videoTitle) {
        System.out.println(username + " notified: New video - " + videoTitle);
    }
}
```

## Usage

```java
YouTubeChannel channel = new YouTubeChannel("CoderArmy");

Subscriber alice = new Subscriber("Alice");
Subscriber bob = new Subscriber("Bob");

channel.subscribe(alice);
channel.subscribe(bob);

channel.uploadVideo("Observer Pattern Explained");
// Alice notified: New video - Observer Pattern Explained
// Bob notified: New video - Observer Pattern Explained

channel.unsubscribe(bob);

channel.uploadVideo("Singleton Pattern");
// Alice notified: New video - Singleton Pattern
```

## Flow

```text
uploadVideo("title")
        ↓
notifyObservers("title")
        ↓
for each subscriber → update("title")
        ↓
Each observer reacts in its own way
```

Observers are **loosely coupled**: the channel only knows they implement `Observer`.

---

# 5. Design Considerations

## SRP Trade-off

The concrete observable handles two things:

- Core business logic (`uploadVideo`)
- Subscription management (`subscribe`, `unsubscribe`, `notifyObservers`)

Technically this **breaks SRP**.

## Why It's Acceptable

Observer logic is **stable and rarely changes**, so bundling it with business logic is a reasonable trade-off.

## Other Points

| Point | Note |
|-------|------|
| Coupling | Observable depends only on the `Observer` interface (DIP) |
| OCP | Add new observer types without modifying the observable |
| Memory leaks | Always `unsubscribe` observers that are no longer needed |
| Thread safety | Use `CopyOnWriteArrayList` if observers can change during notification |

Note: Java's built-in `java.util.Observable` is deprecated since Java 9. Prefer your own interfaces or `PropertyChangeListener`.

---

# 6. Real-World Applications

- **Notification services** (email, push, SMS on events)
- **News feed systems** on social media
- **Event handling / listeners** in frontend and GUI frameworks
- **Stock price tickers** (subscribers react to price changes)
- **Spring events** (`ApplicationEventPublisher` + `@EventListener`)

---

# 7. Interview Questions

## Q1

What is the Observer pattern?

**Answer:**

A behavioral pattern establishing a one-to-many relationship: when the Observable's state changes, all registered Observers are automatically notified.

---

## Q2

Polling vs Pushing?

**Answer:**

Polling: observers repeatedly ask for changes (wasteful). Pushing: the observable notifies observers only when something changes. Observer uses pushing.

---

## Q3

What are the two main interfaces?

**Answer:**

`IObservable` (`subscribe`, `unsubscribe`, `notify`) and `IObserver` (`update`).

---

## Q4

How does the observable notify observers?

**Answer:**

It keeps a list of observers and iterates through it, calling each observer's `update()` method when state changes.

---

## Q5

Does the Observer pattern violate SRP?

**Answer:**

Technically yes, since the concrete observable handles both business logic and subscription management. It's an accepted trade-off because observer logic is stable and rarely changes.

---

## Q6

How does Observer promote loose coupling?

**Answer:**

The observable only knows observers through the `Observer` interface, not their concrete classes. Observers can be added or removed without changing the observable.

---

## Q7

How does Observer support OCP?

**Answer:**

New observer types are added by implementing `Observer`. The observable remains unchanged.

---

## Q8

What is a common pitfall of the Observer pattern?

**Answer:**

Memory leaks when observers aren't unsubscribed, since the observable keeps references to them. Also, notification order isn't guaranteed and heavy observers can slow down notifications.

---

## Q9

Give real-world uses of the Observer pattern.

**Answer:**

Notification systems, social media news feeds, UI event listeners, stock tickers, and Spring's event publishing mechanism.

---

## Q10

How is Observer different from Pub/Sub?

**Answer:**

In Observer, observers register directly with the subject, so they know each other. In Pub/Sub, a message broker sits between publishers and subscribers, fully decoupling them (e.g., Kafka, RabbitMQ).
