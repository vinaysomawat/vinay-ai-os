# PRD: Phase 3 – Zero Friction Personal OS

Version: 1.0

Status: Ready

Priority: Critical

---

# Vision

The user should spend less than 60 seconds per day interacting with Personal OS.

Everything else should happen automatically.

The system should observe life instead of asking the user to log life.

---

# Success Metrics

Manual logging reduced by at least 80%.

The dashboard should remain accurate even if the user doesn't open the app for several days.

The user should feel that Personal OS "knows what happened."

---

# Guiding Principle

Every manual action should trigger one question:

"Can the computer discover this automatically?"

If yes, automate it.

---

# Integration Layer

Create a new feature:

src/features/integrations/

Providers:

Google Calendar

Gmail

GitHub

Health Connect / Apple Health (future abstraction)

Browser Activity

Bank SMS (future)

Weather (optional)

---

# Google Calendar

Purpose:

Understand my day.

Capabilities:

• Import meetings

• Detect focus blocks

• Detect travel

• Detect interviews

• Detect holidays

Brain should know:

Busy today

Free evening

Weekend trip

Meeting-heavy day

Long workday

---

# Gmail Intelligence

Purpose:

Reduce manual career tracking.

Capabilities:

Job offer detection

Interview emails

Application responses

Rejected applications

Calendar invites

Invoices

Bills

Brain should understand:

Interview tomorrow

Amazon rejected application

Google requested documents

Salary credited

Electricity bill arrived

---

# GitHub Intelligence

Purpose:

Understand engineering activity.

Capabilities:

Commits

PRs

Issues

Contribution streak

Repositories

Languages

Brain should use this instead of asking if coding happened.

---

# Browser Intelligence

Optional.

Track:

Learning websites

LeetCode

YouTube learning

Documentation

Medium

Stack Overflow

Not browsing history.

Only categorized productivity time.

---

# Smart Logging

Replace manual logging.

Examples:

Gym photo

↓

Workout detected

Receipt

↓

Expense created

Restaurant bill

↓

Expense

Meal photo

↓

Calories

Protein

GitHub commit

↓

Coding activity

Calendar meeting

↓

Planner context

---

# Background Timeline

Create a timeline.

Examples:

09:00 Office

12:30 Lunch

14:00 Interview

18:00 Workout

20:00 Solved LeetCode

22:00 Read React article

Generated automatically.

---

# Daily Auto Journal

Every night:

Generate

"What happened today"

Include

Work

Learning

Health

Finance

Career

Highlights

Challenges

Wins

One paragraph.

---

# Memory Evolution

Brain should remember:

Recurring behaviors

Preferences

Goals

Achievements

Failures

Repeated questions

Long-term trends

---

# Weekly Pattern Mining

Detect things like:

Always productive Tuesday mornings.

Overspend after salary.

Workout consistency drops during travel.

Coding increases after gym.

Best interview performance after 8 hours sleep.

---

# Automation Rules

Examples:

Interview tomorrow

↓

Reduce workout intensity

↓

Increase React revision

Salary credited

↓

Suggest SIP investment

Weekend free

↓

Recommend trekking

High calorie yesterday

↓

Adjust today's target

---

# Notification Intelligence

Replace reminders.

Instead send only meaningful notifications.

Bad:

Log your weight.

Good:

You haven't logged weight for five days and your trend prediction is becoming unreliable.

---

# Dashboard

New section:

Automatic Activity

Everything detected automatically.

No manual logging required.

---

# Success Criteria

The user should feel:

"I barely touch this app.

Yet it knows my life."
