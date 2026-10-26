# Spring Web MVC Architecture — Deep Dive

---

# Table of Contents

1. Historical Paradigm Shift — Servlets to Front Controller
2. DispatcherServlet — The Heart of Spring MVC
3. Core Strategy Beans
4. Request Routing — HandlerMapping
5. HandlerInterceptor — Cross-Cutting Concerns
6. HandlerAdapter — Bridging the Gap
7. Argument Resolution & Data Binding
8. Response Generation — The Architectural Fork
9. View Resolution (Server-Side Rendering)
10. HttpMessageConverter (REST APIs)
11. Exception Handling Architecture
12. Complete Request Lifecycle Flow
13. Interview Questions

---

# 1. Historical Paradigm Shift — Servlets to Front Controller

## Traditional Servlet Model

Each URL mapped to a separate servlet in `web.xml`.

Each servlet handled everything itself:

```text
Servlet A → /login
Servlet B → /users
Servlet C → /orders
```

Every servlet independently handled:

- Parameter extraction
- Type conversion
- Business logic
- Exception handling
- Response generation

Result:

```text
Massive code duplication
No shared infrastructure
Tightly coupled request logic
```

---

## Spring Boot Revolution

Two key changes:

### 1. Embedded Server

```text
Old: Deploy WAR → External Tomcat
New: Tomcat embedded → Run as standalone JAR
```

### 2. Front Controller Pattern

```text
Old: Dozens of independent servlets
New: ONE DispatcherServlet handles ALL requests
```

---

## Front Controller Pattern

```text
All HTTP Requests
        ↓
  DispatcherServlet (single entry point)
        ↓
  Routes to correct handler
```

---

# 2. DispatcherServlet — The Heart of Spring MVC

## What It Is

A single servlet that acts as the **ultimate orchestrator** for the entire web tier.

Inherits from `HttpServlet`.

Registered automatically via Spring Boot's auto-configuration when `spring-boot-starter-web` is on the classpath.

Mapped to root URL pattern `/` — catches all incoming traffic.

---

## What It Does NOT Do

It does **not** execute business logic.

Its only job is **orchestration** — delegating to specialized beans.

---

## Design Pattern Used

**Strategy Pattern** — DispatcherServlet programs against interfaces, not concrete implementations.

This allows swapping routing mechanisms, argument resolvers, and view renderers without touching the servlet.

---

# 3. Core Strategy Beans

| Bean Type | Responsibility |
|-----------|---------------|
| `HandlerMapping` | Maps incoming requests to the correct handler + interceptor chain |
| `HandlerAdapter` | Invokes the handler, shielding DispatcherServlet from controller details |
| `HandlerExceptionResolver` | Catches exceptions and maps them to HTTP status codes or error views |
| `ViewResolver` | Translates logical view names into physical template files |
| `MultipartResolver` | Parses multipart requests for file uploads |

All implement the **Strategy pattern** — each is an interface with swappable implementations.

---

# 4. Request Routing — HandlerMapping

## What Happens

When a request arrives, `DispatcherServlet` iterates through all registered `HandlerMapping` beans.

Each `HandlerMapping` checks:

- URI
- HTTP method (GET, POST, PUT, DELETE)
- Query parameters
- Headers (`Produces`, `Consumes`)

---

## Annotation Mapping

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.save(user);
    }
}
```

`RequestMappingHandlerMapping` scans for these annotations and builds an internal registry.

---

## HandlerExecutionChain

`HandlerMapping` doesn't just return the controller method.

It returns a **`HandlerExecutionChain`**:

```text
HandlerExecutionChain
      ↓
Target handler method
      +
List of interceptors (pre + post processing)
```

---

# 5. HandlerInterceptor — Cross-Cutting Concerns

## What It Is

Interceptors run **inside the Spring context** — unlike Servlet Filters which run at container level.

Because they're inside Spring, they have access to the handler, method signature, and IoC container.

---

## Use Cases

- Authentication checks
- Authorization checks
- Request logging
- Performance monitoring
- Request validation

---

## Three Lifecycle Hooks

| Method | When It Runs | Behavior |
|--------|-------------|----------|
| `preHandle` | After HandlerMapping, before handler executes | Returns `boolean` — `false` aborts the chain (e.g., 401 Unauthorized) |
| `postHandle` | After handler executes, before view renders | Can augment `ModelAndView`, add global attributes |
| `afterCompletion` | After entire request cycle, including view render | Resource cleanup, metrics — runs regardless of success or exception |

---

## Multiple Interceptors

```text
preHandle:  A → B → C   (sequential)
            ↓
        Handler executes
            ↓
postHandle: C → B → A   (reverse)
afterCompletion: C → B → A (reverse)
```

Symmetric wrapping — like nested layers of an onion.

---

## Example

```java
@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        String token = request.getHeader("Authorization");

        if (token == null || !isValid(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;  // abort chain
        }

        return true;  // proceed
    }
}
```

---

# 6. HandlerAdapter — Bridging the Gap

## The Problem

Spring MVC supports multiple controller types:

- `@Controller` / `@RestController` (modern)
- `HttpRequestHandler` (legacy)
- `Controller` interface (legacy)

`DispatcherServlet` can't hardcode invocation logic for all types — violates OCP.

---

## The Solution: Adapter Pattern

`HandlerAdapter` bridges the gap between the generic `DispatcherServlet` and the specific controller type.

```text
DispatcherServlet
        ↓
HandlerAdapter (picks the right one)
        ↓
Controller Method (via Java reflection)
```

For annotation-driven controllers, `RequestMappingHandlerAdapter` is used.

---

# 7. Argument Resolution & Data Binding

## The Problem

Controller methods don't accept raw `HttpServletRequest`.

They declare strongly-typed parameters:

```java
public User getUser(@PathVariable Long id,
                    @RequestHeader String authorization) { }
```

Someone must extract `"42"` from `/users/42` and convert it to `Long id`.

---

## HandlerMethodArgumentResolver

The resolver that handles this. Two key methods:

```java
// Can this resolver handle this parameter?
boolean supportsParameter(MethodParameter parameter);

// Extract and convert the value
Object resolveArgument(...);
```

---

## Resolver Table

| Annotation | Resolver | What It Does |
|------------|----------|-------------|
| `@PathVariable` | `PathVariableMethodArgumentResolver` | Extracts URI template segments (e.g., `/users/42` → `42`) and converts to `Long` |
| `@RequestParam` | `RequestParamMethodArgumentResolver` | Pulls from query string (`?page=2`) |
| `@RequestBody` | `RequestResponseBodyMethodProcessor` | Deserializes JSON body into Java object via `HttpMessageConverter` |
| `@RequestHeader` | `RequestHeaderMethodArgumentResolver` | Extracts specific HTTP headers |
| `@ModelAttribute` | `ModelAttributeMethodProcessor` | Binds form fields to a backing object |

---

## Example Flow for `@PathVariable`

```java
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) { ... }
```

```text
Request: GET /users/42
      ↓
PathVariableMethodArgumentResolver.supportsParameter() → true
      ↓
Extracts "42" from URI
      ↓
Converts String "42" → Long 42
      ↓
Injects into method parameter
```

---

## Custom Argument Resolvers

Teams can register custom resolvers via `WebMvcConfigurer`:

```java
@Configuration
public class MvcConfig implements WebMvcConfigurer {

    @Override
    public void addArgumentResolvers(
            List<HandlerMethodArgumentResolver> resolvers) {

        resolvers.add(new CurrentUserArgumentResolver());
    }
}
```

---

# 8. Response Generation — The Architectural Fork

After the controller executes, Spring faces a critical decision:

```text
Controller returns a value
          ↓
Is @ResponseBody / @RestController present?
     ↙                      ↘
   NO                       YES
   ↓                         ↓
View Resolution         HttpMessageConverter
(HTML template)         (JSON/XML serialization)
```

---

# 9. View Resolution (Server-Side Rendering)

## When Used

Controller returns a `String` (logical view name) **without** `@ResponseBody`.

```java
@Controller
public class HomeController {

    @GetMapping("/home")
    public String home(Model model) {
        model.addAttribute("username", "John");
        return "home";  // logical view name
    }
}
```

---

## ViewResolver

Translates `"home"` → physical template file.

`InternalResourceViewResolver` example:

```text
prefix = /WEB-INF/views/
suffix = .jsp

"home" → /WEB-INF/views/home.jsp
```

Config:

```java
@Bean
public InternalResourceViewResolver viewResolver() {
    InternalResourceViewResolver resolver =
        new InternalResourceViewResolver();
    resolver.setPrefix("/WEB-INF/views/");
    resolver.setSuffix(".jsp");
    return resolver;
}
```

---

## Benefit

Controllers are **agnostic to presentation technology**.

Migrate from JSP to Thymeleaf — zero controller changes, only update ViewResolver config.

---

# 10. HttpMessageConverter (REST APIs)

## When Used

Controller is annotated with `@RestController` (= `@Controller` + `@ResponseBody`).

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);  // returns Java object directly
    }
}
```

---

## What Happens

View resolution is **bypassed entirely**.

The returned `User` object is serialized directly to the response body.

---

## HttpMessageConverter Selection

`RequestResponseBodyMethodProcessor` checks:

1. Java type of the returned object
2. Client's `Accept` header (`application/json`, `application/xml`)

Then iterates converters calling `canWrite()`.

---

## Jackson (JSON)

When `jackson-databind` is on the classpath, Spring Boot auto-registers:

```text
MappingJackson2HttpMessageConverter
```

Converts Java object → JSON via reflection:

```java
User { id: 1, name: "John" }
      ↓
{"id":1,"name":"John"}
      ↓
Written directly to HTTP response stream
```

---

## Flow

```text
@RestController method returns User object
          ↓
RequestResponseBodyMethodProcessor
          ↓
Checks Accept header → application/json
          ↓
MappingJackson2HttpMessageConverter.canWrite() → true
          ↓
Serialize User → JSON
          ↓
Write to HttpServletResponse body
          ↓
Client receives JSON
```

---

# 11. Exception Handling Architecture

## The Problem

Unhandled exceptions in raw servlets:

```text
Exception bubbles up to Tomcat
      ↓
Ugly stack trace page shown to user
      ↓
Internal details leaked
```

---

## Spring's Solution

`DispatcherServlet` catches all exceptions and delegates to `HandlerExceptionResolver` chain.

---

## Resolver Chain

| Resolver | How It Works |
|----------|-------------|
| `ExceptionHandlerExceptionResolver` | Looks for `@ExceptionHandler` methods in `@RestControllerAdvice` classes |
| `ResponseStatusExceptionResolver` | Handles exceptions annotated with `@ResponseStatus` |
| `SimpleMappingExceptionResolver` | Maps exception types to error view names (server-side render) |
| `DefaultHandlerExceptionResolver` | Handles Spring's own internal exceptions (e.g., 405 Method Not Allowed) |

---

## Global Exception Handler Example

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            EntityNotFoundException ex) {

        ErrorResponse error = new ErrorResponse(
            "NOT_FOUND",
            ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        ErrorResponse error = new ErrorResponse(
            "INTERNAL_ERROR",
            "Something went wrong"
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                             .body(error);
    }
}
```

All exceptions across all controllers are caught in one place.

---

## @ResponseStatus Example

```java
@ResponseStatus(HttpStatus.NOT_FOUND)
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(Long id) {
        super("User not found: " + id);
    }
}
```

Throw it anywhere — Spring auto-converts to `404 Not Found`.

---

# 12. Complete Request Lifecycle Flow

```text
Client sends HTTP request
          ↓
Embedded Tomcat receives it
          ↓
DispatcherServlet.doDispatch()
          ↓
HandlerMapping → finds HandlerExecutionChain
          ↓
preHandle() interceptors (sequential)
          ↓  (if any returns false → abort → 401/403)
HandlerAdapter selected
          ↓
HandlerMethodArgumentResolver resolves parameters
          ↓
Controller method invoked (via reflection)
          ↓
Business logic executes
          ↓
Controller returns value
          ↓
@ResponseBody present?
    ↙               ↘
   NO               YES
   ↓                 ↓
ViewResolver    HttpMessageConverter
   ↓                 ↓
Render template  Serialize to JSON/XML
          ↓
postHandle() interceptors (reverse order)
          ↓
Response committed to client
          ↓
afterCompletion() interceptors (reverse order)
          ↓
Resource cleanup (DB connections, thread locals)
```

If exception at any point:

```text
DispatcherServlet catches exception
          ↓
HandlerExceptionResolver chain
          ↓
@RestControllerAdvice @ExceptionHandler
          ↓
Structured error response to client
          ↓
afterCompletion() still runs
```

---

# 13. Interview Questions

## Q1

What is the Front Controller pattern and how does Spring implement it?

**Answer:**

The Front Controller pattern centralizes all HTTP request processing through a single entry point. Spring implements it via `DispatcherServlet`, which receives all requests and delegates to specialized components for routing, execution, and response generation.

---

## Q2

What is the role of `DispatcherServlet`?

**Answer:**

It is the orchestrator of the Spring MVC request lifecycle. It doesn't execute business logic — it delegates to `HandlerMapping`, `HandlerAdapter`, `ViewResolver`, and `HandlerExceptionResolver` via the Strategy pattern.

---

## Q3

What is `HandlerMapping` and what does it return?

**Answer:**

It maps incoming HTTP requests (URI + method + headers) to the correct handler. It returns a `HandlerExecutionChain` — the target handler method plus a list of interceptors to run before and after it.

---

## Q4

What is the difference between `HandlerInterceptor` and a Servlet Filter?

**Answer:**

Servlet Filters run at the container level before reaching Spring. `HandlerInterceptor` runs inside the Spring context with access to the handler, method signature, and IoC container — making it suitable for authentication, authorization, and logging.

---

## Q5

What are the three `HandlerInterceptor` methods and when do they run?

**Answer:**

`preHandle` — before handler executes (returns false to abort). `postHandle` — after handler, before view renders. `afterCompletion` — after entire cycle, always runs for resource cleanup.

---

## Q6

What is `HandlerAdapter` and why is it needed?

**Answer:**

Spring MVC supports multiple controller types. `HandlerAdapter` acts as a bridge (Adapter pattern) between the generic `DispatcherServlet` and the specific invocation mechanism of each controller type. For `@Controller` classes, `RequestMappingHandlerAdapter` is used.

---

## Q7

How does `@PathVariable` work internally?

**Answer:**

`PathVariableMethodArgumentResolver.supportsParameter()` returns true for `@PathVariable` parameters. It then extracts the URI template segment as a string and converts it to the target type (e.g., `Long`) via Spring's type conversion system.

---

## Q8

What is the difference between `@Controller` and `@RestController`?

**Answer:**

`@RestController` is a meta-annotation combining `@Controller` and `@ResponseBody`. With `@Controller`, the return value is treated as a view name for server-side rendering. With `@RestController`, the return value is serialized directly to the response body — bypassing `ViewResolver`.

---

## Q9

How does Spring select the right `HttpMessageConverter`?

**Answer:**

`RequestResponseBodyMethodProcessor` checks the returned Java type and the client's `Accept` header, then iterates registered converters calling `canWrite()`. If the client requests `application/json` and Jackson is present, `MappingJackson2HttpMessageConverter` handles serialization.

---

## Q10

What is `@RestControllerAdvice` and why is it useful?

**Answer:**

A global exception handling component. Methods annotated with `@ExceptionHandler` inside it catch exceptions thrown from any controller in the application, ensuring all errors return a consistent, structured JSON response instead of raw stack traces.

---

## Q11

What is `WebDataBinder` and when is it used?

**Answer:**

It handles type conversion and validation during argument resolution — converting strings to booleans, integers, dates, etc. It also applies `@Valid` / `@Validated` constraints when binding `@ModelAttribute` or `@RequestBody` parameters.

---

## Q12

What happens in `afterCompletion` and why does it matter?

**Answer:**

`afterCompletion` runs unconditionally after the entire request cycle, regardless of success or exception. It is used to release database connections, clear thread-local variables (like MDC logging context), and finalize performance metrics — preventing memory leaks.