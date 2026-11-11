# Template Method Design Pattern

---

# Table of Contents

1. Core Concept
2. The Problem
3. Example — ML Model Training Pipeline
4. Hooks and Overrides
5. Real-World Use Case — Payment System
6. Template Method vs Strategy
7. Interview Questions

---

# 1. Core Concept

A **behavioral** pattern that defines the **skeleton of an algorithm** in a base class, while letting subclasses override **specific steps** without changing the overall workflow.

```text
Base class  →  fixed order of steps (the "template")
Subclasses  →  custom implementation of individual steps
```

---

# 2. The Problem

Complex pipelines break if steps run in the wrong order.

```text
Training a model BEFORE loading data   ❌
Crediting funds BEFORE debiting        ❌
```

Without a template, every implementation must remember the correct order, and any developer can get it wrong.

## The Solution

The base class **locks the order**. Subclasses only fill in the steps.

---

# 3. Example — ML Model Training Pipeline

Every model (Neural Network, Decision Tree) must follow the same **5-step pipeline**:

```text
1. Load Data
      ↓
2. Pre-process Data
      ↓
3. Train Model
      ↓
4. Evaluate Result
      ↓
5. Save Model
```

## Structure

```text
        ModelTrainer (abstract)
        + trainPipeline()   ← template method (final)
        + loadData()        ← common
        + preprocessData()  ← common
        + trainModel()      ← abstract
        + evaluateModel()   ← abstract
        + saveModel()       ← common
                ▲
       ┌────────┴─────────┐
NeuralNetworkTrainer  DecisionTreeTrainer
```

---

## Step 1: Abstract Base Class

```java
abstract class ModelTrainer {

    // Template method — fixed order, cannot be overridden
    public final void trainPipeline() {
        loadData();
        preprocessData();
        trainModel();
        evaluateModel();
        saveModel();
    }

    // Common steps (shared implementation)
    protected void loadData() {
        System.out.println("Loading data...");
    }

    protected void preprocessData() {
        System.out.println("Pre-processing data...");
    }

    protected void saveModel() {
        System.out.println("Saving model...");
    }

    // Steps subclasses MUST implement
    protected abstract void trainModel();
    protected abstract void evaluateModel();
}
```

`final` on `trainPipeline()` stops subclasses from changing the order.

---

## Step 2: Concrete Subclasses

```java
class NeuralNetworkTrainer extends ModelTrainer {

    @Override
    protected void trainModel() {
        System.out.println("Training neural network (backpropagation)...");
    }

    @Override
    protected void evaluateModel() {
        System.out.println("Evaluating neural network accuracy...");
    }
}

class DecisionTreeTrainer extends ModelTrainer {

    @Override
    protected void trainModel() {
        System.out.println("Building decision tree...");
    }

    @Override
    protected void evaluateModel() {
        System.out.println("Evaluating decision tree with cross-validation...");
    }
}
```

---

## Step 3: Client

```java
public class Main {
    public static void main(String[] args) {

        ModelTrainer trainer = new NeuralNetworkTrainer();
        trainer.trainPipeline();

        System.out.println("-----");

        trainer = new DecisionTreeTrainer();
        trainer.trainPipeline();
    }
}
```

Output:

```text
Loading data...
Pre-processing data...
Training neural network (backpropagation)...
Evaluating neural network accuracy...
Saving model...
-----
Loading data...
Pre-processing data...
Building decision tree...
Evaluating decision tree with cross-validation...
Saving model...
```

The client holds a `ModelTrainer` reference. It doesn't need to know which model it is. The **flow is guaranteed** by the base class.

---

# 4. Hooks and Overrides

## Three Kinds of Steps

| Step type | Implementation | Example |
|-----------|----------------|---------|
| **Common** | Defined in base class, shared | `loadData()`, `saveModel()` |
| **Abstract** | Subclass **must** implement | `trainModel()`, `evaluateModel()` |
| **Hook** | Base class gives a default; subclass **may** override | `preprocessData()` |

## Hook Example

```java
abstract class ModelTrainer {

    public final void trainPipeline() {
        loadData();
        preprocessData();      // hook
        trainModel();
        evaluateModel();
        saveModel();
    }

    // Hook: default does something, subclasses can override or skip
    protected void preprocessData() {
        System.out.println("Default pre-processing...");
    }

    // ...
}

class DecisionTreeTrainer extends ModelTrainer {

    @Override
    protected void preprocessData() {
        // trees don't need feature scaling — override with lighter logic
        System.out.println("Minimal pre-processing for decision tree");
    }
}
```

## Hollywood Principle

```text
"Don't call us, we'll call you."
```

The base class controls the flow and **calls** the subclass's methods, not the other way around.

---

# 5. Real-World Use Case — Payment System

Payment workflow is always:

```text
Validate → Debit → Credit → Confirm Transaction
```

UPI, Credit Card, and Debit Card differ in **how** they validate and debit, but the **order must never change**.

```java
abstract class PaymentProcessor {

    // Template method
    public final void processPayment(double amount) {
        validate(amount);
        debit(amount);
        credit(amount);
        confirmTransaction();
    }

    protected abstract void validate(double amount);
    protected abstract void debit(double amount);

    // Common step
    protected void credit(double amount) {
        System.out.println("Credited " + amount + " to merchant");
    }

    protected void confirmTransaction() {
        System.out.println("Transaction confirmed");
    }
}
```

```java
class UpiPayment extends PaymentProcessor {

    @Override
    protected void validate(double amount) {
        System.out.println("Validating UPI PIN and VPA...");
    }

    @Override
    protected void debit(double amount) {
        System.out.println("Debiting " + amount + " via UPI");
    }
}

class CreditCardPayment extends PaymentProcessor {

    @Override
    protected void validate(double amount) {
        System.out.println("Validating card number, CVV, and credit limit...");
    }

    @Override
    protected void debit(double amount) {
        System.out.println("Charging " + amount + " to credit card");
    }
}
```

```java
PaymentProcessor payment = new UpiPayment();
payment.processPayment(500);
```

```text
Validating UPI PIN and VPA...
Debiting 500.0 via UPI
Credited 500.0 to merchant
Transaction confirmed
```

Because `processPayment()` is `final`, no subclass can **credit before debiting**.

---

# 6. Template Method vs Strategy

| | Template Method | Strategy |
|--|-----------------|----------|
| Mechanism | **Inheritance** | **Composition** |
| What varies | **Steps** inside a fixed algorithm | The **entire algorithm** |
| Flow control | Base class controls order | Context just delegates |
| Binding | Compile-time (class hierarchy) | Runtime (swap strategy object) |

```text
Template Method → same skeleton, different steps
Strategy        → different whole algorithms, swappable at runtime
```
<img width="1210" height="622" alt="image" src="https://github.com/user-attachments/assets/f7676665-cdf0-4aa5-8e54-a37e0a11248f" />


---

# 7. Interview Questions

## Q1

What is the Template Method pattern?

**Answer:**

A behavioral pattern that defines an algorithm's skeleton in a base class and lets subclasses override specific steps without changing the overall order of execution.

---

## Q2

What problem does it solve?

**Answer:**

It guarantees steps run in the correct order across all implementations (e.g., load data before training, debit before credit) and removes duplicated workflow code.

---

## Q3

Why is the template method marked `final` in Java?

**Answer:**

To prevent subclasses from overriding it and changing the order of steps. Only the individual steps can be customized.

---

## Q4

What is the difference between abstract steps and hooks?

**Answer:**

Abstract steps must be implemented by subclasses. Hooks have a default implementation in the base class, and subclasses may override them optionally.

---

## Q5

What is the Hollywood Principle?

**Answer:**

"Don't call us, we'll call you." The base class controls the flow and calls the subclass methods, rather than subclasses driving the algorithm.

---

## Q6

How does the client use a Template Method class?

**Answer:**

It holds a reference to the abstract base class and calls the template method. It doesn't need to know which concrete subclass it's using; the flow is guaranteed.

---

## Q7

Give real-world examples of Template Method.

**Answer:**

ML training pipelines, payment processing (validate → debit → credit → confirm), data import/export workflows, and framework lifecycles such as test setup → run → teardown.

---

## Q8

Template Method vs Strategy?

**Answer:**

Template Method uses inheritance to vary steps within a fixed algorithm. Strategy uses composition to swap the entire algorithm at runtime.

---

## Q9

Which SOLID principles does it relate to?

**Answer:**

OCP (add new variants via new subclasses without modifying the base) and DIP (client depends on the abstract base). It can limit LSP if subclasses break the expected workflow.

---

## Q10

What are the drawbacks?

**Answer:**

It relies on inheritance, so it's rigid and ties subclasses to the base class. Too many abstract steps can make subclasses hard to understand, and the fixed skeleton can't be changed at runtime.
