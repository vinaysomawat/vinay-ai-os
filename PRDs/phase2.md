# PRD: Phase 2 – Personal Brain (Cross-Module Intelligence)

Version: 1.0

Status: Ready for Development

Priority: Highest

---

# Vision

Personal OS should no longer feel like seven separate modules.

Instead, it should feel like a single intelligent system that understands every aspect of my life.

The Personal Brain becomes the central reasoning engine.

Every module contributes context.

Every recommendation considers my entire life.

Instead of:

Health AI

Finance AI

Career AI

Learning AI

Coding AI

There should be one AI that knows everything.

---

# Product Goal

When I open Personal OS, I should feel like I have an executive assistant who understands:

• my career

• my health

• my finances

• my learning

• my coding

• my planner

• my documents

and helps me make better decisions.

The Brain is NOT another chatbot.

It is my operating system.

---

# Core Principles

## 1.

The Brain NEVER owns data.

Modules own data.

The Brain only reads.

---

## 2.

The Brain never duplicates business logic.

All calculations remain deterministic.

The Brain consumes outputs.

Never raw calculations.

---

## 3.

The Brain should reason across modules.

Example:

Health says poor sleep.

Planner says important interview.

Career says Google interview tomorrow.

Learning says React course unfinished.

Brain:

"Skip leg day today.
Spend 2 hours revising React.
Sleep before 10 PM."

---

## 4.

Recommendations must be actionable.

Never generic.

Bad:

"Improve your health."

Good:

"Walk 6,200 more steps today to reach your weekly average."

---

# Architecture

Create a new feature.

src/features/brain/

Structure:

brain/

actions.ts

calculations.ts

prompts.ts

signals.ts

types.ts

context-builder.ts

advisor.ts

components/

BrainPanel.tsx

BrainChat.tsx

DailyMission.tsx

DecisionCard.tsx

WeeklyReview.tsx

---

# Data Flow

Planner

↓

Career

↓

Finance

↓

Health

↓

Learning

↓

Coding

↓

Documents

↓

Context Builder

↓

Unified Context

↓

Claude

↓

Structured JSON

↓

Brain UI

---

# Context Builder

Create one service responsible for collecting information.

Output should look like:

{
today,

lifeScore,

planner,

career,

finance,

health,

learning,

coding,

documents,

signals,

recentActivity,

weeklyPatterns,

monthlyPatterns
}

Every module contributes summarized context.

Never entire database rows.

---

# Brain Signals

Each module exports signals.

Examples

Planner

- overdue tasks

- high priority tasks

- today's workload

Career

- interview soon

- inactive applications

- missing skills

Finance

- overspending

- savings healthy

- EMI pressure

Health

- protein deficit

- no workout

- poor trend

Learning

- revision due

- unfinished course

Coding

- streak risk

- revision pending

Documents

- notes related to interview

The Brain consumes only signals.

---

# Daily Mission

This replaces random recommendations.

Generate exactly five missions.

Examples:

Complete today's coding challenge.

Walk 8,000 steps.

Spend less than ₹400 today.

Review Angular Signals.

Apply to one frontend position.

Mission score

0 / 5

Every mission links to its module.

---

# Ask Brain

A conversational interface.

Questions:

What should I do today?

What am I ignoring?

Why is my weight not changing?

Can I afford a car?

Should I switch jobs?

What should I study tonight?

How productive was I this month?

What is blocking my goals?

How close am I to becoming Staff Engineer?

How am I doing overall?

---

# Decision Engine

Brain should answer decision questions.

Examples:

Should I buy a car?

Should I travel next month?

Should I reduce calories?

Should I stop SIP?

Should I accept this offer?

Should I prepare React or System Design today?

Brain always provides:

Decision

Reasoning

Trade-offs

Confidence

Action items

---

# Pattern Detection

Every week detect patterns.

Examples:

You workout mostly Mondays.

Protein intake drops on weekends.

You solve more coding problems in mornings.

Expenses spike after salary.

You procrastinate interviews.

Sleep impacts coding performance.

Patterns should accumulate over time.

---

# Weekly Reflection

Every Sunday generate:

Wins

Misses

Patterns

Lessons

Next week's focus

Risk areas

One paragraph only.

---

# Monthly Executive Review

Summarize the month.

Include:

Career

Finance

Health

Learning

Coding

Overall

Biggest achievement

Biggest mistake

One recommendation

---

# Explain My Score

When user clicks Life Score.

Brain explains.

Example:

Health +8

Workout completed.

Career -5

No interview preparation.

Finance +10

Stayed under budget.

Learning -6

No study sessions.

Simple.

Transparent.

---

# Memory

Brain remembers.

Examples:

Last promotion.

Current goals.

Current salary.

Target company.

Current workout routine.

Current weight.

No repeated advice.

---

# UI

Create new Dashboard section.

"My Brain"

Contains

Daily Mission

Top Priorities

Ask Brain

Today's Insight

Decision Helper

Weekly Reflection

Compact.

Premium.

---

# AI Rules

Brain should never hallucinate.

If information is missing:

Say so.

Never invent.

Use deterministic values whenever possible.

---

# Performance

Reuse AI Gateway.

Cache responses.

Use structured JSON.

Limit responses to:

200 words.

---


# Success Criteria

After implementation, Personal OS should no longer feel like:

A task manager.

A finance tracker.

A health tracker.

Instead, it should feel like:

A personal operating system that understands my life and helps me make decisions every day.

The Brain should become the primary reason I open the application every morning.

