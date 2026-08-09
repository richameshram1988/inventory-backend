# Inventory Management System

## Live Links

### Frontend
[YOUR_FRONTEND_VERCEL_URL](https://inventory-frontend-three-mu.vercel.app/)

### Backend API
https://inventory-backend-eight-iota.vercel.app

### GitHub
https://github.com/richameshram1988/inventory-backend

---

## FIFO Logic

The inventory system follows the **FIFO (First In, First Out)**
method for inventory management.

Under FIFO, the oldest available inventory stock is consumed first
when a sale is made.

Each purchase is maintained as a separate stock batch with its
quantity and unit cost.

For example:

| Batch | Quantity | Unit Cost |
|-------|----------|-----------|
| Batch A | 10 | ₹100 |
| Batch B | 20 | ₹120 |

If 15 units are sold:

```text
10 × ₹100 = ₹1,000
5 × ₹120  = ₹600

Total FIFO Cost = ₹1,600
## Kafka Integration - Local Setup

Apache Kafka is integrated locally for handling inventory events.

### 1. Start Kafka Server On Locally

After installing Apache Kafka on Windows, open Command Prompt and
navigate to the Kafka installation directory.

Run:

```cmd
bin\windows\kafka-server-start.bat config\server.properties
In new cmd    netstat -ano | findstr ":9092"
 In new cmd   bin\windows\kafka-broker-api-versions.bat --bootstrap-server localhost:9092

