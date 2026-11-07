# Adapter Design Pattern

---

# Table of Contents

1. Core Concept
2. Real-World Analogy
3. The Problem in Software
4. Example — XML to JSON
5. Object Adapter vs Class Adapter
6. Key Use Cases
7. Interview Questions

---

# 1. Core Concept

A **structural** pattern that bridges the gap between **two incompatible interfaces**, letting them work together without modifying either.

```text
Client  →  Adapter  →  Incompatible Class (Adaptee)
```

The adapter **translates** calls from one interface to the other.

---

# 2. Real-World Analogy

```text
Indian plug  →  [ Power Adapter ]  →  US socket
Type-C cable →  [ Converter ]      →  Type-A port
```

Neither the device nor the socket changes. The adapter sits in between and makes them compatible.

---

# 3. The Problem in Software

Your app needs to use a **third-party library** or **legacy code** whose interface doesn't match yours.

## Without an Adapter

```text
Client code → directly uses third-party API
```

- Tightly coupled to the external code
- If the library changes or is replaced, **client code breaks**
- Client logic gets mixed with conversion logic

## With an Adapter
<img width="720" height="502" alt="image" src="https://github.com/user-attachments/assets/1ccf99be-390f-4a8b-a7b9-f788cd7bb889" />

```text
Client → Target interface ← Adapter → Third-party API
```

Only the adapter knows about the external code. Swapping libraries means changing just the adapter.

---

# 4. Example — XML to JSON

## Scenario

- The client expects reports as **JSON** through an `IReport` interface
- The only available library, `XmlDataProvider`, returns **XML**

## Structure

```text
        <<interface>>
          IReport                      XmlDataProvider
       getJsonData()                    getXmlData()
             ▲                               ▲
             │                               │ (has-a)
             └──────── XmlToJsonAdapter ◆────┘
```

---

## Step 1: Target Interface

What the client expects.

```java
interface IReport {
    String getJsonData(String name);
}
```

## Step 2: Adaptee (Third-Party Code)

Can't be modified.

```java
class XmlDataProvider {

    public String getXmlData(String name) {
        return "<report><name>" + name + "</name><amount>500</amount></report>";
    }
}
```

## Step 3: Adapter

Implements the target, holds the adaptee, translates.

```java
class XmlToJsonAdapter implements IReport {

    private final XmlDataProvider xmlProvider;   // composition

    public XmlToJsonAdapter(XmlDataProvider xmlProvider) {
        this.xmlProvider = xmlProvider;
    }

    @Override
    public String getJsonData(String name) {
        String xml = xmlProvider.getXmlData(name);   // fetch raw XML
        return convertXmlToJson(xml);                // translate
    }

    private String convertXmlToJson(String xml) {
        String reportName = extract(xml, "name");
        String amount = extract(xml, "amount");
        return "{\"name\":\"" + reportName + "\",\"amount\":" + amount + "}";
    }

    private String extract(String xml, String tag) {
        int start = xml.indexOf("<" + tag + ">") + tag.length() + 2;
        int end = xml.indexOf("</" + tag + ">");
        return xml.substring(start, end);
    }
}
```

In production, use a library like Jackson (`XmlMapper` + `ObjectMapper`) instead of manual string parsing.

## Step 4: Client

```java
class Client {
    public static void main(String[] args) {

        IReport report = new XmlToJsonAdapter(new XmlDataProvider());

        System.out.println(report.getJsonData("Sales"));
        // {"name":"Sales","amount":500}
    }
}
```

The client calls `getJsonData` and has **no idea** XML is involved.

## Flow

```text
Client.getJsonData("Sales")
        ↓
XmlToJsonAdapter
        ↓
XmlDataProvider.getXmlData("Sales")  →  XML
        ↓
Convert XML → JSON
        ↓
Return JSON to client
```

---

# 5. Object Adapter vs Class Adapter

## Object Adapter (Preferred)

Uses **composition**: holds a reference to the adaptee.

```java
class XmlToJsonAdapter implements IReport {
    private final XmlDataProvider xmlProvider;   // has-a
    ...
}
```

Flexible: can wrap any adaptee instance or subclass.

---

## Class Adapter

Uses **inheritance**: extends the adaptee and implements the target.

```java
class XmlToJsonClassAdapter extends XmlDataProvider implements IReport {

    @Override
    public String getJsonData(String name) {
        String xml = getXmlData(name);    // inherited
        return convert(xml);
    }
}
```

In C++ this uses multiple inheritance. In Java you can only extend **one class**, so it works only when the target is an interface.

## Comparison

| | Object Adapter | Class Adapter |
|--|----------------|---------------|
| Mechanism | Composition | Inheritance |
| Flexibility | High | Low (tied to one adaptee class) |
| Can adapt subclasses | Yes | No |
| Preferred | **Yes** | No |

Principle: **favor composition over inheritance**.

---

# 6. Key Use Cases

## 1. Third-Party Integration

Decouple your code from external libraries.

```text
Swap Stripe → Razorpay?
Write a new adapter. Core business logic unchanged.
```

## 2. Legacy Code Compatibility

Wrap outdated or deprecated code with a modern interface, without rewriting the legacy codebase.

```text
New system → ModernInterface ← LegacyAdapter → Old code
```

## Java Examples

- `Arrays.asList(array)` adapts an array to the `List` interface
- `InputStreamReader` adapts a byte stream (`InputStream`) to a character stream (`Reader`)

---
<img width="1132" height="396" alt="image" src="https://github.com/user-attachments/assets/4e65105c-21ad-451d-94b4-a0a07a01031a" />


# 7. Interview Questions

## Q1

What is the Adapter pattern?

**Answer:**

A structural pattern that bridges two incompatible interfaces by wrapping one in a class that implements the interface the client expects.

---

## Q2

What are the main components?

**Answer:**

Target (interface the client expects), Adaptee (existing incompatible class), Adapter (implements Target and translates to the Adaptee), and Client.

---

## Q3

When should you use Adapter?

**Answer:**

When integrating third-party libraries or legacy code whose interface doesn't match your system, and you don't want to modify that code or couple your app to it.

---

## Q4

Object Adapter vs Class Adapter?

**Answer:**

Object Adapter uses composition (holds an adaptee reference) and is preferred for its flexibility. Class Adapter uses inheritance (extends the adaptee) and is less flexible.

---

## Q5

Why is Class Adapter limited in Java?

**Answer:**

Java has no multiple class inheritance, so a class adapter can extend only one adaptee class and implement the target as an interface.

---

## Q6

How does Adapter support loose coupling?

**Answer:**

The client depends only on the target interface. Third-party code is isolated behind the adapter, so replacing it means changing just the adapter.

---

## Q7

Which SOLID principles does Adapter follow?

**Answer:**

SRP (conversion logic lives in the adapter), OCP (add new adapters without modifying client code), and DIP (client depends on the abstraction).

---

## Q8

Adapter vs Decorator?

**Answer:**

Adapter **changes the interface** so incompatible classes can work together. Decorator keeps the **same interface** and adds behavior to the object.

---

## Q9

Give real-world Java examples of Adapter.

**Answer:**

`Arrays.asList()` (array to List) and `InputStreamReader` (byte stream to character stream).

---

## Q10

Does the client know it's using an adapter?

**Answer:**

No. It interacts with the target interface and is unaware of the translation happening behind the scenes.
