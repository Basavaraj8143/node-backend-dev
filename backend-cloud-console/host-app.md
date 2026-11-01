# 03 · Host a Web App on Compute Engine (GSP662)

**Course:** The Basics of Google Cloud Compute · **Level:** Introductory · **Time:** 50 min · **Cost:** 1 credit
**App:** "Fancy Store" e-commerce site (frontend + Orders + Products microservices)

---

## TL;DR
Deploy an app on VMs, then make it **production-grade**:
**VM → instance template → managed instance group (MIG) → health checks (autohealing) → HTTP load balancer → autoscaling → CDN → rolling updates.**

---

## Analogy 🍕 (Pizza Franchise)
| Cloud term | Real-life |
|---|---|
| **Instance (VM)** | One pizza outlet |
| **Startup script** | Opening checklist: "install oven, load recipe, switch on lights" |
| **Cloud Storage bucket** | Head-office store room (recipes + checklist) |
| **Instance template** | Franchise blueprint: outlet size, layout, setup. **Can't be edited**, only replaced by a new version |
| **Managed instance group (MIG)** | Chain of identical outlets under one manager |
| **Autohealing + health check** | Inspector visits; a failing outlet is **demolished and rebuilt** |
| **Load balancer** | Call-centre: takes every order and routes it to the right kitchen |
| **URL map / path rule** | "Orders → billing counter, Products → menu counter, everything else → front desk" |
| **Named ports** | Door names: "frontend = door 8080" |
| **Autoscaler** | Hire more staff at rush hour, send them home when quiet |
| **Cloud CDN** | Ready-made pizzas at a local counter: no need to call the kitchen |
| **Rolling update** | Renovate outlets one by one so the chain keeps serving |
| **Firewall + network tags** | Gate pass given only to outlets wearing a "frontend"/"backend" badge |

---

## Architecture

```
User → Forwarding rule (IP:80)
     → Target HTTP proxy
     → URL map ──┬─ /api/orders   → backend-service fancy-be-orders   (port 8081) ─┐
                 ├─ /api/products → backend-service fancy-be-products (port 8082) ─┼→ fancy-be-mig
                 └─ (default)     → backend-service fancy-fe-frontend (port 8080) ──→ fancy-fe-mig
                         each backend service uses a health check
```

**Order to remember:** Forwarding rule → Proxy → URL map → Backend service → Instance group.

---

## Setup

```bash
gcloud config set compute/zone ZONE
export ZONE=$(gcloud config get compute/zone)
gcloud config set compute/region REGION
export REGION=$(gcloud config get compute/region)
```

---

## Tasks

### Task 1: Enable API
```bash
gcloud services enable compute.googleapis.com
```

### Task 2: Create bucket
```bash
gcloud storage buckets create gs://fancy-store-PROJECT_ID
```
- Holds the **built code + startup script**.

### Task 3: Clone + test locally
```bash
git clone https://github.com/googlecodelabs/monolith-to-microservices.git
cd ~/monolith-to-microservices && ./setup.sh
cd microservices && npm start        # preview on port 8080, CTRL+C to stop
```
- Locally only the frontend works. Products/Orders aren't exposed yet.

### Task 4: Create instances

**Startup script** (`startup-script.sh`) does:
1. Install Logging agent (collects syslog)
2. Install Node.js + **Supervisor** (keeps app running as a daemon)
3. Pull app code from the bucket, `npm install`
4. Create `nodeapp` user, configure Supervisor to run `npm start`

> ⚠️ Replace `[DEVSHELL_PROJECT_ID]` with your project ID.
> ⚠️ Editor line endings must be **LF, not CRLF**, or the script breaks.

```bash
gcloud storage cp ~/monolith-to-microservices/startup-script.sh gs://fancy-store-PROJECT_ID

cd ~
rm -rf monolith-to-microservices/*/node_modules      # faster upload, recreated at boot
gcloud storage cp -r monolith-to-microservices gs://fancy-store-PROJECT_ID/
```

**Backend VM** (tag `backend`):
```bash
gcloud compute instances create backend \
  --zone=$ZONE --machine-type=e2-standard-2 --tags=backend \
  --image-family=DEBIAN_IMAGE --image-project=debian-cloud \
  --metadata=startup-script-url=https://storage.googleapis.com/fancy-store-PROJECT_ID/startup-script.sh
```

**Point frontend at backend:** get backend IP (`gcloud compute instances list`), edit `react-app/.env`:
```
REACT_APP_ORDERS_URL=http://BACKEND_IP:8081/api/orders
REACT_APP_PRODUCTS_URL=http://BACKEND_IP:8082/api/products
```
Rebuild + re-upload:
```bash
cd ~/monolith-to-microservices/react-app && npm install && npm run-script build
cd ~ && rm -rf monolith-to-microservices/*/node_modules
gcloud storage cp -r monolith-to-microservices gs://fancy-store-PROJECT_ID/
```

**Frontend VM:** same command, name `frontend`, tag `frontend`.

**Firewall (tag-based):**
```bash
gcloud compute firewall-rules create fw-fe --allow tcp:8080 --target-tags=frontend
gcloud compute firewall-rules create fw-be --allow tcp:8081-8082 --target-tags=backend
```
Visit `http://FRONTEND_IP:8080` after ~3 min.

---

### Task 5: Managed Instance Groups

**1. Stop VMs → create templates from them**
```bash
gcloud compute instances stop frontend --zone=$ZONE
gcloud compute instances stop backend  --zone=$ZONE

gcloud compute instance-templates create fancy-fe --source-instance-zone=$ZONE --source-instance=frontend
gcloud compute instance-templates create fancy-be --source-instance-zone=$ZONE --source-instance=backend

gcloud compute instances delete backend --zone=$ZONE     # no longer needed
```
(Keep `frontend`: it's reused to make the updated template later.)

**2. Create MIGs (2 instances each)**
```bash
gcloud compute instance-groups managed create fancy-fe-mig --zone=$ZONE \
  --base-instance-name fancy-fe --size 2 --template fancy-fe
gcloud compute instance-groups managed create fancy-be-mig --zone=$ZONE \
  --base-instance-name fancy-be --size 2 --template fancy-be
```

**3. Named ports** (non-standard ports need names; the load balancer uses them)
```bash
gcloud compute instance-groups set-named-ports fancy-fe-mig --zone=$ZONE --named-ports frontend:8080
gcloud compute instance-groups set-named-ports fancy-be-mig --zone=$ZONE --named-ports orders:8081,products:8082
```

**4. Autohealing**
```bash
gcloud compute health-checks create http fancy-fe-hc --port 8080 \
  --check-interval 30s --healthy-threshold 1 --timeout 10s --unhealthy-threshold 3
gcloud compute health-checks create http fancy-be-hc --port 8081 --request-path=/api/orders \
  --check-interval 30s --healthy-threshold 1 --timeout 10s --unhealthy-threshold 3

gcloud compute firewall-rules create allow-health-check \
  --allow tcp:8080-8081 --source-ranges 130.211.0.0/22,35.191.0.0/16 --network default

gcloud compute instance-groups managed update fancy-fe-mig --zone=$ZONE --health-check fancy-fe-hc --initial-delay 300
gcloud compute instance-groups managed update fancy-be-mig --zone=$ZONE --health-check fancy-be-hc --initial-delay 300
```
- Unhealthy **3 times in a row** → instance recreated.
- `--initial-delay 300` → give the VM 5 min to boot before judging it.
- Autohealing may take up to **15 min** to start monitoring.

> **Two kinds of health checks:**
> | | Autohealing | Load balancing |
> |---|---|---|
> | Action on fail | **Recreate** the VM | **Stop sending traffic** to it |
> | Tuning | Conservative | Aggressive (catch problems fast) |

---

### Task 6: HTTP(S) Load Balancer

```bash
# Health checks for LB
gcloud compute health-checks create http fancy-fe-frontend-hc --request-path=/ --port=8080
gcloud compute health-checks create http fancy-be-orders-hc   --request-path=/api/orders --port=8081
gcloud compute health-checks create http fancy-be-products-hc --request-path=/api/products --port=8082

# Backend services (global, use named ports)
gcloud compute backend-services create fancy-fe-frontend --health-checks=fancy-fe-frontend-hc --port-name=frontend --global
gcloud compute backend-services create fancy-be-orders   --health-checks=fancy-be-orders-hc   --port-name=orders   --global
gcloud compute backend-services create fancy-be-products --health-checks=fancy-be-products-hc --port-name=products --global

# Attach MIGs
gcloud compute backend-services add-backend fancy-fe-frontend --instance-group-zone=$ZONE --instance-group fancy-fe-mig --global
gcloud compute backend-services add-backend fancy-be-orders   --instance-group-zone=$ZONE --instance-group fancy-be-mig --global
gcloud compute backend-services add-backend fancy-be-products --instance-group-zone=$ZONE --instance-group fancy-be-mig --global

# URL map + path matcher
gcloud compute url-maps create fancy-map --default-service fancy-fe-frontend
gcloud compute url-maps add-path-matcher fancy-map --default-service fancy-fe-frontend \
  --path-matcher-name orders \
  --path-rules "/api/orders=fancy-be-orders,/api/products=fancy-be-products"

# Proxy + forwarding rule
gcloud compute target-http-proxies create fancy-proxy --url-map fancy-map
gcloud compute forwarding-rules create fancy-http-rule --global --target-http-proxy fancy-proxy --ports 80
```
- HTTP used for simplicity. **Production → HTTPS.**

**Update frontend to use the LB IP** (no ports needed; the LB handles routing):
```bash
gcloud compute forwarding-rules list --global      # get IP_ADDRESS
```
`.env`:
```
REACT_APP_ORDERS_URL=http://LB_IP/api/orders
REACT_APP_PRODUCTS_URL=http://LB_IP/api/products
```
Rebuild, re-upload (same 3 commands as before), then roll it out:
```bash
gcloud compute instance-groups managed rolling-action replace fancy-fe-mig --zone=$ZONE --max-unavailable 100%
watch -n 2 gcloud compute backend-services get-health fancy-fe-frontend --global    # wait for HEALTHY
```
- `--max-unavailable 100%` = replace all at once (fast, for the lab). **Production: leave a buffer.**

---

### Task 7: Scale

**Autoscaling** (CPU is not used here: it's based on **load balancing utilization**)
```bash
gcloud compute instance-groups managed set-autoscaling fancy-fe-mig --zone=$ZONE \
  --max-num-replicas 2 --target-load-balancing-utilization 0.60
gcloud compute instance-groups managed set-autoscaling fancy-be-mig --zone=$ZONE \
  --max-num-replicas 2 --target-load-balancing-utilization 0.60
```
- Above 60% → add instances. Below → remove.

**Cloud CDN**
```bash
gcloud compute backend-services update fancy-fe-frontend --enable-cdn --global
```
- Request hits **Google Front End (GFE)** → checks CDN cache.
  - **Cache hit** → return cached response.
  - **Cache miss** → go to backend, cache it if cacheable.

---

### Task 8: Update the website

**A. New instance template (change machine type)**
```bash
gcloud compute instances set-machine-type frontend --zone=$ZONE --machine-type e2-small
gcloud compute instance-templates create fancy-fe-new --region=$REGION \
  --source-instance=frontend --source-instance-zone=$ZONE
gcloud compute instance-groups managed rolling-action start-update fancy-fe-mig --zone=$ZONE \
  --version template=fancy-fe-new
watch -n 2 gcloud compute instance-groups managed list-instances fancy-fe-mig --zone=$ZONE
gcloud compute instances describe VM_NAME --zone=$ZONE | grep machineType      # confirm e2-small
```
- Look for: `STATUS: RUNNING`, `ACTION: None`, template = `fancy-fe-new`.
- Templates are **immutable**: create a new one, then roll it out.

**B. Change the code**
```bash
cd ~/monolith-to-microservices/react-app/src/pages/Home
mv index.js.new index.js
cd ~/monolith-to-microservices/react-app && npm install && npm run-script build
cd ~ && rm -rf monolith-to-microservices/*/node_modules
gcloud storage cp -r monolith-to-microservices gs://fancy-store-PROJECT_ID/

gcloud compute instance-groups managed rolling-action replace fancy-fe-mig --zone=$ZONE --max-unavailable=100%
```
- Instances **pull code at startup**, so replacing them = deploying the new code.
- Visit `http://LB_IP` to see the new homepage.

### Simulate failure (test autohealing)
```bash
gcloud compute instance-groups list-instances fancy-fe-mig --zone=$ZONE
gcloud compute ssh INSTANCE_NAME --zone=$ZONE
sudo supervisorctl stop nodeapp; sudo killall node
exit
watch -n 2 gcloud compute operations list --filter='operationType~compute.instances.repair.*'
```
- Result: `compute.instances.repair.recreateInstance` → MIG rebuilt the VM automatically ✅

---

## Badge-Quiz Cheat Sheet
- **MIG** = identical VMs managed as one unit, **single zone**. Gives **autohealing, load balancing, autoscaling, rolling updates**.
- **Instance template** defines machine type, image, network, etc. **Immutable.**
- **Named ports** = `name:port` pairs on an instance group, used by the load balancer.
- **Autohealing health check** → **recreates** VM. **LB health check** → only **routes traffic**.
- **Health-check firewall source ranges:** `130.211.0.0/22` and `35.191.0.0/16`.
- **HTTP LB chain:** forwarding rule → target proxy → URL map → backend service → backend (MIG).
- **URL map** routes by path (`/api/orders`, `/api/products`).
- **Rolling update:** `rolling-action replace` (same template) / `start-update` (new template).
- `--max-unavailable 100%` = replace all at once (testing only).
- **Autoscaler** here uses `--target-load-balancing-utilization 0.60`.
- **Cloud CDN:** enabled on the backend service with `--enable-cdn`; **GFE** serves cache hits.
- **Startup script** runs on every boot. **Supervisor** keeps the Node app alive.
- Firewall rules use **network tags** (`frontend`, `backend`) as targets.
- Compute Engine = **more control, more ops work** than GKE / App Engine.

---

## Common Gotchas
| Problem | Fix |
|---|---|
| Startup script not working | Line endings must be **LF** |
| Site not loading right after create | Wait ~3 min for startup script |
| Instances never HEALTHY | Open `IP:8080` directly; check health-check firewall rule |
| Autohealing not kicking in | Can take up to **15 min** |
| Old code still showing | Rebuild react-app → re-upload → **rolling replace** |
| Forgot to replace `[DEVSHELL_PROJECT_ID]` | Instances can't pull code from the bucket |

---

**Previous:** 02 · Creating a Persistent Disk
