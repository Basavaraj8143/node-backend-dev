# Spring Boot — DTOs & Validation

---

# Table of Contents

1. Why DTOs?
2. Implementing DTOs
3. Mapping Between Layers
4. Applying Validations
5. Validation Annotations
6. Default Error Response
7. Best Practices
8. Quick Revision Summary
9. Interview Questions

---

# 1. Why DTOs?

**DTO (Data Transfer Object)** = an object used to carry data between layers, especially between the client and the controller.

## Problem: Exposing Entities Directly

```java
@PostMapping("/students")
public Student create(@RequestBody Student student) { ... }   // Entity exposed
```

| Problem | Explanation |
|---------|-------------|
| **Security risk** | Internal fields (`deleted`, metadata, audit info) leak to clients, and clients can set fields they shouldn't |
| **Tight coupling** | Any change to the table structure breaks the API contract with front-end clients |
| **Too many responsibilities** | Entity should only handle DB mapping, not JSON serialization or API shape |

## Solution

```text
Client ⇄ DTO ⇄ Controller ⇄ Service ⇄ Entity ⇄ Database
```

The API contract (DTOs) is **decoupled** from the database structure (Entities).

---

# 2. Implementing DTOs

## The Entity (Internal Only)

```java
@Entity
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private int age;
    private boolean deleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // getters and setters
}
```

---

## Request DTOs (Incoming Data)

Separate DTOs per operation control exactly what the client may send.

```java
public class CreateStudentRequestDTO {

    private String name;
    private String email;
    private int age;

    // getters and setters
}

public class UpdateStudentRequestDTO {

    private String name;       // email cannot be changed
    private int age;

    // getters and setters
}
```

---

## Response DTO (Outgoing Data)

Only fields the client should see.

```java
public class StudentResponseDTO {

    private Long id;
    private String name;
    private String email;
    private int age;

    // getters and setters
}
```

Hidden from clients: `deleted`, `createdAt`, `updatedAt`.

---

## Why Separate Create and Update DTOs?

| DTO | Fields | Reason |
|-----|--------|--------|
| `CreateStudentRequestDTO` | name, email, age | All required to create |
| `UpdateStudentRequestDTO` | name, age | Email is immutable after creation |
| `StudentResponseDTO` | id, name, email, age | Safe to expose |

---

# 3. Mapping Between Layers

Convert between DTOs and Entities.

```java
@Service
public class StudentService {

    private final StudentRepository repository;

    public StudentService(StudentRepository repository) {
        this.repository = repository;
    }

    public StudentResponseDTO createStudent(CreateStudentRequestDTO dto) {
        Student student = mapToEntity(dto);
        Student saved = repository.save(student);
        return mapToDto(saved);
    }

    public StudentResponseDTO updateStudent(Long id, UpdateStudentRequestDTO dto) {
        Student student = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setName(dto.getName());
        student.setAge(dto.getAge());
        student.setUpdatedAt(LocalDateTime.now());

        return mapToDto(repository.save(student));
    }

    // DTO → Entity
    private Student mapToEntity(CreateStudentRequestDTO dto) {
        Student student = new Student();
        student.setName(dto.getName());
        student.setEmail(dto.getEmail());
        student.setAge(dto.getAge());
        student.setDeleted(false);
        student.setCreatedAt(LocalDateTime.now());
        student.setUpdatedAt(LocalDateTime.now());
        return student;
    }

    // Entity → DTO
    private StudentResponseDTO mapToDto(Student student) {
        StudentResponseDTO dto = new StudentResponseDTO();
        dto.setId(student.getId());
        dto.setName(student.getName());
        dto.setEmail(student.getEmail());
        dto.setAge(student.getAge());
        return dto;
    }
}
```

## Key Points

- `createdAt` / `updatedAt` are set **server-side** with `LocalDateTime.now()`, never trusted from the client
- The Entity never leaves the service layer
- For many DTOs, use a mapping library like **MapStruct** or **ModelMapper** instead of hand-written code

## Controller

```java
@RestController
@RequestMapping("/students")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<StudentResponseDTO> create(
            @RequestBody CreateStudentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(service.createStudent(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponseDTO> update(
            @PathVariable Long id,
            @RequestBody UpdateStudentRequestDTO dto) {
        return ResponseEntity.ok(service.updateStudent(id, dto));
    }
}
```

## Flow

```text
Client JSON
     ↓
CreateStudentRequestDTO
     ↓
Controller → Service → mapToEntity()
     ↓
Repository saves Entity
     ↓
mapToDto() → StudentResponseDTO
     ↓
Client JSON
```

---

# 4. Applying Validations

Even with DTOs, **validate client input** before it reaches the service layer.

```text
Goal: Stop bad data at the controller level
      Protect business logic from invalid requests
```

## Step 1: Add Dependency

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

## Step 2: Annotate the DTO

```java
import jakarta.validation.constraints.*;

public class CreateStudentRequestDTO {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be 2 to 50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @Min(value = 18, message = "Age must be at least 18")
    private int age;

    // getters and setters
}
```

## Step 3: Trigger Validation with `@Valid`

```java
@PostMapping
public ResponseEntity<StudentResponseDTO> create(
        @Valid @RequestBody CreateStudentRequestDTO dto) {
    return ResponseEntity.status(HttpStatus.CREATED)
                         .body(service.createStudent(dto));
}
```

Without `@Valid`, the annotations on the DTO are **ignored**.

## Flow

```text
Request arrives
     ↓
JSON → CreateStudentRequestDTO
     ↓
@Valid triggers constraint checks
     ↓
Valid?  Yes → controller method runs → service
        No  → MethodArgumentNotValidException → 400 Bad Request
```

---

# 5. Validation Annotations

| Annotation | Purpose | Example |
|-----------|---------|---------|
| `@NotBlank` | Not null, not empty, not just whitespace (Strings) | `@NotBlank String name` |
| `@NotNull` | Not null | `@NotNull Integer age` |
| `@NotEmpty` | Not null and not empty (Strings, collections) | `@NotEmpty List<String> tags` |
| `@Min` / `@Max` | Numeric minimum / maximum | `@Min(18) int age` |
| `@Size` | Length / size limits | `@Size(min = 2, max = 50)` |
| `@Email` | Valid email structure | `@Email String email` |
| `@Pattern` | Must match a regex | `@Pattern(regexp = "^[0-9]{10}$")` |
| `@Positive` | Greater than zero | `@Positive double price` |
| `@Past` / `@Future` | Date must be in the past / future | `@Past LocalDate dob` |

## @NotBlank vs @NotNull vs @NotEmpty

| Input | `@NotNull` | `@NotEmpty` | `@NotBlank` |
|-------|-----------|-------------|-------------|
| `null` | ✗ | ✗ | ✗ |
| `""` | ✓ | ✗ | ✗ |
| `"   "` | ✓ | ✓ | ✗ |
| `"John"` | ✓ | ✓ | ✓ |

---

# 6. Default Error Response

When validation fails, Spring returns **400 Bad Request**, but the default response body is generic and not user-friendly.

```json
{
  "timestamp": "2026-01-01T10:00:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "path": "/students"
}
```

The field-level messages (e.g., "Age must be at least 18") don't appear clearly.

## Next Step: Global Exception Handling

A `@RestControllerAdvice` with `@ExceptionHandler(MethodArgumentNotValidException.class)` can return structured errors:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
            .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));

        return ResponseEntity.badRequest().body(errors);
    }
}
```

Response:

```json
{
  "age": "Age must be at least 18",
  "email": "Email must be valid"
}
```

---

# 7. Best Practices

- **Never expose Entities** in controllers
- Use **separate DTOs** for create, update, and response
- Set audit fields (`createdAt`, `updatedAt`) **server-side**
- Validate at the **controller boundary** with `@Valid`
- Provide **clear validation messages**
- Use **MapStruct** for mapping in larger projects
- Consider Java **records** for immutable DTOs:

```java
public record StudentResponseDTO(Long id, String name, String email, int age) { }
```

---

# 8. Quick Revision Summary

```text
Entity  →  database mapping only, never exposed
DTO     →  API contract (Request DTO in, Response DTO out)
Mapping →  mapToEntity() / mapToDto() in the service layer
@Valid  →  triggers validation annotations on the DTO
Failure →  400 Bad Request (MethodArgumentNotValidException)
```

---

# 9. Interview Questions

## Q1

What is a DTO?

**Answer:**

A Data Transfer Object carries data between layers (especially client and controller). It defines the API contract separately from the database entity.

---

## Q2

Why shouldn't you expose Entities directly in a REST API?

**Answer:**

It leaks internal fields (security risk), tightly couples the API to the database structure, and overloads entities with serialization concerns.

---

## Q3

Why use separate Create and Update DTOs?

**Answer:**

They control exactly which fields a client may provide for each operation. For example, email can be set on create but not changed on update.

---

## Q4

Why set `createdAt` and `updatedAt` on the server?

**Answer:**

Clients can't be trusted to supply audit data. Setting it server-side (e.g., `LocalDateTime.now()`) guarantees accuracy and security.

---

## Q5

Which dependency enables validation in Spring Boot?

**Answer:**

`spring-boot-starter-validation`, which brings in Jakarta Bean Validation (Hibernate Validator).

---

## Q6

What does `@Valid` do?

**Answer:**

It triggers validation of the annotated object against its constraint annotations. Without it, annotations like `@NotBlank` and `@Min` are ignored.

---

## Q7

Difference between `@NotNull`, `@NotEmpty`, and `@NotBlank`?

**Answer:**

`@NotNull` rejects only null. `@NotEmpty` rejects null and empty. `@NotBlank` rejects null, empty, and whitespace-only strings.

---

## Q8

What exception is thrown when `@Valid` fails on a `@RequestBody`?

**Answer:**

`MethodArgumentNotValidException`, which results in a 400 Bad Request by default.

---

## Q9

How do you return user-friendly validation errors?

**Answer:**

Use a `@RestControllerAdvice` with an `@ExceptionHandler` for `MethodArgumentNotValidException`, extracting field errors from the `BindingResult` into a structured response.

---

## Q10

Where should validation happen: controller or service?

**Answer:**

Input validation belongs at the controller boundary (DTO + `@Valid`) so bad data never reaches the service. Business-rule validation (e.g., "email already exists") belongs in the service.

---

## Q11

How do you map between DTOs and Entities?

**Answer:**

Manually with `mapToEntity()` / `mapToDto()` methods in the service layer, or with libraries like MapStruct or ModelMapper for larger projects.

---

## Q12

Can you use Java records as DTOs?

**Answer:**

Yes (Java 16+). Records are immutable, concise, and work well for response DTOs. Validation annotations can be applied to record components.
