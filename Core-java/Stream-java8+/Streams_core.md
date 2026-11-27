# Java Streams (Java 8+)

---

# Table of Contents

1. Imperative vs Declarative
2. What is a Stream?
3. Pipeline Architecture
4. Lazy Evaluation & Vertical Processing
5. Infinite Streams
6. Primitive Streams
7. Common Operations Cheat Sheet
8. Quick Revision Summary
9. Interview Questions

---

# 1. Imperative vs Declarative

## Task

From a list of employees, find those earning over 50,000, get their names, and sort them.

```java
class Employee {
    private final String name;
    private final double salary;

    public Employee(String name, double salary) {
        this.name = name;
        this.salary = salary;
    }

    public String getName()   { return name; }
    public double getSalary() { return salary; }
}
```

## Imperative (Explicit "How")

```java
List<String> result = new ArrayList<>();

for (Employee e : employees) {
    if (e.getSalary() > 50000) {
        result.add(e.getName());
    }
}

Collections.sort(result);
```

You write the loop, the condition, the temp list, and the sort.

## Declarative (Streams: "What")

```java
List<String> result = employees.stream()
        .filter(e -> e.getSalary() > 50000)
        .map(Employee::getName)
        .sorted()
        .toList();
```

You describe **what** you want. Java decides **how** to do it.

| | Imperative | Declarative (Streams) |
|--|-----------|----------------------|
| Focus | How to do it | What to achieve |
| Code | Loops, temp variables | Pipeline of operations |
| Readability | Grows with complexity | Stays compact |

Streams rely on functional interfaces: `Predicate` (filter), `Function` (map), `Consumer` (forEach).

---

# 2. What is a Stream?

A **Stream** is a **pipeline for processing data**. It is **not a data structure**.

- It **does not store** data
- It is a **view** over a source (List, Set, array...)
- It **does not modify** the original collection
- It can be consumed **only once**

```java
List<Integer> nums = List.of(1, 2, 3);

List<Integer> doubled = nums.stream()
        .map(n -> n * 2)
        .toList();

System.out.println(nums);      // [1, 2, 3]  (original unchanged)
System.out.println(doubled);   // [2, 4, 6]
```

## Single Use

```java
Stream<Integer> s = nums.stream();
s.forEach(System.out::println);
s.forEach(System.out::println);   // ❌ IllegalStateException: stream has already been operated upon or closed
```

Create a new stream each time.

---

# 3. Pipeline Architecture

```text
Source  →  Intermediate Operations  →  Terminal Operation
```

```java
employees.stream()                          // 1. SOURCE
         .filter(e -> e.getSalary() > 50000) // 2. INTERMEDIATE
         .map(Employee::getName)             // 2. INTERMEDIATE
         .sorted()                           // 2. INTERMEDIATE
         .toList();                          // 3. TERMINAL
```

| Part | Role | Examples |
|------|------|----------|
| **Source** | Where data comes from | `list.stream()`, `Arrays.stream(arr)`, `Stream.of(...)` |
| **Intermediate** | Transform the stream. **Lazy**, returns a new Stream | `filter`, `map`, `sorted`, `distinct`, `limit`, `skip` |
| **Terminal** | Triggers execution, produces a result. **Ends** the stream | `forEach`, `toList`, `collect`, `count`, `reduce` |

A pipeline **without a terminal operation does nothing**.

---

# 4. Lazy Evaluation & Vertical Processing

## Lazy Evaluation

Intermediate operations are **not executed** until a terminal operation is called.

```java
Stream<Integer> s = Stream.of(1, 2, 3, 4)
        .filter(n -> {
            System.out.println("filter " + n);
            return n % 2 == 0;
        });
// Nothing printed yet: no terminal operation
```

## Vertical Processing

Each element travels through **the entire pipeline** before the next element starts.

```java
List<Integer> nums = List.of(1, 2, 3, 4);

nums.stream()
    .filter(n -> { System.out.println("filter " + n); return n % 2 == 0; })
    .map(n -> { System.out.println("map " + n); return n * 10; })
    .forEach(n -> System.out.println("result " + n));
```

Output:

```text
filter 1
filter 2
map 2
result 20
filter 3
filter 4
map 4
result 40
```

```text
Vertical (streams):            Horizontal (not how streams work):
element 1 → filter → map       filter all elements
element 2 → filter → map       then map all elements
element 3 → ...
```

## Benefits

- **Efficiency**: no intermediate collections created at each stage
- **Short-circuiting**: with `limit()` or `findFirst()`, processing stops as soon as the answer is found

```java
employees.stream()
         .filter(e -> e.getSalary() > 50000)
         .findFirst();          // stops at the first match
```

---

# 5. Infinite Streams

Streams can generate **endless** data. Always combine them with `limit()`.

## `Stream.iterate()`

Each element is computed from the previous one.

```java
Stream.iterate(1, n -> n * 2)
      .limit(5)
      .forEach(System.out::println);
// 1 2 4 8 16
```

Java 9+ adds a stopping condition:

```java
Stream.iterate(1, n -> n <= 100, n -> n * 2)
      .forEach(System.out::println);
// 1 2 4 8 16 32 64
```

## `Stream.generate()`

Produces values from a `Supplier`.

```java
Stream.generate(Math::random)
      .limit(3)
      .forEach(System.out::println);
```

```java
Stream.generate(() -> "Hello")
      .limit(3)
      .toList();             // [Hello, Hello, Hello]
```

Without `limit()`, an infinite stream runs forever (or until memory runs out). Laziness is what makes infinite streams possible.

---

# 6. Primitive Streams

`Stream<Integer>` **boxes** each `int` into an `Integer` object, adding memory and CPU overhead.

Primitive streams avoid this:

| Stream | Primitive |
|--------|-----------|
| `IntStream` | `int` |
| `LongStream` | `long` |
| `DoubleStream` | `double` |

```java
IntStream.range(1, 6).sum();            // 1+2+3+4+5 = 15   (6 excluded)
IntStream.rangeClosed(1, 5).sum();      // 15               (5 included)
```

## Extra Methods

```java
IntStream.of(4, 8, 15).average();       // OptionalDouble[9.0]
IntStream.of(4, 8, 15).max();           // OptionalInt[15]
IntStream.rangeClosed(1, 5).sum();      // 15
```

## Converting Between Stream Types

```java
// Object stream → primitive stream
int totalAge = people.stream()
        .mapToInt(Person::getAge)
        .sum();

// Primitive stream → object stream
List<Integer> list = IntStream.rangeClosed(1, 5)
        .boxed()
        .toList();
```

## Boxed vs Primitive

| | `Stream<Integer>` | `IntStream` |
|--|------------------|------------|
| Boxing/unboxing | Yes (overhead) | None |
| Built-in `sum()`, `average()` | ✗ | ✓ |
| Memory | Higher | Lower |

---

# 7. Common Operations Cheat Sheet

## Intermediate

| Operation | Purpose | Example |
|-----------|---------|---------|
| `filter` | Keep matching elements | `.filter(n -> n > 5)` |
| `map` | Transform each element | `.map(String::toUpperCase)` |
| `flatMap` | Flatten nested streams | `.flatMap(List::stream)` |
| `sorted` | Sort | `.sorted()` |
| `distinct` | Remove duplicates | `.distinct()` |
| `limit(n)` | First n elements | `.limit(3)` |
| `skip(n)` | Skip first n | `.skip(2)` |
| `peek` | Debug without changing | `.peek(System.out::println)` |

## Terminal

| Operation | Purpose | Example |
|-----------|---------|---------|
| `forEach` | Perform action on each | `.forEach(System.out::println)` |
| `toList` / `collect` | Gather into a collection | `.toList()` |
| `count` | Number of elements | `.count()` |
| `reduce` | Combine into one value | `.reduce(0, Integer::sum)` |
| `anyMatch` / `allMatch` / `noneMatch` | Condition checks | `.anyMatch(n -> n > 5)` |
| `findFirst` | First element (Optional) | `.findFirst()` |
| `min` / `max` | Smallest / largest | `.max(Integer::compare)` |

## Quick Examples

```java
List<Integer> nums = List.of(1, 2, 3, 4, 5, 6);

int sumOfEvens = nums.stream()
        .filter(n -> n % 2 == 0)
        .mapToInt(Integer::intValue)
        .sum();                              // 12

List<String> names = employees.stream()
        .map(Employee::getName)
        .distinct()
        .sorted()
        .toList();

Map<Boolean, List<Integer>> parts = nums.stream()
        .collect(Collectors.partitioningBy(n -> n % 2 == 0));
```

---

# 8. Quick Revision Summary

```text
Stream          → pipeline, NOT a data structure; doesn't store or modify the source
Pipeline        → Source → Intermediate (lazy) → Terminal (triggers)
Lazy            → nothing runs until a terminal operation
Vertical        → each element goes through the whole pipeline before the next
Single use      → a stream can be consumed only once
Infinite        → iterate() / generate() + limit()
Primitive       → IntStream / LongStream / DoubleStream avoid boxing
```

---

# 9. Interview Questions

## Q1

What is a Stream in Java?

**Answer:**

A pipeline for processing data from a source (like a collection) using functional-style operations. It doesn't store data or modify the source.

---

## Q2

Imperative vs declarative programming?

**Answer:**

Imperative code spells out how to do something with loops and conditions. Declarative code (Streams) describes what result you want and lets Java handle the execution.

---

## Q3

Does a Stream modify the original collection?

**Answer:**

No. It processes the data and produces a new result, leaving the source untouched.

---

## Q4

Intermediate vs terminal operations?

**Answer:**

Intermediate operations (`filter`, `map`, `sorted`) are lazy and return a new Stream. Terminal operations (`forEach`, `toList`, `count`) trigger execution and produce a result or side effect, ending the stream.

---

## Q5

What is lazy evaluation in streams?

**Answer:**

Intermediate operations don't run until a terminal operation is called. Without one, the pipeline does nothing.

---

## Q6

What is vertical processing?

**Answer:**

Each element passes through the entire pipeline (all filters and maps) before the next element is processed, instead of processing the whole collection at each stage.

---

## Q7

Can a stream be reused?

**Answer:**

No. After a terminal operation, reuse throws `IllegalStateException`. Create a new stream from the source.

---

## Q8

How do you create an infinite stream?

**Answer:**

With `Stream.iterate(seed, fn)` or `Stream.generate(supplier)`, always combined with `limit()` (or a stopping predicate in Java 9+ `iterate`).

---

## Q9

Why use `IntStream` instead of `Stream<Integer>`?

**Answer:**

It avoids autoboxing/unboxing overhead and provides built-in methods like `sum()`, `average()`, and `range()`.

---

## Q10

`range()` vs `rangeClosed()`?

**Answer:**

`range(1, 5)` excludes the end (1 to 4). `rangeClosed(1, 5)` includes it (1 to 5).

---

## Q11

`map()` vs `flatMap()`?

**Answer:**

`map()` transforms each element one-to-one. `flatMap()` transforms each element into a stream and flattens all results into a single stream.

---

## Q12

`toList()` vs `collect(Collectors.toList())`?

**Answer:**

`toList()` (Java 16+) is shorter and returns an unmodifiable list. `Collectors.toList()` is older and typically returns a modifiable `ArrayList`.
