# Spring Boot — JWT Authentication (Stateless)

---

# Table of Contents

1. Stateful vs Stateless Authentication
2. JWT Internals
3. Dependencies & Configuration
4. Security Filter Chain
5. Login Flow
6. JWT Service (Token Generation)
7. Verification
8. Security Best Practices
9. Quick Revision Summary
10. Interview Questions

---

# 1. Stateful vs Stateless Authentication

## Stateful (Session-Based)

The server stores authentication state in an **HTTP session**, identified by `JSESSIONID`.

```text
Login → server creates session → stores in memory
      → sends JSESSIONID cookie
Next request → cookie → server looks up session
```

## The Problem in Distributed Systems

```text
Request 1 → Server A  (session created here)
Request 2 → Server B  (no session → authentication fails ❌)
```

Fix: a **central session store** (e.g., Redis) shared by all replicas. This adds infrastructure and a network hop.

## Stateless (JWT)

The **client holds the token**. The server only validates it. No session storage.

```text
Login → server generates JWT → returns to client
Next request → Authorization: Bearer <JWT>
             → ANY server validates the signature → authenticated ✓
```

| | Stateful (Session) | Stateless (JWT) |
|--|--------------------|----------------|
| State stored | On server | In the token (client) |
| Scaling replicas | Needs shared session store | Works out of the box |
| Logout / revoke | Easy (delete session) | Hard (token valid until expiry) |
| Best for | Traditional web apps | REST APIs, microservices, mobile |

---

# 2. JWT Internals

A JWT has **three parts**, Base64URL-encoded and separated by dots:

```text
Header.Payload.Signature
xxxxx.yyyyy.zzzzz
```

## Header

Metadata: signing algorithm and token type.

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

## Payload (Claims)

```json
{
  "sub": "john@example.com",
  "iss": "my-app",
  "iat": 1735689600,
  "exp": 1735693200,
  "roles": ["ROLE_USER"]
}
```

| Claim | Meaning |
|-------|---------|
| `sub` | Subject (user identity) |
| `iss` | Issuer |
| `iat` | Issued at |
| `exp` | Expiry time |
| `roles` | Custom claim: user authorities |

## Signature

```text
HMACSHA256( base64(header) + "." + base64(payload), secretKey )
```

Ensures **integrity**. If the header or payload is modified, signature validation fails and the server rejects the token.

> The payload is only **encoded, not encrypted**. Anyone can read it. Never put passwords or sensitive data in a JWT.

---

# 3. Dependencies & Configuration

## Dependencies

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

The resource-server starter provides JWT encoding/decoding (Nimbus) and bearer-token validation.

## application.properties

```properties
# Base64-encoded secret, at least 256 bits for HS256
jwt.secret=YOUR_BASE64_ENCODED_256_BIT_SECRET
jwt.expiration-minutes=30
```

Keep the secret in an **environment variable or secrets manager**, never in Git.

## Beans: SecretKey, JwtEncoder, JwtDecoder

```java
@Configuration
public class JwtConfig {

    @Value("${jwt.secret}")
    private String secretString;

    @Bean
    public SecretKey jwtSecretKey() {
        byte[] decodedKey = Base64.getDecoder().decode(secretString);
        return new SecretKeySpec(decodedKey, "HmacSHA256");
    }

    // Used to CREATE (sign) tokens
    @Bean
    public JwtEncoder jwtEncoder(SecretKey jwtSecretKey) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(jwtSecretKey));
    }

    // Used to VERIFY incoming tokens
    @Bean
    public JwtDecoder jwtDecoder(SecretKey jwtSecretKey) {
        return NimbusJwtDecoder
                .withSecretKey(jwtSecretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }
}
```

---

# 4. Security Filter Chain

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())       // stateless API, no cookies
            .sessionManagement(sm ->
                sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter())));

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthConverter() {
        JwtGrantedAuthoritiesConverter authorities = new JwtGrantedAuthoritiesConverter();
        authorities.setAuthoritiesClaimName("roles");   // read from "roles" claim
        authorities.setAuthorityPrefix("");             // no extra prefix

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authorities);
        return converter;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

## Key Points

| Setting | Why |
|---------|-----|
| `SessionCreationPolicy.STATELESS` | No `JSESSIONID`, no server-side session |
| `csrf.disable()` | CSRF targets cookie sessions; not needed for bearer-token APIs |
| `/auth/**` permitted | Login must be reachable without a token |
| `oauth2ResourceServer().jwt()` | Validates `Authorization: Bearer` tokens |

## Why `JwtAuthenticationConverter`?

By default, Spring reads the `scope`/`scp` claim and prefixes authorities with `SCOPE_`.

Our roles are stored in a **`roles`** claim as `ROLE_USER`. We:

- point the converter at the `roles` claim
- set the prefix to `""` so we don't get a wrong prefix like `ROLE_ROLE_USER` when using `hasRole("USER")`

---

# 5. Login Flow

## Request / Response DTOs

```java
public record LoginRequest(
    @NotBlank String username,
    @NotBlank String password
) { }

public record LoginResponse(String access_token) { }
```

## Controller

```java
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.username(), request.password()));

        String token = jwtService.generateToken(authentication);

        return ResponseEntity.ok(new LoginResponse(token));
    }
}
```

`authenticate()` uses your `UserDetailsService` + `PasswordEncoder`. Bad credentials throw `BadCredentialsException` (401).

## Flow

```text
POST /auth/login {username, password}
        ↓
AuthenticationManager.authenticate()
        ↓
Credentials valid?
   No  → 401 Unauthorized
   Yes ↓
JwtService.generateToken()
        ↓
Return { "access_token": "<JWT>" }
```

---

# 6. JWT Service (Token Generation)

```java
@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;

    @Value("${jwt.expiration-minutes}")
    private long expirationMinutes;

    public JwtService(JwtEncoder jwtEncoder) {
        this.jwtEncoder = jwtEncoder;
    }

    public String generateToken(Authentication authentication) {

        Instant now = Instant.now();

        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("my-app")
                .issuedAt(now)
                .expiresAt(now.plus(expirationMinutes, ChronoUnit.MINUTES))
                .subject(authentication.getName())
                .claim("roles", roles)
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();

        return jwtEncoder
                .encode(JwtEncoderParameters.from(header, claims))
                .getTokenValue();
    }
}
```

The header algorithm (`HS256`) must match the algorithm configured on the decoder.

---

# 7. Verification

## Step 1: Login

```http
POST /auth/login
Content-Type: application/json

{
  "username": "john",
  "password": "secret123"
}
```

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huIi..."
}
```

## Step 2: Call a Protected Endpoint

```http
GET /students
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

```text
Valid token    → 200 OK
Missing token  → 401 Unauthorized
Expired/forged → 401 Unauthorized
Wrong role     → 403 Forbidden
```

## Request Flow

```text
Request + Bearer token
        ↓
BearerTokenAuthenticationFilter
        ↓
JwtDecoder verifies signature + expiry
        ↓
JwtAuthenticationConverter → authorities from "roles" claim
        ↓
SecurityContext populated
        ↓
Controller (no session lookup)
```

## Role-Based Access

```java
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/students/{id}")
public void delete(@PathVariable Long id) { ... }
```

Needs `@EnableMethodSecurity` on a config class.

---

# 8. Security Best Practices

- Use a **strong secret** (≥ 256 bits for HS256), stored outside the codebase
- Keep access tokens **short-lived** (e.g., 15–30 min) and add **refresh tokens** for longer sessions
- Always use **HTTPS**
- Never put sensitive data in the payload (it's readable)
- Plan for **revocation** (short expiry, token blacklist, or rotating keys), since JWTs can't be invalidated server-side by default
- For multi-service setups, prefer **asymmetric keys (RS256)** so only the auth server holds the private key
- Don't store tokens in `localStorage` if XSS is a concern; consider `HttpOnly` cookies

---

# 9. Quick Revision Summary

```text
JWT = Header.Payload.Signature
Stateless = client holds token, server only validates
Login → AuthenticationManager → JwtService → access_token
Request → Authorization: Bearer <token> → JwtDecoder → SecurityContext
```

| Component | Role |
|-----------|------|
| `JwtEncoder` | Signs new tokens |
| `JwtDecoder` | Verifies incoming tokens |
| `JwtAuthenticationConverter` | Maps claims → authorities |
| `SecurityFilterChain` | Stateless policy + route rules |
| `AuthenticationManager` | Validates credentials at login |
| `JwtService` | Builds claims and generates the token |

---

# 10. Interview Questions

## Q1

What problem does JWT solve compared to sessions?

**Answer:**

Sessions store state on the server, so multiple replicas need a shared session store. JWT is stateless: the client holds the token and any server can validate it without session storage.

---

## Q2

What are the three parts of a JWT?

**Answer:**

Header (algorithm and type), Payload (claims such as subject, expiry, roles), and Signature (integrity check using the secret key).

---

## Q3

Is the JWT payload encrypted?

**Answer:**

No. It's only Base64URL-encoded, so anyone can read it. The signature only guarantees it hasn't been tampered with. Don't put sensitive data in it.

---

## Q4

What does the signature protect against?

**Answer:**

Tampering. If the header or payload is altered, the recomputed signature won't match and the server rejects the token.

---

## Q5

Which dependency enables JWT validation in Spring Boot?

**Answer:**

`spring-boot-starter-oauth2-resource-server`, along with `spring-boot-starter-security`.

---

## Q6

What do `JwtEncoder` and `JwtDecoder` do?

**Answer:**

`JwtEncoder` creates and signs tokens at login. `JwtDecoder` verifies the signature and expiry of incoming tokens.

---

## Q7

Why set `SessionCreationPolicy.STATELESS`?

**Answer:**

It tells Spring Security not to create or use HTTP sessions, so no `JSESSIONID` is issued and every request is authenticated by its token.

---

## Q8

Why configure a `JwtAuthenticationConverter`?

**Answer:**

By default, Spring reads the `scope` claim and adds a `SCOPE_` prefix. The converter reads authorities from the custom `roles` claim and removes the prefix, avoiding wrong values like `ROLE_ROLE_USER`.

---

## Q9

Why is CSRF usually disabled for JWT APIs?

**Answer:**

CSRF attacks rely on browsers automatically sending cookies. Bearer tokens are sent explicitly in the `Authorization` header, so CSRF protection isn't needed for such stateless APIs.

---

## Q10

How does the login endpoint generate a token?

**Answer:**

It authenticates credentials via `AuthenticationManager`, then a `JwtService` builds a `JwtClaimsSet` (subject, roles, issued-at, expiry) and encodes it with `JwtEncoder` into a signed token.

---

## Q11

What are the drawbacks of JWT?

**Answer:**

Tokens are hard to revoke before expiry, larger than session IDs, and leaked tokens stay valid until they expire. Mitigate with short lifetimes, refresh tokens, and HTTPS.

---

## Q12

HS256 vs RS256?

**Answer:**

HS256 uses one shared secret for both signing and verifying. RS256 uses a private key to sign and a public key to verify, which is safer when multiple services need to validate tokens.
