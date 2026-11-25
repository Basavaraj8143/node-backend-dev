# Spring Boot — Professional Exception Handling

---

# Table of Contents

1. Professional API Responses
2. ResponseEntity
3. Custom Exceptions
4. Standardized Error DTO
5. Global Exception Handler
6. Handling Validation Errors
7. The Clean Controller & Service
8. Final Responses
9. Best Practices
10. Quick Revision Summary
11. Interview Questions

---

# 1. Professional API Responses

A professional API clearly communicates **what happened** through:

- Proper **HTTP status codes**
- Meaningful **headers**
- A structured **response body**

## Amateur vs Professional

```text
Amateur:       Everything returns 200 OK (even errors, with a raw string body)
Professional:  Correct status code + consistent JSON error body
```

## Status Code Families

| Range | Meaning | Examples |
|-------|---------|----------|
| **2xx** | Success | `200 OK`, `201 Created`, `204 No Content` |
| **4xx** | Client error (bad request) | `400`, `401`, `403`, `404`, `409` |
| **5xx** | Server error (our fault) | `500 Internal Server Error` |

## Codes Used in This Lesson

| Scenario | Code |
|----------|------|
| Student created | `201 Created` |
| Student not found | `404 Not Found` |
| Duplicate email | `409 Conflict` |
| Validation failed | `400 Bad Request` |
| Unexpected failure | `500 Internal Server Error` |

---

# 2. ResponseEntity

By default, returning an object from a controller always gives **200 OK**.

`ResponseEntity<T>` gives full control over:

- **Status code**
- **Headers**
- **Body**

```java
@GetMapping("/{id}")
public ResponseEntity<StudentResponseDTO> getStudent(@PathVariable Long id) {
    StudentResponseDTO student = service.getStudent(id);
    return ResponseEntity.ok(student);                          // 200
}

@PostMapping
public ResponseEntity<StudentResponseDTO> create(
        @Valid @RequestBody CreateStudentRequestDTO dto) {
    StudentResponseDTO created = service.createStudent(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);   // 201
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> delete(@PathVariable Long id) {
    service.deleteStudent(id);
    return ResponseEntity.noContent().build();                  // 204
}
```

## Common Builders

| Builder | Status |
|---------|--------|
| `ResponseEntity.ok(body)` | 200 |
| `ResponseEntity.status(HttpStatus.CREATED).body(body)` | 201 |
| `ResponseEntity.noContent().build()` | 204 |
| `ResponseEntity.badRequest().body(body)` | 400 |
| `ResponseEntity.notFound().build()` | 404 |

## Adding Headers

```java
return ResponseEntity.status(HttpStatus.CREATED)
        .header("Location", "/students/" + created.getId())
        .body(created);
```

---

# 3. Custom Exceptions

Instead of `if/else` and `try/catch` scattered through controllers, **throw meaningful exceptions** from the **service layer**.

## Create Custom Runtime Exceptions

```java
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

```java
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
```

Why `RuntimeException` (unchecked)?

- No `throws` clutter in every method
- Spring's `@Transactional` rolls back on runtime exceptions by default

## Throw Them in the Service

```java
@Service
public class StudentService {

    private final StudentRepository repository;

    public StudentService(StudentRepository repository) {
        this.repository = repository;
    }

    public StudentResponseDTO getStudent(Long id) {
        Student student = repository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException("Student not found with id: " + id));
        return mapToDto(student);
    }

    public StudentResponseDTO createStudent(CreateStudentRequestDTO dto) {
        if (repository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException(
                "Student already exists with email: " + dto.getEmail());
        }
        Student saved = repository.save(mapToEntity(dto));
        return mapToDto(saved);
    }

    public void deleteStudent(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Student not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
```

Repository:

```java
public interface StudentRepository extends JpaRepository<Student, Long> {
    boolean existsByEmail(String email);
}
```

The service only expresses **business rules**. It knows nothing about HTTP.

---

# 4. Standardized Error DTO

Replace raw string errors with a **consistent structure**.

```java
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ExceptionResponseDTO {

    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    private Map<String, String> validationErrors;   // only for validation failures

    public ExceptionResponseDTO(int status, String error,
                                String message, String path) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    // getters and setters
}
```

| Field | Purpose |
|-------|---------|
| `timestamp` | When the error occurred |
| `status` | HTTP status code (e.g., 404) |
| `error` | Status reason (e.g., "Not Found") |
| `message` | Human-readable explanation |
| `path` | Request URI that failed |
| `validationErrors` | Field → message map (validation only) |

`@JsonInclude(NON_NULL)` hides `validationErrors` when it's null.

---

# 5. Global Exception Handler

One class handles errors for **all controllers**.

```text
@RestControllerAdvice  = global handler for every @RestController
@ExceptionHandler      = which exception type this method handles
```

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ExceptionResponseDTO> handleNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {

        ExceptionResponseDTO body = new ExceptionResponseDTO(
            HttpStatus.NOT_FOUND.value(),
            HttpStatus.NOT_FOUND.getReasonPhrase(),
            ex.getMessage(),
            request.getRequestURI());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ExceptionResponseDTO> handleDuplicate(
            DuplicateResourceException ex, HttpServletRequest request) {

        ExceptionResponseDTO body = new ExceptionResponseDTO(
            HttpStatus.CONFLICT.value(),
            HttpStatus.CONFLICT.getReasonPhrase(),
            ex.getMessage(),
            request.getRequestURI());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    // Safety net: anything unexpected
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionResponseDTO> handleGeneric(
            Exception ex, HttpServletRequest request) {

        // log the real error internally; don't leak details to the client
        ExceptionResponseDTO body = new ExceptionResponseDTO(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
            "Something went wrong. Please try again later.",
            request.getRequestURI());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
```

## Flow

```text
Controller → Service throws ResourceNotFoundException
        ↓
Spring catches it
        ↓
GlobalExceptionHandler.handleNotFound()
        ↓
Builds ExceptionResponseDTO + 404
        ↓
Client receives structured JSON
```

Spring picks the **most specific** matching handler, so `Exception.class` only catches what nothing else handles.

---

# 6. Handling Validation Errors

When `@Valid` fails on a `@RequestBody`, Spring throws `MethodArgumentNotValidException`.

Add a handler that maps **every field error** into a clean map:

```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ExceptionResponseDTO> handleValidation(
        MethodArgumentNotValidException ex, HttpServletRequest request) {

    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult().getFieldErrors().forEach(fieldError ->
        errors.put(fieldError.getField(), fieldError.getDefaultMessage()));

    ExceptionResponseDTO body = new ExceptionResponseDTO(
        HttpStatus.BAD_REQUEST.value(),
        HttpStatus.BAD_REQUEST.getReasonPhrase(),
        "Validation failed",
        request.getRequestURI());
    body.setValidationErrors(errors);

    return ResponseEntity.badRequest().body(body);
}
```

The DTO constraints (from the DTO & validation lesson):

```java
public class CreateStudentRequestDTO {

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Email must be valid")
    private String email;

    @Min(value = 18, message = "Age must be at least 18")
    private int age;
}
```

---

# 7. The Clean Controller & Service

All error handling now lives in **one place**.

## Before (Messy)

```java
@GetMapping("/{id}")
public ResponseEntity<?> getStudent(@PathVariable Long id) {
    try {
        Student s = repository.findById(id).orElse(null);
        if (s == null) {
            return ResponseEntity.status(404).body("Not found");   // raw string
        }
        return ResponseEntity.ok(s);                               // exposes entity
    } catch (Exception e) {
        return ResponseEntity.status(500).body("Error");
    }
}
```

## After (Clean)

```java
@RestController
@RequestMapping("/students")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponseDTO> getStudent(@PathVariable Long id) {
        return ResponseEntity.ok(service.getStudent(id));
    }

    @PostMapping
    public ResponseEntity<StudentResponseDTO> create(
            @Valid @RequestBody CreateStudentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                             .body(service.createStudent(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
```

```text
Controller → HTTP in/out only
Service    → business rules + throws exceptions
Handler    → turns exceptions into responses
```

---

# 8. Final Responses

## 404 Not Found

`GET /students/99`

```json
{
  "timestamp": "2026-01-15T10:30:45",
  "status": 404,
  "error": "Not Found",
  "message": "Student not found with id: 99",
  "path": "/students/99"
}
```

## 409 Conflict

`POST /students` with an existing email

```json
{
  "timestamp": "2026-01-15T10:31:10",
  "status": 409,
  "error": "Conflict",
  "message": "Student already exists with email: john@example.com",
  "path": "/students"
}
```

## 400 Bad Request (Validation)

`POST /students` with `age: 15` and a bad email

```json
{
  "timestamp": "2026-01-15T10:32:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/students",
  "validationErrors": {
    "age": "Age must be at least 18",
    "email": "Email must be valid"
  }
}
```

## 201 Created

`POST /students` with valid data → `201` and the `StudentResponseDTO` body.

---

# 9. Best Practices

- Use **correct status codes**, never 200 for everything
- Return **one consistent error structure** for the whole API
- Throw **business exceptions from the service**, handle them in **one global handler**
- **Never leak** stack traces, SQL errors, or internal details to clients
- **Log** the real exception server-side in the generic handler
- Keep **controllers thin** (no try/catch)
- Use **409** for duplicates/conflicts, **404** for missing resources, **400** for invalid input
- Handle other common exceptions too:

| Exception | Status |
|-----------|--------|
| `HttpMessageNotReadableException` (malformed JSON) | 400 |
| `MethodArgumentTypeMismatchException` (e.g., `/students/abc`) | 400 |
| `HttpRequestMethodNotSupportedException` | 405 |
| `AccessDeniedException` | 403 |

- Spring 6 / Boot 3 also offers `ProblemDetail` (RFC 7807) as a built-in standard error format

---

# 10. Quick Revision Summary

```text
ResponseEntity          → control status, headers, body
Custom exceptions       → ResourceNotFoundException (404), DuplicateResourceException (409)
ExceptionResponseDTO    → consistent error JSON
@RestControllerAdvice   → global handler class
@ExceptionHandler       → maps an exception type to a response
MethodArgumentNotValidException → validation failure → 400 with field map
```

| Layer | Responsibility |
|-------|---------------|
| Controller | Receive request, return `ResponseEntity` |
| Service | Business logic, throw custom exceptions |
| `GlobalExceptionHandler` | Convert exceptions to HTTP responses |

---

# 11. Interview Questions

## Q1

Why shouldn't an API return 200 OK for everything?

**Answer:**

Clients rely on status codes to know whether a request succeeded or failed and why. Returning 200 for errors hides failures and breaks standard HTTP handling and tooling.

---

## Q2

What is `ResponseEntity`?

**Answer:**

A Spring class representing the full HTTP response: status code, headers, and body. It lets you override the default 200 OK behavior.

---

## Q3

What is `@RestControllerAdvice`?

**Answer:**

A class-level annotation that makes a class a global handler for all REST controllers, combining `@ControllerAdvice` and `@ResponseBody`. It centralizes exception handling.

---

## Q4

What does `@ExceptionHandler` do?

**Answer:**

It marks a method that handles a specific exception type thrown from controllers (or services called by them), returning a custom response.

---

## Q5

Why create custom exceptions like `ResourceNotFoundException`?

**Answer:**

They express business-rule violations clearly, let the service layer signal problems without knowing about HTTP, and map cleanly to specific status codes in the global handler.

---

## Q6

Why extend `RuntimeException` for custom exceptions?

**Answer:**

Unchecked exceptions avoid `throws` clutter and don't force every caller to handle them. Spring's `@Transactional` also rolls back on runtime exceptions by default.

---

## Q7

Which status code for a duplicate email, and why?

**Answer:**

`409 Conflict`. The request is valid but conflicts with the current state of the server (a resource with that email already exists).

---

## Q8

How do you handle `@Valid` failures globally?

**Answer:**

Add an `@ExceptionHandler(MethodArgumentNotValidException.class)` method that collects `getBindingResult().getFieldErrors()` into a map and returns it with a 400 status.

---

## Q9

Why create a standardized `ExceptionResponseDTO`?

**Answer:**

It gives every error the same structure (timestamp, status, error, message, path), so clients can parse errors predictably instead of dealing with raw strings.

---

## Q10

What happens if two handlers match an exception?

**Answer:**

Spring chooses the most specific one. A handler for `ResourceNotFoundException` wins over one for `Exception`.

---

## Q11

Why should the generic `Exception` handler hide the real message?

**Answer:**

Internal messages, stack traces, and SQL details can reveal system internals to attackers. Log them server-side and return a generic message to the client.

---

## Q12

Where should exceptions be thrown, and where handled?

**Answer:**

Thrown in the service layer where business rules are checked. Handled in one place, the global `@RestControllerAdvice`, keeping controllers free of try/catch.

---

## Q13

What is `ProblemDetail`?

**Answer:**

A Spring 6 class implementing RFC 7807 "Problem Details for HTTP APIs", a standard JSON error format that can replace a hand-written error DTO.
