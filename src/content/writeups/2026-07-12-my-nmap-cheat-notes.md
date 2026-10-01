---
title: My Nmap notes
description: The handful of Nmap scans I actually use, and what each flag is for.
date: 2026-07-12
category: experiment
tags:
  - recon
  - nmap
  - tools
cover: /images/samples/writeup-nmap.svg
draft: false
---

> **Example post.** Sample content — replace it with your own.

Only scan machines you own or have written permission to test.

## Quick first look

```bash
nmap -sC -sV -oN initial.txt 10.10.10.10
```

- `-sC` runs the default scripts
- `-sV` detects service versions
- `-oN` saves normal output to a file

## All ports, fast

```bash
nmap -p- --min-rate 2000 -T4 10.10.10.10
```

## UDP top ports

```bash
sudo nmap -sU --top-ports 50 10.10.10.10
```
