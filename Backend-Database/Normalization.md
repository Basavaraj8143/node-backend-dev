# Database Normalization

## Table of Contents

1. What is Normalization?
2. The Three Anomalies
3. Keys and Functional Dependencies
4. First Normal Form (1NF)
5. Second Normal Form (2NF)
6. Third Normal Form (3NF)
7. Boyce-Codd Normal Form (BCNF)
8. Normal Forms Comparison
9. Normalization in SQL
10. Quick Revision Summary
11. Interview Questions

---

# 1. What is Normalization?

**Definition:** Normalization is the process of organizing tables to reduce unnecessary redundancy and prevent data anomalies.

**Problem:** One big table holding everything.

**Student_Course table**

| Student_ID | Student_Name | Course | Instructor |
| ---------- | ------------ | ------ | ---------- |
| 1          | Rahul        | Java   | Amit       |
| 1          | Rahul        | DBMS   | Priya      |
| 2          | Aman         | Java   | Amit       |
| 3          | Neha         | DBMS   | Priya      |

What goes wrong:

- Rahul's name is repeated.
- Changing the Java instructor means updating many rows.
- Deleting a student can wipe out course information.

**Solution:** Split the table into smaller, well-structured tables linked by keys.

```text
One big table                Normalized design
+----------------+           +---------+   +------------+   +---------+
| student+course |   --->    | Student |<--| Enrollment |-->| Course  |
| +instructor    |           +---------+   +------------+   +---------+
+----------------+
```

**Benefits:**

- Less duplicated data.
- Consistent updates.
- Safer inserts and deletes.

---

# 2. The Three Anomalies

## A. Insertion anomaly

A new course (Python) is added, but no student has enrolled yet.

There is no row to hold it. You must insert NULL student data or wait for an enrollment.

## B. Update anomaly

The Java instructor changes from Amit to Arjun.

Every Java row must change. Update only one and the data becomes inconsistent.

## C. Deletion anomaly

Neha is the only student in DBMS. Delete her and you also lose the fact that Priya teaches DBMS.

## Summary

| Anomaly   | Trigger                  | Result                                |
| --------- | ------------------------ | ------------------------------------- |
| Insertion | Add new unrelated fact   | Forced NULLs or blocked insert        |
| Update    | Change repeated value    | Inconsistent copies                   |
| Deletion  | Remove one record        | Unrelated information lost            |

---

# 3. Keys and Functional Dependencies

## Composite key

Consider:

| Student_ID | Course_ID | Student_Name | Course_Name |
| ---------- | --------- | ------------ | ----------- |
| 1          | C101      | Rahul        | Java        |
| 1          | C102      | Rahul        | DBMS        |
| 2          | C101      | Aman         | Java        |

- `Student_ID` alone does not identify a row.
- `Course_ID` alone does not identify a row.
- `(Student_ID, Course_ID)` together do.

That pair is a **composite primary key**: two or more columns that together uniquely identify a row.

## Functional dependency (FD)

`X → Y` means: if you know X, you can determine Y.

```text
Student_ID --> Student_Name
Course_ID  --> Course_Name
```

## Key terms

| Term                | Meaning                                              |
| ------------------- | ---------------------------------------------------- |
| Superkey            | Any set of columns that uniquely identifies a row    |
| Candidate key       | A minimal superkey                                   |
| Prime attribute     | Part of some candidate key                           |
| Non-prime attribute | Not part of any candidate key                        |
| Determinant         | The left side X of an FD `X → Y`                     |

---

# 4. First Normal Form (1NF)

**Rule:** Every column holds atomic (single) values.

**Problem:**

| Student_ID | Student_Name | Phone_Numbers          |
| ---------- | ------------ | ---------------------- |
| 1          | Rahul        | 9876543210, 9876500000 |
| 2          | Aman         | 9876511111             |

`Phone_Numbers` holds multiple values in one cell. This violates 1NF.

**Solution:** Move phone numbers into their own table.

**Student**

| Student_ID | Student_Name |
| ---------- | ------------ |
| 1          | Rahul        |
| 2          | Aman         |

**Student_Phone**

| Student_ID | Phone_Number |
| ---------- | ------------ |
| 1          | 9876543210   |
| 1          | 9876500000   |
| 2          | 9876511111   |

**Remember:**

- No multiple values in one cell.
- No repeating groups of columns.
- Each field is atomic.

## Bad vs Good (SQL)

**Bad: multiple values in one cell**

```sql
CREATE TABLE Student (
    student_id    INT PRIMARY KEY,
    student_name  VARCHAR(50),
    phone_numbers VARCHAR(100)   -- '9876543210, 9876500000'
);
```

**Good: one value per cell**

```sql
CREATE TABLE Student (
    student_id   INT PRIMARY KEY,
    student_name VARCHAR(50)
);

CREATE TABLE Student_Phone (
    student_id   INT,
    phone_number VARCHAR(15),
    PRIMARY KEY (student_id, phone_number),
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
);
```

---

# 5. Second Normal Form (2NF)

**Rules:**

1. The table is in 1NF.
2. Every non-key attribute depends on the **whole** candidate key, not just part of it.

**Problem:** Partial dependency.

Primary key = `(Student_ID, Course_ID)`

| Student_ID | Course_ID | Student_Name | Course_Name |
| ---------- | --------- | ------------ | ----------- |
| 1          | C101      | Rahul        | Java        |
| 1          | C102      | Rahul        | DBMS        |
| 2          | C101      | Aman         | Java        |

```text
Student_ID --> Student_Name     (part of the key only)
Course_ID  --> Course_Name      (part of the key only)
```

Neither name depends on the full composite key. That is a **partial dependency**.

**Solution:** Split into three tables.

```text
+-----------------+     +----------------------+     +----------------+
| Student         |     | Enrollment           |     | Course         |
|-----------------|     |----------------------|     |----------------|
| Student_ID (PK) |<----| Student_ID (FK)      |---->| Course_ID (PK) |
| Student_Name    |     | Course_ID  (FK)      |     | Course_Name    |
+-----------------+     +----------------------+     +----------------+
```

**Student**

| Student_ID (PK) | Student_Name |
| --------------- | ------------ |
| 1               | Rahul        |
| 2               | Aman         |

**Course**

| Course_ID (PK) | Course_Name |
| -------------- | ----------- |
| C101           | Java        |
| C102           | DBMS        |

**Enrollment**

| Student_ID (FK) | Course_ID (FK) |
| --------------- | -------------- |
| 1               | C101           |
| 1               | C102           |
| 2               | C101           |

## Bad vs Good (SQL)

**Bad: partial dependencies**

```sql
CREATE TABLE Enrollment (
    student_id   INT,
    course_id    VARCHAR(10),
    student_name VARCHAR(50),   -- depends only on student_id
    course_name  VARCHAR(50),   -- depends only on course_id
    PRIMARY KEY (student_id, course_id)
);
```

**Good: each fact stored once**

```sql
CREATE TABLE Student (
    student_id   INT PRIMARY KEY,
    student_name VARCHAR(50)
);

CREATE TABLE Course (
    course_id   VARCHAR(10) PRIMARY KEY,
    course_name VARCHAR(50)
);

CREATE TABLE Enrollment (
    student_id INT,
    course_id  VARCHAR(10),
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (course_id)  REFERENCES Course(course_id)
);
```

**Interview definition:** 2NF eliminates partial functional dependencies of non-prime attributes on candidate keys.

**Pitfall:** A table with a single-column candidate key can never have a partial dependency. So it is automatically in 2NF if it is in 1NF.

---

# 6. Third Normal Form (3NF)

**Rules:**

1. The table is in 2NF.
2. No transitive dependency of non-key attributes on candidate keys.

**Problem:** Transitive dependency.

Primary key = `Student_ID`

| Student_ID | Student_Name | Dept_ID | Dept_Name |
| ---------- | ------------ | ------- | --------- |
| 1          | Rahul        | 101     | CSE       |
| 2          | Aman         | 102     | ECE       |
| 3          | Priya        | 101     | CSE       |

```text
Student_ID --> Dept_ID --> Dept_Name

Student_ID determines Dept_Name only indirectly, through Dept_ID.
```

**Solution:** Split department data into its own table.

**Student**

| Student_ID (PK) | Student_Name | Dept_ID (FK) |
| --------------- | ------------ | ------------ |
| 1               | Rahul        | 101          |
| 2               | Aman         | 102          |
| 3               | Priya        | 101          |

**Department**

| Dept_ID (PK) | Dept_Name |
| ------------ | --------- |
| 101          | CSE       |
| 102          | ECE       |

## Bad vs Good (SQL)

**Bad: Dept_Name repeated for every student**

```sql
CREATE TABLE Student (
    student_id   INT PRIMARY KEY,
    student_name VARCHAR(50),
    dept_id      INT,
    dept_name    VARCHAR(50)    -- depends on dept_id, not on student_id
);
```

**Good: department stored once**

```sql
CREATE TABLE Department (
    dept_id   INT PRIMARY KEY,
    dept_name VARCHAR(50)
);

CREATE TABLE Student (
    student_id   INT PRIMARY KEY,
    student_name VARCHAR(50),
    dept_id      INT,
    FOREIGN KEY (dept_id) REFERENCES Department(dept_id)
);
```

**Formal definition:** A relation is in 3NF if it is in 2NF and, for every non-trivial FD `X → A`, at least one holds:

- X is a superkey, OR
- A is a prime attribute.

For basic placement questions, remember: **3NF removes transitive dependencies.**

---

# 7. Boyce-Codd Normal Form (BCNF)

BCNF is a stricter version of 3NF.

**Rule:** For every non-trivial FD `X → Y`, X must be a superkey.

**Problem:**

| Student | Subject | Instructor |
| ------- | ------- | ---------- |
| Rahul   | Java    | Amit       |
| Rahul   | DBMS    | Priya      |
| Aman    | Java    | Amit       |

Business rules:

- A student can study many subjects.
- Each instructor teaches only one subject.
- A subject can have many instructors.
- A student has one instructor per subject.

Functional dependencies:

```text
(Student, Subject) --> Instructor
Instructor         --> Subject
```

Candidate keys: `(Student, Subject)` and `(Student, Instructor)`.

`Instructor → Subject` violates BCNF. Instructor alone is not a superkey, because many students share one instructor.

The table still passes 3NF, because `Subject` is a prime attribute. This is exactly the gap BCNF closes.

**Solution:** Decompose.

**Instructor_Subject**

| Instructor | Subject |
| ---------- | ------- |
| Amit       | Java    |
| Priya      | DBMS    |

**Student_Instructor**

| Student | Instructor |
| ------- | ---------- |
| Rahul   | Amit       |
| Rahul   | Priya      |
| Aman    | Amit       |

```text
Before:  Student_Subject_Instructor
                 |
          split on Instructor --> Subject
                 |
After:   Instructor_Subject     Student_Instructor
```

## SQL

```sql
CREATE TABLE Instructor_Subject (
    instructor VARCHAR(50) PRIMARY KEY,
    subject    VARCHAR(50)
);

CREATE TABLE Student_Instructor (
    student    VARCHAR(50),
    instructor VARCHAR(50),
    PRIMARY KEY (student, instructor),
    FOREIGN KEY (instructor) REFERENCES Instructor_Subject(instructor)
);
```

**Key point:** BCNF removes FD-based anomalies that can survive 3NF.

---

# 8. Normal Forms Comparison

| Normal Form | Main Rule                                    | Removes                    |
| ----------- | -------------------------------------------- | -------------------------- |
| 1NF         | Atomic values; no repeating groups           | Multi-valued cells         |
| 2NF         | 1NF + no partial dependency                  | Partial dependency         |
| 3NF         | 2NF + no transitive dependency               | Transitive dependency      |
| BCNF        | Every determinant is a superkey              | Remaining FD anomalies     |

```text
1NF --> 2NF --> 3NF --> BCNF
 |       |        |        |
atomic  no       no      every
values  partial  trans-  determinant
        dep.     itive   is a
                 dep.    superkey
```

Every BCNF relation is in 3NF. Not every 3NF relation is in BCNF.

---

# 9. Normalization in SQL

Normalization is a design concept. In practice you create separate tables and link them with foreign keys.

```sql
CREATE TABLE Department (
    dept_id   INT PRIMARY KEY,
    dept_name VARCHAR(50)
);

CREATE TABLE Student (
    student_id   INT PRIMARY KEY,
    student_name VARCHAR(50),
    dept_id      INT,
    FOREIGN KEY (dept_id) REFERENCES Department(dept_id)
);

INSERT INTO Department VALUES
(101, 'CSE'),
(102, 'ECE');

INSERT INTO Student VALUES
(1, 'Rahul', 101),
(2, 'Aman', 102),
(3, 'Priya', 101);
```

Department data is no longer repeated in every student row.

To see everything together, use a JOIN:

```sql
SELECT s.student_name, d.dept_name
FROM Student s
JOIN Department d
  ON s.dept_id = d.dept_id;
```

**Trade-off:** Normalization improves integrity but adds JOINs. Heavily read systems sometimes denormalize on purpose for speed.

---

# 10. Quick Revision Summary

| Topic              | One-line recall                                           |
| ------------------ | --------------------------------------------------------- |
| Normalization      | Organize tables to cut redundancy and anomalies           |
| Insertion anomaly  | Cannot add a fact without unrelated data                  |
| Update anomaly     | Repeated value changed in some rows only                  |
| Deletion anomaly   | Deleting one record loses unrelated facts                 |
| Composite key      | Two or more columns that together identify a row          |
| 1NF                | Atomic values                                             |
| 2NF                | No partial dependency                                     |
| 3NF                | No transitive dependency                                  |
| BCNF               | Every determinant is a superkey                           |
| BCNF vs 3NF        | BCNF is stricter                                          |

```text
Big messy table
      |
     1NF  (atomic cells)
      |
     2NF  (whole key decides everything)
      |
     3NF  (only the key decides, nothing indirect)
      |
    BCNF  (every determinant is a superkey)
```

---

# 11. Interview Questions

## Q1

What is database normalization?

**Answer:**

It is the process of organizing tables to reduce redundancy and prevent insertion, update and deletion anomalies.

---

## Q2

What are insertion, update and deletion anomalies?

**Answer:**

Insertion: cannot add a fact without unrelated data. Update: one change must be repeated in many rows. Deletion: removing a record loses unrelated information.

---

## Q3

What is 1NF? Give an example.

**Answer:**

Every column holds atomic values. A `Phone_Numbers` column holding "111, 222" violates it. Fix it with one phone number per row, in a separate table.

---

## Q4

What is a composite key?

**Answer:**

Two or more columns that together uniquely identify a row, such as `(Student_ID, Course_ID)`.

---

## Q5

What is a partial dependency, and what is 2NF?

**Answer:**

A partial dependency is a non-key attribute depending on only part of a composite key. 2NF is 1NF with no partial dependencies.

---

## Q6

What is a transitive dependency, and what is 3NF?

**Answer:**

A transitive dependency is `A → B → C`, where C depends on A only through B. 3NF is 2NF with no transitive dependencies.

---

## Q7

What is BCNF?

**Answer:**

A table is in BCNF if, for every non-trivial FD `X → Y`, X is a superkey.

---

## Q8

What is the difference between 3NF and BCNF?

**Answer:**

3NF allows `X → A` when A is a prime attribute. BCNF requires X to always be a superkey. So BCNF is stricter.

---

## Q9

Can a table be in 1NF but not 2NF?

**Answer:**

Yes. A table with a composite key and a partial dependency is in 1NF but violates 2NF.

---

## Q10

Can a table be in 3NF but not BCNF?

**Answer:**

Yes. It happens when `X → A` holds with A prime but X not a superkey.

---

## Q11

What is a functional dependency?

**Answer:**

`X → Y` means each value of X determines exactly one value of Y. For example, `Student_ID → Student_Name`.

---

## Q12

Does normalization always improve performance?

**Answer:**

No. It improves integrity and cuts redundancy, but more tables mean more JOINs. Read-heavy systems sometimes denormalize on purpose.

---
