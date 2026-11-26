# Core Java Concepts — The "Why" Behind the Rules

---

# Table of Contents

1. One Public Class Per File
2. Wrapper Classes, Autoboxing & Unboxing
3. `==` vs `.equals()`
4. Integer Caching
5. Abstract Classes
6. POJO Classes
7. Quick Revision Summary
8. Interview Questions

---

# 1. One Public Class Per File

## The Rule

A `.java` file can contain **only one `public` class**, and the file name **must match** that class name.

```java
// File: Student.java
public class Student { }       // ✓ matches file name

class Helper { }               // ✓ allowed: non-public class in the same file
```

```java
// File: Student.java
public class Student { }
public class Teacher { }       // ❌ compile error: only one public class allowed
```

Wrong file name:

```text
error: class Student is public, should be declared in a file named Student.java
```

## Why?

- **Predictable lookup**: given a class name `Student`, the compiler and class loader know to look for `Student.java` / `Student.class`. No searching through files
- **Clear entry point**: the file name tells you the main class when running `java Student`
- **Cleaner structure**: one public class per file keeps large projects organized

## Details

| Question | Answer |
|----------|--------|
| Can a file have multiple non-public classes? | Yes. Each compiles to its own `.class` file |
| Can the file name differ if no class is public? | Yes. Any name works |
| Which class holds `main`? | Any class can, but it's conventionally the public one |

```text
Student.java  →  javac  →  Student.class + Helper.class
```

---

# 2. Wrapper Classes, Autoboxing & Unboxing

## Why Primitives Exist

Java keeps primitives (`int`, `float`, `char`...) for **performance** (stored directly, no object overhead).

## Why Wrapper Classes Exist

Collections and generics work only with **objects**:

```java
ArrayList<int> list;        // ❌ not allowed
ArrayList<Integer> list;    // ✓ wrapper class
```

## Wrapper Classes

| Primitive | Wrapper |
|-----------|---------|
| `byte` | `Byte` |
| `short` | `Short` |
| `int` | `Integer` |
| `long` | `Long` |
| `float` | `Float` |
| `double` | `Double` |
| `char` | `Character` |
| `boolean` | `Boolean` |

---

## Autoboxing

**Automatic conversion** of a primitive to its wrapper object.

```java
int x = 10;
Integer y = x;                       // autoboxing

// What the compiler actually does:
Integer y2 = Integer.valueOf(x);
```

## Unboxing

**Automatic conversion** of a wrapper object back to a primitive.

```java
Integer a = 20;
int b = a;                           // unboxing

// What the compiler actually does:
int b2 = a.intValue();
```

Unboxing also happens in calculations:

```java
Integer a = 5;
Integer b = 10;
int sum = a + b;                     // both unboxed, then added
```

## Autoboxing in Collections

```java
List<Integer> list = new ArrayList<>();
list.add(5);                         // int → Integer (autoboxing)
int first = list.get(0);             // Integer → int (unboxing)
```

## Pitfall: Unboxing `null`

```java
Integer value = null;
int x = value;                       // ❌ NullPointerException
```

```text
Unboxing calls value.intValue() → on null → NPE
```

## Performance Note

Autoboxing in tight loops creates many objects:

```java
Long sum = 0L;
for (long i = 0; i < 1_000_000; i++) {
    sum += i;                        // unbox, add, box a NEW Long each time ❌
}

long sum2 = 0L;                      // use primitive instead ✓
```

---

# 3. `==` vs `.equals()`

| | `==` | `.equals()` |
|--|------|------------|
| Primitives | Compares **values** | n/a |
| Objects | Compares **references** (same memory address?) | Meant to compare **values** |

## The Pitfall

```java
Integer x = 200;
Integer y = 200;

System.out.println(x == y);          // false (different objects)
System.out.println(x.equals(y));     // true  (same value)
```

```text
x ──> [Integer 200]  (object 1)
y ──> [Integer 200]  (object 2)
== compares addresses → different → false
```

## Correct Ways to Compare Wrappers

```java
x.equals(y);                         // ✓ value comparison
x.intValue() == y.intValue();        // ✓ compares primitives
Objects.equals(x, y);                // ✓ also null-safe
```

---

# 4. Integer Caching

## Surprising Behavior

```java
Integer a = 100;
Integer b = 100;
System.out.println(a == b);          // true

Integer c = 200;
Integer d = 200;
System.out.println(c == d);          // false
```

Same code, different results. This is **Integer caching**.

## How It Works

`Integer.valueOf()` (used by autoboxing) keeps a **cache of Integer objects from -128 to 127**.

```text
valueOf(100)  → within range → returns the SAME cached object
valueOf(200)  → outside range → creates a NEW object
```

```text
Cache:  [-128] [-127] ... [0] ... [126] [127]
                ↑ a and b both point to cached 100
```

## Why Cache?

Small numbers are used constantly (loop counters, flags, indexes). Reusing objects saves memory and creation time.

## Other Cached Types

| Type | Cached Range |
|------|-------------|
| `Byte`, `Short`, `Long` | -128 to 127 |
| `Character` | 0 to 127 |
| `Boolean` | `TRUE` and `FALSE` |
| `Float`, `Double` | **Not cached** |

The upper bound of the Integer cache is tunable with `-XX:AutoBoxCacheMax=<n>`.

## Lesson

```text
Never rely on == for wrapper objects.
It may work for small values and silently fail for large ones.
Always use .equals().
```

```java
Integer a = new Integer(100);        // ❌ deprecated; always creates a new object
Integer b = Integer.valueOf(100);    // ✓ uses the cache
```

---

# 5. Abstract Classes

An abstract class is meant to be **extended**, not instantiated.

```java
abstract class Shape {

    protected String color;

    public Shape(String color) {            // constructor ✓
        this.color = color;
    }

    public abstract double area();          // no body, children must implement

    public void describe() {                // concrete method ✓
        System.out.println(color + " shape, area " + area());
    }
}
```

```java
Shape s = new Shape("red");                 // ❌ cannot instantiate abstract class

class Circle extends Shape {
    private double radius;

    public Circle(String color, double radius) {
        super(color);                        // parent constructor is called
        this.radius = radius;
    }

    @Override
    public double area() {
        return Math.PI * radius * radius;
    }
}
```

## What's Allowed

| Feature | Allowed? | Reason |
|---------|----------|--------|
| **Constructor** | ✓ | Runs when a child object is created (`super(...)`) |
| **Static members** | ✓ | Belong to the class, not an instance |
| **Concrete methods** | ✓ | Shared behavior for children |
| **Fields** | ✓ | State shared by children |
| **No abstract methods at all** | ✓ | Still can't be instantiated |

## What's NOT Allowed

| Feature | Why |
|---------|-----|
| **`final` abstract class** | `final` blocks inheritance, but abstract classes exist to be inherited |
| **`private abstract` method** | Child classes can't see private methods, so they could never override it |
| **`static abstract` method** | Static methods can't be overridden |
| **`final abstract` method** | `final` blocks overriding, but abstract requires it |
| **Instantiation (`new Shape()`)** | Class is incomplete |

```java
abstract class A {
    private void helper() { }               // ✓ private concrete method is fine
    // private abstract void foo();         // ❌ illegal combination of modifiers
    // final abstract void bar();           // ❌ illegal combination
}
```

## Abstract Class vs Interface

| | Abstract Class | Interface |
|--|----------------|-----------|
| Constructors | ✓ | ✗ |
| Instance fields | ✓ | Only `public static final` constants |
| Multiple inheritance | ✗ (one parent) | ✓ (implement many) |
| Use when | Sharing state + code among related classes | Defining a capability/contract |

---

# 6. POJO Classes

**POJO** = **Plain Old Java Object**

A simple Java class used for **data modeling**, with **no dependency on any framework** (doesn't have to extend or implement framework classes).

## Typical Shape

- `private` fields
- A no-arg constructor (and optionally others)
- Getters and setters
- Optionally `equals()`, `hashCode()`, `toString()`

---

## Anemic Model

A POJO with **only data**: fields, constructors, getters/setters. No behavior.

```java
public class Student {

    private Long id;
    private String name;
    private int attendedClasses;

    public Student() { }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getAttendedClasses() { return attendedClasses; }
    public void setAttendedClasses(int attendedClasses) {
        this.attendedClasses = attendedClasses;
    }
}
```

Business logic lives elsewhere (e.g., a service class):

```java
studentService.markAttendance(student);
```

---

## Rich Domain Model

A POJO that **also contains business logic** related to its own data.

```java
public class Student {

    private Long id;
    private String name;
    private int attendedClasses;

    public void markAttendance() {                 // behavior inside the object
        this.attendedClasses++;
    }

    public boolean isEligibleForExam(int totalClasses) {
        return attendedClasses >= totalClasses * 0.75;
    }

    // getters, setters
}
```

```java
student.markAttendance();
```

## Comparison

| | Anemic Model | Rich Domain Model |
|--|-------------|------------------|
| Contains | Data only | Data + related behavior |
| Logic lives in | Service classes | The object itself |
| Common in | Simple CRUD apps, DTOs, JPA entities | Domain-driven design |
| Benefit | Simple, easy to map to DB/JSON | Better encapsulation, logic stays with data |

## POJO in Practice

DTOs, JPA entities, and request/response objects in Spring Boot are all POJOs. A POJO can have framework **annotations** (like `@Entity`) while still being a plain class; it just must not be forced to extend framework base classes.

---

# 7. Quick Revision Summary

```text
public class        → one per file, file name = class name
Wrapper classes     → Integer, Double, etc. (needed by collections/generics)
Autoboxing          → int → Integer (Integer.valueOf)
Unboxing            → Integer → int (intValue); null → NullPointerException
==                  → reference comparison for objects
equals()            → value comparison
Integer cache       → -128 to 127 shared; outside → new objects
Abstract class      → constructors ✓, static ✓, final ✗, private abstract ✗
POJO                → plain data class; anemic (data only) vs rich (data + logic)
```

| Code | Result |
|------|--------|
| `Integer a = 127, b = 127; a == b` | `true` |
| `Integer a = 128, b = 128; a == b` | `false` |
| `Integer a = 128, b = 128; a.equals(b)` | `true` |

---

# 8. Interview Questions

## Q1

Why can a Java file have only one public class?

**Answer:**

So the class name maps directly to the file name, letting the compiler and class loader locate source and class files predictably, and keeping code organized. The file name must match the public class.

---

## Q2

Can a Java file contain multiple classes?

**Answer:**

Yes, but only one can be public. The others must be package-private (default access). Each compiles into its own `.class` file.

---

## Q3

Why do wrapper classes exist?

**Answer:**

Collections and generics work only with objects, not primitives. Wrapper classes provide object versions of primitives (`Integer` for `int`) plus useful utility methods.

---

## Q4

What are autoboxing and unboxing?

**Answer:**

Autoboxing automatically converts a primitive to its wrapper (`int` → `Integer` via `Integer.valueOf()`). Unboxing converts a wrapper back to a primitive (`Integer` → `int` via `intValue()`).

---

## Q5

What happens when you unbox a `null` wrapper?

**Answer:**

A `NullPointerException`, because unboxing calls a method like `intValue()` on null.

---

## Q6

What is the output?

```java
Integer a = 127, b = 127;
Integer c = 128, d = 128;
System.out.println(a == b);
System.out.println(c == d);
```

**Answer:**

`true`, then `false`. Values from -128 to 127 are cached and shared, so `a` and `b` are the same object. 128 is outside the cache, so `c` and `d` are different objects.

---

## Q7

What is Integer caching and why does it exist?

**Answer:**

`Integer.valueOf()` returns cached objects for values from -128 to 127 to save memory and creation time, since small numbers are used very frequently.

---

## Q8

How should you compare two `Integer` objects?

**Answer:**

Use `equals()` (or `Objects.equals()` for null safety), or unbox them to primitives. Never use `==`.

---

## Q9

Can an abstract class have a constructor?

**Answer:**

Yes. It can't be used to create an abstract object directly, but it runs when a child class object is created via `super(...)`, initializing the parent's state.

---

## Q10

Why can't an abstract class be `final`?

**Answer:**

`final` prevents inheritance, but an abstract class is incomplete and exists only to be extended. The combination is a compile error.

---

## Q11

Why can't an abstract method be `private`?

**Answer:**

Private methods aren't visible to child classes, so they could never override and implement it. The same logic applies to `final` and `static` abstract methods.

---

## Q12

Can an abstract class have static members?

**Answer:**

Yes. Static members belong to the class and don't need an instance, so they're allowed.

---

## Q13

What is a POJO?

**Answer:**

A Plain Old Java Object: a simple class used for data modeling that doesn't depend on any framework's base classes or interfaces.

---

## Q14

Anemic vs Rich Domain Model?

**Answer:**

An anemic model has only data (fields, getters/setters) with logic in separate services. A rich domain model also includes behavior related to its own data, like `student.markAttendance()`.
