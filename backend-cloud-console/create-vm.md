# 01 · Create a Virtual Machine (GSP001)

**Course:** The Basics of Google Cloud Compute · **Level:** Introductory · **Time:** 25 min · **Cost:** 1 credit

---

## TL;DR
**Compute Engine = rent a computer (VM) on Google's hardware.** Create it from the **Console** or **`gcloud`**, SSH in, install NGINX, open it in the browser.

---

## Analogy 🏠
| Cloud term | Real-life |
|---|---|
| **Region** | A city (e.g. Mumbai) |
| **Zone** | A building/locality inside that city |
| **VM instance** | A rented room in that building |
| **Machine type** (`e2-medium`) | Room size: 2 CPU / 4 GB RAM |
| **Boot disk** | The room's cupboard (OS + storage) |
| **Firewall rule** | Security guard at the gate: who may enter, via which door |
| **Port 80 (HTTP)** | The front door for web visitors |
| **External IP** | The room's public postal address |
| **Internal IP** | Room number, only residents know it |
| **NGINX** | A receptionist who serves web pages to visitors |

Disk and VM must be in the **same building (zone)**, like a cupboard that has to be in the same room. A static IP must be in the same **city (region)**.

---

## Core Concepts

### Compute Engine
- IaaS: you get a VM, you manage the OS and apps.
- OS options: Debian, Ubuntu, SUSE, Red Hat, CoreOS, Windows Server.
- Scales to thousands of vCPUs with consistent performance.

### Regions & Zones
- **Region** = geographic location (`us-central1`). Has 1+ zones.
- **Zone** = isolated spot in a region (`us-central1-a`).
- **Zonal resources:** VM instances, persistent disks.
- **Regional resources:** static external IPs.

### Machine Type
- `e2-medium` → **E2 series**, 2 vCPU, 4 GB RAM.
- Range: micro → 32 cores / 208 GB RAM.
- New projects have a **default quota** on CPU cores (can request more).

---

## Setup (once per Cloud Shell session)

```bash
gcloud auth list                      # active account
gcloud config list project            # project ID

gcloud config set compute/region REGION
export REGION=REGION
export ZONE=ZONE
```

> ⚠️ In **Cloud Shell** these settings are **not persisted**. Set them again every new session. On your own machine, `gcloud config` persists.

> ⚠️ Use the **student account** in an **Incognito** window, not your personal Google account (avoids charges and conflicts).

---

## Task 1: Create VM from Console

**Path:** ☰ → Compute Engine → VM Instances → **Create Instance**

| Field | Value |
|---|---|
| Name | `gcelab` |
| Region / Zone | your `REGION` / `ZONE` |
| Series | E2 |
| Machine type | `e2-medium` |
| OS | Debian |
| Boot disk type | Balanced persistent disk |
| Size | 10 GB |
| Firewall | ✅ **Allow HTTP traffic** |

- Ticking *Allow HTTP* auto-creates a firewall rule for **port 80**.
- Click **Create** (~1 min), then **SSH** (browser-based client).

---

## Task 2: Install NGINX

```bash
sudo apt-get update
sudo apt-get install -y nginx
ps auwx | grep nginx          # confirm it's running
```

- Expect a `nginx: master process` and `worker process` lines.
- Open `http://EXTERNAL_IP/` (or click the External IP link) → **"Welcome to nginx!"**
- If the page doesn't load → check the **HTTP firewall** option.

---

## Task 3: Create VM with gcloud

```bash
gcloud compute instances create gcelab2 --machine-type e2-medium --zone=$ZONE
```

**Defaults when not specified:**
- Image: Debian
- Machine type: as given (`e2-medium`)
- Root persistent disk: same name as the instance, auto-attached

```bash
gcloud compute instances create --help      # see all defaults (CTRL+C to exit)

gcloud config set compute/zone ZONE         # skip --zone every time
gcloud config set compute/region REGION

gcloud compute ssh gcelab2 --zone=$ZONE     # SSH via gcloud
exit                                        # leave SSH
```

- First SSH: press **Y**, then **Enter** through the passphrase (empty is fine for the lab).

---

## Console vs gcloud

| | Console | gcloud |
|---|---|---|
| Style | Click UI | Command line |
| Best for | Learning, one-offs | Automation, repeatability |
| Firewall HTTP | Checkbox | Needs a flag / separate rule |
| Result | Same VM | Same VM |

---

## Quiz 🎯
**Q: How can you create a VM in Compute Engine?**
✅ **gcloud command line** + ✅ **Cloud console** (both)

---

## Badge-Quiz Cheat Sheet
- VM and its persistent disk → **same zone**.
- Static IP and VM → **same region**.
- Allow HTTP in the console → creates a **port 80** firewall rule.
- Cloud Shell = a VM with dev tools, **5 GB persistent home dir**, `gcloud` preinstalled.
- Cloud Shell `gcloud` config is **per session**.
- Default `gcloud compute instances create` → **Debian + e2-medium + same-name boot disk**.
- Two ways to create a VM: **console** and **gcloud** (API/Terraform also exist).
- Labs are **timed, can't be paused**, and give **temporary credentials**.

---

## Commands Quick Ref

| Command | Purpose |
|---|---|
| `gcloud auth list` | Show active account |
| `gcloud config list project` | Show project |
| `gcloud config set compute/region X` | Default region |
| `gcloud config set compute/zone X` | Default zone |
| `gcloud compute instances create NAME --machine-type TYPE --zone=ZONE` | Create VM |
| `gcloud compute ssh NAME --zone=ZONE` | SSH into VM |
| `gcloud compute instances create --help` | View defaults |

---

**Next lab:** Get Started with Cloud Shell and gcloud
