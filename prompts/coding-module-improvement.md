# Improve Existing Coding Module (Next.js) - Vinay AI OS

You are working on an existing production-ready Next.js application called **Vinay AI OS**. Do **NOT** rebuild the module from scratch. Improve and extend the existing Coding module while following the current project architecture, coding standards, UI design system, folder structure, components, APIs, database models, and utility functions.

## Current State

The Coding module already exists.

I already have a JSON file inside the `reference/` folder that contains coding questions.

Each question contains fields similar to:

```json
{
  "id": 1,
  "title": "Two Sum",
  "difficulty": "Easy",
  "url": "https://..."
}
```

The project also has:

* Planner module
* Telegram Bot integration
* Dashboard
* Daily Scheduler
* Authentication
* Existing database
* Existing APIs

Reuse everything wherever possible.

---

# Goal

Turn the Coding module into a **Daily Coding Habit System**.

Instead of showing hundreds of questions, the application should intelligently assign today's questions and integrate them with Planner and Telegram.

---

# Daily Question Assignment

Every day, automatically generate today's coding tasks.

Requirements:

* configurable:

  * 1 question/day
  * 2 questions/day
  * custom number

Questions should be selected intelligently.

Example rotation:

Monday

* 1 Easy

Tuesday

* 1 Easy
* 1 Medium

Wednesday

* 2 Medium

Thursday

* 1 Medium
* 1 Hard

Friday

* 2 Medium

Saturday

* 1 Hard

Sunday

* Revision day

(or make this configurable.)

Questions should never repeat until the pool is exhausted.

After completing all questions,
restart the cycle automatically.

---

# Daily Coding Task

Every generated question becomes a Planner task.

Example

Today's Planner

☐ Solve Two Sum

Difficulty: Easy

Estimated Time: 20 min

Source: Coding Module

Clicking opens Coding module directly.

Completion in Coding should automatically mark Planner task complete.

Planner completion should update Coding progress.

Both modules stay synchronized.

---

# Telegram Integration

The project already contains Telegram Bots.

Use the existing infrastructure.

Every morning send notification like:

💻 Today's Coding Challenge

Question 1

Two Sum

Difficulty: Easy

Estimated Time:
20 mins

Open in AI OS

or

Question 1/2

Question 2/2

If not completed by evening:

Reminder

You still have today's coding challenge pending.

---

# Coding Dashboard

Improve dashboard.

Show:

Today's Question

Current Streak

Longest Streak

Questions Solved

Easy Solved

Medium Solved

Hard Solved

Completion %

Weekly Progress

Monthly Progress

Current Target

Remaining Questions

Time Spent

Average Solve Time

Success Rate

Consistency Score

Difficulty Distribution

---

# Daily Workflow

Morning

↓

Generate today's question

↓

Create Planner Task

↓

Send Telegram Notification

↓

User solves question

↓

Mark Complete

↓

Update Dashboard

↓

Increase Streak

↓

Store History

---

# Progress Tracking

Maintain:

Daily history

Completion date

Skipped

Solved

Difficulty

URL

Notes

Time spent

Personal rating

Favorite

Revision required

---

# Coding Calendar

Build GitHub-like contribution calendar.

Green = solved

Yellow = partial

Red = missed

Gray = no assignment

Allow clicking any date.

---

# Revision System

Automatically identify:

Questions solved over 30 days ago

Frequently failed questions

Hard questions

Questions marked for revision

Generate weekly revision tasks.

---

# Smart Recommendations

If user misses several Easy questions,

recommend easier schedule.

If solving everything quickly,

increase difficulty.

If struggling with Hard,

recommend more Medium.

Adaptive learning.

---

# Planner Integration

Planner should display:

Today's Coding

Estimated duration

Priority

Deadline

One-click open

Completion sync

Automatic carry-forward if missed.

---

# Reminder System

Morning

Today's coding challenge is ready.

Afternoon

Friendly reminder.

Evening

Still pending.

Night

Daily summary.

---

# Dashboard Widgets

Create beautiful widgets.

Today's Coding

🔥 Current Streak

📈 Weekly Progress

Difficulty Breakdown

Monthly Completion

Upcoming Revision

Recent Activity

Coding Score

---

# Coding Score

Create score out of 100.

Factors:

Daily consistency

Streak

Completion rate

Difficulty solved

Revision completion

Skipped questions

Recent activity

Display

Overall Coding Score

Weekly Score

Monthly Score

Trend graph

---

# Filters

Allow filtering by:

Difficulty

Completed

Pending

Revision

Favorites

Topic (future ready)

Date

---

# Settings

Allow configuration:

Questions/day

Preferred difficulty

Weekend revision

Reminder timings

Telegram notifications

Planner sync

Auto carry-forward

Auto difficulty progression

---

# Future Ready

Design architecture so future additions are easy.

Future support:

LeetCode API

GeeksforGeeks

HackerRank

Codeforces

Topic-wise plans

Interview mode

Company-wise questions

AI code review

AI hints

Solution tracker

Contest mode

---

# Database

Create appropriate tables/models if missing.

Suggested entities:

CodingQuestion

DailyAssignment

CodingHistory

CodingStats

CodingSettings

RevisionQueue

CodingStreak

Reuse existing schema whenever possible.

---

# UI

Modern dashboard.

Responsive.

Dark mode.

Beautiful cards.

Progress rings.

Heatmap.

Charts.

Minimal design matching existing AI OS theme.

---

# Technical Requirements

* Do NOT rewrite existing modules.
* Extend existing architecture.
* Follow existing folder structure.
* Reuse current APIs and utilities.
* Use TypeScript.
* Keep components reusable.
* Write clean, maintainable code.
* Avoid duplicated logic.
* Add proper loading states.
* Add error handling.
* Keep performance optimized.
* Ensure Planner, Coding, Dashboard, and Telegram remain synchronized through a single source of truth.

The final implementation should feel like a first-class productivity system rather than just a list of coding questions.
