# Advanced Exception Handling in Java

---

# Table of Contents

1. Nested try-catch
2. Exception Hierarchy
3. Catching Strategies & Best Practices
4. Throwing Exceptions (`throw`)
5. Checked Exception Propagation (`throws`)
6. Custom Exceptions
7. try-with-resources
8. Interview Questions

---

# 1. Nested try-catch

A try-catch can live inside another try block.

## Scenario 1: Independent Handling

The inner catch handles its own exception. The outer block never sees it.

```java
try {
    System.out.println("Outer try");

    try {
        int x = 5 / 0;
    } catch (ArithmeticException e) {
        System.out.println("Inner handled: " + e.getMessage());
    }

    System.out.println("Outer continues");

} catch (Exception e) {
    System.out.println("Outer catch (not reached)");
}
```

```text
Outer try
Inner handled: / by zero
Outer continues
```

## Scenario 2: Parent Handling

The inner block has no matching catch, so the exception propagates to the outer catch.

```java
try {
    try {
        int x = 5 / 0;
    } catch (NullPointerException e) {
        System.out.println("Inner: wrong type");   // doesn't match
    }
} catch (ArithmeticException e) {
    System.out.println("Outer handled: " + e.getMessage());
}
```

```text
Outer handled: / by zero
```

```text
Inner catch matches?  Yes → handled there
                      No  → bubbles to outer catch
```

> Nested try-catch is possible but generally discouraged: it hurts readability. Extract inner logic into a separate method instead.

---

# 2. Exception Hierarchy

```text
Throwable
 ├── Error                          (irrecoverable)
 │     ├── OutOfMemoryError
 │     └── StackOverflowError
 │
 └── Exception                      (recoverable)
       ├── IOException              ← checked
       │     └── FileNotFoundException
       ├── SQLException             ← checked
       │
       └── RuntimeException         ← unchecked
             ├── NullPointerException
             ├── ArithmeticException
             ├── ArrayIndexOutOfBoundsException
             └── IllegalArgumentException
```

## Key Points

| Type | Checked at | Must handle? | Examples |
|------|-----------|--------------|----------|
| **Error** | n/a | No (don't catch) | `OutOfMemoryError` |
| **Checked Exception** | Compile time | **Yes** (try-catch or `throws`) | `IOException`, `SQLException` |
| **Unchecked (RuntimeException)** | Runtime | No | `NullPointerException`, `ArithmeticException` |

- **Throwable** is the root of everything throwable
- **Checked** = `Exception` and its subclasses **excluding** `RuntimeException`
- **Unchecked** = `RuntimeException` and its subclasses

---

# 3. Catching Strategies & Best Practices

## Catch Specific First, General Last

```java
try {
    int x = 5 / 0;
} catch (ArithmeticException e) {       // specific
    System.out.println("Math error");
} catch (Exception e) {                 // general
    System.out.println("Other error");
}
```

## Wrong Order = Compile Error

```java
try {
    int x = 5 / 0;
} catch (Exception e) {                 // parent first
    System.out.println("General");
} catch (ArithmeticException e) {       // ❌ unreachable code
    System.out.println("Math error");
}
```

The parent already catches everything, so the child catch is **unreachable**.

---

## Multi-Catch (Java 7+)

Catch multiple **sibling** exceptions with `|`.

```java
try {
    String s = null;
    s.length();
} catch (ArithmeticException | NullPointerException e) {
    System.out.println("Handled: " + e.getMessage());
}
```

Rules:

- Exceptions must **not** be parent/child of each other
- The variable `e` is implicitly `final`

---

# 4. Throwing Exceptions (`throw`)

Use `throw` to **manually** trigger an exception object.

```java
static void setAge(int age) {
    if (age < 0) {
        throw new IllegalArgumentException("Age cannot be negative");
    }
    System.out.println("Age set: " + age);
}
```

```java
public static void main(String[] args) {
    try {
        setAge(-5);
    } catch (IllegalArgumentException e) {
        System.out.println(e.getMessage());   // Age cannot be negative
    }
}
```

## Propagation

If the method doesn't catch what it throws, it propagates to the caller.

```text
main → setAge(-5) throws
         ↓ no catch inside setAge
       bubbles to main → caught there
```

## throw vs throws

| Keyword | Purpose |
|---------|---------|
| `throw` | **Triggers** an exception (inside a method body) |
| `throws` | **Declares** exceptions a method might pass to its caller (in the signature) |

---

# 5. Checked Exception Propagation (`throws`)

Checked exceptions must be **handled or declared**. The compiler enforces this.

## Option 1: Handle with try-catch

```java
static void readFile() {
    try {
        FileReader fr = new FileReader("abc.txt");
    } catch (FileNotFoundException e) {
        System.out.println("File not found");
    }
}
```

## Option 2: Declare with `throws`

Shift responsibility to the caller.

```java
static void readFile() throws FileNotFoundException {
    FileReader fr = new FileReader("abc.txt");
}

public static void main(String[] args) {
    try {
        readFile();                          // caller must now handle it
    } catch (FileNotFoundException e) {
        System.out.println("File not found");
    }
}
```

```text
No try-catch and no throws on a checked exception → compile error
```

---

# 6. Custom Exceptions

Create business-specific exceptions for clearer error reporting.

## Basic Custom Exception

Extend `Exception` (checked) and pass the message to `super`.

```java
class InvalidAgeException extends Exception {

    public InvalidAgeException(String message) {
        super(message);
    }
}
```

```java
static void validate(int age) throws InvalidAgeException {
    if (age < 18) {
        throw new InvalidAgeException("Must be 18 or older");
    }
}

public static void main(String[] args) {
    try {
        validate(15);
    } catch (InvalidAgeException e) {
        System.out.println(e.getMessage());   // Must be 18 or older
    }
}
```

## Adding Custom Fields & Methods

Give the catch block extra context.

```java
class InvalidAgeException extends Exception {

    private final int age;

    public InvalidAgeException(String message, int age) {
        super(message);
        this.age = age;
    }

    public int getAge() {
        return age;
    }
}
```

```java
try {
    throw new InvalidAgeException("Must be 18 or older", 15);
} catch (InvalidAgeException e) {
    System.out.println(e.getMessage() + " (got: " + e.getAge() + ")");
}
```

```text
Must be 18 or older (got: 15)
```

## Checked vs Unchecked Custom

| Extend | Type | Use when |
|--------|------|----------|
| `Exception` | Checked | Caller should be forced to handle it |
| `RuntimeException` | Unchecked | Programming/business errors, no forced handling (common in Spring apps) |

---

# 7. try-with-resources

Prevents **resource leaks** (files, DB connections, sockets).

## Old Way (Manual finally)

```java
FileReader fr = null;
try {
    fr = new FileReader("abc.txt");
    // use fr
} catch (IOException e) {
    e.printStackTrace();
} finally {
    if (fr != null) {
        try { fr.close(); } catch (IOException e) { }
    }
}
```

Verbose and error-prone.

## New Way

```java
try (FileReader fr = new FileReader("abc.txt")) {
    // use fr
} catch (IOException e) {
    e.printStackTrace();
}
// fr closed automatically
```

## Key Points

- Resource must implement `AutoCloseable`
- Closed **automatically**, whether or not an exception occurs
- Multiple resources are separated by `;` and closed in **reverse order**

```java
try (FileReader fr = new FileReader("in.txt");
     BufferedReader br = new BufferedReader(fr)) {
    System.out.println(br.readLine());
}
```
<img width="915" height="572" alt="image" src="https://github.com/user-attachments/assets/47fb6a05-d375-45eb-8afa-27884b6c08c6" />


---

# 8. Interview Questions

## Q1

What is the root of the exception hierarchy?

**Answer:**

`Throwable`. It has two branches: `Error` (irrecoverable) and `Exception` (recoverable).

---

## Q2

Checked vs Unchecked exceptions?

**Answer:**

Checked exceptions are verified at compile time and must be handled or declared (e.g., `IOException`). Unchecked exceptions are subclasses of `RuntimeException`, occur at runtime, and aren't enforced by the compiler (e.g., `NullPointerException`).

---

## Q3

What happens if a parent exception is caught before its child?

**Answer:**

Compile-time error. The child catch block becomes unreachable. Always catch specific exceptions first.

---

## Q4

What is multi-catch and what are its rules?

**Answer:**

Introduced in Java 7, it catches multiple exceptions in one block using `|`. The exceptions must not be in a parent-child relationship, and the catch variable is implicitly final.

---

## Q5

Difference between `throw` and `throws`?

**Answer:**

`throw` triggers an exception object inside a method. `throws` declares in the method signature that the method may pass certain exceptions to its caller.

---

## Q6

How do you handle a checked exception?

**Answer:**

Either wrap the code in try-catch, or declare it with `throws` to make the caller responsible.

---

## Q7

How do you create a custom exception?

**Answer:**

Extend `Exception` (checked) or `RuntimeException` (unchecked) and call `super(message)` in the constructor. You can add fields and methods for extra context.

---

## Q8

Why use custom exceptions?

**Answer:**

They give business-specific, readable error reporting (e.g., `InvalidAgeException`) and can carry extra data to the catch block.

---

## Q9

What is try-with-resources and what does it require?

**Answer:**

A try statement that declares resources in parentheses and closes them automatically, even on exceptions. Resources must implement `AutoCloseable`.

---

## Q10

In what order are multiple try-with-resources resources closed?

**Answer:**

In reverse order of their declaration.

---

## Q11

Why is nested try-catch discouraged?

**Answer:**

It makes code hard to read and maintain. Extracting the inner logic into a separate method is cleaner.

---

## Q12

Should you catch `Error` or `Throwable`?

**Answer:**

Generally no. Errors like `OutOfMemoryError` are irrecoverable JVM problems, and catching `Throwable` hides them along with all exceptions.
