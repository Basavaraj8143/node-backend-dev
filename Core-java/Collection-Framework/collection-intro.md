# Java Collection Framework — Introduction

---

# Table of Contents

1. Why Data Structures?
2. Arrays vs Dynamic Data Structures
3. Dynamic Arrays
4. Linked Lists
5. Sets & Hashing
6. Stacks & Queues
7. Maps
8. Trees (BST)
9. The Collection Framework Hierarchy
10. Interview Questions

---

# 1. Why Data Structures?

Programs need to **store data** and **query it efficiently**.

The right data structure makes insertion, search, and deletion fast. The wrong one makes them slow.

---

# 2. Arrays vs Dynamic Data Structures

## Unsorted Array

| Operation | Time |
|-----------|------|
| Insert at end | O(1) |
| Access by index | O(1) |
| Find largest element | **O(n)** (must scan everything) |

## Sorted Array

| Operation | Time |
|-----------|------|
| Find largest element | **O(1)** (it's the last element) |
| Insert | **O(n)** (shift elements to keep order) |

## The Trade-off

```text
Unsorted → fast insert, slow query
Sorted   → fast query, slow insert
```

No single structure is best for everything. The Collection Framework gives you many to choose from.

---

# 3. Dynamic Arrays

Arrays have a **fixed size**. A dynamic array grows automatically.

## How It Works Internally

```text
Fixed array [1, 2, 3, 4]  ← full
        ↓
Create new array with DOUBLE capacity (8)
        ↓
Copy old elements over
        ↓
Add new element
```

```text
[1, 2, 3, 4, _, _, _, _]  →  insert 5  →  [1, 2, 3, 4, 5, _, _, _]
```

In Java this is `ArrayList`.

```java
List<Integer> list = new ArrayList<>();
list.add(10);
list.add(20);
list.add(30);   // grows automatically
```

Occasional resizing costs O(n), but most inserts stay O(1) (amortized).

---

# 4. Linked Lists

Elements are stored as **nodes**, each pointing to the next.

```text
[10 | •]──>[20 | •]──>[30 | null]
```

Best when you need **frequent insertions and deletions**, since no shifting is required.

```java
List<Integer> list = new LinkedList<>();
list.add(10);
list.add(20);
list.remove(0);
```

## ArrayList vs LinkedList

| Operation | ArrayList | LinkedList |
|-----------|-----------|-----------|
| Access by index | O(1) | O(n) |
| Insert/delete at start | O(n) | O(1) |
| Insert/delete in middle | O(n) | O(1) once the node is found |
| Memory | Compact | Extra pointer per node |

---

# 5. Sets & Hashing

## Set Requirements

- **No duplicates**
- **Constant-time lookup**

## Intuitive Hashing

Use the element itself to pick an index:

```text
index = element % arrayLength
```

```text
Array length = 5

Insert 12 → 12 % 5 = 2  → arr[2]
Insert 7  →  7 % 5 = 2  → collision!
Insert 9  →  9 % 5 = 4  → arr[4]
```

Insert and lookup both jump straight to an index → **O(1)**.

## Collisions

Different elements can map to the same index. Real implementations handle this by chaining entries in a list/tree at that index.

```java
Set<Integer> set = new HashSet<>();
set.add(5);
set.add(5);                    // ignored, duplicate
System.out.println(set.size());       // 1
System.out.println(set.contains(5));  // true — O(1)
```

---

# 6. Stacks & Queues

## Stack — LIFO (Last-In-First-Out)

Like a stack of plates: add and remove at the **same end**.

```text
push(1) push(2) push(3)

 | 3 |  ← top
 | 2 |
 | 1 |

pop() → 3
```

```java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);
stack.push(2);
stack.push(3);
System.out.println(stack.pop());   // 3
```

Use cases: undo, function call stack, bracket matching.

---

## Queue — FIFO (First-In-First-Out)

Like a line of people: enter at one end, leave at the other.

```text
enqueue → [1][2][3] → dequeue
          back  front
```

```java
Queue<Integer> queue = new LinkedList<>();
queue.add(1);
queue.add(2);
queue.add(3);
System.out.println(queue.poll());   // 1
```

Use cases: task scheduling, request handling, BFS.

---

# 7. Maps

Store **key-value pairs** (e.g., Name → Roll Number).

```java
Map<String, Integer> map = new HashMap<>();
map.put("Alice", 101);
map.put("Bob", 102);

System.out.println(map.get("Alice"));   // 101
```

## How It Works

The **key's hash code** determines the storage index.

```text
"Alice".hashCode() → index → store (Alice, 101)
```

Lookup by key is O(1) on average.

## Common Implementations

| Class | Ordering | Notes |
|-------|----------|-------|
| `HashMap` | None | Fastest, O(1) average |
| `LinkedHashMap` | Insertion order | Slightly slower |
| `TreeMap` | Sorted by key | O(log n) |

---

# 8. Trees (BST)

Used for **hierarchical** data and efficient search.

## Binary Search Tree Rule

```text
Left child  <  Node  <  Right child
```

```text
        50
       /  \
     30    70
    / \    / \
  20  40  60  80
```

Searching for 60:

```text
50 → go right → 70 → go left → 60 ✓
```

Each step halves the search space → **O(log n)** when balanced.

Java's `TreeSet` and `TreeMap` use a self-balancing tree (Red-Black Tree).

---

# 9. The Collection Framework Hierarchy

Java unifies all these structures under one hierarchy so you don't deal with each separately.

```text
Iterable
   │
Collection
   ├── List
   │     ├── ArrayList
   │     ├── LinkedList
   │     └── Vector
   │
   ├── Set
   │     ├── HashSet
   │     ├── LinkedHashSet
   │     └── TreeSet
   │
   └── Queue
         ├── PriorityQueue
         └── ArrayDeque / LinkedList

Map  (separate hierarchy)
   ├── HashMap
   ├── LinkedHashMap
   └── TreeMap
```

## Program to the Interface

```java
List<String> names = new ArrayList<>();   // declare as List
names.add("Alice");

// Switch implementation — rest of the code is unchanged
names = new LinkedList<>();
names.add("Alice");
```

Polymorphism lets `.add()` work identically on any `List`.

## Why Map Is Separate

`Map` stores **key-value pairs**, while `Collection` types store **individual values**. Their operations differ (`put/get` vs `add/remove`), so `Map` doesn't extend `Collection`.

---

# 10. Interview Questions

## Q1

Why do we need the Collection Framework?

**Answer:**

It provides ready-made, tested data structures (lists, sets, queues, maps) with a unified API, so you can store and query data efficiently without implementing them yourself.

---

## Q2

How does a dynamic array grow?

**Answer:**

When the internal array is full, a new array of double the capacity is created, existing elements are copied over, and the new element is added.

---

## Q3

ArrayList vs LinkedList?

**Answer:**

ArrayList gives O(1) index access but O(n) inserts/deletes in the middle. LinkedList gives O(1) inserts/deletes once the node is found but O(n) access by index.

---

## Q4

How does a Set avoid duplicates and give O(1) lookup?

**Answer:**

Elements are hashed to an index in an internal array, so insert and contains jump directly to a location. A duplicate maps to the same slot and is rejected.

---

## Q5

What is a hash collision?

**Answer:**

When two different elements map to the same index. Implementations resolve it by storing multiple entries at that index (chaining with lists or trees).

---

## Q6

Stack vs Queue?

**Answer:**

Stack is LIFO (insert and remove at the same end). Queue is FIFO (insert at one end, remove from the other).

---

## Q7

Why is `Deque` preferred over the legacy `Stack` class?

**Answer:**

`Stack` extends `Vector` and is synchronized and outdated. `ArrayDeque` is faster and offers a cleaner API for stack operations.

---

## Q8

How does a HashMap store data?

**Answer:**

It computes the key's hash code to determine the storage index, then stores the key-value pair there. Lookup by key is O(1) on average.

---

## Q9

What is a Binary Search Tree?

**Answer:**

A tree where each node's left child is smaller and right child is larger, allowing search in O(log n) when balanced.

---

## Q10

Why is `Map` not part of the `Collection` interface?

**Answer:**

`Map` stores key-value pairs, while `Collection` stores single elements. Their operations differ, so Java keeps them in separate hierarchies.

---

## Q11

Why declare `List<String> list = new ArrayList<>()` instead of `ArrayList<String>`?

**Answer:**

Programming to the interface lets you swap implementations (e.g., to `LinkedList`) without changing the rest of the code.

---

## Q12

HashSet vs TreeSet?

**Answer:**

HashSet is unordered with O(1) average operations. TreeSet keeps elements sorted with O(log n) operations, backed by a Red-Black Tree.
