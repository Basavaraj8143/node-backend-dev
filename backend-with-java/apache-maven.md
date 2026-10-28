# Apache Maven - Build Management for Java

---

# Table of Contents

1. Why Maven?
2. Project Structure
3. pom.xml
4. Repositories & Dependencies
5. Build Lifecycle
6. Maven Archetypes
7. Interview Questions

---

# 1. Why Maven?

## The Problem Without Maven

Multiple `.java` files compile into separate `.class` files.

Sharing or packaging manually:

```text
Order.class
User.class
Product.class
      ↓
How do you ship all of this?
```

## JAR Files

**JAR (Java ARchive)** — bundles `.class` files, resources, and folder structure into one file.

```text
myapp.jar  =  all .class files + resources + metadata
```

Maven automates creating, managing, and sharing these JARs.

---

# 2. Project Structure

Maven enforces a **standard directory layout**:

```text
my-project/
├── src/
│   ├── main/
│   │   └── java/        ← application source code
│   └── test/
│       └── java/        ← test source code
├── target/              ← compiled output (auto-generated)
└── pom.xml              ← project config
```

`target/` is created on build — never commit it to Git.

---

# 3. pom.xml

**Project Object Model** — the heart of every Maven project.

```xml
<project>
    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
</project>
```

## Key Sections

| Section | Purpose |
|---------|---------|
| `groupId` | Organisation/package identifier |
| `artifactId` | Project name |
| `version` | Current version |
| `parent` | Inherit config from a parent POM |
| `dependencies` | Third-party libraries to include |
| `plugins` | Build tools (compiler, test runner, etc.) |

## POM Hierarchy

```text
Super POM (Maven default)
      ↑
Parent POM (spring-boot-starter-parent)
      ↑
Your pom.xml
```

Child inherits all config from parent — reduces duplication.

---

# 4. Repositories & Dependencies

## How Maven Finds a Dependency

```text
Check Local Repo (~/.m2)
        ↓
Found? → use it (fast)
Not found? → download from Central/Remote Repo
        ↓
Cache in ~/.m2 for next time
```

## Three Repository Types

| Type | Description |
|------|-------------|
| Local (`.m2`) | Cache on your machine — checked first |
| Central | [repo.maven.apache.org](https://repo.maven.apache.org) — public library hub |
| Remote | Company's private repo for proprietary libs |

---

# 5. Build Lifecycle

Three lifecycles:

## Clean

```text
mvn clean
```

Deletes the `target/` folder — removes stale build artifacts.

---

## Default (Main)

Phases run in order:

```text
validate   →  check project is correct
compile    →  compile source code → .class files
test       →  run unit tests
package    →  bundle into .jar / .war
verify     →  run integration checks
install    →  copy .jar to local ~/.m2 repo
deploy     →  upload .jar to remote repo
```

Running a phase runs **all previous phases** too:

```bash
mvn package   # runs validate → compile → test → package
```

---

## Site

```text
mvn site
```

Generates project documentation (HTML reports).

---

# 6. Maven Archetypes

Pre-configured project templates to jumpstart development.

```bash
mvn archetype:generate
```

Common archetypes:

| Archetype | Use Case |
|-----------|---------|
| `maven-archetype-quickstart` | Basic Java project |
| `spring-boot-starter` | Spring Boot project |

Spring Initializr (start.spring.io) is essentially a web UI for Maven archetypes.

---

# 7. Interview Questions

## Q1

What is Maven and why is it used?

**Answer:**

A build automation tool for Java projects. It standardizes project structure, manages dependencies automatically, and handles the full build lifecycle from compilation to deployment.

---

## Q2

What is a JAR file?

**Answer:**

Java ARchive — a packaged bundle of `.class` files, resources, and metadata. Used to distribute and deploy Java applications as a single file.

---

## Q3

What is `pom.xml`?

**Answer:**

Project Object Model — the central config file of a Maven project. Defines project metadata, dependencies, plugins, and parent POM inheritance.

---

## Q4

What is the local repository and where is it?

**Answer:**

A cache directory (`~/.m2/repository`) on the developer's machine. Maven checks here first before downloading from the internet — speeds up subsequent builds.

---

## Q5

What is the difference between `install` and `deploy` in the Maven lifecycle?

**Answer:**

`install` copies the built JAR to the local `.m2` repository. `deploy` uploads it to a remote repository for sharing with a team or CI/CD pipeline.

---

## Q6

What happens when you run `mvn package`?

**Answer:**

Maven runs all preceding phases — `validate`, `compile`, `test` — and then packages the compiled output into a `.jar` or `.war` file inside the `target/` folder.

---

## Q7

What is a Parent POM?

**Answer:**

A POM that child projects inherit from. It centralizes shared configuration like dependency versions, plugin settings, and build properties — reducing repetition across projects. Spring Boot projects inherit from `spring-boot-starter-parent`.

---

## Q8

What is a Maven Archetype?

**Answer:**

A project template that generates a pre-configured folder structure and `pom.xml`. Lets developers bootstrap a new project in seconds instead of setting it up manually.
