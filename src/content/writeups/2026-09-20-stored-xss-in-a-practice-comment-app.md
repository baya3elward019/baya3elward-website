---
title: Stored XSS in a practice comment app
description: Finding and exploiting a stored XSS in a deliberately vulnerable lab app, then fixing it properly with output encoding and a CSP.
date: 2026-09-20
category: write-up
platform: Home lab
difficulty: Easy
tags:
  - web
  - xss
  - owasp
cover: /images/samples/writeup-xss.svg
draft: false
---

> **Example post.** This is sample content to show how write-ups look. Replace it with your own from Pages CMS.

This lab is a tiny comment board I run locally in Docker. The goal: find a way to run JavaScript in another visitor's browser, then fix the root cause.

## Recon

Start with the obvious: what does the app accept, and where does it echo it back?

```bash
curl -s http://localhost:8080/comments | head -20
curl -s -X POST http://localhost:8080/comments -d 'author=test&body=<b>hello</b>'
```

The second request comes back **bold** on the page. HTML is rendered as-is, so the input isn't encoded on output.

## Proof of concept

A harmless payload proves script execution without doing anything nasty:

```html
<img src=x onerror="alert(document.domain)">
```

Every visitor who loads the page now triggers the alert. That's a stored XSS: the payload lives in the database and fires for everyone.

### Why it works

The template builds HTML with string concatenation:

```js
// vulnerable
list.innerHTML += `<li><b>${c.author}</b>: ${c.body}</li>`;
```

## The fix

1. **Encode on output.** Use `textContent` (or your framework's default escaping) instead of `innerHTML`.
2. **Sanitize** only if you really need rich text, with a proven library such as DOMPurify.
3. **Add a Content Security Policy** as a second layer.

```js
// fixed
const li = document.createElement('li');
const b = document.createElement('b');
b.textContent = c.author;
li.append(b, `: ${c.body}`);
list.append(li);
```

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'
```

## Takeaways

- Look for every place user input is **reflected**, not just stored.
- Escaping is the fix; a CSP limits the damage when you miss one.
