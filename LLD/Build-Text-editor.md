# LLD — Design a Document Editor (Google Docs-like)

---

# Table of Contents

1. Problem Statement
2. Design Approaches
3. The "Bad Design"
4. The Improved Design
5. SOLID Evaluation
6. Law of Demeter & Trade-offs
7. Interview Questions

---

# 1. Problem Statement

Build an editor that supports:

- Adding **text**
- Adding **images**
- Rendering the document
- Saving the document

Future requirements: tables, videos, fonts, etc.

The design must absorb these without rewriting existing code.

---

# 2. Design Approaches

| Approach | Idea |
|----------|------|
| Top-Down | Design high-level objects first, then break them down |
| Bottom-Up | Build small independent components first, then combine |

Bottom-Up is preferred in LLD interviews.

---

# 3. The "Bad Design"

Everything lives in one `DocumentEditor` class.

```java
class DocumentEditor {

    private List<String> elements = new ArrayList<>();

    public void addText(String text) {
        elements.add(text);
    }

    public void addImage(String path) {
        elements.add(path);
    }

    public String render() {
        StringBuilder sb = new StringBuilder();
        for (String e : elements) {
            // hacky type check
            if (e.endsWith(".jpg") || e.endsWith(".png")) {
                sb.append("[Image: ").append(e).append("]");
            } else {
                sb.append(e);
            }
        }
        return sb.toString();
    }

    public void saveToFile() { ... }
    public void saveToDB()   { ... }
}
```

## Why It's Bad

| Principle | Violation |
|-----------|-----------|
| SRP | One class stores, renders, and saves — many reasons to change |
| OCP | Adding a video means editing `render()` |
| Design | Single `List<String>` loses type info; relies on file extension hacks |

---

# 4. The Improved Design

## Structure

```text
DocumentElement (abstract)
   ├── TextElement
   ├── ImageElement
   ├── NewlineElement
   └── TabElement

Document        → holds List<DocumentElement>

Persistence (interface)
   ├── SaveToFile
   └── SaveToDB

DocumentEditor  → coordinates Document + Persistence
```

---

## Step 1: Elements (Polymorphism)

```java
interface DocumentElement {
    String render();
}

class TextElement implements DocumentElement {
    private final String text;

    public TextElement(String text) { this.text = text; }

    @Override
    public String render() { return text; }
}

class ImageElement implements DocumentElement {
    private final String path;

    public ImageElement(String path) { this.path = path; }

    @Override
    public String render() { return "[Image: " + path + "]"; }
}

class NewlineElement implements DocumentElement {
    @Override
    public String render() { return "\n"; }
}

class TabElement implements DocumentElement {
    @Override
    public String render() { return "\t"; }
}
```

Each element knows **how to render itself**.

---

## Step 2: Document (Storage + Delegation)

```java
class Document {

    private final List<DocumentElement> elements = new ArrayList<>();

    public void addElement(DocumentElement element) {
        elements.add(element);
    }

    public String render() {
        StringBuilder sb = new StringBuilder();
        for (DocumentElement e : elements) {
            sb.append(e.render());   // delegates to each element
        }
        return sb.toString();
    }
}
```

`Document` doesn't care what kind of element it holds.

---

## Step 3: Persistence (DIP)

```java
interface Persistence {
    void save(String data);
}

class SaveToFile implements Persistence {
    @Override
    public void save(String data) {
        System.out.println("Saved to file: " + data);
    }
}

class SaveToDB implements Persistence {
    @Override
    public void save(String data) {
        System.out.println("Saved to DB: " + data);
    }
}
```

---

## Step 4: DocumentEditor (Coordinator)

```java
class DocumentEditor {

    private final Document document;
    private final Persistence persistence;

    public DocumentEditor(Document document, Persistence persistence) {
        this.document = document;
        this.persistence = persistence;
    }

    public void addText(String text) {
        document.addElement(new TextElement(text));
    }

    public void addImage(String path) {
        document.addElement(new ImageElement(path));
    }

    public void addNewline() {
        document.addElement(new NewlineElement());
    }

    public void addTab() {
        document.addElement(new TabElement());
    }

    public String render() {
        return document.render();
    }

    public void save() {
        persistence.save(document.render());
    }
}
```

---

## Usage

```java
Document doc = new Document();
Persistence storage = new SaveToFile();   // swap to SaveToDB freely

DocumentEditor editor = new DocumentEditor(doc, storage);

editor.addText("Hello");
editor.addNewline();
editor.addImage("photo.jpg");
editor.addTab();
editor.addText("World");

System.out.println(editor.render());
editor.save();
```

---

## Adding a Video (OCP in Action)

```java
class VideoElement implements DocumentElement {
    private final String url;

    public VideoElement(String url) { this.url = url; }

    @Override
    public String render() { return "[Video: " + url + "]"; }
}
```

Zero changes to `Document`, `Persistence`, or existing elements.

---

# 5. SOLID Evaluation

| Principle | How the design satisfies it |
|-----------|----------------------------|
| **SRP** | `Document` stores, `Persistence` saves, each element renders itself |
| **OCP** | New elements = new classes, no edits to `Document` |
| **LSP** | `Document` accepts any `DocumentElement` subtype seamlessly |
| **ISP** | Interfaces are small and focused (`render()`, `save()`) |
| **DIP** | `DocumentEditor` depends on `Persistence` abstraction, not file/DB classes |

---

# 6. Law of Demeter & Trade-offs

## Principle of Least Knowledge

> A class should only talk to its immediate friends — not friends of friends.

## Violation

```java
// DocumentEditor reaching through Document into its elements
for (DocumentElement e : document.getElements()) {
    sb.append(e.render());
}
```

`DocumentEditor` now knows about `Document`'s internals **and** `DocumentElement`.

## Fix

Ask `Document` to do the work:

```java
String output = document.render();   // talks only to its friend
```

## The Trade-off

To hide the elements, `Document` must both **store** and **render** — which slightly stretches SRP.

```text
Satisfy Law of Demeter  →  Document does more  →  SRP loosened
```

LLD is **iterative and full of trade-offs**. There's rarely a perfect design — choose what fits the requirements.

---

# 7. Interview Questions

## Q1

Why is putting everything in one `DocumentEditor` class a bad design?

**Answer:**

It violates SRP (storing, rendering, and saving in one class) and OCP (adding a new element type means modifying existing code). Type checks like file extensions are also fragile.

---

## Q2

How does polymorphism improve the document design?

**Answer:**

Each element implements `render()` itself. `Document` just calls `render()` on every element without knowing its type, so new element types need no changes to existing code.

---

## Q3

How does the design follow OCP?

**Answer:**

Adding a `VideoElement` or `TableElement` means creating a new class implementing `DocumentElement`. `Document` and other classes remain untouched.

---

## Q4

Where is DIP applied?

**Answer:**

`DocumentEditor` depends on the `Persistence` interface, not `SaveToFile` or `SaveToDB`. Storage can be swapped without touching editor logic.

---

## Q5

What is the role of `DocumentEditor` after the redesign?

**Answer:**

A coordinator. It wires `Document` and `Persistence` together and exposes simple methods, but doesn't contain rendering or saving logic.

---

## Q6

Top-Down vs Bottom-Up design?

**Answer:**

Top-Down starts with high-level objects and breaks them down. Bottom-Up builds small independent components first and combines them. Bottom-Up is generally preferred in LLD interviews.

---

## Q7

What is the Law of Demeter?

**Answer:**

Also called the Principle of Least Knowledge — a class should only interact with its immediate collaborators, not reach through them into their internals.

---

## Q8

How can following the Law of Demeter conflict with SRP?

**Answer:**

To hide internals, a class like `Document` must expose behavior (e.g., `render()`) instead of its element list. That means it both stores and renders, loosening SRP.

---

## Q9

How would you add font support?

**Answer:**

Create a new element or a decorator implementing `DocumentElement` (e.g., `StyledTextElement`) with its own `render()`. No existing class needs to change.

---

## Q10

Why is LLD described as iterative with trade-offs?

**Answer:**

Principles can pull in different directions (e.g., Demeter vs SRP). The goal isn't a perfect design but one that balances them for the given requirements.
