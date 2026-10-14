# UML Diagrams for Low-Level Design (LLD)

---

# Table of Contents

1. Introduction to UML
2. Class Diagrams
   - Class Structure
   - Access Modifiers
   - Relationships & Associations
3. Sequence Diagrams
   - Key Components
   - Message Types
   - Combined Fragments
4. Real-World Example: ATM System
5. Quick Revision Summary
6. Interview Questions

---

# 1. Introduction to UML

## What is UML?

UML (Unified Modeling Language) is a standardized, diagrammatic way to represent software components, objects, and their interactions.

---

## Why UML?

Without UML:

```text
Explain a system using long text descriptions
      ↓
Team misunderstandings
      ↓
Inconsistent implementations
```

With UML:

```text
Visualize the system as diagrams
      ↓
Standardized, intuitive, unambiguous
      ↓
Everyone builds from the same blueprint
```

---

## UML as a Bridge

```text
Conceptual Idea
      ↓
     UML
      ↓
Actual Implementation
```

---

## Two Main Types Used in LLD

| Type | Category | Purpose |
|------|----------|---------|
| Class Diagram | Structural | Static blueprint of classes and relationships |
| Sequence Diagram | Behavioral | How objects interact over time |

---

# 2. Class Diagrams

Class diagrams define the **static blueprint** of an application.

---

## 2.1 Class Structure

A class is represented as a rectangle divided into three parts:

```text
┌─────────────────────┐
│      ClassName      │  ← Class Name
├─────────────────────┤
│  - name: String     │  ← Variables (fields)
│  - age: int         │    with data types & access modifiers
├─────────────────────┤
│  + getName(): String│  ← Methods
│  + setAge(int): void│    with return types
└─────────────────────┘
```

Abstract class is labeled:

```text
┌─────────────────────┐
│  <<abstract>>       │
│      Shape          │
├─────────────────────┤
│  ...                │
├─────────────────────┤
│  + area(): double   │  ← italic or <<abstract>> label
└─────────────────────┘
```

---

## 2.2 Access Modifiers in UML

| Symbol | Modifier | Meaning |
|--------|----------|---------|
| `+` | public | Accessible everywhere |
| `-` | private | Accessible only within the class |
| `#` | protected | Accessible in class and subclasses |

---

## 2.3 Relationships & Associations

---

### Inheritance (Is-A Relationship)

Represents a parent-child relationship.

```text
Animal
  ▲
  │  (solid line + closed hollow arrow)
  │
 Dog
```

Meaning: `Dog` IS-A `Animal`.

Java equivalent:

```java
class Dog extends Animal { }
```

---

### Simple Association

The weakest form of relationship.

One class uses another, but neither owns the other.

```text
Student ──────> Course
         (open arrow)
```

Meaning: `Student` is associated with `Course`.

Java equivalent:

```java
class Student {
    Course course;  // has a reference, no ownership
}
```

---

### Aggregation (Weak Has-A)

A container holds other objects, but those objects **can exist independently**.

```text
Room ◇──────── Bed
     (unfilled diamond)
```

Meaning: A `Room` HAS-A `Bed`, but the `Bed` can exist without the `Room`.

Java equivalent:

```java
class Room {
    private Bed bed;  // Bed exists independently

    public Room(Bed bed) {
        this.bed = bed;  // passed in from outside
    }
}
```

---

### Composition (Strong Has-A)

The strongest has-a relationship. Parts **cannot exist without the container**.

```text
Chair ◆──────── Wheel
      (filled diamond)
```

Meaning: A `Chair` HAS-A `Wheel`, but the `Wheel` cannot exist without the `Chair`.

Java equivalent:

```java
class Chair {
    private Wheel wheel;

    public Chair() {
        this.wheel = new Wheel();  // created inside — lives and dies with Chair
    }
}
```

---

### Relationship Strength Comparison

```text
Weakest                                    Strongest
  │                                             │
Simple Association → Aggregation → Composition
  │                      │               │
no ownership         independent     parts die
                       parts          with whole
```

---

### Summary Table

| Relationship | Symbol | Type | Key Idea |
|-------------|--------|------|----------|
| Inheritance | Solid line + closed arrow | Is-A | Parent-child |
| Simple Association | Open arrow | Uses | Weak link |
| Aggregation | Unfilled diamond | Has-A | Independent parts |
| Composition | Filled diamond | Has-A | Dependent parts |

---

# 3. Sequence Diagrams

Sequence diagrams visualize **how objects interact over time**.

---

## 3.1 Key Components

### Lifelines

Represent objects participating in the interaction.

```text
:ATM          :Transaction      :Account
  |                |                |
  |                |                |
  |                |                |
```

Each object gets a vertical dashed line called a lifeline.

---

### Activation Bars

Thin rectangles on a lifeline showing when an object is **actively performing a task**.

```text
:ATM
  |
  ║  ← activation bar (object is busy here)
  |
```

---

### Messages (Arrows)

Arrows between lifelines represent messages sent between objects.

```text
:ATM ──────────────────> :Transaction
        withdraw(amount)
```

---

## 3.2 Message Types

---

### Synchronous Message

Sender **waits** for a response before continuing.

```text
A ──────────────> B
  ◄──────────────
     (response)
```

Represented by a filled arrowhead.

---

### Asynchronous Message

Sender **continues** without waiting for a response.

```text
A ──────────────> B
```

Represented by an open arrowhead. No response expected immediately.

---

### Create Message

Creates a new object during the interaction.

```text
:ATM ──────────────> :Transaction
       <<create>>
```

The `Transaction` object is born at this point.

---

### Destroy Message

Marks the end of an object's lifecycle.

```text
:Transaction ──X
```

An X at the bottom of the lifeline indicates the object is destroyed.

---

### Lost Message

A message sent but the destination is unknown or outside the system boundary.

```text
A ──────────> ●
```

---

### Found Message

A message received but the source is unknown.

```text
● ──────────> B
```

---

## 3.3 Combined Fragments (Logic in Sequence Diagrams)

Combined fragments represent programming constructs inside sequence diagrams.

---

### alt (if-else)

```text
┌─────────────────────────────┐
│ alt [balance >= amount]     │
│   Transaction → Account     │
│   deduct funds              │
├─────────────────────────────┤
│ [else]                      │
│   Transaction → ATM         │
│   return insufficient funds │
└─────────────────────────────┘
```

---

### opt (if only)

```text
┌─────────────────────────────┐
│ opt [user is premium]       │
│   Apply bonus rewards       │
└─────────────────────────────┘
```

---

### loop

```text
┌─────────────────────────────┐
│ loop [3 times]              │
│   ATM → User: enter PIN     │
└─────────────────────────────┘
```

---

# 4. Real-World Example: ATM Withdrawal Flow

---

## Objects Involved

```text
:User     :ATM     :Transaction     :Account     :CashDispenser
```

---

## Sequence

```text
:User          :ATM          :Transaction     :Account     :CashDispenser
  |              |                 |               |               |
  |──withdraw──> |                 |               |               |
  |              |──<<create>>──>  |               |               |
  |              |                 |──verifyFunds─>|               |
  |              |                 |<──sufficient──|               |
  |              |                 |──requestCash──────────────────>|
  |              |                 |<──cashReady───────────────────|
  |<──dispensed──|                 |               |               |
  |              |              ───X (destroyed)   |               |
```

---

## Step-by-Step

1. `User` sends `withdraw(amount)` to `ATM`
2. `ATM` creates a `Transaction` object (`<<create>>`)
3. `Transaction` sends `verifyFunds` to `Account`
4. `Account` confirms funds are sufficient
5. `Transaction` sends `requestCash` to `CashDispenser`
6. `CashDispenser` provides cash and responds
7. `ATM` dispenses cash to `User`
8. `Transaction` object is **destroyed** (`X`)

---

## Combined Fragment Applied

```text
alt [balance >= amount]
    → proceed with steps above

[else]
    Transaction → ATM: return "Insufficient Funds"
    Transaction destroyed
```

---

# 5. Quick Revision Summary

## Class Diagram Notation

```text
+ public
- private
# protected
```

## Relationships

```text
───▷  Inheritance (Is-A)
───>  Simple Association
◇─── Aggregation (Has-A, independent)
◆─── Composition (Has-A, dependent)
```

## Sequence Diagram Components

```text
Lifeline        →  vertical dashed line per object
Activation Bar  →  rectangle showing active processing
Sync Message    →  filled arrow, waits for response
Async Message   →  open arrow, no wait
<<create>>      →  object creation
X               →  object destruction
alt             →  if-else logic
opt             →  if-only logic
loop            →  repeating logic
```

---

# 6. Interview Questions

## Q1

What is UML and why is it used in LLD?

**Answer:**

UML (Unified Modeling Language) is a standardized diagrammatic language for visualizing software design. In LLD, it serves as a bridge between a conceptual idea and actual implementation, enabling teams to communicate design decisions clearly and consistently.

---

## Q2

What are the three sections of a class in a class diagram?

**Answer:**

Class name, variables (fields with types and access modifiers), and methods (with return types).

---

## Q3

What is the difference between Aggregation and Composition?

**Answer:**

Aggregation is a weak has-a relationship where the contained objects can exist independently (e.g., a room and a bed — the bed exists without the room). Composition is a strong has-a relationship where the parts cannot exist without the container (e.g., a chair and its wheels — wheels are created and destroyed with the chair).

---

## Q4

How is Inheritance represented in a class diagram?

**Answer:**

A solid line with a closed hollow arrow pointing from the child class to the parent class.

---

## Q5

What is a Lifeline in a sequence diagram?

**Answer:**

A vertical dashed line representing an object participating in the interaction. It shows the object's existence over the duration of the sequence.

---

## Q6

What is an Activation Bar?

**Answer:**

A thin rectangle on a lifeline that shows the period during which an object is actively processing or executing a task.

---

## Q7

Difference between Synchronous and Asynchronous messages?

**Answer:**

Synchronous: The sender waits for a response before continuing — represented by a filled arrowhead.

Asynchronous: The sender continues without waiting — represented by an open arrowhead.

---

## Q8

What do `alt`, `opt`, and `loop` represent in sequence diagrams?

**Answer:**

`alt` represents if-else logic, `opt` represents an if-only block (executes only when the condition is true), and `loop` represents a repeating block of interactions.

---

## Q9

What are Lost and Found messages?

**Answer:**

Lost message: Sent but the destination is unknown or outside the system boundary. Found message: Received but the source is unknown. Both handle edge cases at system boundaries.

---

## Q10

In the ATM example, why is the Transaction object destroyed at the end?

**Answer:**

A transaction represents a single withdrawal operation. Once the cash is dispensed and the operation is complete, the transaction object has fulfilled its purpose and is destroyed to free resources and end its lifecycle.

---

## Q11

How does Composition differ from Aggregation in Java code?

**Answer:**

In Composition, the part object is created inside the container's constructor (`new Wheel()`) — it lives and dies with the container. In Aggregation, the part object is passed in from outside (`Room(Bed bed)`) — it exists independently and can outlive the container.

---

## Q12

What is Simple Association and when is it used?

**Answer:**

The weakest relationship — one class holds a reference to another but neither owns the other. Used when two classes interact but have no ownership dependency. For example, a `Student` referencing a `Course` without the student owning the course.
