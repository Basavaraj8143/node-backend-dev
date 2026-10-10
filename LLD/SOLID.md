# 17. SOLID Design Principles

---

# Table of Contents

1. Introduction & Why SOLID Matters
2. Single Responsibility Principle (SRP)
3. Open/Closed Principle (OCP)
4. Liskov Substitution Principle (LSP)
5. Quick Revision Summary
6. Interview Questions

---

# 1. Introduction & Why SOLID Matters

SOLID principles are the cornerstone of writing **scalable, maintainable, and clean code** in object-oriented programming.

Real-world applications manage thousands of classes.

Without these principles, you get:

---

## High Coupling

```text
Classes become so interdependent
that changing one breaks others.
```

---

## Technical Debt

```text
Code becomes difficult to read,
scale, or upgrade over time.
```

---

## Debugging Nightmare

```text
Bugs become harder to isolate.
Maintenance costs spike dramatically.
```

---

## The Result Without SOLID

```text
Spaghetti Code
      ↓
High Coupling
      ↓
Frequent Disastrous Bugs
      ↓
Expensive Maintenance
```

---

# 2. Single Responsibility Principle (SRP)

## Concept

> A class should have **only one reason to change**.

Each class should focus on a single, well-defined responsibility.

---

## Violation Example

A monolithic `ShoppingCart` class that does everything:

```java
class ShoppingCart {

    void calculatePrice() { ... }

    void printInvoice() { ... }

    void saveToDatabase() { ... }
}
```

Problems:

- A change in printing logic forces touching the shopping cart class
- A database change breaks invoice printing context
- Hard to test any one feature in isolation
- All responsibilities coupled together

---

## Resolution

Refactor into specialized classes:

```java
class ShoppingCart {
    void calculatePrice() { ... }
}

class InvoicePrinter {
    void print(ShoppingCart cart) { ... }
}

class DBStorage {
    void save(ShoppingCart cart) { ... }
}
```

Each class now does **one thing well**.

---

## Benefits

- Easier to test each class independently
- Easier to debug (responsibility is clear)
- Easier to maintain (change one thing, touch one class)
- Better team collaboration (parallel development per class)

---

## SRP Flow

```text
Before SRP
ShoppingCart → calculates + prints + stores
                      ↓
             One change breaks everything

After SRP
ShoppingCart    → calculates only
InvoicePrinter  → prints only
DBStorage       → stores only
                      ↓
             Change is isolated
```

---

# 3. Open/Closed Principle (OCP)

## Concept

> Software entities should be **open for extension but closed for modification**.

You should be able to add new functionality **without changing existing, battle-tested code**.

---

## Violation Example

Adding a new database type requires modifying `DBStorage`:

```java
class DBStorage {

    void save(ShoppingCart cart, String type) {

        if (type.equals("mysql")) {
            // MySQL logic
        } else if (type.equals("mongo")) {
            // MongoDB logic — NEW CODE ADDED HERE
        }
    }
}
```

Problems:

- Every new database type requires modifying the existing class
- Risks breaking existing MySQL logic
- Violates stability of battle-tested code

---

## Resolution

Introduce abstraction via an interface:

```java
interface Persistence {
    void save(ShoppingCart cart);
}

class MySQLPersistence implements Persistence {
    void save(ShoppingCart cart) { ... }
}

class MongoPersistence implements Persistence {
    void save(ShoppingCart cart) { ... }
}

class FilePersistence implements Persistence {
    void save(ShoppingCart cart) { ... }
}
```

Adding a new storage type:

```text
Create a new class
      ↓
Implement Persistence interface
      ↓
Zero changes to existing code
```

---

## Benefits

- Existing code stays untouched and stable
- New features added through new classes
- Reduces regression risk
- Scales cleanly as requirements grow

---

## OCP Flow

```text
Before OCP
DBStorage → modify for every new DB type
                    ↓
          Risk breaking existing logic

After OCP
Persistence (interface)
      ↓
MySQLPersistence   (existing — untouched)
MongoPersistence   (new — just add it)
FilePersistence    (new — just add it)
```

---

# 4. Liskov Substitution Principle (LSP)

## Concept

> Subclasses must be **substitutable for their base classes** without affecting the correctness of the program.

If code works with a base class, it must work perfectly with any derived subclass.

---

## Violation Example

A banking hierarchy where `FixedDepositAccount` inherits from `Account`:

```java
class Account {
    void deposit(double amount) { ... }
    void withdraw(double amount) { ... }
}

class FixedDepositAccount extends Account {

    void withdraw(double amount) {
        throw new RuntimeException(
            "Withdrawal not allowed on FD accounts"
        );
    }
}
```

Problem:

```java
Account account = new FixedDepositAccount();
account.withdraw(5000);
// Runtime Exception! LSP violated.
```

Code that works with `Account` breaks when given `FixedDepositAccount`.

---

## Resolution

Refine the hierarchy into specific interfaces:

```java
interface NonWithdrawableAccount {
    void deposit(double amount);
}

interface WithdrawableAccount extends NonWithdrawableAccount {
    void withdraw(double amount);
}

class FixedDepositAccount implements NonWithdrawableAccount {
    void deposit(double amount) { ... }
}

class SavingsAccount implements WithdrawableAccount {
    void deposit(double amount) { ... }
    void withdraw(double amount) { ... }
}
```

Now:

```text
Client code using NonWithdrawableAccount
      → never calls withdraw
      → no runtime exception

Client code using WithdrawableAccount
      → safely calls withdraw
      → guaranteed to work
```

---

## Benefits

- No unexpected runtime exceptions from subclasses
- Client code works predictably with any subtype
- Hierarchy reflects real-world behavior accurately
- Easier to reason about inheritance chains

---

## LSP Flow

```text
Before LSP
Account (base)
      ↓
FixedDepositAccount (subclass)
      ↓
withdraw() → Runtime Exception!
      ↓
Program integrity broken

After LSP
NonWithdrawableAccount → deposit only
WithdrawableAccount    → deposit + withdraw
      ↓
Client gets exactly the contract it expects
      ↓
No surprises
```

---

# 5. Quick Revision Summary

## SOLID at a Glance

| Principle | One-Line Rule |
|-----------|---------------|
| SRP | One class, one responsibility |
| OCP | Extend behavior, don't modify existing code |
| LSP | Subtypes must honor their base type's contract |
| ISP* | Don't force classes to implement unused methods |
| DIP* | Depend on abstractions, not concrete implementations |

*ISP and DIP covered separately.

---

## Problems SOLID Solves

| Problem | Caused By | Principle That Fixes It |
|---------|-----------|------------------------|
| One change breaks unrelated code | High coupling | SRP |
| Adding features breaks existing code | Modifying instead of extending | OCP |
| Runtime exceptions from subclasses | Broken inheritance contract | LSP |

---

## The Three Principles — One Sentence Each

**SRP:**

```text
ShoppingCart should not know how to print invoices.
```

**OCP:**

```text
Add a new database type by writing a new class, not editing the old one.
```

**LSP:**

```text
A FixedDepositAccount that throws on withdraw() is not a valid Account.
```

---

# 6. Interview Questions

## Q1

What does SOLID stand for?

**Answer:**

Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.

---

## Q2

What is the Single Responsibility Principle?

**Answer:**

A class should have only one reason to change. It should focus on a single, well-defined responsibility and not mix unrelated concerns.

---

## Q3

Why is a class that handles calculation, printing, and database storage a SRP violation?

**Answer:**

It has three separate reasons to change — a change in printing logic, database logic, or calculation logic each forces touching the same class. Any one change risks breaking the other two responsibilities.

---

## Q4

What is the Open/Closed Principle?

**Answer:**

Software entities should be open for extension but closed for modification. New functionality is added by creating new classes, not by modifying existing battle-tested code.

---

## Q5

How does abstraction help implement OCP?

**Answer:**

By defining an interface, new implementations (like MongoPersistence or FilePersistence) can be added without touching existing classes. The original code remains stable while behavior is extended through new classes.

---

## Q6

What is the Liskov Substitution Principle?

**Answer:**

Subclasses must be fully substitutable for their base classes without breaking program correctness. If code works with a base class, it must work with any derived subclass.

---

## Q7

Give an example of an LSP violation.

**Answer:**

A `FixedDepositAccount` inheriting from `Account` and throwing a runtime exception on `withdraw()`. Code that works with `Account` and calls `withdraw()` will break when given a `FixedDepositAccount`.

---

## Q8

How is the LSP violation in the banking example resolved?

**Answer:**

By splitting into two interfaces — `NonWithdrawableAccount` (deposit only) and `WithdrawableAccount` (deposit + withdraw). Each account type implements only the interface it actually supports, so client code never calls an unsupported method.

---

## Q9

What is high coupling and why is it dangerous?

**Answer:**

High coupling means classes are so interdependent that changing one breaks others. It makes code fragile, hard to test, and expensive to maintain.

---

## Q10

What is the difference between OCP extension and modification?

**Answer:**

Modification changes existing code, risking regressions in tested functionality. Extension adds new classes or implementations alongside existing ones, keeping the original code untouched and stable.

---

## Q11

Why does SRP make code easier to test?

**Answer:**

When each class has one responsibility, it can be tested in complete isolation without needing to set up unrelated dependencies. A focused class has fewer moving parts and clearer expected behavior.

---

## Q12

What is technical debt and how do SOLID principles reduce it?

**Answer:**

Technical debt is the cost of future rework caused by poor design decisions today. SOLID principles enforce clean boundaries, reduce coupling, and make code easier to extend — all of which reduce the accumulation of technical debt over time.
