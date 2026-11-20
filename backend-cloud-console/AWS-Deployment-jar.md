# Deploying a Spring Boot App on AWS EC2

---

# Table of Contents

1. Overview
2. Phase 1 — Manual Deployment
   - Build the JAR
   - Create the EC2 Instance
   - Connect with SSH
   - Transfer the JAR with SCP
   - Install Java & Run
   - Open Port 8080
3. Phase 2 — Docker Deployment
   - Docker Basics
   - Build & Push Image with Jib
   - Install Docker on EC2
   - Pull & Run the Container
4. Cleanup (Avoid Charges)
5. Troubleshooting
6. Command Cheat Sheet
7. Interview Questions

---

# 1. Overview

```text
Local machine                          AWS Cloud
┌──────────────┐                 ┌──────────────────┐
│ Spring Boot  │   SCP / Docker  │   EC2 Instance   │
│ app (JAR)    │ ──────────────> │  (Linux server)  │ ──> Internet :8080
└──────────────┘                 └──────────────────┘
```

Two approaches:

| Approach | How | Effort |
|----------|-----|--------|
| **Manual** | Copy JAR → install Java on server → run | More setup |
| **Docker** | Build image → push → pull and run on server | Cleaner, repeatable |

---

# 2. Phase 1 — Manual Deployment

## 2.1 Build the JAR

Simple controller:

```java
@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello from AWS!";
    }
}
```

Build the runnable JAR:

```bash
# Linux / macOS
./mvnw clean package

# Windows
mvnw.cmd clean package

# Skip tests if needed
./mvnw clean package -DskipTests
```

Output: `target/demo-0.0.1-SNAPSHOT.jar`

Test locally first:

```bash
java -jar target/demo-0.0.1-SNAPSHOT.jar
# open http://localhost:8080/hello
```

---

## 2.2 Create the EC2 Instance (AWS Console)

1. Sign in to the **AWS Console**
2. **Check the Region** (top-right), e.g. `ap-south-1` (Mumbai). Always note which one you use
3. Go to **EC2 → Launch instance**
4. Configure:

| Setting | Value |
|---------|-------|
| Name | `spring-demo` |
| AMI | Amazon Linux 2023 (or Ubuntu) |
| Instance type | `t3.micro` (free tier eligible) |
| Key pair | Create new → download the `.pem` file |
| Network / Security group | Allow **SSH (22)** from **My IP** |

5. Click **Launch instance**
6. Copy the instance's **Public IPv4 address** (or Public DNS)

> Keep the `.pem` file safe. It can't be downloaded again. **Never commit it to Git.**

### Default SSH usernames

| AMI | Username |
|-----|----------|
| Amazon Linux | `ec2-user` |
| Ubuntu | `ubuntu` |

---

## 2.3 Connect with SSH

Restrict key permissions (required on Linux/macOS, otherwise SSH refuses the key):

```bash
chmod 400 my-key.pem
```

Connect:

```bash
ssh -i my-key.pem ec2-user@<EC2_PUBLIC_IP>
```

Example:

```bash
ssh -i my-key.pem ec2-user@13.233.45.67
```

First connection asks to confirm the host fingerprint. Type `yes`.

Leave the server session:

```bash
exit
```

---

## 2.4 Transfer the JAR with SCP

Run this on your **local machine** (not on the server):

```bash
scp -i my-key.pem target/demo-0.0.1-SNAPSHOT.jar ec2-user@<EC2_PUBLIC_IP>:/home/ec2-user/
```

Verify on the server:

```bash
ssh -i my-key.pem ec2-user@<EC2_PUBLIC_IP>
ls
```

```text
SCP = Secure Copy Protocol → copies files over SSH
```

---

## 2.5 Install Java & Run

Run these **on the EC2 server**.

### Amazon Linux 2023

```bash
sudo dnf update -y
sudo dnf install java-17-amazon-corretto -y
java -version
```

### Ubuntu

```bash
sudo apt update
sudo apt install openjdk-17-jdk -y
java -version
```

Run the app:

```bash
java -jar demo-0.0.1-SNAPSHOT.jar
```

This stops when you close the terminal. To keep it running in the background:

```bash
nohup java -jar demo-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
```

Check it:

```bash
tail -f app.log          # view logs
ps aux | grep java       # find the process
curl localhost:8080/hello
```

Stop it:

```bash
kill <PID>
```

---

## 2.6 Open Port 8080

The app runs, but AWS blocks outside traffic by default. Add an **inbound rule** to the Security Group:

1. **EC2 → Instances →** select instance → **Security** tab
2. Click the **Security group** link → **Edit inbound rules**
3. **Add rule:**

| Type | Protocol | Port | Source |
|------|----------|------|--------|
| Custom TCP | TCP | 8080 | `0.0.0.0/0` (anywhere) |

4. **Save rules**

Test in your browser:

```text
http://<EC2_PUBLIC_IP>:8080/hello
```

Or from your terminal:

```bash
curl http://<EC2_PUBLIC_IP>:8080/hello
```

```text
Internet → Security Group (port 8080 open?) → EC2 → Spring Boot app
```

---

# 3. Phase 2 — Docker Deployment

## 3.1 Docker Basics

Docker packages your app and its runtime into an isolated **container**.

```text
Without Docker: install Java, configure the host, run JAR
With Docker:    docker run → everything included
```

| Term | Meaning |
|------|---------|
| **Image** | Read-only template (app + Java + OS layers) |
| **Container** | A running instance of an image |
| **Registry** | Storage for images (Docker Hub, AWS ECR) |

---

## 3.2 Build & Push Image with Jib

**Google Jib** builds Docker images directly from Maven. **No Dockerfile and no local Docker install required.**

### Add the plugin to `pom.xml`

```xml
<build>
    <plugins>
        <plugin>
            <groupId>com.google.cloud.tools</groupId>
            <artifactId>jib-maven-plugin</artifactId>
            <version>3.4.0</version>
            <configuration>
                <to>
                    <image>your-dockerhub-username/demo-app:1.0</image>
                </to>
            </configuration>
        </plugin>
    </plugins>
</build>
```

### Authenticate with Docker Hub

Option 1: if Docker is installed locally:

```bash
docker login
```

Option 2: pass credentials directly (use a Docker Hub **access token**, not your password):

```bash
./mvnw compile jib:build \
  -Djib.to.auth.username=your-dockerhub-username \
  -Djib.to.auth.password=<ACCESS_TOKEN>
```

### Build and push to Docker Hub

```bash
./mvnw compile jib:build
```

### Alternative: build to local Docker only (no push)

```bash
./mvnw compile jib:dockerBuild
docker images
```

---

## 3.3 Install Docker on EC2

SSH into the server first.

### Amazon Linux 2023

```bash
sudo dnf update -y
sudo dnf install docker -y
sudo systemctl start docker
sudo systemctl enable docker           # start on boot
sudo usermod -aG docker ec2-user       # run docker without sudo
exit                                   # re-login for the group change
```

Reconnect and verify:

```bash
ssh -i my-key.pem ec2-user@<EC2_PUBLIC_IP>
docker --version
docker ps
```

### Ubuntu

```bash
sudo apt update
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
```

---

## 3.4 Pull & Run the Container

```bash
# Pull the image from Docker Hub
docker pull your-dockerhub-username/demo-app:1.0

# Run it in the background, mapping port 8080
docker run -d -p 8080:8080 --name demo-app your-dockerhub-username/demo-app:1.0
```

| Flag | Meaning |
|------|---------|
| `-d` | Detached (run in background) |
| `-p 8080:8080` | Map host port : container port |
| `--name demo-app` | Give the container a name |

Check and manage it:

```bash
docker ps                      # running containers
docker ps -a                   # all containers
docker logs -f demo-app        # follow logs
docker stop demo-app           # stop
docker start demo-app          # start again
docker rm demo-app             # remove (must be stopped)
docker rmi your-dockerhub-username/demo-app:1.0   # remove image
```

Test:

```bash
curl http://<EC2_PUBLIC_IP>:8080/hello
```

(The port 8080 inbound rule from Phase 1 must still be open.)

## Update to a New Version

```bash
# Local: bump the tag in pom.xml (1.1), then
./mvnw compile jib:build

# EC2:
docker stop demo-app
docker rm demo-app
docker pull your-dockerhub-username/demo-app:1.1
docker run -d -p 8080:8080 --name demo-app your-dockerhub-username/demo-app:1.1
```

## Manual vs Docker

| | Manual | Docker |
|--|--------|--------|
| Install Java on server | Yes | No |
| Environment consistency | Depends on host | Same everywhere |
| Updating | Copy JAR, restart | Pull new image, run |
| Rollback | Keep old JARs | Run previous tag |

---

# 4. Cleanup (Avoid Charges)

Always **terminate** practice instances.

### Console

1. **EC2 → Instances**
2. Select the instance → **Instance state → Terminate instance**
3. **Verify the Region.** Instances in other regions keep running (and billing) if you forget them

### AWS CLI (optional)

```bash
aws ec2 describe-instances --region ap-south-1
aws ec2 terminate-instances --instance-ids i-0123456789abcdef0 --region ap-south-1
```

### Also check

- **Elastic IPs**: release any unattached ones
- **EBS volumes** left over from terminated instances
- **Billing dashboard** for unexpected charges

> Stopping an instance is not the same as terminating it. A stopped instance still bills for its storage.

---

# 5. Troubleshooting

| Problem | Likely Cause | Fix |
|---------|--------------|-----|
| `Permissions 0644 for 'key.pem' are too open` | Key file too permissive | `chmod 400 my-key.pem` |
| `Connection timed out` on SSH | Port 22 not open or wrong IP | Check the security group's inbound SSH rule |
| `Permission denied (publickey)` | Wrong username or key | Use `ec2-user` (Amazon Linux) or `ubuntu` (Ubuntu) |
| Browser can't reach `:8080` | Port 8080 not open | Add the inbound rule in the security group |
| App stops when terminal closes | Running in the foreground | Use `nohup ... &`, or Docker with `-d` |
| `Port 8080 already in use` | Old process still running | `ps aux \| grep java` then `kill <PID>`, or `docker rm -f demo-app` |
| `docker: permission denied` | User not in the docker group | `sudo usermod -aG docker $USER`, then re-login |
| Public IP changed after restart | EC2 assigns a new IP on stop/start | Attach an **Elastic IP** |

---

# 6. Command Cheat Sheet

## Local Machine

```bash
./mvnw clean package                      # build JAR
chmod 400 my-key.pem                      # fix key permissions
ssh -i my-key.pem ec2-user@<IP>           # connect
scp -i my-key.pem target/app.jar ec2-user@<IP>:/home/ec2-user/   # upload
./mvnw compile jib:build                  # build + push image
```

## EC2 Server (Manual)

```bash
sudo dnf install java-17-amazon-corretto -y
java -jar app.jar
nohup java -jar app.jar > app.log 2>&1 &
tail -f app.log
```

## EC2 Server (Docker)

```bash
sudo dnf install docker -y
sudo systemctl start docker
sudo usermod -aG docker ec2-user
docker pull <user>/demo-app:1.0
docker run -d -p 8080:8080 --name demo-app <user>/demo-app:1.0
docker logs -f demo-app
docker stop demo-app && docker rm demo-app
```

---

# 7. Interview Questions

## Q1

What is AWS EC2?

**Answer:**

Elastic Compute Cloud, AWS's service for renting virtual servers in the cloud. You choose the OS, instance type (CPU/RAM), and manage the server yourself.

---

## Q2

What is an AWS Region?

**Answer:**

A geographic area containing multiple data centers (e.g., `ap-south-1` Mumbai). Resources are region-specific, so always check you're in the right region, especially when cleaning up.

---

## Q3

What is a Security Group?

**Answer:**

A virtual firewall for an EC2 instance that controls inbound and outbound traffic through rules based on port, protocol, and source. Port 8080 must be opened for the Spring Boot app to be reachable.

---

## Q4

What is a key pair and how is it used?

**Answer:**

A public/private key pair for SSH authentication. AWS stores the public key on the instance, and you keep the `.pem` private key to log in, with permissions restricted (`chmod 400`).

---

## Q5

How do you copy a file to an EC2 instance?

**Answer:**

With SCP: `scp -i key.pem app.jar ec2-user@<IP>:/home/ec2-user/`. It copies files securely over SSH.

---

## Q6

How do you keep a Spring Boot app running after closing SSH?

**Answer:**

Run it with `nohup java -jar app.jar &`, use a systemd service, or run it as a Docker container with `-d`.

---

## Q7

Why use Docker for deployment?

**Answer:**

It provides an isolated, consistent environment. You don't install or configure Java on the host, and the same image runs identically on any machine.

---

## Q8

What is Jib?

**Answer:**

A Google Maven/Gradle plugin that builds optimized Docker images for Java apps without a Dockerfile or a local Docker daemon, and can push directly to a registry like Docker Hub.

---

## Q9

What does `docker run -d -p 8080:8080` do?

**Answer:**

Runs the container in the background (`-d`) and maps port 8080 of the host to port 8080 of the container (`host:container`).

---

## Q10

Stopping vs terminating an EC2 instance?

**Answer:**

Stopping shuts it down but keeps the instance and its storage (still billed for storage). Terminating permanently deletes the instance.

---

## Q11

Why might the public IP change?

**Answer:**

EC2 assigns a new public IP each time an instance is stopped and started. An Elastic IP gives a fixed address.

---

## Q12

Why shouldn't SSH (port 22) be open to `0.0.0.0/0`?

**Answer:**

It exposes the server to the whole internet, inviting brute-force attacks. Restrict SSH to your own IP or use a bastion host or AWS Systems Manager Session Manager.
