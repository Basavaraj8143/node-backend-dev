# Java String Pool

---

# Table of Contents

1. What is the String Pool?
2. String Literal vs `new String()`
3. `==` vs `equals()`
4. The `intern()` Method
5. String Concatenation & the Pool
6. Why Strings Are Immutable
7. String vs StringBuilder vs StringBuffer
8. Memory & Performance Notes
9. Quick Revision Summary
10. Interview Questions

---

# 1. What is the String Pool?

The **String Pool** (String Constant Pool) is a special area in the **heap** where Java stores **unique String literals**.

Goal: **save memory** by reusing the same String object instead of creating duplicates.

```text
String a = "hello";
String b = "hello";

Both a and b point to the SAME object in the pool.
```

## Memory Layout

```text
Stack                     Heap
┌─────────┐        ┌─────────────────────────────┐
│ a ──────┼───┐    │  String Pool                │
│ b ──────┼───┼──> │   ["hello"]                 │
└─────────┘   │    │   ["world"]                 │
              │    ├─────────────────────────────┤
              │    │  Normal Heap                │
              │    │   (objects created with new)│
              └──> └─────────────────────────────┘
```

## Key Facts

- Since **Java 7**, the pool lives in the **heap** (earlier it was in PermGen)
- Unreferenced pooled strings can be **garbage collected**
- Internally it's a **hash table**; size is tunable with `-XX:StringTableSize`
- Pooling works safely because Strings are **immutable**

---

# 2. String Literal vs `new String()`

## String Literal

```java
String s1 = "hello";
```

```text
1. JVM checks the pool for "hello"
2. Found?     → reuse the existing reference
   Not found? → create it in the pool, then reference it
```

## Using `new`

```java
String s3 = new String("hello");
```

```text
1. "hello" literal is placed in the pool (if not already there)
2. `new` creates ANOTHER String object on the normal heap
3. s3 points to the heap object, NOT the pool object
```

## Comparison

```java
String s1 = "hello";
String s2 = "hello";
String s3 = new String("hello");
String s4 = new String("hello");
```

```text
Pool:  ["hello"] ◄── s1, s2
Heap:  [String "hello"] ◄── s3
Heap:  [String "hello"] ◄── s4
```

| Expression | Result | Reason |
|-----------|--------|--------|
| `s1 == s2` | `true` | Same pooled object |
| `s1 == s3` | `false` | Pool object vs heap object |
| `s3 == s4` | `false` | Two separate heap objects |
| `s1.equals(s3)` | `true` | Same content |

## How Many Objects?

```java
String s = new String("abc");
```

- If `"abc"` is **not** in the pool yet → **2 objects** (one in pool, one on heap)
- If `"abc"` is **already** in the pool → **1 object** (just the heap one)

Avoid `new String("...")`. It wastes memory with no benefit.

---

# 3. `==` vs `equals()`

| | `==` | `equals()` |
|--|------|-----------|
| Compares | **Reference** (memory address) | **Content** (characters) |
| Use for Strings | Almost never | **Always** |

```java
String a = "java";
String b = new String("java");

System.out.println(a == b);        // false
System.out.println(a.equals(b));   // true
```

## Best Practice

```java
// Safe against NullPointerException — literal on the left
if ("admin".equals(role)) { ... }

// Or
if (Objects.equals(role, "admin")) { ... }
```

Case-insensitive:

```java
"Java".equalsIgnoreCase("JAVA");   // true
```

---

# 4. The `intern()` Method

`intern()` returns the **pooled** version of a String.

```text
String in pool already? → return the pooled reference
Not in pool?            → add it to the pool, return the reference
```

```java
String s1 = "hello";
String s2 = new String("hello");

System.out.println(s1 == s2);            // false
System.out.println(s1 == s2.intern());   // true
```

```java
String s3 = new String("java");
String s4 = s3.intern();      // adds "java" to the pool (or finds it)
String s5 = "java";

System.out.println(s4 == s5);   // true
```

## When to Use `intern()`

- Many duplicate strings read from files/DB/network (saves memory)
- Heavy `==` comparisons (rare, usually not worth it)

## Caution

- The pool is a shared hash table. Interning huge numbers of unique strings can slow things down
- Prefer normal `equals()` and let the JVM handle duplicates

---

# 5. String Concatenation & the Pool

## Compile-Time Constants → Pooled

```java
String s1 = "hello";
String s2 = "hel" + "lo";     // folded to "hello" at compile time

System.out.println(s1 == s2);   // true
```

## Runtime Concatenation → New Object

```java
String a = "hel";
String b = "lo";
String c = a + b;             // computed at runtime → new heap object

System.out.println(c == "hello");           // false
System.out.println(c.equals("hello"));      // true
System.out.println(c.intern() == "hello");  // true
```

## `final` Variables Are Constants

```java
final String fa = "hel";
final String fb = "lo";
String d = fa + fb;           // both are compile-time constants → folded

System.out.println(d == "hello");   // true
```

| Case | Pooled? |
|------|---------|
| `"hel" + "lo"` | ✓ (compile-time) |
| `final` vars + `final` vars | ✓ (compile-time) |
| Non-final vars `a + b` | ✗ (runtime, new object) |
| Method result (`s.substring(1)`, `s.toUpperCase()`) | ✗ |
| Input from `Scanner`, files, network | ✗ |

---

# 6. Why Strings Are Immutable

Once created, a String's content **cannot change**.

```java
String s = "hello";
s = s + " world";     // creates a NEW String; "hello" is untouched
```

```text
Before:  s ──> "hello"
After:   s ──> "hello world"      ("hello" still exists in the pool)
```

## Reasons

| Reason | Explanation |
|--------|-------------|
| **String Pool** | Shared references are safe only if nobody can modify the object |
| **Security** | Used for DB URLs, file paths, class names, passwords. Mutation after validation would be dangerous |
| **Thread safety** | Immutable objects can be shared across threads without synchronization |
| **Hashcode caching** | `hashCode()` is computed once and cached, which makes Strings great `HashMap` keys |
| **Class loading** | Class names are Strings. Changing them would break loading |

## What If Strings Were Mutable?

```java
String a = "hello";
String b = "hello";    // same pooled object

a.changeTo("bye");     // hypothetical
// b would ALSO become "bye" — chaos
```

---

# 7. String vs StringBuilder vs StringBuffer

Repeated concatenation creates many throwaway objects:

```java
String result = "";
for (int i = 0; i < 10000; i++) {
    result += i;               // new String every iteration ❌
}
```

Use a mutable builder:

```java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    sb.append(i);              // modifies the same buffer ✓
}
String result = sb.toString();
```

| | `String` | `StringBuilder` | `StringBuffer` |
|--|----------|----------------|---------------|
| Mutable | ✗ | ✓ | ✓ |
| Thread-safe | ✓ (immutable) | ✗ | ✓ (synchronized) |
| Speed | Slow for many changes | **Fastest** | Slower than StringBuilder |
| Stored in pool | ✓ (literals) | ✗ | ✗ |
| Use when | Fixed text | Single-threaded building | Shared across threads |

Rule of thumb: **use `StringBuilder`** unless multiple threads share the same builder.

---

# 8. Memory & Performance Notes

- **Prefer literals** over `new String(...)`
- Use **`equals()`**, not `==`
- Build strings in loops with **`StringBuilder`**
- Modern JVMs optimize simple `a + b + c` into efficient code (`StringBuilder` or `invokedynamic`), but not inside loops
- Duplicate-heavy apps can enable **String Deduplication** with the G1 collector: `-XX:+UseStringDeduplication`
- Tune pool size if you intern lots of strings: `-XX:StringTableSize=<n>`
- Don't store passwords in Strings that stay in memory. Prefer `char[]` and clear it after use

## Common Pitfalls

```java
String s = "hello";
s.toUpperCase();                   // result discarded! s is unchanged
System.out.println(s);             // hello

s = s.toUpperCase();               // reassign to keep the result
System.out.println(s);             // HELLO
```

---

# 9. Quick Revision Summary

```text
"literal"         → stored in String Pool, reused
new String("x")   → new heap object (+ pooled literal)
==                → compares references
equals()          → compares content
intern()          → returns the pooled reference
"a" + "b"         → compile-time constant, pooled
var1 + var2       → runtime, new object
Immutable         → makes pooling, caching, and thread safety possible
```

| Code | `== "java"`? |
|------|-------------|
| `String s = "java";` | ✓ true |
| `String s = new String("java");` | ✗ false |
| `new String("java").intern()` | ✓ true |
| `"ja" + "va"` | ✓ true |
| `a + b` (non-final vars) | ✗ false |

---

# 10. Interview Questions

## Q1

What is the String Pool?

**Answer:**

A special area in the heap that stores unique String literals so identical strings share one object, saving memory.

---

## Q2

Where is the String Pool stored?

**Answer:**

In the heap (since Java 7). Before Java 7 it was in PermGen.

---

## Q3

Difference between `String s = "hello"` and `String s = new String("hello")`?

**Answer:**

The literal reuses (or creates) an object in the pool. `new String("hello")` always creates a new object on the heap, in addition to the pooled literal.

---

## Q4

How many objects does `new String("abc")` create?

**Answer:**

Up to 2: one in the pool (if `"abc"` isn't there already) and one on the heap. If the literal is already pooled, only 1 is created.

---

## Q5

Difference between `==` and `equals()` for Strings?

**Answer:**

`==` compares references (same object?). `equals()` compares content (same characters?). Always use `equals()` for Strings.

---

## Q6

What does `intern()` do?

**Answer:**

It returns the canonical pooled instance of the String. If the content isn't in the pool, it's added first.

---

## Q7

Why are Strings immutable in Java?

**Answer:**

For the String Pool to work safely, for security, for thread safety, and for hashCode caching (making Strings reliable `HashMap` keys).

---

## Q8

What is the output?

```java
String a = "java";
String b = "ja" + "va";
String c = "ja";
String d = c + "va";
System.out.println(a == b);
System.out.println(a == d);
```

**Answer:**

`true`, then `false`. `"ja" + "va"` is a compile-time constant and pooled. `c + "va"` involves a non-final variable, so it's computed at runtime into a new object.

---

## Q9

What changes if `c` is declared `final String c = "ja";`?

**Answer:**

`a == d` becomes `true`, because `c` is then a compile-time constant and `c + "va"` is folded at compile time.

---

## Q10

String vs StringBuilder vs StringBuffer?

**Answer:**

String is immutable. StringBuilder is mutable and fast but not thread-safe. StringBuffer is mutable and thread-safe (synchronized) but slower.

---

## Q11

Why is concatenating in a loop with `+` bad?

**Answer:**

Each `+` creates a new String object, wasting memory and time (O(n²) copying). Use `StringBuilder` instead.

---

## Q12

Does the String Pool get garbage collected?

**Answer:**

Yes (since Java 7). Pooled strings that are no longer referenced anywhere can be collected.

---

## Q13

Are Strings created from user input or `substring()` stored in the pool?

**Answer:**

No. Only literals and compile-time constants are pooled automatically. Runtime-created strings go to the normal heap unless you call `intern()`.

---

## Q14

Why is `"admin".equals(role)` preferred over `role.equals("admin")`?

**Answer:**

It avoids a `NullPointerException` when `role` is null, since the literal is never null.
