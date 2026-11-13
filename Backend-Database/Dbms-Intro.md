# Introduction to DBMS

## Table of Contents

1. Data vs Information
2. What is a Database?
3. What is a DBMS?
4. File System vs DBMS
5. Advantages and Disadvantages of DBMS
6. Types of DBMS
7. DBMS vs RDBMS
8. Three-Schema Architecture
9. Data Independence
10. Quick Revision Summary
11. Interview Questions

---

# 1. Data vs Information

**Data** = raw facts and figures that can be stored and processed.

**Information** = data that is organized and given context.

Sample student data:

| Student ID | Name  | Age | Branch |
| ---------- | ----- | --- | ------ |
| 101        | Rahul | 21  | CSE    |
| 102        | Kiran | 22  | ECE    |
| 103        | Amit  | 20  | CSE    |

`101`, `Rahul`, `21` and `CSE` are each just data. Put them together in a table with headings and they become information.

```text
Raw facts  --->  Organize + add context  --->  Meaningful information
 (data)              (processing)                 (information)
```

| Data                | Information                          |
| ------------------- | ------------------------------------ |
| Raw, unprocessed    | Processed and meaningful             |
| `21`, `CSE`         | "Rahul, aged 21, studies in CSE"     |
| Input               | Output                               |

---

# 2. What is a Database?

A **database** is an organized collection of related data. It is stored electronically. It can be accessed, managed, updated and retrieved easily.

**Problem:** A college has 5,000 students. It must store:

- Student details
- Attendance
- Marks
- Fees
- Course information

Paper registers cannot handle this at scale.

**Solution:** Store everything in one organized database.

```text
+-----------------------------------------+
|               COLLEGE DATABASE          |
|                                         |
|  Students | Attendance | Marks          |
|  Fees     | Courses                     |
+-----------------------------------------+
```

---

# 3. What is a DBMS?

**DBMS = Database Management System.**

A DBMS is software. It lets users and applications create, store, retrieve, update and manage data in a database.

Examples: MySQL, PostgreSQL, Oracle Database, Microsoft SQL Server, SQLite.

| Term     | Meaning                              |
| -------- | ------------------------------------ |
| Database | Where organized data is stored       |
| DBMS     | Software that manages the database   |

## How an application uses a DBMS

Take a URL shortener app.

```text
+-------+   request   +-------------+   query   +-------+
| React | ----------> | Spring Boot | --------> | MySQL |
|  UI   |             |   Backend   |           | DBMS  |
+-------+             +-------------+           +-------+
    ^                        ^                      |
    |                        |       result         |
    +------------------------+----------------------+
```

The backend never touches the data files directly. It asks the DBMS, and the DBMS does the work.

## SQL example: the DBMS stores and returns data

```sql
CREATE TABLE urls (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    long_url   VARCHAR(500) NOT NULL
);

-- Backend asks the DBMS to store a row
INSERT INTO urls (short_code, long_url)
VALUES ('abc123', 'https://example.com/very/long/path');

-- Backend asks the DBMS to fetch it
SELECT long_url FROM urls WHERE short_code = 'abc123';
```

---

# 4. File System vs DBMS

Suppose a college stores records in Excel or text files. It works at first. As data grows, problems appear.

## Problem 1: Data redundancy

The same data is stored in many files.

Rahul's phone number sits in the admission file, attendance file and fees file.

## Problem 2: Data inconsistency

You update the phone number in one file. You forget the others. Now two different numbers exist for one student.

## Problem 3: Security

Only authorized staff should see marks. Plain files have no built-in access control.

## Problem 4: Concurrent access

Two staff members update the same record at the same time. Plain files cannot manage this safely.

## Problem 5: Backup and recovery

The computer crashes mid-update. Recovering consistent data is hard.

## Bad vs Good (SQL)

**Bad: same data duplicated across tables**

```sql
CREATE TABLE admission (student_id INT, name VARCHAR(50), phone VARCHAR(15));
CREATE TABLE fees      (student_id INT, name VARCHAR(50), phone VARCHAR(15));

-- Update only one copy -> inconsistency
UPDATE admission SET phone = '9999999999' WHERE student_id = 101;
-- fees still has the old number!
```

**Good: one copy, linked by key**

```sql
CREATE TABLE students (
    student_id INT PRIMARY KEY,
    name       VARCHAR(50),
    phone      VARCHAR(15)
);

CREATE TABLE fees (
    student_id INT REFERENCES students(student_id),
    amount_paid DECIMAL(10,2)
);

-- Phone lives in ONE place
UPDATE students SET phone = '9999999999' WHERE student_id = 101;
```

## Comparison

| Feature           | File System          | DBMS                |
| ----------------- | -------------------- | ------------------- |
| Redundancy        | More likely          | Can be controlled   |
| Consistency       | Difficult            | Better enforcement  |
| Security          | Basic                | Advanced controls   |
| Concurrent access | Difficult            | Managed             |
| Backup            | Often manual         | Built-in mechanisms |
| Querying          | Requires custom code | SQL support         |
| Relationships     | Difficult to manage  | Supported           |

**Pitfall:** A DBMS does not remove every problem automatically. Poor table design still creates redundancy and inconsistency.

---

# 5. Advantages and Disadvantages of DBMS

## Advantages

| Advantage             | Meaning                                                |
| --------------------- | ------------------------------------------------------ |
| Reduced redundancy    | Avoids unnecessary duplication                         |
| Data consistency      | Keeps data accurate across the system                  |
| Data security         | Controls who can access or modify data                 |
| Data sharing          | Many authorized users can use the same data            |
| Data integrity        | Constraints ensure valid data                          |
| Backup and recovery   | Helps restore data after failures                      |
| Concurrency control   | Manages simultaneous operations                        |
| Data independence     | Storage changes need not break every application       |

## Disadvantages

| Disadvantage            | Meaning                                                    |
| ----------------------- | ---------------------------------------------------------- |
| Cost                    | Enterprise software and infrastructure can be expensive    |
| Complexity              | Needs administration and expertise                         |
| Resource consumption    | Can need significant memory, CPU and storage               |
| Single point of failure | A poorly configured central database is a critical risk    |
| Maintenance             | Needs updates, monitoring and administration               |

**Is DBMS always better?** No. For very small apps or simple storage, a basic file system can be enough. A DBMS pays off when relationships, consistency, security and concurrent access matter.

---

# 6. Types of DBMS

There are four traditional types.

```text
DBMS Types
 |
 +-- Hierarchical   (tree)
 +-- Network        (graph)
 +-- Relational     (tables)
 +-- Object-Oriented (objects)
```

## 6.1 Hierarchical DBMS

Data is organized as a tree. Each child has one parent.

```text
Company
 |-- Department A
 |     |-- Employee 1
 |     +-- Employee 2
 +-- Department B
       +-- Employee 3
```

## 6.2 Network DBMS

Data is organized as a network. A record can have multiple parents and children.

```text
Student 1 ----> Course A
    \          ^
     \        /
      v      /
     Course B <---- Student 2
```

A student can enroll in many courses. A course can have many students.

## 6.3 Relational DBMS (RDBMS)

Data is stored in tables of rows and columns. Keys link the tables.

```text
STUDENT                     ENROLLMENT
+----+-------+              +------------+-----------+
| id | name  |  <---------  | student_id | course_id |
+----+-------+     key      +------------+-----------+
| 1  | Rahul |              | 1          | 10        |
+----+-------+              +------------+-----------+
```

Examples: MySQL, PostgreSQL, Oracle.

## 6.4 Object-Oriented DBMS

Data is stored as objects, like in OOP.

Example: ObjectDB.

## Comparison

| Type             | Structure | Relationship style        | Example      |
| ---------------- | --------- | ------------------------- | ------------ |
| Hierarchical     | Tree      | One parent per child      | IMS          |
| Network          | Graph     | Many parents allowed      | IDS          |
| Relational       | Tables    | Keys (primary / foreign)  | MySQL        |
| Object-Oriented  | Objects   | Object references         | ObjectDB     |

**Pitfall:** NoSQL is a broad family of non-relational databases. It is not just another name for object-oriented DBMS.

---

# 7. DBMS vs RDBMS

| DBMS                                   | RDBMS                                     |
| -------------------------------------- | ----------------------------------------- |
| General database management concept    | Relational database management system     |
| May use different data models          | Uses relational tables                    |
| Relationships depend on the data model | Relationships commonly use keys           |
| Relational constraints may not apply   | Supports relational integrity constraints |

Examples:

- DBMS: hierarchical and network database systems.
- RDBMS: MySQL, PostgreSQL, Oracle.

```text
+----------------------------------+
|              DBMS                |
|   +--------------------------+   |
|   |          RDBMS           |   |
|   |  MySQL, PostgreSQL,      |   |
|   |  Oracle                  |   |
|   +--------------------------+   |
+----------------------------------+
```

Every RDBMS is a DBMS. Not every DBMS is an RDBMS.

---

# 8. Three-Schema Architecture

**Definition:** It separates how users see data from how data is logically organized and physically stored.

**Problem:** If every application depends on the physical storage details, any storage change breaks everything.

**Solution:** Split the database into three levels.

```text
   User A view     User B view     User C view
        \              |              /
         v             v             v
  +----------------------------------------+
  |   EXTERNAL LEVEL (View level)          |
  +----------------------------------------+
                      |
                      v
  +----------------------------------------+
  |   CONCEPTUAL LEVEL (Logical level)     |
  +----------------------------------------+
                      |
                      v
  +----------------------------------------+
  |   INTERNAL LEVEL (Physical level)      |
  +----------------------------------------+
                      |
                      v
                 [ Disk storage ]
```

## A. External level (View level)

What an individual user sees.

- A student sees marks and attendance.
- An accountant sees fee details.
- An administrator sees all permitted student information.

Different users get different views of the same database.

## B. Conceptual level (Logical level)

The complete logical structure of the database. It defines:

- Which tables exist
- Which attributes they contain
- Relationships between tables
- Constraints

Example: Student, Course, Attendance and Fees tables and how they relate.

## C. Internal level (Physical level)

How data is physically stored. It deals with:

- Files and storage pages
- Index structures
- Record organization

## Easy way to remember

| Level      | Think of               |
| ---------- | ---------------------- |
| External   | What the user sees     |
| Conceptual | What the database contains |
| Internal   | How the data is stored |

## SQL example: an external view

An accountant should only see fee data, not marks. A view gives that.

```sql
CREATE VIEW accountant_view AS
SELECT student_id, name, fees_paid
FROM students;

SELECT * FROM accountant_view;
```

**Benefits:**

- Users see only what they need.
- Security improves.
- Storage can change without breaking user views.

---

# 9. Data Independence

The three-schema architecture gives two kinds of data independence.

## 9.1 Physical data independence

Changes to physical storage do not require changes to the conceptual schema.

Example: change the indexing or storage organization. The logical tables stay the same.

## 9.2 Logical data independence

Changes to the conceptual schema do not require changes to every external view or application.

Example: add a new optional column. Existing views keep working.

## SQL example: logical independence in action

```sql
-- Before: students(student_id, name, fees_paid)
-- Change the conceptual schema: add a new optional column
ALTER TABLE students ADD COLUMN email VARCHAR(100);

-- The view and its queries still work unchanged
SELECT student_id, name, fees_paid FROM accountant_view;
```

## Comparison

| Feature        | Physical independence          | Logical independence             |
| -------------- | ------------------------------ | -------------------------------- |
| What changes   | Storage and indexes            | Tables and columns               |
| What stays safe| Conceptual schema              | External views and applications  |
| Difficulty     | Easier                         | Harder                           |

Logical data independence is generally harder to achieve.

**Pitfall:** `SELECT *` breaks easily when columns change. Name your columns.

---

# 10. Quick Revision Summary

| Topic                     | One-line recall                                        |
| ------------------------- | ------------------------------------------------------ |
| Data                      | Raw facts                                              |
| Information               | Data with context                                      |
| Database                  | Organized collection of related data                   |
| DBMS                      | Software that manages the database                     |
| File system problems      | Redundancy, inconsistency, weak security, no concurrency, hard recovery |
| Types of DBMS             | Hierarchical, Network, Relational, Object-Oriented     |
| DBMS vs RDBMS             | Every RDBMS is a DBMS, not vice versa                  |
| Three levels              | External (view), Conceptual (logical), Internal (physical) |
| Physical independence     | Storage changes do not affect the logical schema       |
| Logical independence      | Schema changes do not affect views / apps; harder      |

```text
Data --> Database --> DBMS --> RDBMS (tables + keys)
                        |
                        +--> Three-schema: External / Conceptual / Internal
```

---

# 11. Interview Questions

## Q1

What is data?

**Answer:**

Data is raw facts and figures that can be processed to produce meaningful information.

---

## Q2

What is a database?

**Answer:**

A database is a structured collection of related data. It allows efficient storage, retrieval, modification and management of information.

---

## Q3

What is a DBMS, and why do we need it?

**Answer:**

A DBMS is software to create, store, retrieve, update and manage data. We need it for controlled access, efficient retrieval, security, consistency, concurrency management, and backup and recovery.

---

## Q4

What is the difference between a database and a DBMS?

**Answer:**

A database is where organized data is stored. A DBMS is the software that manages that database.

---

## Q5

Why is a DBMS better than a file system?

**Answer:**

A DBMS reduces redundancy, maintains consistency, provides security, supports concurrent access, and offers backup and recovery. Files struggle with all of these.

---

## Q6

What are data redundancy and data inconsistency?

**Answer:**

Redundancy is unnecessary duplication of the same data. Inconsistency happens when duplicate copies disagree, for example two different phone numbers for one student.

---

## Q7

Is a DBMS always better than a file system?

**Answer:**

No. For very small or simple applications, a file system can be enough. A DBMS is valuable when relationships, consistency, security and concurrency matter.

---

## Q8

Name the four types of DBMS.

**Answer:**

Hierarchical, Network, Relational and Object-Oriented.

---

## Q9

What is the difference between DBMS and RDBMS?

**Answer:**

A DBMS is the general concept and may use different data models. An RDBMS stores data in tables linked by keys and supports relational integrity constraints. Examples: MySQL, PostgreSQL, Oracle.

---

## Q10

Is every RDBMS a DBMS?

**Answer:**

Yes. Every RDBMS is a DBMS, but not every DBMS is an RDBMS.

---

## Q11

Explain the three-schema architecture.

**Answer:**

It has three levels. The external level is what each user sees. The conceptual level is the logical structure of the whole database. The internal level is how data is physically stored.

---

## Q12

What is data independence? Compare logical and physical.

**Answer:**

Data independence means changes at one level do not force changes at higher levels. Physical independence protects the conceptual schema from storage changes. Logical independence protects views and applications from schema changes, and is harder to achieve.

---
