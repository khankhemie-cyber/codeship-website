# Builders Teacher Manual
**Document ID:** CSA-BLD-TM-EN-v1.0 · **Program:** Builders (Grades 2–3) · Companion to CSA-BLD-MCM-EN

---

## How to use this volume

One block per session: objectives, materials, minute-by-minute plan, callouts. Timing: Warm-up 5 → Teach 10 → Build 30 → Reflect 10; quiz days (x.3, x.5) open with the 10-minute quiz + 5-minute re-teach. References: workbook CSA-BLD-SW-EN, printables CSA-BLD-PRB-EN, quizzes CSA-BLD-AM-EN. 💻 = online adaptation.

**Preparation checklist (every session):** room/tech per OPS §2 · editor + today's starter file open on every device · printable copied · tag reference cards on tables · fallback pack ready.

> **📌 Teacher Note (program-wide):** live-code everything on the big screen, slowly, narrating each character ("angle bracket… h1… angle bracket…"). Make deliberate mistakes and fix them aloud — Builders learn debugging by watching you be cheerfully wrong.

---

## Semester 1 — All About Me Page

### S1.1 What Is a Website?
**Objectives:** identify page parts (heading/paragraph/image); type a first `<h1>` and see it render.
**Materials:** printed "page parts" scavenger sheets (PRB-1); starter file `about-me-1`; workbook p. S1.1.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | "What's your favourite website or app? What do you SEE on it?" — collect: big words, small words, pictures, buttons. |
| 5–15 | Teach | Big screen: a real page (kid-safe) → the same page's code, briefly — "everything you see is written in a language called HTML." Type `<h1>Hello, Builders!</h1>` in the split editor; the preview updates live. Gasp moment. |
| 15–45 | Build | **Diagnostic:** page-parts scavenger hunt on paper (AM §3). Then devices: type your own `<h1>` with your first name, add a second one, change the words. Core: 2 headings edited. Stretch: try `<h2>` and describe the difference. |
| 45–55 | Reflect | Circle: "HTML tells the page what things ARE." Workbook: label the page parts. |

> **🗣 Suggested Dialogue:** "Blocks were training wheels. Today you wrote the same language professional web developers write. Real code. That was you."
> 💻 Online: scavenger hunt becomes a shared-screen point-and-name game.

### S1.2 Tag Team
**Objectives:** use `<h1>`, `<h2>`, `<p>` correctly; explain open/close pairs.
**Materials:** tag cards (PRB-2); starter `about-me-2`; workbook p. S1.2.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Tag-card match: hold up `<p>` — class shows its partner `</p>`. |
| 5–15 | Teach | Tags hug their words: `<p>` opens the hug, `</p>` closes it. Live-code a heading + two paragraphs; break one on purpose (forget `</p>`) and watch the page misbehave; fix it. |
| 15–45 | Build | Students write: 1 `<h1>` (their name), 2 `<h2>` section headings ("Things I Love", "My Family… " etc. — their choice), 1 `<p>` under each. Lighter: fill-in-the-tag starter. Stretch: third section, or `<strong>` for one word. |
| 45–55 | Reflect | Partner reads your page in the preview: "does every heading match its story?" Workbook tag-hug page. |

### S1.3 Pictures & Order (Quiz Q1)
**Objectives:** add `<img>` with alt text; order content sensibly.
**Materials:** Q1 (AM); class-safe image folder pre-loaded; workbook p. S1.3.

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q1 | Tags & page parts (read items aloud). |
| 10–15 | Re-teach | Rebuild the most-missed tag pair live. |
| 15–45 | Build | Add an image from the class folder: `<img src="..." alt="...">` — "alt text is what the picture SAYS if eyes can't see it." Reorder page so image sits with its section. Core: 1 image with alt. Stretch: image per section. |
| 45–55 | Reflect | "Why does alt text matter?" (accessibility conversation, age-level). Goal set. |

> **⚠️ Watch For:** filename typos are the #1 image bug. Teach copy-paste of filenames, not retyping.

### S1.4 The Page Skeleton
**Objectives:** describe head vs. body; nest correctly; plan final page.
**Materials:** skeleton poster (PRB-3); paper wireframe planner (PRB-4).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Human skeleton stretch: "head holds the page's name; body holds everything you SEE." |
| 5–15 | Teach | Show full skeleton: `<html>` → `<head>` (with `<title>`) → `<body>`. Nesting = boxes inside boxes. Change the `<title>` and find it in the browser tab — delight moment. |
| 15–45 | Build | Wireframe the final All About Me page on paper (sections, image spots), then organize real code to match: everything in the right part of the skeleton, sections in chosen order. |
| 45–55 | Reflect | Swap wireframes: "can your partner find each wireframe box in your real page?" |

### S1.5 All About Me — publish day (Quiz Q2)
**Objectives:** complete and present the structured page, safe-sharing applied.
**Materials:** Q2; safe-sharing checklist (PRB-5); rubric (AM §6); Home Link (PRB-6).

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q2 | Semester quiz (tags, structure). |
| 10–15 | Re-teach | Fix-the-skeleton speed round. |
| 15–45 | Build | Finish pages. **Safe-sharing check** (from Explorers' footprint, now for the web): first name only, no address/school/phone, images from class folder only. Rehearse the 3-line tour: "My page has… My favourite tag is… I'm proud of…" Rubric scoring during circulation. |
| 45–55 | Reflect | Gallery walk on devices + presentations; "I like… / I wonder…" pairs. Home Link goes home. |

---

## Semester 2 — Weather Helper

### S2.1 Same Page, New Clothes
**Objectives:** connect CSS; change colours/fonts; state HTML=structure, CSS=style.
**Materials:** starter `weather-1` (an unstyled page); CSS property cards (PRB-7).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Show the same plain page twice — one styled beautifully. "Same words. What changed?" |
| 5–15 | Teach | "HTML is the body; CSS is the clothes." Live: `h1 { color: teal; }` — one rule, whole page responds. Anatomy chant: selector { property: value; } — don't forget the semicolon! |
| 15–45 | Build | Students style the starter: heading colour, background colour, font-family (from a card of 4 kid-safe choices). Core: 3 rules. Lighter: edit values in pre-written rules. Stretch: style `h2` differently from `h1`. |
| 45–55 | Reflect | "Show your wildest rule." Workbook: my favourite property. |

### S2.2 Lists of Everything
**Objectives:** build `<ul>`/`<ol>`; choose the right one.
**Materials:** starter `weather-2`; list sort cards (PRB-8).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Card sort: "steps to brush teeth" vs "favourite fruits" — which needs numbers? |
| 5–15 | Teach | `<ul>` = bullet list (order doesn't matter), `<ol>` = numbered (order matters), `<li>` = each item. Live-build one of each. |
| 15–45 | Build | Weather content begins: a `<ul>` of "what to wear when it's snowy" + an `<ol>` "how to get ready for a rainy day". Core: both lists. Stretch: style list items with CSS. |
| 45–55 | Reflect | Partner check: "did they pick ul/ol right? Why?" |

### S2.3 Class Acts (Quiz Q3)
**Objectives:** use classes to style specific elements.
**Materials:** Q3; starter `weather-3`.

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q3 | CSS + lists. |
| 10–15 | Re-teach | Selector-anatomy rebuild from misses. |
| 15–45 | Build | Problem: "I want THIS heading blue and THAT one orange." Classes: `class="snowy"` + `.snowy { color: lightblue; }`. Students give each weather section its own mood class. Core: 2 classes. Stretch: class that styles multiple things (colour + size). |
| 45–55 | Reflect | "How did you make sections feel different?" Goal: which seasons will your Helper cover? |

### S2.4 Building the Helper
**Objectives:** assemble the full Weather Helper.
**Materials:** wireframe planner; all starters merged (`weather-full`).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Selector pop quiz with cards (selector? property? value?). |
| 5–15 | Teach | Walk the assembly plan: per season — h2 + dress list + mood styling. Model one season fully. |
| 15–45 | Build | Students build 2+ seasons with lists and class-styled moods. Circulate with the tag-doctor checklist for breakages. |
| 45–55 | Reflect | Self-check against success criteria card; goal for demo day. |

### S2.5 Weather Helper — demo day (Quiz Q4)
**Objectives:** finish, polish, present.
**Materials:** Q4; rubric; Home Link.

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q4 | Semester quiz (CSS, lists, classes). |
| 10–15 | Re-teach | Most-missed rule, live. |
| 15–45 | Build | Final polish; rehearse: "My Helper covers ___ weather. I styled it to feel ___ because ___." Rubric scoring. |
| 45–55 | Reflect | Demos + warm feedback. "Someone could really use this before school!" |

---

## Semester 3 — Class Pet Care Guide

### S3.1 Who Is Our Pet?
**Objectives:** choose the pet; gather facts; plan sections.
**Materials:** fact organizer (PRB-9); pet picture bank.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | "Who has cared for an animal? What did you have to KNOW?" |
| 5–15 | Teach | This semester we write a guide a *pet-sitter could truly follow*. Audience thinking: what do THEY need? Class chooses the pet (real class pet, or vote on an imagined one). Model the fact organizer (Eats / Plays / Needs / Watch out). |
| 15–45 | Build | Pairs fill fact organizers (books/printed fact sheets provided — supervised research). Plan guide pages: Home / Feeding / Play & Care. |
| 45–55 | Reflect | Share one fact that surprised you. |

### S3.2 Follow the Link
**Objectives:** link two pages with `<a>`; explain how links make "the web".
**Materials:** starter `pet-guide` (two blank linked-ready pages).

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Human web: ball of yarn across the circle — "pages hold hands. Those hands are links." |
| 5–15 | Teach | Live: `<a href="feeding.html">Feeding</a>` — click it, we travel! Then the link back. Two rules: href must match the filename exactly; every page needs a way home. |
| 15–45 | Build | Students create Home + Feeding pages and link them both ways. Core: working round trip. Stretch: third page linked. |
| 45–55 | Reflect | Partner clicks every link on your pages. Fix dead ends together. |

### S3.3 Write So They Can Do It (Quiz Q5)
**Objectives:** write clear numbered instructions using informational-writing rules.
**Materials:** Q5; sabotaged-instructions demo; writing frame (PRB-9 reverse).

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q5 | Links + guide planning. |
| 10–15 | Re-teach | Broken-link autopsy from quiz results. |
| 15–45 | Build | Teach moment inside Build: instructor literally follows a child's verbal "how to feed" instructions robot-style (calls back to Explorers!) — vague steps fail funny. Rules chart: start with a verb · one action per step · in order. Students draft feeding steps on the frame, then code them as an `<ol>` on the Feeding page. |
| 45–55 | Reflect | Partner reads your steps: "could you do this with no help?" Revise one step. |

### S3.4 Building the Guide
**Objectives:** assemble the multi-page guide with navigation.
**Materials:** full starter; nav strip snippet card.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Instructions chant: verb first, one action, in order. |
| 5–15 | Teach | Model the nav strip (same links on every page) and page assembly: facts into sections, steps into lists, one image per page with alt. |
| 15–45 | Build | Assemble all pages: Home (about pet), Feeding (steps), Play & Care (facts + list). Style with last semester's CSS skills. Tag-doctor rounds. |
| 45–55 | Reflect | Full click-through with the link checklist (PRB-10 reverse). Goal for handover. |

### S3.5 Guide handover day (Quiz Q6)
**Objectives:** test everything; present for a real audience.
**Materials:** Q6; rubric; Home Link.

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q6 | Semester quiz (links, informational writing). |
| 10–15 | Re-teach | Class-vote re-teach. |
| 15–45 | Build | Final test + polish. Rehearse handover: "If you looked after our pet, my guide shows you ___." Rubric scoring. |
| 45–55 | Reflect | Handover presentations — ideally to a real guest (office staff, another class's teacher 💻 or a parent volunteer online) who asks one genuine question each. |

---

## Semester 4 — Save the Bees Awareness Site

### S4.1 Why Bees?
**Objectives:** gather facts; split fact vs. opinion; draft a persuasive headline.
**Materials:** bee fact sheets (PRB-11); fact/opinion cards.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | "Convince me in one sentence to try your favourite food. GO." |
| 5–15 | Teach | This semester: making people CARE. Bees: why they matter (pollination → food). Fact vs. opinion sort as a class ("Bees pollinate a third of our food crops" vs "Bees are the best insect"). Persuasive headlines: strong verb + why-you-care ("Bees feed you. Feed them back."). |
| 15–45 | Build | Fact hunt on the sheets: each student collects 3 facts + drafts 2 headlines on the planner. Class headline gallery — stars for favourites. |
| 45–55 | Reflect | "Which classmate headline made you feel something? Why?" |

### S4.2 Design That Cares
**Objectives:** use styling deliberately to strengthen a message.
**Materials:** starter `bees-1`; two contrast demo pages.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Two identical-text pages: one grey and tiny, one warm and bold. "Which makes you care?" |
| 5–15 | Teach | Design has feelings: colour mood (bee golds/greens), size = importance (`font-size`), emphasis (`strong`, class highlights). Restraint rule: 2–3 colours, not 10. |
| 15–45 | Build | Build the top of the site: headline styled to matter, first fact paragraphs, bee image with alt. Core: styled headline + 2 facts. Stretch: highlight class for key words. |
| 45–55 | Reflect | Squint test in pairs: "what's the FIRST thing you see? Is it the right thing?" |

### S4.3 Calls to Action (Quiz Q7)
**Objectives:** write a call to action; add an action list; digital-footprint check.
**Materials:** Q7; action ideas sheet.

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q7 | Persuasion + design. |
| 10–15 | Re-teach | Fact/opinion lightning sort. |
| 15–45 | Build | Call to action = telling your reader exactly what to do ("Plant one flower this spring"). Students add a "What You Can Do" `<ul>` of 3 doable actions + a closing CTA line. **Footprint check:** our site speaks for us — is everything true, kind, and safe to publish? (facts checked, no personal info, images from class bank). |
| 45–55 | Reflect | Read CTAs aloud — class thumbs: "would you actually do it?" |

### S4.4 Building the Campaign
**Objectives:** assemble and polish the full site.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Persuasion checklist chant: headline, facts, feelings, action. |
| 5–15 | Teach | Model final assembly order and the polish pass (spacing, consistent classes, alt text everywhere). |
| 15–45 | Build | Full assembly: headline, 3 facts, action list, CTA, image(s). Tag-doctor + footprint checks. Stretch: second page ("More Bee Facts") linked with nav. |
| 45–55 | Reflect | Self-score against success criteria card; launch-day goal. |

### S4.5 Campaign launch day (Quiz Q8)
**Objectives:** present persuasively; measure the "did you care?" response.
**Materials:** Q8; rubric; Home Link + capstone note.

| Time | Phase | Plan |
|------|-------|------|
| 0–10 | Quiz Q8 | Semester quiz (integration). |
| 10–15 | Re-teach | Class-choice replay. |
| 15–45 | Build | Final polish + rehearsal: 30-second "campaign speech" using their own headline and CTA. Rubric scoring. |
| 45–55 | Reflect | Launches: each Builder presents; audience answers "one thing I'll actually do." Capstone teaser: "Next: a whole site about a real hero near you." |

---

## Capstone — Community Helper Website

### C.1 My Helper, My Site
**Objectives:** choose a real community helper; plan a multi-page site; build page one.
**Materials:** site map planner (PRB-12); helper idea cards for the stuck.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | "Who helped you this week that isn't family?" — collect: crossing guard, librarian, dentist, coach… |
| 5–15 | Teach | The brief: a real multi-page website celebrating a helper in your community. Show the planner: Page 1 = Who they are (inform), Page 2 = Why they matter (persuade). Requirement check on the planner mirrors the rubric. |
| 15–45 | Build | Plan (10 min cap), then build page one with skeleton, headings, paragraphs, image, styling. Instructor coaches with questions only. |
| 45–55 | Reflect | Stand-up: "My site celebrates ___ because ___." |

### C.2 Launch & Celebrate
**Objectives:** finish site + navigation; present at family showcase.
**Materials:** presentation frames (PRB-13); certificates (PRB-17, AM §9); rubric.

| Time | Phase | Plan |
|------|-------|------|
| 0–5 | Warm-up | Quiet setup; silent frame rehearsal. |
| 5–15 | Teach | Launch checklist: links round-trip · alt text · safe-sharing · squint test. Presentation mini-lesson: show the click journey. |
| 15–45 | Build | Finish + rehearse in pairs; capstone rubric scoring; showcase stations set. |
| 45–55 | Reflect | **Family showcase:** "My site celebrates… Watch what happens when I click… I'm proud of…" Certificates presented. If the helper can attend or receive the site (per consent rules), even better. |

---

## Troubleshooting quick table

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| Page shows raw code | Missing `>` or filename not .html | Tag-doctor checklist step 1 |
| Everything went huge/bold | Unclosed tag swallowing the page | Find the lonely open tag (checklist step 2) |
| Image won't show | src typo / wrong folder | Copy-paste the filename; class folder only |
| Link goes nowhere | href ≠ filename | Match exactly, including .html |
| CSS "does nothing" | Missing semicolon/brace, or selector typo | Read the rule aloud: selector { property: value; } |
| Child despairs at typos | Age-normal motor/spelling | Normalize: "pros make this typo daily"; pair-check |

## Homework guidance

No required homework. Home Links offer optional paper-first activities (wireframe your dream page; spot lists in the kitchen; find a persuasive poster in the wild). If families ask for more, the class editor may be used at home for 20-minute sessions — never required.

## Parent talking points (pickup)

- "Ask them what a tag is — they'll draw the hug."
- "They wrote real HTML today, same language as every website they've seen."
- "Ask: fact or opinion — 'pizza is the best food'?" (S4)

## Closure script (every session)

"Builders, save your page… hands off keyboards, eyes here. Say our line with me: HTML is the structure, CSS is the style. Goal for next week is on the board — Dream. Code. Achieve!"

## Revision history

| Version | Date | Author role | Change |
|---------|------|-------------|--------|
| 1.0 | 2026-07-14 | Senior Instructional Designer | First published edition |
