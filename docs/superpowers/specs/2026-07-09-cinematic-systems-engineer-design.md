# Cinematic Systems Engineer Design

**Goal:** Reframe the homepage into a guided, cinematic portfolio experience that presents Dhruv as a serious backend and infrastructure engineer while preserving the current brutalist visual personality.

## Direction

The homepage should feel authored rather than noisy. Motion should support sequencing, hierarchy, and storytelling instead of behaving as independent decoration. The visual language stays bold, tactile, and slightly playful, but the first impression should be competence and systems thinking.

## Narrative Structure

### Beat 1: Identity

The landing screen establishes the positioning immediately:

- Backend and infrastructure engineer
- Systems and observability focus
- Strong, poster-like headline with one supporting artifact

The hero keeps oversized typography and one terminal-like artifact. Decorative shapes remain in the scene but are demoted to supporting props.

### Beat 2: Credibility

The second section explains why the positioning is believable:

- Production support and enterprise systems
- Observability and reliability work
- Authentication, platform, and deployment experience

This section should reveal as one composed sequence rather than many unrelated animations.

### Beat 3: Choice

Only after identity and credibility are established should the page present the two exploration paths:

- `Interactive Terminal` for exploratory conversation
- `Manual Mode` for direct browsing

These options should feel like two intentional views into the same engineer, not just two cards.

## Motion Rules

- One focal animation at a time
- `GSAP` owns page-level choreography and scroll timing
- Existing lightweight hover states can remain on CSS or `motion/react`
- Continuous motion should be reduced sharply
- At most one draggable artifact remains on the homepage

## GSAP Usage

`GSAP` should be used for:

- Hero entrance timeline
- Controlled transition from identity to credibility
- Staged reveal of the path-selection section
- Optional short desktop-only pin if it clarifies a narrative transition

`GSAP` should not be used for:

- Per-card animation everywhere
- Constant parallax layers
- Decorative effects without narrative purpose
- Long pinned scenes that slow navigation

## Existing Homepage Changes

The current homepage contains:

- A fixed header
- A continuously moving marquee
- Multiple draggable shapes
- A draggable terminal window
- Animated hero copy
- A narrative card and two route cards

Planned adjustments:

- Remove or heavily demote the marquee
- Reduce draggables to one signature interactive artifact or remove dragging entirely
- Keep the brutalist color system and card language
- Tighten hero sequencing and improve section pacing
- Make the route cards feel like a deliberate fork in the experience

## Constraints

- Preserve existing routes and navigation structure
- Preserve mobile usability
- Avoid heavy, chaotic motion
- Keep implementation maintainable in the current Vite + React codebase

## Success Criteria

- The homepage reads as premium and intentional
- Motion improves comprehension rather than distracting from it
- The visitor understands identity, credibility, and next-step choices in sequence
- The site remains bold and memorable without feeling gimmicky
