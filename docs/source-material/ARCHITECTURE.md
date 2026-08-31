# Architecture

## Core architecture principle

Build a reusable **Practice Room engine**, not separate software for every topic.

Avoid a structure such as:

```text
AngerScreen.tsx
WorryScreen.tsx
FriendshipScreen.tsx
OverthinkingScreen.tsx
CriticismScreen.tsx
ExamAnxietyScreen.tsx
```

Prefer:

```text
Practice Room Engine
        ↓
Structured Practice Room
        ↓
Situation
Pattern
Exercises
Reflections
Progress
Challenge
```

A Worry Room, Anger Room, Relationship Room, Exam Anxiety Room, and similar experiences should largely be content/configuration powered by the same primitives.

## Three platform components

### Kids Gym
“Help me discover how my mind works.”

### Adult Gym
“Help me practise meeting life's challenges differently.”

### Practice Engine
“Turn any meaningful situation into a structured practice.”

The Practice Engine is the technological/product innovation that powers the other experiences.
