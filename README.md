# SyncUp

A project management web app designed for university group projects — built
to solve the common problem of newly formed teams that lack structure: no
clear roles, unclear expectations, and uneven distribution of work.

## Problem

At the start of most university group projects, teams are unorganized:
nobody has defined roles, deadlines are informal, and workload often ends up
distributed unevenly. SyncUp addresses this in the critical "forming" phase
of a team.

## Features

- **Team setup** – Define team members, roles, and responsibilities early.
- **Task management** – Create, assign, and track tasks across the project
  timeline.
- **Workload overview** – Visualize how work is distributed across team
  members to flag imbalances early.
- **AI-assisted planning** – Uses the Gemini API to suggest task breakdowns
  and help structure project plans based on a short project description.

## Tech Stack

- React + TypeScript
- Vite
- Gemini API (for AI-assisted task suggestions)

## Setup

**Prerequisites:** Node.js

```bash
npm install
```

Set your `GEMINI_API_KEY` in `.env.local`, then:

```bash
npm run dev
```

## Why this project

Built after experiencing the friction of unstructured group work first-hand;
an attempt to translate that into a lightweight tool that helps teams agree
on structure before conflicts arise.

## Status

Functional prototype. Possible extensions: deadline reminders, integration
with calendar tools, conflict-resolution suggestions based on team feedback.
