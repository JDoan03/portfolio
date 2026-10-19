---
title: A hosting platform for small-business websites
summary: "One $6 server, set up entirely from code. Push a change to GitHub and the site is live about a minute later; roll back in seconds. This site is its first customer."
status: in-progress
section: building
stack: [Ansible, Caddy, GitHub Actions, DigitalOcean, "Next: .NET 10 dashboard"]
page: true
order: 1
---

## Why

I wanted somewhere cheap to host this site, and a way to test an idea: a small, managed hosting service for local businesses that want a website without having to think about servers, certificates or deploys.

## How a deploy works

1. I push a change to GitHub.
2. GitHub Actions builds the site, then checks for broken links and a Lighthouse score of at least 95.
3. The finished files are copied to the server as a new, unchangeable deploy.
4. The server switches to the new deploy instantly. Rolling back switches it to the previous one.

## Decisions so far

- **Sites are never built on the server.** Builds run in CI, and the server only receives finished files, so customer code never runs next to anyone else's site.
- **Caddy serves every site** and handles HTTPS certificates automatically, including for customers' own domains.
- **Each site gets its own Linux user and deploy key**, so one leaked key can't touch another customer's site.
- **The whole server is rebuilt from code**, with Ansible. There's nothing to back up: git is the source of truth.

## What's next

A small .NET 10 dashboard for listing sites and deploys, with one-click rollbacks.

_This page grows as the platform does._
