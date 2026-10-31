# 02 · Creating a Persistent Disk (GSP004)

**Course:** The Basics of Google Cloud Compute · **Level:** Introductory · **Time:** 15 min · **Cost:** 1 credit

---

## TL;DR
**Persistent disk = network hard drive for your VM that outlives the VM.** Flow: **create disk → attach → find it → format (`mkfs`) → mount → add to `/etc/fstab`**.

---

## Analogy 🎒
| Cloud term | Real-life |
|---|---|
| **VM** | Your laptop |
| **Boot disk** | The laptop's internal drive (has the OS) |
| **Persistent disk (extra)** | External pen drive / hard drive |
| **Attach** | Plug the drive into the USB port |
| **Format (`mkfs`)** | Wipe + set up the drive so it can store files |
| **Mount** | Make the drive show up as a folder you can open |
| **`/etc/fstab`** | "Auto-detect this drive on every startup" list |
| **Delete VM** | Laptop thrown away: pen drive still has your data |
| **Local SSD** | Memory chip soldered *inside* the laptop: super fast, but lost if the laptop dies |

---

## Core Concepts

### Persistent Disk (PD)
- Primary storage for VMs, like a physical drive but **independent of the VM**.
- **VM deleted → disk keeps the data** → attach it to another VM.
- Two types: **Standard (HDD)** and **SSD**. Each has different capacity limits.
- Disk and VM must be in the **same zone**.

### Local SSD (Task 5, theory only)
| | Persistent Disk | Local SSD |
|---|---|---|
| Location | Network-attached | **Physically on the host server** |
| Speed | Good | **<1 ms latency, up to 680K read / 360K write IOPS** |
| Durability | Survives VM deletion | **Not replicated. Can lose data on host error** |
| Backup | Snapshots | You must back it up yourself |
| NVMe image | Not needed | Needed for max performance |

---

## Setup (per Cloud Shell session)

```bash
gcloud config set compute/zone ZONE
gcloud config set compute/region REGION
export REGION=REGION
export ZONE=ZONE
```

> ⚠️ Cloud Shell does **not** persist these. Set them every session.

---

## Task 1: Create VM (boot disk only)

```bash
gcloud compute instances create gcelab \
  --zone=$ZONE \
  --machine-type=e2-standard-2 \
  --image-family=DEBIAN_IMAGE \
  --image-project=debian-cloud
```
- Gets a default **10 GB** boot disk.

## Task 2: Create a new disk

```bash
gcloud compute disks create mydisk --size=200GB --zone $ZONE
```
- Same **zone** as the VM (mandatory).
- Default type → `pd-standard`.

## Task 3: Attach, format, mount

### Attach
```bash
gcloud compute instances attach-disk gcelab --disk mydisk --zone $ZONE
```
- Works on a **running** VM, no restart needed.
- Custom name: add `--device-name <NAME>`.

### SSH in
```bash
gcloud compute ssh gcelab --zone $ZONE
```
- First time: **Y**, then **Enter, Enter** (empty passphrase).

### Find the disk
```bash
ls -l /dev/disk/by-id/
```
- Boot disk → `google-persistent-disk-0` → `sda`
- New disk → `scsi-0Google_PersistentDisk_persistent-disk-1` → `sdb`

### Mount point, format, mount
```bash
sudo mkdir /mnt/mydisk

sudo mkfs.ext4 -F -E lazy_itable_init=0,lazy_journal_init=0,discard \
  /dev/disk/by-id/scsi-0Google_PersistentDisk_persistent-disk-1

sudo mount -o discard,defaults \
  /dev/disk/by-id/scsi-0Google_PersistentDisk_persistent-disk-1 /mnt/mydisk
```
- `mkfs.ext4` → creates the filesystem. ⚠️ **Deletes all data on that disk.**
- `mount` → attaches the filesystem to a folder.

### Auto-mount on reboot
```bash
sudo nano /etc/fstab
```
Add at the bottom:
```
/dev/disk/by-id/scsi-0Google_PersistentDisk_persistent-disk-1 /mnt/mydisk ext4 defaults 1 1
```
Save: **CTRL+O → ENTER → CTRL+X**

> By default a mounted disk is **NOT** remounted after VM restart. `fstab` fixes that.

---

## Quiz 🎯

**Q1: Can you prevent an attached persistent disk from being destroyed when the instance is deleted?**
✅ **Yes, deselect "Delete boot disk when instance is deleted" when creating the instance.**
- ❌ "No, always tied to the instance": wrong.
- Note: `--keep-disks` is also a real `gcloud compute instances delete` flag (values: `all`, `boot`, `data`), but the option as written in the quiz uses a different dash style. If it's multi-select, pick both; otherwise go with the first.

**Q2: Migrate a disk's data to another region, correct order?**
✅ **(5, 3, 2, 4, 1)**

| Step | Action | Why |
|---|---|---|
| 5 | Unmount file system(s) | Clean, consistent state |
| 3 | Create snapshot | Snapshots can be used across regions |
| 2 | Create disk (from snapshot, in new region) | New disk |
| 4 | Create instance (new region) | New VM |
| 1 | Attach disk | Plug it in |

**Memory trick:** *"Unmount → Snapshot → Disk → Instance → Attach"* = **U-S-D-I-A**.

---

## Badge-Quiz Cheat Sheet
- PD exists **independent of the VM**: delete the VM, data stays.
- Disk and VM → **same zone** to attach.
- Two PD types: **Standard** and **SSD**.
- New VM boot disk default: **10 GB**.
- `mkfs` = create filesystem (**erases data**). `mount` = attach filesystem to a folder.
- Extra disk without `fstab` → **not remounted after restart**.
- Default device path: `/dev/disk/by-id/scsi-0Google_PersistentDisk_persistent-disk-1`.
- **Local SSD** = fastest, physically attached, **not auto-replicated**, back it up yourself.
- Cross-region move → **unmount → snapshot → create disk → create instance → attach**.

---

## Commands Quick Ref

| Command | Purpose |
|---|---|
| `gcloud compute instances create NAME ...` | Create VM |
| `gcloud compute disks create NAME --size=200GB --zone $ZONE` | Create disk |
| `gcloud compute instances attach-disk VM --disk DISK --zone $ZONE` | Attach disk |
| `gcloud compute ssh VM --zone $ZONE` | SSH in |
| `ls -l /dev/disk/by-id/` | Find disk device |
| `sudo mkdir /mnt/DIR` | Make mount point |
| `sudo mkfs.ext4 -F ... /dev/disk/by-id/...` | Format |
| `sudo mount -o discard,defaults DEVICE /mnt/DIR` | Mount |
| `sudo nano /etc/fstab` | Persist mount |

---

**Previous:** 01 · Create a Virtual Machine
