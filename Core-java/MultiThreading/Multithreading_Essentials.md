# Java Multithreading — Essentials

---

# Table of Contents

1. Thread Creation
2. Synchronization & Coordination
3. ExecutorService
4. CompletableFuture
5. Interview Questions

---

# 1. Thread Creation

## Two Ways

```java
// 1. Extend Thread
class MyThread extends Thread {
    public void run() { System.out.println("Running"); }
}
new MyThread().start();

// 2. Implement Runnable (preferred)
class MyTask implements Runnable {
    public void run() { System.out.println("Running"); }
}
new Thread(new MyTask()).start();
```

`Runnable` is preferred: your class can still extend another class.

## Lambda (Most Concise)

```java
new Thread(() -> System.out.println("Running")).start();
```

## `start()` vs `run()`

| | `start()` | `run()` |
|--|-----------|---------|
| Creates a new thread | ✓ | ✗ |
| Executes in | New thread | **Current** thread |

Always call `start()`.

---

# 2. Synchronization & Coordination

## `synchronized`

Only **one thread at a time** can run the guarded code, preventing data inconsistency.

```java
class Counter {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }
}
```

A **constructor cannot be synchronized**.

## Thread Methods

| Method | Purpose | Releases lock? |
|--------|---------|---------------|
| `sleep(ms)` | Pause the current thread | No |
| `join()` | Wait until another thread finishes | n/a |
| `wait()` | Pause until notified | **Yes** |
| `notify()` | Wake one waiting thread | n/a |

`wait()` and `notify()` **must be called inside a `synchronized` block**, otherwise `IllegalMonitorStateException`.

## wait / notify Example

```java
class Counter {

    public synchronized void waitForSignal() throws InterruptedException {
        System.out.println("T1 waiting...");
        wait();                              // releases lock, pauses
        System.out.println("T1 resumed");
    }

    public synchronized void sendSignal() {
        System.out.println("T2 notifying");
        notify();                            // wakes T1
    }
}
```

```java
Counter c = new Counter();

Thread t1 = new Thread(() -> {
    try { c.waitForSignal(); } catch (InterruptedException e) { }
});

Thread t2 = new Thread(() -> {
    try { Thread.sleep(1000); } catch (InterruptedException e) { }
    c.sendSignal();
});

t1.start();
t2.start();
```

```text
T1 waiting...
(1 second)
T2 notifying
T1 resumed
```

---

# 3. ExecutorService

Manages a **pool of threads** and runs tasks on them.

```java
ExecutorService executor = Executors.newFixedThreadPool(3);
```

## `execute()` vs `submit()`

| | `execute()` | `submit()` |
|--|------------|-----------|
| Accepts | `Runnable` | `Runnable` or `Callable` |
| Returns | `void` | `Future` |

```java
executor.execute(() -> System.out.println("Task"));

Future<Integer> future = executor.submit(() -> 10 + 20);   // Callable
```

## `Future.get()`

Waits until the task completes and returns its result.

```java
int result = future.get();       // 30 (blocks until ready)
executor.shutdown();             // always shut down the pool
```

`get()` can throw `InterruptedException` and `ExecutionException`.

---

# 4. CompletableFuture

Clean **asynchronous** programming with chaining.

| Method | Purpose |
|--------|---------|
| `supplyAsync()` | Run a task async and **return a result** |
| `thenApply()` | Transform the result |
| `thenAccept()` | Consume the result (returns nothing) |

By default it runs on **`ForkJoinPool.commonPool()`**.

```java
CompletableFuture.supplyAsync(() -> 10)
                 .thenApply(res -> res + 10)
                 .thenAccept(res -> System.out.println(res));
// Output: 20
```

```text
supplyAsync → 10 → thenApply → 20 → thenAccept → prints 20
```

In a short `main`, call `.join()` on the future so the program doesn't exit before it prints.

---

# 5. Interview Questions

## Q1

Ways to create a thread?

**Answer:**

Extend `Thread` or implement `Runnable` (preferred, since the class can still extend another class). A lambda is the most concise form.

---

## Q2

`start()` vs `run()`?

**Answer:**

`start()` creates a new thread and runs `run()` in it. Calling `run()` directly executes in the current thread.

---

## Q3

What does `synchronized` do?

**Answer:**

Lets only one thread at a time access the guarded code or resource, preventing data inconsistency. Constructors can't be synchronized.

---

## Q4

`sleep()` vs `wait()`?

**Answer:**

`sleep()` pauses for a set time and keeps the lock. `wait()` pauses until notified and releases the lock; it must be called inside a synchronized block.

---

## Q5

What does `join()` do?

**Answer:**

Makes the calling thread wait until the target thread finishes.

---

## Q6

`execute()` vs `submit()`?

**Answer:**

`execute()` takes a `Runnable` and returns void. `submit()` takes a `Runnable` or `Callable` and returns a `Future`.

---

## Q7

What does `Future.get()` do?

**Answer:**

Blocks until the task completes, then returns its result.

---

## Q8

What does `CompletableFuture.supplyAsync()` do, and which pool does it use?

**Answer:**

Runs a task asynchronously and returns a result via a `CompletableFuture`. It uses `ForkJoinPool.commonPool()` by default.
