import type { Article } from "./articles";
import { barChart, checklist, dataTable, steps } from "@/lib/articleCharts";

/**
 * "ABA + coding & robotics" cluster: three research-backed resources written for
 * ABA clinics, BCBAs and families, pointing to /partners/aba-clinics.
 * Every figure here is taken from the cited source; keep it that way on edits.
 */

const PARTNER_LINK = { label: "Partner with CODEship: ABA clinics", href: "/partners/aba-clinics" };

const SRC = {
  phacCcdss: {
    title: "Understanding autism data in the Canadian Chronic Disease Surveillance System",
    publisher: "Public Health Agency of Canada",
    date: "2025-12-10",
    url: "https://health-infobase.canada.ca/src/doc/autism-blog/Understanding-autism-data.pdf",
  },
  phacChscy: {
    title: "Chronic conditions in childhood: Prevalence (Canadian Health Survey on Children and Youth, 2019 and 2023)",
    publisher: "Public Health Agency of Canada, Health Infobase",
    date: "2026-03-16",
    url: "https://health-infobase.canada.ca/chronic-conditions/childhood/prevalence.html",
  },
  statcanYouth: {
    title: "Youth with Disabilities: Education and Employment, 2022",
    publisher: "Statistics Canada, The Daily",
    date: "2025-01-27",
    url: "https://www150.statcan.gc.ca/n1/daily-quotidien/250127/dq250127a-eng.htm",
  },
  ccrw: {
    title: "Future in Focus 2025 Trends Report: From Divide to Inclusion: Digital Access, Accessibility, and Skills Development for Persons with Disabilities",
    publisher: "Canadian Council on Rehabilitation and Work (CCRW)",
    date: "2025-11-20",
    url: "https://ccrw.org/wp-content/uploads/2025/11/From-Divide-to-Inclusion-Digital-Access-Accessibility-and-Skills-Development-for-Persons-with-Disabilities_CCRW-Trends-Report-2025.pdf",
  },
  marchOfDimes: {
    title: "Identifying the experiences, challenges and opportunities along pathways for community-based digital skill development for young people with disabilities in Canada: a community-based research study",
    publisher: "Frontiers in Rehabilitation Sciences",
    authors: "Armas, A., Buttle, C., Johnston, E., Avila Patro, G., Reynolds, B., Thompson, H., Karuza, D., Olaomi, A., & Rhodes, K.",
    date: "2026-08-04",
    url: "https://doi.org/10.3389/fresc.2026.1870194",
  },
  phacNetwork: {
    title: "Government of Canada announces the organization to establish and lead the National Autism Network",
    publisher: "Public Health Agency of Canada",
    date: "2025-03-21",
    url: "https://www.canada.ca/en/public-health/news/2025/03/government-of-canada-announces-the-organization-to-establish-and-lead-the-national-autism-network.html",
  },
  cp24: {
    title: "Parents slam 'make-work project' for private administrator of Ontario's autism program",
    publisher: "CP24",
    authors: "Woodward, J.",
    date: "2026-07-10",
    url: "https://www.cp24.com/politics/queens-park/2026/07/10/parents-slam-make-work-project-for-private-administrator-of-ontarios-autism-program/",
  },
  icub: {
    title: "Enhancing theory of mind in autism through humanoid robot interaction in a randomized controlled trial",
    publisher: "Scientific Reports (Nature Portfolio)",
    authors: "Ghiglino, D., Floris, F., De Tommaso, D., Russi, N. S., Frulli, A., Moretti, S., & Wykowska, A.",
    date: "2025-07-29",
    url: "https://doi.org/10.1038/s41598-025-12253-7",
  },
  metaAnalysis: {
    title: "The Role of Social Robot in Enhancing Social–Emotional Skill Development in Children With Autism: A Three-Level Meta-Analysis",
    publisher: "Journal of Computer Assisted Learning (Wiley)",
    authors: "Zhong, W., Luo, J., Luo, L., & Lyu, Y.",
    date: "2025-11-10",
    url: "https://doi.org/10.1111/jcal.70154",
  },
  kurnaz: {
    title: "Effectiveness of Video Self-Modeling in Teaching Unplugged Coding Skills to Children with Autism Spectrum Disorders",
    publisher: "Behavioral Sciences (MDPI)",
    authors: "Kurnaz, E.",
    date: "2025-02-26",
    url: "https://doi.org/10.3390/bs15030272",
  },
  hutchison: {
    title: "Robotics as a tool for STEM inclusion: Implementation of an after-school robotics program for students with Autism Spectrum Disorder",
    publisher: "Journal of Research on Technology in Education (Taylor & Francis)",
    authors: "Hutchison, A., & Barnard-Brak, L.",
    date: "2025-05-20",
    url: "https://doi.org/10.1080/15391523.2025.2504356",
  },
  scoping: {
    title: "Programming Education for Students with Autism: A Scoping Review of Pedagogical Strategies and Tools Between 2017–2025",
    publisher: "Education. Innovation. Diversity (Riga Technical University)",
    authors: "Topaloglou, A., Tsiomi, E., Nanou, A., & Karampatzakis, D.",
    date: "2026-07-17",
    url: "https://doi.org/10.17770/eid2026.1.107",
  },
};

const a = (s: { url: string }, text: string) => `<a href="${s.url}" target="_blank" rel="noopener">${text}</a>`;

/* ---------------------------------------------------------------- 1 */

const abaAndCoding: Article = {
  slug: "aba-and-coding-robotics-research-2026",
  title: "ABA and Coding: How Behaviour Analysis and Robotics Work Together (2025–2026 Research)",
  metaDescription:
    "How ABA principles like task analysis, prompting and reinforcement fit coding and robotics for autistic children. 2025–2026 studies, a chart of effect sizes and a clinic checklist.",
  category: "partners",
  readTime: 8,
  publishDate: "2026-11-24",
  author: "CODEship Academy Team",
  cluster: "aba-coding",
  targetQuery: "ABA therapy and coding for autistic children",
  internalLinks: [
    PARTNER_LINK,
    { label: "Autism in Canada: the 2025–2026 data", href: "/resources/autism-in-canada-2026-data-inclusive-coding" },
    { label: "ABA clinic partnership checklist", href: "/resources/aba-clinic-coding-robotics-partnership-checklist" },
  ],
  keyTakeaways: [
    "Coding and robotics fit ABA well: both break skills into small steps, give instant feedback and reward success.",
    "A 2025 randomized trial built ABA principles into robot-assisted sessions and improved social cognition in autistic children aged about 7.",
    "A 2025 meta-analysis of 20 trials (532 autistic children) found social robots had a moderate positive effect on social–emotional skills (g = 0.51).",
    "A 2025 single-case study taught coding to autistic children with video self-modeling. All four learned it, used it in a new setting and kept it for up to 12 weeks.",
    "The best results come when a BCBA sets the goals and the coding instructor delivers fun, structured projects.",
  ],
  sources: [SRC.metaAnalysis, SRC.icub, SRC.scoping, SRC.hutchison, SRC.kurnaz],
  content: `
<p><strong>Quick answer:</strong> Applied behaviour analysis (ABA) and coding share the same building blocks. Both break a big skill into small steps, give clear feedback right away, and reward each success. Research from 2025 and 2026 shows that coding and robotics, taught with ABA methods, help autistic children learn new skills and keep them.</p>

<h2>Why ABA and coding fit together</h2>
<p>A computer program is a set of steps in a fixed order. That is also how a BCBA writes a task analysis. When a child drags a block and the robot moves, the feedback is instant and the same every time. Robots do not get tired, change their tone or show frustration. For many autistic learners, that predictability lowers stress and frees up attention for learning.</p>
<p>Coding also gives a clinic something it often needs: a highly motivating activity that can carry real targets. Turn-taking, requesting help, following multi-step directions, tolerating errors and flexible thinking can all be practised inside a coding or robotics project.</p>

<h2>ABA techniques, mapped to coding and robotics</h2>
${dataTable({
  caption: "How common ABA methods show up in a coding or robotics session",
  headers: ["ABA method", "What it looks like in coding and robotics", "Example target"],
  rows: [
    ["Task analysis", "A project is split into short steps: open the editor, add a start block, add a move block, run, check.", "Completes a 5-step build with fewer prompts"],
    ["Prompting and fading", "Instructor points, models, then just waits. Picture cards fade out as the child gains skill.", "Moves from full model to independent"],
    ["Reinforcement", "The robot moving or the game working is a natural reinforcer. Points, badges and choice time can add to it.", "Stays on task for 10 minutes"],
    ["Video modeling", "A short clip shows a peer or the child completing the step correctly.", "Builds a sequence after watching once"],
    ["Generalization", "The same skill is used with a new robot, a new screen, a new room or a new partner.", "Debugs a program in a new setting"],
    ["Data collection", "Each step is scored. Coding tools often log attempts, so data is easy to collect.", "Percentage of steps done independently"],
    ["Social skills training", "Pair programming: one child drives, one navigates, then they swap.", "Asks a peer for help; takes turns"],
  ],
})}

<h2>What the 2025–2026 research shows</h2>

<h3>Robots that use ABA principles improve social cognition</h3>
<p>A ${a(SRC.icub, "randomized trial in <em>Scientific Reports</em> (July 2025)")} built Applied Behavior Analysis principles directly into robot-assisted training. Thirty-two autistic children, average age 7.5, practised perspective-taking, joint attention and reading intentions through role-play with the humanoid robot iCub. Social cognition improved with the robot. It did not improve with standard therapy or with the same protocol delivered by a person, which points to the robot itself as the active ingredient.</p>

<h3>A 2025 meta-analysis: moderate gains in social–emotional skills</h3>
<p>The ${a(SRC.metaAnalysis, "largest recent pooled analysis")}, published in the <em>Journal of Computer Assisted Learning</em> in November 2025, combined 20 trials and 64 effect sizes from 532 autistic children. Robot-assisted interventions had a moderate positive effect overall (Hedges' g = 0.51). The biggest gain was in social reciprocity. Children with more severe autism symptoms improved the most.</p>

${barChart({
  title: "Effect of social-robot interventions on autistic children's social–emotional skills (Hedges' g)",
  rows: [
    { label: "Social reciprocity", value: 0.72, tone: "dark" },
    { label: "Emotional competence", value: 0.49 },
    { label: "Verbal communication", value: 0.49 },
    { label: "Social cognition", value: 0.35 },
    { label: "Non-verbal communication", value: 0.32 },
    { label: "Overall effect", value: 0.51, tone: "accent" },
  ],
  max: 0.8,
  valueHeader: "Hedges' g",
  caption:
    "Robot-assisted sessions had the largest effect on social reciprocity (g = 0.72) and a moderate effect overall (g = 0.51). As a rough guide, 0.2 is small, 0.5 is moderate and 0.8 is large.",
  source: `Zhong et al., 2025, ${a(SRC.metaAnalysis, "<em>Journal of Computer Assisted Learning</em>")}. 20 trials, 532 children.`,
})}

<h3>Video self-modeling teaches coding, and the skills last</h3>
<p>In a ${a(SRC.kurnaz, "2025 single-case study in <em>Behavioral Sciences</em>")}, four autistic children aged 10 to 12 learned unplugged coding through video self-modeling, a common ABA strategy. The study used a multiple-probe design across participants. All four children learned the skill, all four used it in a new setting, and the skill held for up to 12 weeks. Parents and children rated the approach positively.</p>

<h3>Hands-on robots win, but sensory needs vary</h3>
<p>A ${a(SRC.hutchison, "seven-week after-school robotics and coding program")} for autistic elementary students, reported in May 2025, found a strong preference for touching and building real robots. Children also liked coding apps when they could see a physical result. Sensory reactions to robots varied a lot, so the authors call for a range of tools and a calm room. Parents and staff saw more engagement, better problem-solving and more social interaction. The main challenge was the need for individualized teaching and well-trained staff.</p>

<h3>What a 2026 review says works</h3>
<p>A ${a(SRC.scoping, "July 2026 scoping review")} of 16 studies (2017–2025) on teaching programming to autistic students found most programs used visual, block-based tools such as Scratch and Blockly. The strategies linked to better engagement and learning were scaffolding, visual supports, adjusted pacing and inclusive group work. The review also found a gap: educators need more training. That is exactly where a partnership between a clinic and a coding program helps.</p>

<h2>What this means for ABA clinics</h2>
<ul>
<li><strong>Coding is a strong vehicle for existing goals.</strong> It does not replace a treatment plan. It gives children a motivating place to practise it.</li>
<li><strong>Use block-based tools first.</strong> They remove typing and spelling barriers and fit the evidence base.</li>
<li><strong>Start hands-on.</strong> Physical robots and visible results hold attention best.</li>
<li><strong>Plan for generalization.</strong> Move skills across tools, rooms and partners, and collect data in each.</li>
<li><strong>Share roles.</strong> The BCBA owns goals and data. The coding instructor owns the curriculum and the fun.</li>
</ul>

${checklist({
  title: "Checklist: is this coding or robotics program ABA-friendly?",
  intro: "Use this when you evaluate any coding provider for your clinic or a client.",
  items: [
    "Lessons are broken into short, clear steps that can be written as a task analysis.",
    "Visual, block-based tools are used before typed code.",
    "Physical robots or visible results are part of every session.",
    "The instructor can follow a prompting hierarchy and fade prompts.",
    "Reinforcement can be built in, and the clinic can add its own reinforcers.",
    "Visual schedules, first-then boards and timers are welcome.",
    "Sensory needs are planned for: noise, lighting, breaks and a quiet space.",
    "Group sizes are small enough for 1:1 or 1:2 support when needed.",
    "The provider will share session notes so the BCBA can track data.",
    "Projects can be repeated across settings to support generalization.",
    "Instructors have current vulnerable sector checks and the provider is insured.",
    "There is a clear way to pause, adapt or end a session if a child is distressed.",
  ],
})}

<h2>How CODEship works with ABA teams</h2>
<p>CODEship teaches coding, AI and robotics to children in Kindergarten to Grade 8, in person in Oshawa, at partner sites and live online across Canada. Our classes already use short projects, visual block tools, flexible pacing and many ways to show learning. For clinics, we co-design sessions with your BCBA so each project carries your client's goals. ${'<a href="/partners/aba-clinics">See how a clinic partnership works</a>'}.</p>
`,
  faqs: [
    {
      question: "Can ABA therapy and coding be combined?",
      answer:
        "Yes. Coding and robotics break skills into small steps, give instant feedback and reward success, which matches ABA. A 2025 randomized trial built ABA principles into robot-assisted training and improved social cognition in autistic children.",
    },
    {
      question: "Do robots help autistic children learn social skills?",
      answer:
        "Research says yes, with a moderate effect. A November 2025 meta-analysis of 20 trials and 532 autistic children found social-robot interventions improved social–emotional skills (g = 0.51), with the biggest effect on social reciprocity (g = 0.72).",
    },
    {
      question: "What ABA strategies work for teaching coding?",
      answer:
        "Task analysis, prompting and fading, reinforcement, video modeling and planned generalization all work. A 2025 study taught coding to four autistic children with video self-modeling; all four learned it, used it in a new setting and kept it for up to 12 weeks.",
    },
    {
      question: "What coding tools are best for autistic children?",
      answer:
        "Visual, block-based tools such as Scratch and Blockly, plus hands-on robots. A 2026 review of 16 studies found these tools, with scaffolding, visual supports and adjusted pacing, were linked to better engagement and learning.",
    },
    {
      question: "Does coding replace ABA therapy?",
      answer:
        "No. Coding is a motivating setting where children practise goals from their treatment plan. The BCBA sets the goals and tracks data; the coding instructor delivers the projects.",
    },
  ],
};

/* ---------------------------------------------------------------- 2 */

const autismCanadaData: Article = {
  slug: "autism-in-canada-2026-data-inclusive-coding",
  title: "Autism in Canada: 2025–2026 Data and Why Every Child Needs Access to Coding",
  metaDescription:
    "New PHAC data: 1 in 44 Canadian children and youth are autistic. See the charts, Ontario Autism Program numbers, the digital skills gap for youth with disabilities, and what clinics can do.",
  category: "partners",
  readTime: 7,
  publishDate: "2026-11-24",
  author: "CODEship Academy Team",
  cluster: "aba-coding",
  targetQuery: "autism statistics Canada 2026",
  internalLinks: [
    PARTNER_LINK,
    { label: "ABA and coding: the research", href: "/resources/aba-and-coding-robotics-research-2026" },
    { label: "ABA clinic partnership checklist", href: "/resources/aba-clinic-coding-robotics-partnership-checklist" },
  ],
  keyTakeaways: [
    "PHAC's first national autism surveillance data (released fall 2025) puts autism at 1 in 44 Canadian children and youth (2.25%), up from 1 in 714 in 2000–2001.",
    "Parent-reported survey data show autism among children aged 1 to 17 rose from 2.0% in 2019 to 3.0% in 2023.",
    "In Ontario, about 23% of children registered in the Ontario Autism Program were enrolled in core clinical services as of March 2026.",
    "Youth with disabilities in Canada are more likely to be out of work, school and training (16.0% vs 9.2%).",
    "Early, inclusive coding and robotics programs can help close the digital skills gap before it starts.",
  ],
  sources: [SRC.phacCcdss, SRC.phacChscy, SRC.cp24, SRC.marchOfDimes, SRC.ccrw, SRC.phacNetwork, SRC.statcanYouth],
  content: `
<p><strong>Quick answer:</strong> About 1 in 44 children and youth in Canada are autistic, according to the Public Health Agency of Canada's first national autism surveillance data, released in fall 2025. That number has grown sharply over 20 years. At the same time, Canadian youth with disabilities are less likely to be working or in school, and many face barriers to digital skills. Inclusive coding and robotics, started early, is one practical way to change that.</p>

<h2>How many children in Canada are autistic?</h2>
<p>The Public Health Agency of Canada (PHAC) added autism to the Canadian Chronic Disease Surveillance System and ${a(SRC.phacCcdss, "published its first national autism data")} in fall 2025. Using health records for children and youth aged 1 to 19, prevalence rose from 1 in 714 (0.14%) in 2000–2001 to 1 in 44 (2.25%) in 2023–2024.</p>

${barChart({
  title: "Autism prevalence among children and youth in Canada, aged 1 to 19 (%)",
  rows: [
    { label: "2000–2001", value: 0.14, display: "0.14% (1 in 714)" },
    { label: "2023–2024", value: 2.25, display: "2.25% (1 in 44)", tone: "dark" },
  ],
  max: 2.5,
  valueHeader: "Prevalence",
  caption: "Autism prevalence in Canadian health records grew about 16-fold in 23 years. PHAC links the rise to more awareness, wider diagnostic criteria and earlier screening.",
  source: `Public Health Agency of Canada, ${a(SRC.phacCcdss, "Canadian Chronic Disease Surveillance System")}, 2025.`,
})}

<p>Survey data tell the same story. PHAC's ${a(SRC.phacChscy, "Canadian Health Survey on Children and Youth")} found autism among children aged 1 to 17 rose from 2.0% in 2019 to 3.0% in 2023. Boys were diagnosed more often than girls (4.3% vs 1.5%), but PHAC's records show the gap is narrowing: 4.0 times more new cases in males in 2000–2001, down to 2.3 times in 2023–2024.</p>

<h2>Children are being identified younger</h2>
<p>The rate of newly identified autism is now highest in the youngest children. That means more families start their support journey in the preschool years, often with ABA, and are looking for what comes next when their child starts school.</p>

${barChart({
  title: "Newly identified autism cases per 100,000 children, by age, 2023–2024",
  rows: [
    { label: "Ages 1–4", value: 689, display: "689", tone: "dark" },
    { label: "Ages 5–9", value: 489, display: "489" },
    { label: "All ages 1–19", value: 365, display: "365" },
  ],
  valueHeader: "Cases per 100,000",
  caption: "In 2023–2024, children aged 1 to 4 had the highest rate of new autism identification, at 689 per 100,000.",
  source: `Public Health Agency of Canada, ${a(SRC.phacCcdss, "CCDSS autism data")}, 2025.`,
})}

<h2>It varies by province</h2>
<p>Prevalence in 2023–2024 ranged from 1 in 75 (1.33%) in Saskatchewan to 1 in 34 (2.97%) in Prince Edward Island. PHAC says the gaps likely reflect differences in record-keeping, access to care and assessment, not real differences between children.</p>

<h2>Ontario: demand far ahead of services</h2>
<p>In Ontario, the Ontario Autism Program (OAP) funds core clinical services such as ABA. Figures obtained by the Ontario Autism Coalition and ${a(SRC.cp24, "reported by CP24 in July 2026")} show that as of March 2026, 89,799 children were registered and 24,360 were enrolled in core clinical services, about 23%.</p>

${barChart({
  title: "Ontario Autism Program, March 2026",
  rows: [
    { label: "Children registered", value: 89799, display: "89,799" },
    { label: "Enrolled in core clinical services", value: 24360, display: "24,360 (about 23%)", tone: "dark" },
  ],
  valueHeader: "Children",
  caption: "Fewer than 1 in 4 registered children were enrolled in core clinical services.",
  source: `Ontario Autism Coalition figures, as ${a(SRC.cp24, "reported by CP24")}, July 10, 2026.`,
})}

<p>For ABA clinics, this means long waitlists and families who want meaningful, structured activities in the meantime and alongside therapy. Group programs built around a child's interests, like coding and robotics, can fill that gap.</p>

<h2>The digital skills gap for youth with disabilities</h2>
<p>Statistics Canada's ${a(SRC.statcanYouth, "January 2025 release")} on youth with disabilities found the disability rate among 15- to 24-year-olds rose from 13.1% in 2017 to 20.1% in 2022. In 2022, only 41.8% of youth with disabilities were working, and they were more likely to be out of work, school and training.</p>

${barChart({
  title: "Youth aged 15 to 24 not in employment, education or training (NEET), Canada, 2022",
  rows: [
    { label: "Youth with disabilities", value: 16.0, display: "16.0%", tone: "dark" },
    { label: "Youth without disabilities", value: 9.2, display: "9.2%" },
  ],
  max: 20,
  valueHeader: "NEET rate",
  caption: "Youth with disabilities were about 1.7 times as likely to be out of work, school and training.",
  source: `Statistics Canada, ${a(SRC.statcanYouth, "The Daily")}, January 27, 2025.`,
})}

<p>Digital access is part of the problem. The Canadian Council on Rehabilitation and Work's ${a(SRC.ccrw, "2025 trends report")} found that about 35% of Canadians with disabilities hit technology barriers when filling out online applications, and 17% report barriers to Internet use, rising to 28% among those with very severe disabilities. A ${a(SRC.marchOfDimes, "2026 March of Dimes Canada study")} mapped seven pathways young people with disabilities take to build digital skills, and concluded those pathways need systemic change to become accessible.</p>

<h2>Why starting coding early matters</h2>
<ul>
<li><strong>Skills compound.</strong> Children who learn sequencing, debugging and persistence at 6 carry them into school, and later into work.</li>
<li><strong>Interest drives learning.</strong> Many autistic children are drawn to systems, patterns and technology. Coding turns that interest into a skill.</li>
<li><strong>It builds a pathway, not a one-off.</strong> A K–8 progression, from blocks to web pages to Python, gives a clear next step each year.</li>
<li><strong>Canada is investing in autism support.</strong> In March 2025 the federal government ${a(SRC.phacNetwork, "committed over $6.3 million over five years")} to a new National Autism Network led by the Sinneave Family Foundation with Autism Alliance of Canada.</li>
</ul>

${checklist({
  title: "Checklist: making coding accessible for every child",
  intro: "For clinics, schools and families planning inclusive tech learning.",
  items: [
    "Start with visual, picture-based tools that do not require reading or typing.",
    "Offer in-person and online options so distance and transport are not barriers.",
    "Keep groups small and sessions short, with predictable routines.",
    "Provide devices, so families do not need to buy equipment.",
    "Plan for sensory needs: headphones, quiet space and movement breaks.",
    "Let children show learning in more than one way: a project, a demo or a verbal walkthrough.",
    "Connect each session to a clear next level so progress is visible.",
    "Share progress with the child's care team, with family consent.",
  ],
})}

<p>CODEship partners with ABA clinics, schools and community groups to bring structured coding and robotics to more children. ${'<a href="/partners/aba-clinics">Learn about clinic partnerships</a>'}.</p>
`,
  faqs: [
    {
      question: "How common is autism in Canada in 2026?",
      answer:
        "About 1 in 44 children and youth aged 1 to 19 (2.25%), based on the Public Health Agency of Canada's first national autism surveillance data, released in fall 2025 with data to 2023–2024.",
    },
    {
      question: "Is autism increasing in Canada?",
      answer:
        "Recorded autism has risen from 1 in 714 in 2000–2001 to 1 in 44 in 2023–2024. PHAC says more awareness, wider diagnostic criteria and earlier screening likely play a role, though their exact share is unknown.",
    },
    {
      question: "How many children are waiting for Ontario Autism Program services?",
      answer:
        "As of March 2026, 89,799 children were registered in the Ontario Autism Program and 24,360 were enrolled in core clinical services, about 23%, according to Ontario Autism Coalition figures reported by CP24.",
    },
    {
      question: "Why should autistic children learn to code?",
      answer:
        "Coding is structured, visual and gives instant feedback, which suits many autistic learners. It also builds digital skills early, which matters because Canadian youth with disabilities are more likely to be out of work, school and training (16.0% vs 9.2% in 2022).",
    },
  ],
};

/* ---------------------------------------------------------------- 3 */

const partnershipChecklist: Article = {
  slug: "aba-clinic-coding-robotics-partnership-checklist",
  title: "How ABA Clinics Can Add Coding and Robotics: A Partnership Checklist",
  metaDescription:
    "A step-by-step guide for ABA clinics and BCBAs adding coding and robotics: partnership models, roles, goals, privacy, a readiness checklist and a 12-week sample plan.",
  category: "partners",
  readTime: 7,
  publishDate: "2026-11-24",
  author: "CODEship Academy Team",
  cluster: "aba-coding",
  targetQuery: "coding program partnership for ABA clinic",
  internalLinks: [
    PARTNER_LINK,
    { label: "ABA and coding: the research", href: "/resources/aba-and-coding-robotics-research-2026" },
    { label: "Autism in Canada: the 2025–2026 data", href: "/resources/autism-in-canada-2026-data-inclusive-coding" },
  ],
  keyTakeaways: [
    "Pick a partnership model first: in-clinic groups, a social skills group, a bridge to community classes, or online.",
    "The BCBA owns goals and data. The coding instructor owns the curriculum and delivery.",
    "Write each coding project as a task analysis so it carries real treatment targets.",
    "Plan privacy, consent and data-sharing before the first session.",
    "Start with a short pilot, about 8 to 12 weeks, and review the data before scaling.",
  ],
  sources: [SRC.scoping, SRC.hutchison, SRC.metaAnalysis, SRC.kurnaz, SRC.cp24],
  content: `
<p><strong>Quick answer:</strong> To add coding and robotics to an ABA clinic, choose a partnership model, agree on roles, turn coding projects into task analyses with clear targets, set up consent and data-sharing, and run a short pilot. This guide walks through each step, with checklists you can tick off.</p>

<h2>Why clinics are adding coding and robotics</h2>
<p>Families on long waitlists and in active therapy are looking for structured, motivating group activities. In Ontario alone, ${a(SRC.cp24, "fewer than 1 in 4 children registered in the Ontario Autism Program")} were enrolled in core clinical services as of March 2026. Research also backs the approach: a ${a(SRC.metaAnalysis, "2025 meta-analysis")} of 20 trials found robot-assisted interventions improved autistic children's social–emotional skills, and a ${a(SRC.scoping, "2026 review")} found visual block coding with scaffolding and visual supports linked to better engagement and learning.</p>

<h2>Step 1: Choose a partnership model</h2>
${dataTable({
  caption: "Four ways an ABA clinic can partner with a coding and robotics program",
  headers: ["Model", "How it works", "Best for"],
  rows: [
    ["<strong>In-clinic group</strong>", "A coding instructor runs weekly small-group sessions at your clinic. Your staff support and collect data.", "Clinics with a group room and several school-age clients"],
    ["<strong>Social skills group</strong>", "Coding and robotics become the activity inside an existing social skills group: pair programming, turn-taking, team missions.", "Clients with social and communication goals"],
    ["<strong>Bridge to community classes</strong>", "Clients practise in clinic, then move to a regular class with support, then fade support.", "Generalization and transition goals"],
    ["<strong>Online sessions</strong>", "Live, small-group classes on screen, with a parent or RBT beside the child.", "Rural families, waitlisted clients, home programs"],
  ],
})}

<h2>Step 2: Agree on roles</h2>
${dataTable({
  caption: "Who does what in a clinic and coding program partnership",
  headers: ["Role", "Responsible for"],
  rows: [
    ["<strong>BCBA</strong>", "Choosing targets, writing behaviour plans, approving prompting and reinforcement, reviewing data."],
    ["<strong>RBT or clinic staff</strong>", "1:1 or 1:2 support, implementing the plan, collecting data during sessions."],
    ["<strong>Coding instructor</strong>", "Curriculum, project design, delivering the lesson, adapting pace, sharing session notes."],
    ["<strong>Family</strong>", "Consent, sharing interests and reinforcers, practising at home with free tools."],
  ],
})}

<h2>Step 3: Turn each project into a task analysis</h2>
<p>Every coding project can be written as steps. Here is a sample for a first robot mission:</p>
${steps({
  title: "Sample task analysis: program a robot to drive a square",
  items: [
    { name: "Open the project", text: "Child selects the robot project from a picture menu." },
    { name: "Add a start block", text: "Drags the green start block into the work area." },
    { name: "Add move and turn blocks", text: "Places move forward, then turn right." },
    { name: "Repeat four times", text: "Wraps the two blocks in a repeat block set to 4." },
    { name: "Run and watch", text: "Presses run and watches the robot. Natural reinforcer: it moves." },
    { name: "Debug if needed", text: "If the square is wrong, finds and fixes one block, then runs again." },
    { name: "Share", text: "Shows a peer or staff member and says one thing the robot did." },
  ],
})}
<p>Each step can be scored as independent, prompted or not done. A ${a(SRC.kurnaz, "2025 single-case study")} used a design like this to teach coding to autistic children with video self-modeling; all four learned the skill and kept it for up to 12 weeks.</p>

<h2>Step 4: Link coding to treatment goals</h2>
${dataTable({
  caption: "Examples of ABA goals practised through coding and robotics",
  headers: ["Goal area", "Coding or robotics activity", "Sample measure"],
  rows: [
    ["Following directions", "Build a program from a 3- to 5-step visual card", "Steps completed independently"],
    ["Requesting help", "Ask for help when the robot does not move as planned", "Independent requests per session"],
    ["Frustration tolerance", "Debug a broken program with a calm-down plan ready", "Minutes on task after an error"],
    ["Turn-taking", "Pair programming: driver and navigator swap every 3 minutes", "Turns taken without prompts"],
    ["Flexible thinking", "Solve the same maze two different ways", "Number of solutions tried"],
    ["Joint attention", "Point to and talk about what the robot is doing", "Shared-attention bids"],
  ],
})}

<h2>Step 5: Set up consent, privacy and data</h2>
<p>Agree in writing what the coding partner sees and stores. Share only what is needed to run the session, such as first name, support needs and reinforcers. Get written family consent before any data, photos or videos are shared. In Ontario, personal health information is protected under PHIPA, so check your clinic's policies and your privacy officer's advice before sharing clinical notes.</p>

<h2>Step 6: Run a pilot and review</h2>
<p>Start small. A 12-week pilot gives enough sessions to see a trend.</p>
${dataTable({
  caption: "Sample 12-week pilot plan",
  headers: ["Weeks", "Focus"],
  rows: [
    ["1–2", "Pairing, room set-up, sensory check, baseline data on each target"],
    ["3–6", "Short block-coding projects with physical robots; heavy prompting, then fading"],
    ["7–9", "Pair programming and team missions; social targets added"],
    ["10–11", "Generalization: new robot, new room or online session"],
    ["12", "Showcase for families; BCBA and instructor review the data and plan next steps"],
  ],
})}
<p>The ${a(SRC.hutchison, "2025 after-school robotics study")} found the biggest challenges were the need for individualized instruction and staff training, so build both into the pilot.</p>

${checklist({
  title: "Partnership readiness checklist for ABA clinics",
  intro: "Tick these off before your first session.",
  items: [
    "We know which clients and goals the program will serve.",
    "We picked a partnership model and a weekly time slot.",
    "Our BCBA and the coding instructor have met to plan targets.",
    "Each project is written as a task analysis with a scoring method.",
    "Prompting, reinforcement and crisis plans are shared with the instructor.",
    "We have a room with space, power, Wi-Fi and a quiet corner.",
    "Group size and staff ratio are set (for example, 4 children with 2 staff).",
    "Family consent forms cover participation, data sharing, photos and video.",
    "Privacy rules for clinical information are agreed in writing.",
    "Instructor vulnerable sector check and the partner's insurance are on file.",
    "We know how session notes and data will be shared each week.",
    "A review date is booked at the end of the pilot.",
  ],
})}

${checklist({
  title: "Questions to ask any coding partner",
  items: [
    "Can you adapt pace and steps for each child?",
    "Do you use visual, block-based tools before typing?",
    "Will you follow our behaviour plan and prompting hierarchy?",
    "Can your projects run in clinic, in a community class and online?",
    "What will you share with us after each session?",
    "Do you bring devices and robots, or do we need to buy them?",
  ],
})}

<h2>Working with CODEship</h2>
<p>CODEship runs a K–Grade 8 coding, AI and robotics journey, in person in Oshawa, at partner sites and live online across Canada. We bring devices and materials, our instructors hold current vulnerable sector checks, and we are insured. For ABA clinics, we co-design every session with your BCBA. ${'<a href="/partners/aba-clinics#inquire">Book a partnership call</a>'}.</p>
`,
  faqs: [
    {
      question: "How can an ABA clinic add a coding program?",
      answer:
        "Choose a partnership model (in-clinic group, social skills group, bridge to community classes or online), agree on roles with the coding provider, write projects as task analyses, set up consent and data-sharing, and run an 8- to 12-week pilot.",
    },
    {
      question: "Who sets the goals in a coding and ABA partnership?",
      answer:
        "The BCBA sets targets and reviews data. The coding instructor designs and delivers the projects, and RBTs or clinic staff provide support and collect data during sessions.",
    },
    {
      question: "What ABA goals can be practised through coding?",
      answer:
        "Following multi-step directions, requesting help, frustration tolerance, turn-taking, flexible thinking and joint attention can all be practised through coding and robotics projects.",
    },
    {
      question: "Do coding sessions for ABA clinics need special equipment?",
      answer:
        "A room with power, Wi-Fi and a quiet corner is enough when the coding partner brings devices and robots. CODEship brings all devices and materials.",
    },
  ],
};

export const abaArticles: Article[] = [abaAndCoding, autismCanadaData, partnershipChecklist];
