# Apache Kafka — Fundamentals & CLI

---

# Table of Contents

1. What is Kafka?
2. The Need for Kafka
3. Core Components
4. Setup with KRaft Mode
5. Topic Commands
6. Producer & Consumer Commands
7. Consumer Group Commands
8. Kafka in Spring Boot
9. Command Cheat Sheet
10. Interview Questions

---

# 1. What is Kafka?

Kafka is a **distributed event streaming platform**.

Services **publish events** to Kafka. Other services **consume** them whenever they are ready.

```text
Producer  →  Kafka (stores events)  →  Consumers
```

---

# 2. The Need for Kafka

## Traditional Microservices (Direct API Calls)

```text
Order Service ──> Payment Service
              ──> Inventory Service
              ──> Analytics Service
```

## Problem 1: Performance

If `Payment Service` is slow, `Order Service` **waits**, so latency grows.

## Problem 2: Tight Coupling

- If a service is **down**, the request can be **lost**
- Adding a new service (e.g., Analytics) means **modifying** `Order Service` to call it

## Kafka as an Intermediary

```text
                       ┌──> Payment Service
Order Service ──> Kafka ──> Inventory Service
 (publishes)           └──> Analytics Service   (new service: no change to Order Service)
```

| Benefit | Explanation |
|---------|-------------|
| **Loose coupling** | Producer doesn't know who consumes |
| **Fault tolerance** | Events are stored; consumers catch up after downtime |
| **Fast response** | Order Service publishes and moves on |
| **Easy extension** | Add consumers without touching producers |

---

# 3. Core Components

```text
Producer → Topic (Partition 0, 1, 2) → Consumer Group
                    ↑
              Brokers (cluster)
```

## Producer

An application that **sends events** to Kafka (e.g., `Order Service`).

## Topic

A **named category** where events of one type are stored.

```text
order-events
user-events
payment-events
```

## Partitions

A topic is split into **partitions** for **parallel processing** and data distribution.

```text
Topic: order-events
 ├── Partition 0:  [0][1][2][3] ...
 ├── Partition 1:  [0][1][2] ...
 └── Partition 2:  [0][1][2][3][4] ...
```

- **Ordering is guaranteed only within a partition**
- Events with the **same key** go to the **same partition**

## Offset

A **unique, increasing ID** for an event within a partition. It tracks reading progress.

```text
Partition 0:  offset 0 | offset 1 | offset 2 | offset 3
                                       ↑
                         consumer has read up to here
```

## Consumer & Consumer Group

A **consumer** reads events. A **consumer group** (e.g., `payment-group`) lets multiple consumers share the work.

```text
Topic with 3 partitions, group "payment-group" with 3 consumers:

Partition 0 → Consumer A
Partition 1 → Consumer B
Partition 2 → Consumer C
```

Rules:

- One partition is read by **only one consumer** in a group
- **Partitions ≥ consumers**. Extra consumers sit idle
- **Different groups** each receive **all** events independently

```text
payment-group   → gets all order events
analytics-group → also gets all order events
```

## Brokers & Cluster

A **broker** is a server running Kafka. Multiple brokers form a **cluster**.

## Replication (Leader / Follower)

Each partition has copies on different brokers.

```text
Partition 0:  Broker 1 (LEADER)    ← reads/writes
              Broker 2 (follower)  ← copy
              Broker 3 (follower)  ← copy

Broker 1 fails → a follower is elected leader → data stays available
```

---

# 4. Setup with KRaft Mode

**KRaft** = Kafka's built-in metadata management (replaces ZooKeeper). No separate ZooKeeper to run.

## Prerequisites

- Java installed (`java -version`)
- Kafka downloaded and extracted

```bash
tar -xzf kafka_2.13-<version>.tgz
cd kafka_2.13-<version>
```

## Step 1: Generate a Cluster ID

```bash
KAFKA_CLUSTER_ID="$(bin/kafka-storage.sh random-uuid)"
echo $KAFKA_CLUSTER_ID
```

## Step 2: Format the Storage

```bash
# Kafka 3.x
bin/kafka-storage.sh format -t $KAFKA_CLUSTER_ID -c config/kraft/server.properties

# Kafka 4.x (config/kraft folder was removed)
bin/kafka-storage.sh format -t $KAFKA_CLUSTER_ID -c config/server.properties
```

## Step 3: Start the Broker

```bash
# Kafka 3.x
bin/kafka-server-start.sh config/kraft/server.properties

# Kafka 4.x
bin/kafka-server-start.sh config/server.properties
```

The broker listens on `localhost:9092` by default. Keep this terminal open and use new terminals for the commands below.

## Step 4: Stop the Broker

Press `Ctrl + C`, or:

```bash
bin/kafka-server-stop.sh
```

---

# 5. Topic Commands

All commands use `--bootstrap-server localhost:9092` to connect to the broker.

## Create a Topic

```bash
bin/kafka-topics.sh --create \
  --topic order-events \
  --bootstrap-server localhost:9092 \
  --partitions 3 \
  --replication-factor 1
```

| Flag | Meaning |
|------|---------|
| `--partitions 3` | Split the topic into 3 partitions |
| `--replication-factor 1` | Copies per partition (can't exceed the number of brokers) |

## List Topics

```bash
bin/kafka-topics.sh --list --bootstrap-server localhost:9092
```

## Describe a Topic (Inspect Partitions)

```bash
bin/kafka-topics.sh --describe --topic order-events --bootstrap-server localhost:9092
```

Output:

```text
Topic: order-events  PartitionCount: 3  ReplicationFactor: 1
  Partition: 0  Leader: 1  Replicas: 1  Isr: 1
  Partition: 1  Leader: 1  Replicas: 1  Isr: 1
  Partition: 2  Leader: 1  Replicas: 1  Isr: 1
```

| Field | Meaning |
|-------|---------|
| `Leader` | Broker handling reads/writes for that partition |
| `Replicas` | Brokers holding a copy |
| `Isr` | In-Sync Replicas (copies that are up to date) |

## Increase Partitions

```bash
bin/kafka-topics.sh --alter --topic order-events --partitions 5 --bootstrap-server localhost:9092
```

Partitions can only be **increased**, never decreased.

## Delete a Topic

```bash
bin/kafka-topics.sh --delete --topic order-events --bootstrap-server localhost:9092
```

---

# 6. Producer & Consumer Commands

## Console Producer

```bash
bin/kafka-console-producer.sh --topic order-events --bootstrap-server localhost:9092
```

Type messages, one per line, then press Enter:

```text
> order-1 created
> order-2 created
```

### Producer With Keys

Same key → same partition (keeps related events ordered).

```bash
bin/kafka-console-producer.sh --topic order-events \
  --bootstrap-server localhost:9092 \
  --property parse.key=true \
  --property key.separator=:
```

```text
> user1:order created
> user1:order paid
> user2:order created
```

## Console Consumer

Reads **new** messages only (from now on):

```bash
bin/kafka-console-consumer.sh --topic order-events --bootstrap-server localhost:9092
```

Read **old messages too**:

```bash
bin/kafka-console-consumer.sh --topic order-events \
  --bootstrap-server localhost:9092 \
  --from-beginning
```

Show key, partition, and offset:

```bash
bin/kafka-console-consumer.sh --topic order-events \
  --bootstrap-server localhost:9092 \
  --from-beginning \
  --property print.key=true \
  --property print.partition=true \
  --property print.offset=true
```

Read as part of a consumer group:

```bash
bin/kafka-console-consumer.sh --topic order-events \
  --bootstrap-server localhost:9092 \
  --group payment-group
```

## Try It: Parallel Consumers

```text
Terminal 1: broker
Terminal 2: consumer in payment-group
Terminal 3: second consumer in payment-group  → partitions are split between them
Terminal 4: producer
```

Run a different `--group analytics-group` consumer and it receives **all** the events too.

---

# 7. Consumer Group Commands

## List Groups

```bash
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list
```

## Describe a Group (Offsets & Lag)

```bash
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --describe --group payment-group
```

Output:

```text
GROUP          TOPIC         PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
payment-group  order-events  0          10              10              0
payment-group  order-events  1          7               9               2
```

| Column | Meaning |
|--------|---------|
| `CURRENT-OFFSET` | Last offset the group has consumed |
| `LOG-END-OFFSET` | Latest offset in the partition |
| `LAG` | How far behind the consumer is |

## Reset Offsets

The group must be **inactive** (no running consumers).

```bash
# Preview first
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group payment-group --topic order-events \
  --reset-offsets --to-earliest --dry-run

# Apply
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group payment-group --topic order-events \
  --reset-offsets --to-earliest --execute
```

## Delete a Group

```bash
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --delete --group payment-group
```

---

# 8. Kafka in Spring Boot

## Dependency

```xml
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```

## application.properties

```properties
spring.kafka.bootstrap-servers=localhost:9092

spring.kafka.consumer.group-id=payment-group
spring.kafka.consumer.auto-offset-reset=earliest
spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.consumer.value-deserializer=org.apache.kafka.common.serialization.StringDeserializer

spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.apache.kafka.common.serialization.StringSerializer
```

## Producer (Order Service)

```java
@Service
public class OrderProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public OrderProducer(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishOrderCreated(String userId, String orderJson) {
        // key = userId → all of a user's events land in the same partition
        kafkaTemplate.send("order-events", userId, orderJson);
    }
}
```

## Consumer (Payment Service)

```java
@Service
public class PaymentConsumer {

    @KafkaListener(topics = "order-events", groupId = "payment-group")
    public void handleOrder(String message) {
        System.out.println("Processing payment for: " + message);
    }
}
```

## Flow

```text
POST /orders
     ↓
OrderService saves order
     ↓
OrderProducer.send("order-events")  → returns immediately
     ↓
Kafka stores the event
     ↓
PaymentConsumer, InventoryConsumer, AnalyticsConsumer each process it independently
```

---

# 9. Command Cheat Sheet

```bash
# Start (KRaft)
KAFKA_CLUSTER_ID="$(bin/kafka-storage.sh random-uuid)"
bin/kafka-storage.sh format -t $KAFKA_CLUSTER_ID -c config/server.properties
bin/kafka-server-start.sh config/server.properties

# Topics
bin/kafka-topics.sh --create   --topic T --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
bin/kafka-topics.sh --list     --bootstrap-server localhost:9092
bin/kafka-topics.sh --describe --topic T --bootstrap-server localhost:9092
bin/kafka-topics.sh --delete   --topic T --bootstrap-server localhost:9092

# Produce / Consume
bin/kafka-console-producer.sh --topic T --bootstrap-server localhost:9092
bin/kafka-console-consumer.sh --topic T --bootstrap-server localhost:9092 --from-beginning
bin/kafka-console-consumer.sh --topic T --bootstrap-server localhost:9092 --group G

# Consumer groups
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group G
```

---

# 10. Interview Questions

## Q1

What is Apache Kafka?

**Answer:**

A distributed event streaming platform where producers publish events to topics and consumers read them independently, enabling loosely coupled, fault-tolerant systems.

---

## Q2

What problems does Kafka solve in microservices?

**Answer:**

Latency from waiting on slow services and tight coupling. With Kafka, the producer publishes an event and moves on, and new consumers can be added without changing the producer.

---

## Q3

What is a topic?

**Answer:**

A named category where events of one type are stored, such as `order-events`.

---

## Q4

Why are topics split into partitions?

**Answer:**

For parallel processing and scalability. Each partition can be consumed by a different consumer, and partitions are distributed across brokers.

---

## Q5

What is an offset?

**Answer:**

A unique, increasing ID for an event within a partition. Consumers use it to track how far they've read.

---

## Q6

What is a consumer group?

**Answer:**

A set of consumers sharing the same `group.id` that split a topic's partitions among themselves. Each partition is read by only one consumer in the group, and different groups each receive all events.

---

## Q7

What if there are more consumers than partitions?

**Answer:**

The extra consumers stay idle, since a partition can be read by only one consumer in a group. Keep partitions ≥ consumers.

---

## Q8

Does Kafka guarantee message ordering?

**Answer:**

Only within a single partition. Using the same key sends related events to the same partition so their order is preserved.

---

## Q9

What is a broker and a cluster?

**Answer:**

A broker is a server running Kafka. Multiple brokers working together form a cluster.

---

## Q10

How does replication provide fault tolerance?

**Answer:**

Each partition has a leader and follower copies on different brokers. If the leader's broker fails, a follower in the ISR becomes the new leader, so data remains available.

---

## Q11

What is KRaft mode?

**Answer:**

Kafka's built-in Raft-based metadata management that replaces ZooKeeper, so no separate ZooKeeper cluster is needed. ZooKeeper has been removed from Kafka 4.x.

---

## Q12

What does `--from-beginning` do?

**Answer:**

It makes a console consumer read all existing messages in the topic from the earliest offset, instead of only new ones. (For consumers in a group with committed offsets, the group's saved position is used.)

---

## Q13

What is consumer lag?

**Answer:**

The difference between the latest offset in a partition and the group's current offset. High lag means consumers are falling behind the producers.
