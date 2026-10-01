---
title: Subnetting a three-floor office network
description: How I split one address block into VLANs for five departments across three floors, with room to grow.
date: 2026-08-30
category: article
tags:
  - networking
  - vlan
  - packet-tracer
cover: /images/samples/writeup-subnet.svg
draft: false
---

> **Example post.** Sample content — replace it with your own.

For my advanced networking project I had to design a network for a fictional company: three floors, about 60 users and five departments. Here's how I planned the addressing.

## Requirements

| Department | Users | Floor |
|---|---|---|
| Management | 6 | 3 |
| IT | 8 | 3 |
| Finance | 10 | 2 |
| HR | 8 | 2 |
| Sales | 24 | 1 |

## Picking subnet sizes

Size each subnet for today's users **plus growth**, then round up to a power of two:

```text
Sales       24 users -> /26 (62 hosts)
Finance     10 users -> /27 (30 hosts)
HR, IT       8 users -> /27 (30 hosts)
Management   6 users -> /28 (14 hosts)
```

## VLAN config on the access switch

```bash
enable
configure terminal
vlan 10
 name SALES
interface range fa0/1-24
 switchport mode access
 switchport access vlan 10
end
```

## What I'd do differently

- Put printers and cameras on their own VLAN from day one.
- Document the IP plan in a sheet *before* touching Packet Tracer.
