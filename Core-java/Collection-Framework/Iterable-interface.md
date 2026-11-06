# Java Iterable Interface — Introduction

---

# Table of Contents

1. Why Do We Need Iterable?
2. The Problem: Tight Coupling
3. The Solution: Iterator Pattern
4. Iterable vs Iterator
5. Internal Implementation (Custom Iterator)
6. Enhanced For-Loop (For-Each)
7. Separation of Concerns
8. ConcurrentModificationException
9. Iterator.remove()
10. Interview Questions

---

# 1. Why Do We Need Iterable?

Java has many data structures: `ArrayList`, `LinkedList`, `HashSet`, `Queue`, and more.

Each one stores data differently, but we want to **traverse all of them in the same way**.

`Iterable` is the interface at the top of the Collection hierarchy that makes this possible.

```text
Iterable          ← top of the hierarchy
   │
Collection
   ├── List  (ArrayList, LinkedList)
   ├── Set   (HashSet, TreeSet)
   └── Queue (PriorityQueue, ArrayDeque)
```

---

# 2. The Problem: Tight Coupling

The obvious way to loop over an `ArrayList` is with an index:

```java
List<Integer> list = new ArrayList<>();
list.add(10);
list.add(20);
list.add(30);

for (int i = 0; i < list.size(); i++) {
    System.out.println(list.get(i));
}
```

This works, but the loop is **tightly coupled to the internal structure** of the list (it assumes index-based access).

It breaks for structures that have no index:

```text
ArrayList   → get(i) works         ✓
LinkedList  → get(i) works, but O(n) per call  ✗ (slow)
HashSet     → no get(i) at all     ✗
Queue       → no get(i) at all     ✗
```

If we switch the collection type, the traversal code has to be rewritten.

---

# 3. The Solution: Iterator Pattern

Java uses the **Iterator design pattern**.

```text
Collection  ──implements──>  Iterable
                                │
                          iterator()
                                │
                                ↓
                            Iterator   ← hasNext(), next()
```

- A collection implements `Iterable` and must provide an `iterator()` method.
- `iterator()` returns an `Iterator` object.
- The `Iterator` knows how to walk through that specific collection.

The traversal logic is now **separated from the storage logic**, so the same loop works for any collection.

```java
Iterator<Integer> it = list.iterator();

while (it.hasNext()) {
    System.out.println(it.next());
}
```

Swap `ArrayList` for `HashSet` or `LinkedList` and this code stays exactly the same.

---

# 4. Iterable vs Iterator

| | Iterable | Iterator |
|---|----------|----------|
| Role | Says "I can be traversed" | Does the actual traversal |
| Implemented by | The collection (e.g., `ArrayList`) | A helper object returned by the collection |
| Key method | `iterator()` | `hasNext()`, `next()`, `remove()` |
| Holds state? | No | Yes (current position) |

## Iterator Methods

| Method | Purpose |
|--------|---------|
| `hasNext()` | Checks if more elements remain |
| `next()` | Returns the current element and moves the cursor forward |
| `remove()` | Removes the last element returned by `next()` |

---

# 5. Internal Implementation (Custom Iterator)

Let's build a simple list that supports iteration, to see how it works inside.

```java
class MyList<T> implements Iterable<T> {

    private Object[] data = new Object[10];
    private int size = 0;

    public void add(T value) {
        data[size++] = value;
    }

    @Override
    public Iterator<T> iterator() {
        return new MyListIterator();      // hand out a fresh iterator
    }

    // Nested class: holds its own traversal state
    private class MyListIterator implements Iterator<T> {

        private int position = 0;         // cursor

        @Override
        public boolean hasNext() {
            return position < size;
        }

        @Override
        @SuppressWarnings("unchecked")
        public T next() {
            return (T) data[position++];  // return current, then move on
        }
    }
}
```

Using it:

```java
MyList<String> names = new MyList<>();
names.add("Alice");
names.add("Bob");

for (String n : names) {
    System.out.println(n);   // Alice, Bob
}
```

## How the Cursor Moves

```text
data:      [Alice][Bob][Carol]
position:    ↑

next() → Alice,  position = 1
next() → Bob,    position = 2
next() → Carol,  position = 3
hasNext() → false (3 < 3 is false)
```

The `position` pointer lives in the **iterator**, not in the collection.

---

# 6. Enhanced For-Loop (For-Each)

The for-each loop is **syntactic sugar** over the Iterator pattern.

You write:

```java
for (String name : names) {
    System.out.println(name);
}
```

The compiler translates it to:

```java
Iterator<String> it = names.iterator();
while (it.hasNext()) {
    String name = it.next();
    System.out.println(name);
}
```

## The Rule

For-each works **only** on arrays and classes that implement `Iterable`.

```java
class Box { }

Box box = new Box();
for (Object o : box) { }   // ❌ compile error: not Iterable
```

Use cases: any read-only pass over a collection, printing, summing, searching.

---

# 7. Separation of Concerns

```text
Collection → stores the data
Iterator   → tracks the traversal
```

Because each call to `iterator()` returns a **new** iterator with its own cursor, traversals do not interfere with one another.

## Nested Loops on the Same Collection

```java
for (String a : names) {
    for (String b : names) {
        System.out.println(a + " - " + b);
    }
}
```

This works correctly because each loop has its own iterator and its own position.

If the cursor were stored inside the collection itself, the inner loop would move the outer loop's position and the output would be wrong.

---

# 8. ConcurrentModificationException

If you **change the structure** of a collection while iterating over it, Java throws `ConcurrentModificationException`.

```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3, 4));

for (Integer x : list) {
    if (x == 2) {
        list.remove(x);      // ❌ modifies the list during traversal
    }
}
// Exception in thread "main" java.util.ConcurrentModificationException
```

## Why It Happens

```text
Iterator starts → remembers the collection's modification count
Collection changes outside the iterator → modification count changes
next() is called → counts don't match → throw exception
```

This is called a **fail-fast** mechanism. It stops immediately instead of silently producing wrong results.

---

# 9. Iterator.remove()

To remove elements safely during traversal, use the iterator's own `remove()`:

```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3, 4));

Iterator<Integer> it = list.iterator();
while (it.hasNext()) {
    int x = it.next();
    if (x % 2 == 0) {
        it.remove();         // ✓ safe: iterator updates its own state
    }
}

System.out.println(list);    // [1, 3]
```

## Rules

- `remove()` deletes the **last element returned by `next()`**.
- You must call `next()` before each `remove()`.
- Calling `remove()` twice in a row without `next()` throws `IllegalStateException`.

---

# 10. Interview Questions

## Q1

What is the Iterable interface?

**Answer:**

It is the root interface of the Collection hierarchy. A class that implements it must provide an `iterator()` method, which makes the class traversable and usable in a for-each loop.

---

## Q2

Why not just use an index-based for-loop?

**Answer:**

It is tightly coupled to index-based structures like `ArrayList`. It does not work for `HashSet` or `Queue`, and is inefficient on `LinkedList`. An iterator gives one uniform way to traverse any collection.

---

## Q3

Iterable vs Iterator?

**Answer:**

`Iterable` is implemented by the collection and has the `iterator()` method. `Iterator` is the object that does the traversal, with `hasNext()`, `next()` and `remove()`, and it holds the current position.

---

## Q4

What methods does the Iterator interface provide?

**Answer:**

`hasNext()` checks if more elements remain, `next()` returns the next element and advances the cursor, and `remove()` deletes the last returned element.

---

## Q5

How does the enhanced for-loop work internally?

**Answer:**

The compiler converts it into an `Iterator` loop: it calls `iterator()`, then repeats `hasNext()` and `next()` until no elements remain.

---

## Q6

Can you use for-each on any class?

**Answer:**

No. Only arrays and classes that implement `Iterable`. Otherwise the compiler reports an error.

---

## Q7

Why does `iterator()` return a new object each time?

**Answer:**

So each traversal has its own cursor. This allows nested loops or several traversals on the same collection without interfering with each other.

---

## Q8

What is ConcurrentModificationException?

**Answer:**

It is thrown when a collection is structurally modified (for example by `list.remove()`) while it is being iterated. It is a fail-fast mechanism that protects against inconsistent traversal.

---

## Q9

How do you remove elements safely while iterating?

**Answer:**

Use `Iterator.remove()`. It removes the last element returned by `next()` and keeps the iterator's internal state consistent.

---

## Q10

Why is the iterator implemented as a separate (often nested) class?

**Answer:**

It separates traversal from storage. The iterator keeps its own state, such as a position pointer, so the collection stays focused on storing data and multiple traversals can run independently.
