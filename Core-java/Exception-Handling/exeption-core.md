# Exception Handling in Java

---

# Table of Contents

1. Why Exceptions Exist
2. Errors vs Exceptions
3. Exceptions Are Objects
4. Default Exception Handling
5. try-catch
6. Exception Propagation (Call Stack)
7. finally Block
8. Multiple Catch Blocks
9. Best Practices
10. Interview Questions

---

# 1. Why Exceptions Exist

Programs don't always behave as planned:

- Invalid user input
- Missing files
- Division by zero
- Network or database failures

Exception handling lets you **stay in control** of execution instead of letting the program crash.

---

# 2. Errors vs Exceptions

```text
Throwable
 ├── Error        → serious, non-recoverable (OutOfMemoryError, StackOverflowError)
 └── Exception    → recoverable, can be handled
```

| | Error | Exception |
|--|-------|-----------|
| Severity | Serious JVM/system problem | Program-level problem |
| Recoverable | No | Yes |
| Should you catch it | Generally no | Yes |
| Example | `OutOfMemoryError` | `ArithmeticException` |

---

# 3. Exceptions Are Objects

An exception is an **object** created by the JVM to signal an abnormal condition.

```java
int a = 5, b = 0;
System.out.println(a / b);
```

```text
JVM detects division by zero
        ↓
Creates an ArithmeticException object
        ↓
Throws it up the call stack
```

---

# 4. Default Exception Handling

If you don't handle it, the JVM:

1. Stops program execution
2. Prints the **stack trace** (method call sequence)
3. Terminates the application

```java
public class Main {
    public static void main(String[] args) {
        int a = 5, b = 0;
        System.out.println(a / b);
        System.out.println("This never runs");
    }
}
```

Output:

```text
Exception in thread "main" java.lang.ArithmeticException: / by zero
    at Main.main(Main.java:4)
```

---

# 5. try-catch

## Syntax

```java
try {
    // risky code
} catch (ExceptionType e) {
    // handle it
}
```

## Example

```java
public class Main {
    public static void main(String[] args) {
        try {
            int a = 5, b = 0;
            System.out.println(a / b);
        } catch (ArithmeticException e) {
            System.out.println("Cannot divide by zero");
        }

        System.out.println("Program continues...");
    }
}
```

Output:

```text
Cannot divide by zero
Program continues...
```

## Flow

```text
Enter try
    ↓
Exception thrown? ── No ──→ skip catch, continue
    │
   Yes
    ↓
Matching catch runs
    ↓
Program continues normally
```

Code after the exception line **inside try** is skipped.

---

# 6. Exception Propagation (Call Stack)

If a method doesn't handle an exception, it **bubbles up** to its caller.

```java
public class Main {

    static void methodB() {
        int x = 5 / 0;          // exception thrown here
    }

    static void methodA() {
        methodB();              // not handled here
    }

    public static void main(String[] args) {
        try {
            methodA();          // caught here
        } catch (ArithmeticException e) {
            System.out.println("Caught in main");
        }
    }
}
```

## Flow

```text
main → methodA → methodB  (exception thrown)
                    ↓
              methodB has no catch → bubbles up
                    ↓
              methodA has no catch → bubbles up
                    ↓
              main has catch → handled ✓
```

If no method catches it, the JVM's default handler terminates the program.

---

# 7. finally Block

An optional block that **always executes**, whether or not an exception occurred.

Used for **cleanup**: closing files, DB connections, network sockets.

```java
try {
    int result = 5 / 0;
} catch (ArithmeticException e) {
    System.out.println("Exception caught");
} finally {
    System.out.println("Cleanup done");
}
```

Output:

```text
Exception caught
Cleanup done
```

## Runs in All Cases

| Scenario | try | catch | finally |
|----------|-----|-------|---------|
| No exception | ✓ | skipped | ✓ |
| Exception caught | partial | ✓ | ✓ |
| Exception not caught | partial | skipped | ✓ (then crashes) |

---

# 8. Multiple Catch Blocks

Handle different exceptions with different logic.

```java
try {
    String s = null;
    int[] arr = new int[3];

    arr[5] = 10;           // ArrayIndexOutOfBoundsException
    s.length();            // NullPointerException
    int x = 5 / 0;         // ArithmeticException

} catch (ArithmeticException e) {
    System.out.println("Math error");
} catch (ArrayIndexOutOfBoundsException e) {
    System.out.println("Invalid array index");
} catch (Exception e) {
    System.out.println("Something else went wrong");
}
```

## Rules

- Only **one** matching catch runs
- Put **specific** exceptions first, **general** (`Exception`) last
- Catching a parent before its child causes a compile error

Multi-catch (Java 7+):

```java
catch (ArithmeticException | NullPointerException e) {
    System.out.println("Handled: " + e.getMessage());
}
```

---

# 9. Best Practices

## Use printStackTrace for Debugging

```java
catch (Exception e) {
    e.printStackTrace();   // shows where and why
}
```

Shows the exact call sequence. In production, prefer a logger:

```java
logger.error("Operation failed", e);
```

## Show User-Friendly Messages

```text
User sees:  "Something went wrong. Please try again."
Logs hold:  full stack trace
```

Users shouldn't see technical error logs.

## try-with-resources (Auto Cleanup)

```java
try (BufferedReader br = new BufferedReader(new FileReader("data.txt"))) {
    System.out.println(br.readLine());
} catch (IOException e) {
    e.printStackTrace();
}
// br closed automatically — no finally needed
```

## Don'ts

- Don't leave catch blocks **empty** (hides bugs)
- Don't catch `Exception` everywhere without reason
- Don't use exceptions for normal control flow

---

# 10. Interview Questions

## Q1

What is an exception in Java?

**Answer:**

An object created by the JVM to signal an abnormal condition during execution, which can be handled to prevent the program from crashing.

---

## Q2

Difference between Error and Exception?

**Answer:**

Errors are serious, non-recoverable problems (e.g., `OutOfMemoryError`) and generally shouldn't be caught. Exceptions are recoverable conditions that can be handled.

---

## Q3

What happens if an exception is not handled?

**Answer:**

The JVM's default handler stops the program, prints the stack trace, and terminates the application.

---

## Q4

What is a stack trace?

**Answer:**

A report of the method call sequence at the point the exception occurred, showing where and why it happened.

---

## Q5

How does exception propagation work?

**Answer:**

An unhandled exception moves up the call stack from the method where it occurred to its caller, and onward, until a matching catch block is found or it reaches the JVM.

---

## Q6

What is the purpose of `finally`?

**Answer:**

It always runs whether or not an exception occurs. Used for cleanup such as closing files and database connections.

---

## Q7

Can a `try` exist without `catch`?

**Answer:**

Yes, if it has a `finally` block or is a try-with-resources statement.

---

## Q8

In what order should multiple catch blocks be written?

**Answer:**

Most specific exception first, most general last. A parent class catch before a child catch causes a compile error.

---

## Q9

Does `finally` run if `System.exit()` is called inside `try`?

**Answer:**

No. `System.exit()` terminates the JVM immediately, so `finally` doesn't execute.

---

## Q10

What is try-with-resources?

**Answer:**

A try statement that declares resources implementing `AutoCloseable`. They are closed automatically at the end, removing the need for a manual `finally` cleanup.

---

## Q11

Checked vs unchecked exceptions?

**Answer:**

Checked exceptions (e.g., `IOException`) must be handled or declared with `throws` at compile time. Unchecked exceptions (subclasses of `RuntimeException`, e.g., `ArithmeticException`) are not enforced by the compiler.

---

## Q12

Why shouldn't users see stack traces?

**Answer:**

They are confusing, unfriendly, and can leak internal details. Show a clean message to users and log the full trace internally.
