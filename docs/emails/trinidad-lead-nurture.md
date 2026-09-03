# Trinidad & Tobago — Lead Broadcast Email

One email to **all Trinidad leads**. It lists the five online programs; each has
its own button that clicks through to the matching `/tt` landing page, where the
lead completes registration on the HubSpot form. Leads self-select the program
they want.

- **HTML version (paste into HubSpot / your ESP):** [`trinidad-lead-nurture.html`](./trinidad-lead-nurture.html)
- **Plain-text version:** below
- Replace `{{ firstName }}` and `{{ unsubscribe_link }}` with your ESP's merge fields.

## Landing page URLs (one per program)

| Program | Landing page (with email UTMs) |
|---|---|
| Online Coding Classes | `https://www.codeshipacademy.com/tt/online-coding-classes?utm_source=email&utm_medium=email&utm_campaign=trinidad-lead-nurture&utm_content=online-coding-classes` |
| Mathematics, Language Arts & Coding | `https://www.codeshipacademy.com/tt/math-language-arts-coding?utm_source=email&utm_medium=email&utm_campaign=trinidad-lead-nurture&utm_content=math-language-arts-coding` |
| SEA Skill-Building & Digital Skills | `https://www.codeshipacademy.com/tt/sea-digital-skills?utm_source=email&utm_medium=email&utm_campaign=trinidad-lead-nurture&utm_content=sea-digital-skills` |
| Computer Classes for Kids | `https://www.codeshipacademy.com/tt/computer-classes-for-kids?utm_source=email&utm_medium=email&utm_campaign=trinidad-lead-nurture&utm_content=computer-classes-for-kids` |
| Online STEM Classes | `https://www.codeshipacademy.com/tt/online-stem-classes?utm_source=email&utm_medium=email&utm_campaign=trinidad-lead-nurture&utm_content=online-stem-classes` |

The clean landing-page URLs (no UTMs) are:

- https://www.codeshipacademy.com/tt/online-coding-classes
- https://www.codeshipacademy.com/tt/math-language-arts-coding
- https://www.codeshipacademy.com/tt/sea-digital-skills
- https://www.codeshipacademy.com/tt/computer-classes-for-kids
- https://www.codeshipacademy.com/tt/online-stem-classes

## Subject line options

1. Choose your child's online class — Trinidad & Tobago
2. Pick a program and complete your CODEship registration
3. 5 live online programs for your child — pick one to register
4. Ready to register? Choose your child's CODEship program

**Preview text:** Live, beginner-friendly online classes for kids across Trinidad & Tobago — pick the one that fits and register.

## Plain-text version

```
Hi {{ firstName }},

Thank you for your interest in CODEship. We run live, beginner-friendly online
classes that help children across Trinidad and Tobago move from simply using
technology to building with it.

Below are our five online programs. Pick the one that fits your child and click
its link to see the details and finish your registration.

1) ONLINE CODING CLASSES
Beginner-friendly live coding — your child builds a real interactive project and
learns to explain how it works.
Register: https://www.codeshipacademy.com/tt/online-coding-classes?utm_source=email&utm_medium=email&utm_campaign=trinidad-lead-nurture&utm_content=online-coding-classes

2) MATHEMATICS, LANGUAGE ARTS & CODING
Connects key school skills — Mathematics, Language Arts and Creative Writing —
with coding and project-based learning.
Register: https://www.codeshipacademy.com/tt/math-language-arts-coding?utm_source=email&utm_medium=email&utm_campaign=trinidad-lead-nurture&utm_content=math-language-arts-coding

3) SEA SKILL-BUILDING & DIGITAL SKILLS
Live enrichment that strengthens problem-solving, reasoning, written explanation
and digital confidence before secondary school.
Register: https://www.codeshipacademy.com/tt/sea-digital-skills?utm_source=email&utm_medium=email&utm_campaign=trinidad-lead-nurture&utm_content=sea-digital-skills

4) COMPUTER CLASSES FOR KIDS
Practical computer skills, coding basics and safer, more confident technology
habits — built through hands-on projects.
Register: https://www.codeshipacademy.com/tt/computer-classes-for-kids?utm_source=email&utm_medium=email&utm_campaign=trinidad-lead-nurture&utm_content=computer-classes-for-kids

5) ONLINE STEM CLASSES
Coding, Mathematics thinking, writing and logic combined into practical STEM
projects your child builds, explains and presents.
Register: https://www.codeshipacademy.com/tt/online-stem-classes?utm_source=email&utm_medium=email&utm_campaign=trinidad-lead-nurture&utm_content=online-stem-classes

EVERY PROGRAM INCLUDES:
- Four live, instructor-led online classes (one per week)
- Small-group, beginner-friendly learning
- A practical digital project your child builds and keeps
- TT$600 for the four-week program (TT$150 per live class)

Not sure which program is the best fit? Just reply to this email and our team
will help you choose.

CODEship is an independent online enrichment program for children across
Trinidad and Tobago. It supports school-related skills — it is not an official
SEA program, is not Ministry-approved or endorsed, and does not guarantee grades,
examination results or secondary-school placement. A laptop or desktop computer
and an internet connection are required.

CODEship Academy — www.codeshipacademy.com
Unsubscribe: {{ unsubscribe_link }}
```

## Notes

- **Attribution:** every link carries `utm_source=email`, `utm_medium=email`,
  `utm_campaign=trinidad-lead-nurture`, and a per-program `utm_content`. The `/tt`
  landing pages forward these onto the `/register` HubSpot form, so click-through
  and completed registrations stay attributable by program.
- **Fee/cohort facts** mirror `src/data/trinidadCampaigns.ts`
  (`TT$600` / `TT$150` per class). The email intentionally does **not** hardcode a
  cohort start date so it won't go stale between sends — the landing pages show the
  current cohort date.
- **Compliance:** the SEA disclaimer from `TRINIDAD_COMPLIANCE_DISCLAIMER` is
  reproduced in the footer; keep it on any SEA-related send.
