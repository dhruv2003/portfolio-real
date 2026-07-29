# Homepage Cinematic Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the homepage into a guided cinematic experience using `GSAP` for macro choreography while preserving the existing brutalist visual language.

**Architecture:** Keep routing and overall page composition intact, but refactor the homepage into clearer content groups with dedicated refs for timeline control. Use `GSAP` plus `ScrollTrigger` for page-level sequencing, while leaving simple hover polish in CSS and only keeping lightweight `motion/react` usage where it still makes sense.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, `motion/react`, `gsap`

---

### Task 1: Add animation dependency

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install `gsap`**

Run: `npm install gsap`

Expected: `package.json` gains a `gsap` dependency and `package-lock.json` updates accordingly.

- [ ] **Step 2: Verify dependency was recorded**

Run: `rg -n '"gsap"' package.json package-lock.json`

Expected: both files contain `gsap`.

### Task 2: Refactor homepage structure for timeline control

**Files:**
- Modify: `src/app/routes/Home.tsx`

- [ ] **Step 1: Group the homepage into explicit narrative sections**

Create ref-targetable wrappers for:

- header / hero shell
- identity content
- credibility content
- choice content

Expected result: the JSX still renders the same route, but major story beats have stable containers for animation hooks.

- [ ] **Step 2: Remove noisy continuous motion**

Replace or remove:

- the constantly moving marquee
- most draggable decorative shapes
- extra simultaneous hero motion

Expected result: only one signature interactive artifact remains, or dragging is removed completely.

### Task 3: Add GSAP hero timeline

**Files:**
- Modify: `src/app/routes/Home.tsx`

- [ ] **Step 1: Register `ScrollTrigger` and create refs**

Add imports for `gsap` and `ScrollTrigger`, then create refs for:

- hero badge
- hero heading lines
- terminal artifact
- supporting props
- scroll cue

- [ ] **Step 2: Implement a mount-time hero timeline**

Sequence the hero so the elements enter in a controlled order with short overlaps:

1. badge
2. headline
3. terminal artifact
4. supporting props
5. scroll cue

Expected result: the hero feels deliberate and cinematic rather than playful-chaotic.

### Task 4: Add guided scroll transitions

**Files:**
- Modify: `src/app/routes/Home.tsx`

- [ ] **Step 1: Animate the credibility section as one composed reveal**

Use `ScrollTrigger` to fade and translate the credibility card and related content into view as a single staged sequence.

- [ ] **Step 2: Animate the route-choice section as an intentional fork**

Reveal the two route cards with slightly different timing and emphasis so:

- `Interactive Terminal` feels exploratory
- `Manual Mode` feels structured

- [ ] **Step 3: Keep pinning minimal**

Only add a short desktop-only pin if the transition from hero to credibility feels weak without it.

### Task 5: Clean up motion ownership

**Files:**
- Modify: `src/app/routes/Home.tsx`

- [ ] **Step 1: Reduce `motion/react` to lightweight cases**

Keep only simple hover or local interactions that do not conflict with `GSAP`.

- [ ] **Step 2: Ensure motion respects mobile usability**

Avoid long pins, large transforms, or interaction patterns that make mobile scrolling awkward.

### Task 6: Verify and polish

**Files:**
- Modify: `src/app/routes/Home.tsx`

- [ ] **Step 1: Run a production build**

Run: `npm run build`

Expected: Vite completes successfully with no type or bundling errors.

- [ ] **Step 2: Sanity-check the final dependency and route file**

Run: `rg -n 'gsap|ScrollTrigger|useRef|useEffect' src/app/routes/Home.tsx package.json`

Expected: the homepage shows the new animation setup and `package.json` includes `gsap`.

- [ ] **Step 3: Review the homepage for scope drift**

Check that the work changed only the homepage motion system and did not alter unrelated routes.
