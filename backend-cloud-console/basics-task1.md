# 04 · The Basics of Google Cloud Compute: Challenge Lab (ARC120)

**Level:** Introductory · **Time:** 20 min (timed, auto-graded) · **Cost:** 1 credit
**Reward:** 🏅 *The Basics of Google Cloud Compute* skill badge (score **100%** to earn it)

---

## TL;DR
No hand-holding. Combine what you learned in labs 01 to 03:
**Bucket → VM (with HTTP) → extra disk → attach → NGINX.**

---

## Analogy 🚗
Lessons 01 to 03 were driving classes. This is the **driving test**: no instructor, just a checklist and an examiner (the auto-scorer) who clicks "Check my progress".

---

## Rules
- Region **`us-east1`**, zone **`us-east1-c`** for everything (unless told otherwise).
- Names must match **exactly** (`my-instance`, `mydisk`, the bucket name from the lab panel).
- Timer can't be paused.

---

## Setup

```bash
export REGION=us-east1
export ZONE=us-east1-c
gcloud config set compute/region $REGION
gcloud config set compute/zone $ZONE
```

---

## Task 1: Cloud Storage bucket

| Requirement | Value |
|---|---|
| Name | `<PROJECT_ID>-bucket` (copy from the lab) |
| Location | **US (multi-region)** |

```bash
gcloud storage buckets create gs://BUCKET_NAME --location=US
```
> ⚠️ Multi-region = `--location=US`, **not** `us-east1`. Easy to get wrong.

---

## Task 2: VM + persistent disk

| Property | Value |
|---|---|
| Name | `my-instance` |
| Series / Type | E2 / `e2-medium` |
| Boot disk | **Balanced** persistent disk, **10 GB** |
| Image | **Debian GNU/Linux 12 (bookworm)** |
| Firewall | ✅ **Allow HTTP traffic** |

**Easiest: Console** (the checkbox creates the firewall rule for you)
☰ → Compute Engine → VM instances → **Create instance**

**Or gcloud:**
```bash
gcloud compute instances create my-instance \
  --zone=$ZONE \
  --machine-type=e2-medium \
  --image-family=debian-12 --image-project=debian-cloud \
  --boot-disk-size=10GB --boot-disk-type=pd-balanced \
  --tags=http-server
```
> ⚠️ In gcloud, `--tags=http-server` alone is **not enough**. The firewall rule must exist too:
> ```bash
> gcloud compute firewall-rules create default-allow-http \
>   --allow tcp:80 --target-tags http-server
> ```
> (Skip if `default-allow-http` already exists.) The console checkbox does both for you.

**Disk:**
```bash
gcloud compute disks create mydisk --size=200GB --zone=$ZONE
gcloud compute instances attach-disk my-instance --disk mydisk --zone=$ZONE
```
- Disk and VM must be in the **same zone** (lesson 02).
- Only **create + attach** is asked. No format/mount needed for the check.

---

## Task 3: Install NGINX

```bash
gcloud compute ssh my-instance --zone=$ZONE      # or click SSH in the console
```
Inside the VM:
```bash
sudo apt-get update
sudo apt-get install -y nginx
ps auwx | grep nginx
```
- Expect `nginx: master process` + `worker process` lines.
- Test: open `http://EXTERNAL_IP/` → **"Welcome to nginx!"**
- Not loading? → HTTP firewall / tag missing on the VM.

---

## Checklist ✅
- [ ] Bucket created, **US multi-region**
- [ ] `my-instance`: E2, e2-medium, balanced 10 GB, Debian 12, **HTTP allowed**
- [ ] `mydisk` 200 GB created in `us-east1-c`
- [ ] `mydisk` **attached** to `my-instance`
- [ ] NGINX installed and running
- [ ] Click **Check my progress** after each task

---

## Where Each Skill Came From
| Task | Lesson |
|---|---|
| VM, console/gcloud, NGINX | 01 · Create a Virtual Machine |
| Disk create + attach | 02 · Creating a Persistent Disk |
| Zones, firewall, tags | 01 to 03 |

---

## Common Mistakes
| Mistake | Fix |
|---|---|
| Wrong zone | Everything in `us-east1-c` |
| Bucket in `us-east1` instead of `US` | Recreate with `--location=US` |
| Allow HTTP not ticked | Edit VM (tick HTTP) or add firewall rule + `http-server` tag |
| Boot disk type left as default | Must be **Balanced** (`pd-balanced`) |
| Image not Debian 12 | Use `debian-12` family |
| Typo in `my-instance` / `mydisk` | Names are checked exactly |

---

**Previous:** 03 · Host a Web App on Compute Engine
**Course complete 🎉** after this lab → claim the badge.
