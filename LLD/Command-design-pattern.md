# Command Design Pattern — Introduction

---

# Table of Contents

1. Why Command Pattern?
2. Core Concept
3. Example: Smart Home Remote
4. Real-World Use Cases
5. Interview Questions

---

# 1. Why Command Pattern?

Normally, a source object calls a method directly on a receiver:

```text
RemoteControl ──calls──> Light.on()
```

The remote is **tightly coupled** to the light. Adding a fan means changing the remote's code.

The Command Pattern **encapsulates a request as an object**, so the sender doesn't need to know who performs the action or how.

---

# 2. Core Concept

A **Command** object sits between the source and the receiver.

```text
Source (Invoker)  ──>  Command  ──>  Receiver
RemoteControl          LightCommand     Light
```

| Role | Responsibility | Example |
|------|----------------|---------|
| Source / Invoker | Triggers the request | `RemoteControl` |
| Command | Wraps the action and its receiver | `LightCommand` |
| Receiver | Executes the real logic | `Light`, `Fan` |

This follows the **Open/Closed Principle**: new commands can be added without changing the remote.

**Definition:** Encapsulate a request as an object, so you can parameterize clients with different requests, queue or log requests, and support undoable operations.

---

# 3. Example: Smart Home Remote

## Command Interface

```java
interface ICommand {
    void execute();
    void undo();
}
```

## Receiver and Concrete Command

```java
class Light {
    void on()  { System.out.println("Light ON"); }
    void off() { System.out.println("Light OFF"); }
}

class LightCommand implements ICommand {
    private Light light;

    LightCommand(Light light) { this.light = light; }

    public void execute() { light.on(); }
    public void undo()    { light.off(); }
}
```

`FanCommand` is written the same way for a `Fan` receiver.

## Invoker

```java
class RemoteControl {
    private ICommand[] commands = new ICommand[5];
    private boolean[] pressed = new boolean[5];   // tracks toggle state

    void setCommand(int slot, ICommand cmd) {
        commands[slot] = cmd;                      // assign at runtime
    }

    void pressButton(int slot) {
        if (commands[slot] == null) {              // no command assigned
            System.out.println("No command assigned");
            return;
        }
        if (!pressed[slot]) commands[slot].execute();
        else                commands[slot].undo();
        pressed[slot] = !pressed[slot];
    }
}
```

## Usage

```java
RemoteControl remote = new RemoteControl();
remote.setCommand(0, new LightCommand(new Light()));

remote.pressButton(0);   // Light ON
remote.pressButton(0);   // Light OFF
remote.pressButton(1);   // No command assigned
```

## Key Points

- `setCommand()` lets buttons be reassigned dynamically.
- `undo()` reverses an action.
- A `null` check protects against unassigned buttons.

---

# 4. Real-World Use Cases

- **Undo/Redo (Ctrl+Z):** editors and Photoshop keep a **stack of command objects** and reverse them.
- **Keyboard shortcuts:** each key is mapped to a command object, not hard-wired to a function.
- **Task queues and logging:** commands can be stored, queued, or logged.

---

# 5. Interview Questions

## Q1

What is the Command Pattern?

**Answer:**

A behavioral pattern that encapsulates a request as an object, decoupling the sender from the receiver and enabling queuing, logging and undo.

---

## Q2

What are the main components?

**Answer:**

The invoker (triggers the request), the command (wraps the action), and the receiver (performs it).

---

## Q3

How does it follow the Open/Closed Principle?

**Answer:**

New commands can be added without modifying the invoker, since it only depends on the `ICommand` interface.

---

## Q4

How is undo implemented?

**Answer:**

Each command defines an `undo()` method that reverses `execute()`. Applications keep executed commands in a stack to undo them in order.

---

## Q5

Where is it used in real life?

**Answer:**

Undo/redo in editors, keyboard shortcuts, remote controls, and task queues.
