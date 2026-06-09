"use client";

import { useState } from "react";

const NAVY = "#0D1B2A";
const GOLD = "#F5A623";
const TEAL = "#2A9D8F";
const PURPLE = "#5C3D8F";
const WHITE = "#FFFFFF";
const LIGHT = "#F7F8FA";
const GRAY = "#6B7280";

const pages = ["Cover", "Your Market", "Competitors", "Your Audience", "Your Models", "Investment", "Next Steps"];

const Logo = ({ light }: { light?: boolean }) => (
  <div style={{ lineHeight: 1 }}>
    <span style={{ fontWeight: 900, fontSize: 20, color: light ? WHITE : NAVY, letterSpacing: -0.5 }}>CODE</span>
    <span style={{ fontWeight: 900, fontSize: 20, color: GOLD, letterSpacing: -0.5 }}>ship</span>
    <div style={{ fontSize: 11, fontStyle: "italic", color: GOLD, fontWeight: 600, marginTop: 1 }}>Academy</div>
  </div>
);

const TagBadge = ({ label, color = GOLD }: { label: string; color?: string }) => (
  <span style={{
    display: "inline-block", background: color, color: color === GOLD ? NAVY : WHITE,
    fontSize: 9, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase",
    padding: "3px 10px", borderRadius: 3, marginRight: 8,
  }}>{label}</span>
);

const SectionLabel = ({ n, label }: { n: number; label: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
    <TagBadge label={String(n).padStart(2, "0")} />
    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>{label}</span>
  </div>
);

const GoldBar = () => <div style={{ height: 4, background: GOLD }} />;

const Footer = ({ right = "codeshipacademy.com/franchise" }: { right?: string }) => (
  <div style={{
    background: NAVY, height: 52, display: "flex", alignItems: "center",
    justifyContent: "space-between", padding: "0 40px", flexShrink: 0,
  }}>
    <Logo light />
    <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: 3, color: GOLD, textTransform: "uppercase" }}>Dream . Code . Achieve</span>
    <span style={{ fontSize: 10, color: "#6B7280" }}>{right}</span>
  </div>
);

const NavButton = ({ onClick, dir, label }: { onClick: () => void; dir: "prev" | "next"; label: string }) => (
  <button onClick={onClick} style={{
    background: GOLD, color: NAVY, border: "none", borderRadius: 8,
    padding: "10px 22px", fontWeight: 800, fontSize: 13, cursor: "pointer",
    letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 6,
  }}>
    {dir === "prev" && "←"} {label} {dir === "next" && "→"}
  </button>
);

const Pill = ({ children, bg = NAVY, color = WHITE }: { children: React.ReactNode; bg?: string; color?: string }) => (
  <span style={{
    display: "inline-block", background: bg, color, fontSize: 11, fontWeight: 700,
    padding: "4px 13px", borderRadius: 20, marginRight: 8, marginBottom: 6,
  }}>{children}</span>
);

const CheckItem = ({ text }: { text: string }) => (
  <div style={{ display: "flex", gap: 9, marginBottom: 8, alignItems: "flex-start" }}>
    <span style={{ color: TEAL, fontWeight: 900, fontSize: 14, flexShrink: 0, lineHeight: 1.4 }}>✓</span>
    <span style={{ fontSize: 12.5, color: "#2d3748", lineHeight: 1.45 }}>{text}</span>
  </div>
);

const DotItem = ({ text, color = TEAL }: { text: string; color?: string }) => (
  <div style={{ display: "flex", gap: 10, marginBottom: 7, alignItems: "flex-start" }}>
    <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 6 }} />
    <span style={{ fontSize: 12, color: "#4a5568", lineHeight: 1.55 }}>{text}</span>
  </div>
);

const StatBox = ({ label, value, sub, accent = GOLD }: { label: string; value: string; sub?: string; accent?: string }) => (
  <div style={{ background: NAVY, borderRadius: 10, padding: "14px 18px", marginBottom: 10 }}>
    <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.42)", marginBottom: 3 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 900, color: accent, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{sub}</div>}
  </div>
);

const Card = ({ children, border = "#e0e4ea", style = {} }: { children: React.ReactNode; border?: string; style?: React.CSSProperties }) => (
  <div style={{ background: LIGHT, borderRadius: 10, padding: 18, border: `1.5px solid ${border}`, ...style }}>{children}</div>
);

const ColHead = ({ label, bg, textColor = WHITE }: { label: string; bg: string; textColor?: string }) => (
  <div style={{ background: bg, padding: "11px 14px", borderRadius: "10px 10px 0 0" }}>
    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: textColor }}>{label}</span>
  </div>
);

// ── PAGE 1: COVER ───────────────────────────────────────────────────────────
function PageCover() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{
        flex: "0 0 520px",
        background: `linear-gradient(160deg, #081828 0%, #1a4070 100%)`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 320, height: 320, borderRadius: "50%", background: "rgba(42,157,143,0.12)" }} />
        <div style={{ position: "absolute", top: 40, right: 40, width: 180, height: 180, borderRadius: "50%", background: "rgba(245,166,35,0.08)" }} />
        <div style={{ position: "absolute", bottom: 80, right: 100, width: 100, height: 100, borderRadius: "50%", background: "rgba(92,61,143,0.15)" }} />
        <div style={{ position: "absolute", top: 32, left: 44 }}><Logo light /></div>
        <div style={{ position: "absolute", top: 32, right: 44 }}>
          <div style={{
            background: "rgba(245,166,35,0.15)", border: "1px solid rgba(245,166,35,0.5)",
            borderRadius: 6, padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>Prepared for</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: WHITE }}>Tom Che</span>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px 44px 36px" }}>
          <div style={{ fontSize: 62, fontWeight: 900, color: GOLD, lineHeight: 0.92, textTransform: "uppercase", letterSpacing: -2, marginBottom: 4 }}>TOM,</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: WHITE, lineHeight: 0.95, textTransform: "uppercase", letterSpacing: -1, marginBottom: 4 }}>YOUR SCHOOL</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: GOLD, lineHeight: 0.95, textTransform: "uppercase", letterSpacing: -1 }}>STARTS HERE.</div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", lineHeight: 1.65, marginTop: 16, maxWidth: 460 }}>
            You have the teaching background. You have the community connection. You have the drive.
            This is your personalized pathway to building a children&apos;s innovation academy in Markham or Scarborough.
          </p>
        </div>
      </div>
      <div style={{ background: NAVY, flex: 1, padding: "28px 44px", display: "flex", gap: 20, alignItems: "center" }}>
        <div style={{ background: TEAL, borderRadius: 12, padding: "18px 22px", flexShrink: 0, minWidth: 170 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>Low Startup Model</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: GOLD, lineHeight: 1 }}>$10K–$20K</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: WHITE, marginTop: 2 }}>CAD</div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 11 }}>
          {[
            { dot: GOLD, label: "Territory:", val: "Markham / Scarborough" },
            { dot: TEAL, label: "Background:", val: "Educator — Hong Kong trained" },
            { dot: PURPLE, label: "Franchise Fee:", val: "$10,000 CAD — one time payment" },
          ].map(({ dot, label, val }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", minWidth: 100 }}>{label}</span>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: WHITE }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 3, color: GOLD, textTransform: "uppercase", lineHeight: 2.2 }}>
            Dream. Code.<br />Achieve.
          </div>
        </div>
      </div>
      <GoldBar />
      <Footer />
    </div>
  );
}

// ── PAGE 2: MARKET LANDSCAPE ────────────────────────────────────────────────
function PageMarket() {
  const [active, setActive] = useState<"markham" | "scarborough">("markham");
  const markets = {
    markham: {
      name: "Markham", pop: "338,503", kids: "~74,430", kidsNote: "children under 19 (22% of pop.)",
      income: "$104,000", chinese: "40%+", southAsian: "12%", growth: "+2.6% / yr",
      schools: "~90+", schoolsNote: "YRDSB + YCDSB elementary schools",
      opportunity: "Markham is one of Canada's fastest-growing cities. Over 40% of residents identify as Chinese — and parents here invest heavily in their children's education. With median household income at $104K, families have the means. The demand for quality STEM programs is high. The competition is thin.",
      accent: TEAL,
      tags: ["Fastest-growing GTA city", "High-income families", "Education-focused culture", "Chinese community 40%+", "Low STEM competition"],
    },
    scarborough: {
      name: "Scarborough", pop: "~632,000", kids: "~85,000", kidsNote: "children under 19 (~13.4% of pop.)",
      income: "$72,000", chinese: "38%", southAsian: "24%", growth: "Steady urban growth",
      schools: "~150+", schoolsNote: "TDSB + TCDSB schools in Scarborough",
      opportunity: "Scarborough is a large, diverse, and underserved market. Large Chinese and South Asian communities with strong cultural emphasis on academic achievement. Far fewer organized STEM enrichment options than North York or Richmond Hill — your opportunity to be first and become the trusted name.",
      accent: GOLD,
      tags: ["Largest underserved GTA market", "Strong Chinese + S. Asian community", "Academic-achievement culture", "Very low STEM competition", "High school density"],
    },
  };
  const m = markets[active];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ background: NAVY, padding: "28px 44px 24px", flexShrink: 0 }}>
        <SectionLabel n={1} label="Your Market" />
        <div style={{ fontSize: 28, fontWeight: 900, color: WHITE, textTransform: "uppercase", marginBottom: 8 }}>
          TWO CITIES. <span style={{ color: GOLD }}>ONE BIG OPPORTUNITY.</span>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, maxWidth: 560 }}>
          Both Markham and Scarborough have large, education-focused immigrant communities — exactly the families who invest in their children&apos;s futures. Click each city to explore the landscape.
        </p>
      </div>
      <GoldBar />
      <div style={{ padding: "18px 44px 0", flexShrink: 0, display: "flex", gap: 12 }}>
        {(["markham", "scarborough"] as const).map(k => (
          <button key={k} onClick={() => setActive(k)} style={{
            flex: 1, padding: "10px 0", borderRadius: 8, border: `2px solid ${active === k ? markets[k].accent : "#e0e3e8"}`,
            background: active === k ? markets[k].accent : WHITE, cursor: "pointer",
            fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1,
            color: active === k ? (k === "scarborough" ? NAVY : WHITE) : GRAY,
            transition: "all 0.2s",
          }}>{markets[k].name}</button>
        ))}
      </div>
      <div style={{ padding: "16px 44px 0", flex: 1, display: "flex", gap: 20 }}>
        <div style={{ width: 220, flexShrink: 0 }}>
          <StatBox label="Total Population" value={m.pop} accent={m.accent} />
          <StatBox label="Children & Youth" value={m.kids} sub={m.kidsNote} accent={m.accent} />
          <StatBox label="Median Household Income" value={m.income} accent={m.accent} />
          <StatBox label="Elementary Schools" value={m.schools} sub={m.schoolsNote} accent={m.accent} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ background: NAVY, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>Community Breakdown</div>
            <div style={{ display: "flex", gap: 16 }}>
              {[{ label: "Chinese", val: m.chinese }, { label: "South Asian", val: m.southAsian }, { label: "Pop. growth", val: m.growth }].map(({ label, val }) => (
                <div key={label} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: m.accent, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 3, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, color: m.accent, marginBottom: 8 }}>The Opportunity</div>
            <p style={{ fontSize: 13, color: "#2d3748", lineHeight: 1.7 }}>{m.opportunity}</p>
          </Card>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {m.tags.map(t => <Pill key={t} bg={m.accent} color={m.accent === GOLD ? NAVY : WHITE}>{t}</Pill>)}
          </div>
          <div style={{ background: "#FEF3C7", borderRadius: 10, padding: "13px 16px", border: `2px solid ${GOLD}`, marginTop: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: 0.5 }}>Your Edge in {m.name}: </span>
            <span style={{ fontSize: 12.5, color: "#4a5568", lineHeight: 1.65 }}>
              Your Hong Kong teaching background and Cantonese language skills give you a direct cultural connection that no other franchise operator in {m.name} can replicate. Families trust people from their own community. You are that person.
            </span>
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <GoldBar />
      <Footer right="Personalized for Tom Che" />
    </div>
  );
}

// ── PAGE 3: COMPETITIVE LANDSCAPE ───────────────────────────────────────────
function PageCompetitors() {
  const comps = [
    {
      name: "Code Ninjas", type: "Direct Competitor", typeColor: "#dc2626",
      investment: "$175K–$385K CAD", royalty: "8% + 2% marketing", location: "Physical dojo required",
      schoolPartnership: "None", culturalFit: "Generic / mass-market", present: "1 location in Markham",
      weakness: "Requires large upfront investment and a physical location before you have a single student.",
      isUs: false,
    },
    {
      name: "Kumon", type: "Adjacent Competitor", typeColor: "#d97706",
      investment: "$150K–$400K CAD", royalty: "~$36–$46 per student/month", location: "Physical centre required",
      schoolPartnership: "None", culturalFit: "Strong in East Asian communities", present: "Multiple Markham + Scarborough locations",
      weakness: "Focused purely on math and reading. No STEM, coding, or creativity component.",
      isUs: false,
    },
    {
      name: "Mathnasium", type: "Adjacent Competitor", typeColor: "#d97706",
      investment: "$112K–$149K CAD", royalty: "10% + fees", location: "Physical centre required",
      schoolPartnership: "None", culturalFit: "Broad / general market", present: "Limited presence in Scarborough",
      weakness: "Math only. No school partnerships. No community-first growth model.",
      isUs: false,
    },
    {
      name: "CODEship Academy", type: "Your Advantage", typeColor: TEAL,
      investment: "$10K–$20K CAD", royalty: "$1,500 flat/mo (Year 1)", location: "No fixed location needed",
      schoolPartnership: "Core to the model", culturalFit: "Community-led, culturally adaptable",
      present: "Territory AVAILABLE — no competition yet",
      weakness: null, isUs: true,
    },
  ];

  const rows = ["Investment", "Royalty (Yr 1)", "Location Required", "School Partnerships", "Cultural Fit", "Status in Market"];
  const vals = comps.map(c => [c.investment, c.royalty, c.location, c.schoolPartnership, c.culturalFit, c.present]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ background: NAVY, padding: "28px 44px 24px", flexShrink: 0 }}>
        <SectionLabel n={2} label="Competitive Landscape" />
        <div style={{ fontSize: 26, fontWeight: 900, color: WHITE, textTransform: "uppercase", marginBottom: 8 }}>
          THE MARKET IS <span style={{ color: GOLD }}>WIDE OPEN.</span>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, maxWidth: 560 }}>
          Every other option costs 10–20x more to start and requires you to sign a lease before you have a single student. CODEship is the only model built for educators like you.
        </p>
      </div>
      <GoldBar />
      <div style={{ padding: "18px 44px 0", flex: 1, overflowY: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr 1fr 1fr", gap: 0, border: "1.5px solid #e0e3e8", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ background: "#F7F8FA", padding: "10px 12px", borderBottom: "1.5px solid #e0e3e8" }} />
          {comps.map((c, i) => (
            <div key={i} style={{ background: c.isUs ? TEAL : "#F7F8FA", padding: "10px 12px", borderBottom: "1.5px solid #e0e3e8", borderLeft: "1px solid #e0e3e8" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: c.isUs ? WHITE : NAVY, textTransform: "uppercase", letterSpacing: 0.3 }}>{c.name}</div>
              <div style={{ display: "inline-block", background: c.typeColor, color: WHITE, fontSize: 8, fontWeight: 800, padding: "2px 7px", borderRadius: 3, marginTop: 4, letterSpacing: 1, textTransform: "uppercase" }}>{c.type}</div>
            </div>
          ))}
          {rows.map((row, ri) => (
            <>
              <div key={`label-${ri}`} style={{ background: "#F7F8FA", padding: "9px 12px", borderBottom: "1px solid #e8eaed", fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: GRAY }}>{row}</div>
              {vals.map((v, ci) => (
                <div key={`val-${ri}-${ci}`} style={{ background: comps[ci].isUs ? "rgba(42,157,143,0.06)" : WHITE, padding: "9px 12px", borderBottom: "1px solid #e8eaed", borderLeft: "1px solid #e8eaed", fontSize: 11.5, color: comps[ci].isUs ? TEAL : "#2d3748", fontWeight: comps[ci].isUs ? 700 : 400 }}>
                  {v[ri] === "None" ? <span style={{ color: "#dc2626", fontWeight: 700 }}>None</span>
                    : v[ri] === "Core to the model" ? <span style={{ color: TEAL, fontWeight: 800 }}>✓ Core to model</span>
                    : v[ri] === "Territory AVAILABLE — no competition yet" ? <span style={{ color: TEAL, fontWeight: 800 }}>✓ Open territory</span>
                    : v[ri]}
                </div>
              ))}
            </>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
          {comps.map((c, i) => (
            <div key={i} style={{ background: c.isUs ? TEAL : "#F7F8FA", borderRadius: 10, padding: "12px 14px", border: `1.5px solid ${c.isUs ? TEAL : "#e0e3e8"}` }}>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: c.isUs ? WHITE : GRAY, marginBottom: 6 }}>
                {c.isUs ? "Your Advantage" : "Key Weakness"}
              </div>
              <p style={{ fontSize: 11.5, color: c.isUs ? WHITE : "#4a5568", lineHeight: 1.55 }}>
                {c.weakness || "You build students before you build a location. No other franchise in this market lets you do that."}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 12 }} />
      <GoldBar />
      <Footer right="Personalized for Tom Che" />
    </div>
  );
}

// ── PAGE 4: TARGET AUDIENCE ─────────────────────────────────────────────────
function PageAudience() {
  const [tab, setTab] = useState<"b2c" | "b2b">("b2c");

  const b2c = {
    sub: "Your primary customer is the education-focused immigrant parent — a profile that dominates both Markham and Scarborough.",
    segments: [
      { icon: "👨‍👩‍👧", label: "The Tiger Parent", color: TEAL, desc: "High-achieving families from East and South Asian backgrounds who actively invest in enrichment programs. Education is a top family priority. They research thoroughly and pay for quality.", stats: ["Markham: ~40% Chinese community", "Scarborough: ~38% Chinese community", "Avg. spend on enrichment: $3,000–$8,000/yr/child"] },
      { icon: "🏠", label: "The Career-Change Parent", color: PURPLE, desc: "Parents re-entering the workforce or seeking flexible income who enroll their children while exploring the business opportunity themselves. A dual funnel.", stats: ["Trust community operators over chains", "Referred by other parents at school pickup", "Loyal once trust is established"] },
      { icon: "🎓", label: "The Academic Achiever Family", color: GOLD, desc: "Families whose children attend top-ranked elementary schools in Markham (e.g. Unionville, Stonebridge). Actively preparing for high school and university pathways.", stats: ["Markham has some of Ontario's top-ranked elementary schools", "EQAO scores consistently above provincial average", "Already investing in tutoring and enrichment"] },
    ],
    insight: "Tom, your Cantonese language skills and teaching background let you market directly to Chinese-speaking families in a way no corporate brand can. That is your unfair advantage.",
  };

  const b2b = {
    sub: "Your B2B audience gives you a customer pipeline before you have a physical location — and credibility from day one.",
    segments: [
      { icon: "🏫", label: "YRDSB Elementary Schools", color: TEAL, desc: "York Region District School Board operates 175 elementary schools across York Region, with approximately 90+ serving Markham students. These schools actively seek curriculum-aligned enrichment partners for after-school programs.", stats: ["~90 elementary schools in Markham area", "YRDSB serves 117,000+ students", "After-school programs actively recruited"] },
      { icon: "⛪", label: "YCDSB Catholic Schools", color: PURPLE, desc: "York Catholic District School Board operates 86 elementary schools across York Region. Catholic schools have strong community focus and often welcome values-aligned enrichment partners.", stats: ["86 elementary schools across York Region", "54,000+ students served", "Strong community partnership culture"] },
      { icon: "🏙", label: "Scarborough: TDSB + TCDSB", color: GOLD, desc: "The Toronto District School Board alone operates 469 elementary schools across Toronto — a significant portion in Scarborough. Combined with TCDSB's 163 elementary schools, Scarborough has 150+ schools within reach.", stats: ["150+ elementary schools in Scarborough area", "TDSB: Canada's largest school board", "TCDSB: 163 elementary schools in Toronto"] },
      { icon: "🏛", label: "Rec Centres & Libraries", color: NAVY, desc: "Markham Civic Centre, Scarborough Civic Centre, and Toronto Public Library branches all run community programming and actively partner with enrichment providers for after-school and weekend slots.", stats: ["City of Markham: 8 recreation centres", "City of Toronto: 100+ community centres", "Libraries run 'digital literacy' programming budgets"] },
    ],
    insight: "A single school partnership generates parent awareness, recurring enrollment, and referrals — without paying for a single ad. Schools are your acquisition channel.",
  };

  const data = tab === "b2c" ? b2c : b2b;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ background: NAVY, padding: "26px 44px 22px", flexShrink: 0 }}>
        <SectionLabel n={3} label="Your Target Audience" />
        <div style={{ fontSize: 24, fontWeight: 900, color: WHITE, textTransform: "uppercase", marginBottom: 8 }}>
          WHO YOU SERVE. <span style={{ color: GOLD }}>AND WHO PAYS YOU.</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {([["b2c", "B2C — Parents & Families"], ["b2b", "B2B — Schools & Organisations"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: "8px 18px", borderRadius: 6, border: "none", cursor: "pointer",
              background: tab === k ? GOLD : "rgba(255,255,255,0.12)",
              color: tab === k ? NAVY : "rgba(255,255,255,0.75)",
              fontSize: 12, fontWeight: 800, letterSpacing: 0.5,
            }}>{l}</button>
          ))}
        </div>
      </div>
      <GoldBar />
      <div style={{ padding: "16px 44px 0", flex: 1 }}>
        <p style={{ fontSize: 13.5, color: "#4a5568", lineHeight: 1.7, marginBottom: 14 }}>{data.sub}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          {data.segments.map((seg, i) => (
            <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: "1.5px solid #e0e3e8" }}>
              <div style={{ background: seg.color, padding: "11px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{seg.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, color: seg.color === GOLD ? NAVY : WHITE }}>{seg.label}</span>
              </div>
              <div style={{ background: LIGHT, padding: "13px 14px" }}>
                <p style={{ fontSize: 12, color: "#4a5568", lineHeight: 1.6, marginBottom: 10 }}>{seg.desc}</p>
                {seg.stats.map(s => <DotItem key={s} text={s} color={seg.color} />)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: "#FEF3C7", borderRadius: 10, padding: "13px 18px", border: `2px solid ${GOLD}` }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: 0.5 }}>Your Insight: </span>
          <span style={{ fontSize: 12.5, color: "#4a5568", lineHeight: 1.65 }}>{data.insight}</span>
        </div>
      </div>
      <div style={{ height: 10 }} />
      <GoldBar />
      <Footer right="Personalized for Tom Che" />
    </div>
  );
}

// ── PAGE 5: THREE MODELS ─────────────────────────────────────────────────────
function PageModels() {
  const [active, setActive] = useState(0);

  const models = [
    {
      num: "01", name: "Pop-Up Workshop Model", tagline: "Start lean. Build trust. Earn before you lease.", color: TEAL,
      invest: "$10K–$13K CAD", royalty: "$1,500 flat/mo (Year 1)", location: "No fixed space needed", icon: "🚀",
      best: "The perfect starting point if you want to test the market, build a student base, and earn income before committing to any overhead.",
      what: ["Run workshops directly inside schools as an approved after-school partner", "Use community centres, libraries, and park recreation rooms for weekend sessions", "Partner with religious centres and cultural organizations for weekday programs", "Deliver holiday camps (March Break, PA Days, Summer) at partner venues", "No rent. No lease. No location overhead."],
      revenue: ["School workshop fees ($280–$950/session)", "After-school program subscriptions", "Holiday camp registrations", "PA Day programs"],
      mindset: "Start lean. Grow smart. This is where most successful CODEship franchisees begin.",
    },
    {
      num: "02", name: "Shared Space Model", tagline: "Your branded space. A fraction of the cost.", color: GOLD,
      invest: "$13K–$18K CAD", royalty: "$1,500 flat/mo (Year 1)", location: "$500–$800/month shared unit", icon: "🏢",
      best: "You want a real, branded presence without the risk of a full commercial lease. Perfect once you have 20–30 students enrolled through school partnerships.",
      what: ["Rent a shared commercial unit or co-working space at $500–$800/month", "Alternatively, secure long-term space within a recreation centre or community hub", "Brand it fully as your CODEship Academy location", "Continue school partnerships to drive enrollment to your space", "Flexible lease: month-to-month or short-term arrangements available"],
      revenue: ["Weekly in-centre classes (higher enrollment capacity)", "School partnerships continued", "Birthday party bookings", "Private tutoring sessions", "AI and app development programs"],
      mindset: "Build the destination. You have students before you have a location — so the risk is near zero.",
    },
    {
      num: "03", name: "Home-Based / Hybrid Online Model", tagline: "Maximum flexibility. Zero overhead.", color: PURPLE,
      invest: "$10K–$12K CAD", royalty: "$1,500 flat/mo (Year 1)", location: "Home studio + online delivery", icon: "💻",
      best: "Ideal if you're starting part-time while keeping your current job, or want to test the market with zero overhead before committing to a space.",
      what: ["Run small-group sessions from a dedicated home studio (basement, spare room)", "Deliver online classes via CODEship's digital platform", "Partner with schools for in-school delivery during school hours", "Hybrid model: some students in-home, some online, all under your brand", "Scale to a shared space once demand exceeds home capacity"],
      revenue: ["Online subscription classes", "In-home small group sessions (6–8 students)", "School workshop partnerships", "Virtual camps during school breaks"],
      mindset: "Test the market without risk. Many CODEship partners start here and transition to Model 2 within 6–12 months.",
    },
  ];

  const m = models[active];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ background: NAVY, padding: "26px 44px 22px", flexShrink: 0 }}>
        <SectionLabel n={4} label="Your Operating Models" />
        <div style={{ fontSize: 22, fontWeight: 900, color: WHITE, textTransform: "uppercase", marginBottom: 8 }}>
          THREE WAYS TO <span style={{ color: GOLD }}>BUILD YOUR SCHOOL.</span>
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, maxWidth: 560 }}>
          Choose the model that fits where you are right now. You can start with any model and evolve — most partners move from Model 1 to Model 2 as their student base grows.
        </p>
      </div>
      <GoldBar />
      <div style={{ padding: "14px 44px 0", flexShrink: 0, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {models.map((mod, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            padding: "12px 10px", borderRadius: 10, cursor: "pointer",
            border: `2px solid ${active === i ? mod.color : "#e0e3e8"}`,
            background: active === i ? mod.color : WHITE, textAlign: "left", transition: "all 0.2s",
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: active === i ? "rgba(255,255,255,0.7)" : GRAY, marginBottom: 4 }}>Model {mod.num}</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: active === i ? (mod.color === GOLD ? NAVY : WHITE) : NAVY, textTransform: "uppercase", letterSpacing: 0.3, lineHeight: 1.2 }}>{mod.name}</div>
            <div style={{ fontSize: 11, color: active === i ? (mod.color === GOLD ? "rgba(13,27,42,0.65)" : "rgba(255,255,255,0.7)") : GRAY, marginTop: 4 }}>{mod.invest}</div>
          </button>
        ))}
      </div>
      <div style={{ padding: "14px 44px 0", flex: 1, display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ borderRadius: 10, overflow: "hidden", border: "1.5px solid #e0e3e8", marginBottom: 12 }}>
            <ColHead label="How It Works" bg={m.color} textColor={m.color === GOLD ? NAVY : WHITE} />
            <div style={{ background: LIGHT, padding: "14px" }}>
              {m.what.map(w => <DotItem key={w} text={w} color={m.color} />)}
            </div>
          </div>
          <div style={{ background: "#FEF3C7", borderRadius: 10, padding: "12px 14px", border: `2px solid ${GOLD}` }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: 0.5 }}>The Mindset: </span>
            <span style={{ fontSize: 12.5, color: "#4a5568", lineHeight: 1.65 }}>{m.mindset}</span>
          </div>
        </div>
        <div style={{ width: 210, flexShrink: 0 }}>
          <div style={{ background: NAVY, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>At a Glance</div>
            {([["Investment", m.invest], ["Yr 1 Royalty", m.royalty], ["Location", m.location]] as const).map(([l, v]) => (
              <div key={l} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: m.color, lineHeight: 1.3 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ borderRadius: 10, overflow: "hidden", border: "1.5px solid #e0e3e8" }}>
            <ColHead label="Revenue Streams" bg={m.color} textColor={m.color === GOLD ? NAVY : WHITE} />
            <div style={{ background: LIGHT, padding: "12px 14px" }}>
              {m.revenue.map(r => <DotItem key={r} text={r} color={m.color} />)}
            </div>
          </div>
          <div style={{ background: LIGHT, borderRadius: 10, padding: "12px 14px", border: "1.5px solid #e0e3e8", marginTop: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: m.color, marginBottom: 6 }}>Best If You Want…</div>
            <p style={{ fontSize: 12, color: "#4a5568", lineHeight: 1.6 }}>{m.best}</p>
          </div>
        </div>
      </div>
      <div style={{ height: 10 }} />
      <GoldBar />
      <Footer right="Personalized for Tom Che" />
    </div>
  );
}

// ── PAGE 6: INVESTMENT ───────────────────────────────────────────────────────
function PageInvestment() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ background: NAVY, padding: "26px 48px 0", flexShrink: 0 }}>
        <SectionLabel n={5} label="Your Investment" />
        <div style={{ fontSize: 26, fontWeight: 900, color: WHITE, textTransform: "uppercase", marginBottom: 6 }}>
          HOW YOUR <span style={{ color: GOLD }}>$20,000</span> WORKS.
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.55, maxWidth: 540 }}>
          No other children&apos;s education franchise offers this model at this price. Here is every dollar accounted for.
        </p>
        <div style={{ marginTop: 16, background: TEAL, borderRadius: "10px 10px 0 0", padding: "14px 22px", display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ flex: 1.4 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: 3 }}>Founding Partner Offer</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: WHITE, textTransform: "uppercase" }}>For Your First 12 Months</div>
          </div>
          <div style={{ flex: 1, borderLeft: "1px solid rgba(255,255,255,0.25)", paddingLeft: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 3 }}>Flat Monthly Royalty</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: GOLD, lineHeight: 1 }}>$1,500</div>
          </div>
          <div style={{ flex: 1, borderLeft: "1px solid rgba(255,255,255,0.25)", paddingLeft: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 3 }}>Marketing Fund</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: WHITE, lineHeight: 1 }}>WAIVED</div>
          </div>
          <div style={{ flex: 1.2, textAlign: "right", fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.9 }}>
            Build your business.<br />Grow your enrollment.<br />Focus on your community.
          </div>
        </div>
      </div>
      <div style={{ padding: "0 36px", display: "flex", gap: 16, marginTop: 16, flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, border: `2px solid ${TEAL}`, borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ background: TEAL, padding: "12px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: WHITE, textTransform: "uppercase", letterSpacing: 0.5 }}>Franchise Fee — $10,000</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>One time. Unlocks everything below.</div>
          </div>
          <div style={{ background: LIGHT, padding: "15px 16px", flex: 1 }}>
            {["CODEship brand licence and full identity system", "Complete curriculum: Coding, AI, STEM, Robotics, App Dev", "Operations manual and business systems", "Program delivery training and ongoing coaching", "Marketing materials, launch support, and launch plan", "School partnership outreach toolkit and scripts", "Staff hiring guidance and training support", "Ongoing coaching, check-ins, and partner community"].map(t => <CheckItem key={t} text={t} />)}
          </div>
        </div>
        <div style={{ flex: 1, border: `2px solid ${GOLD}`, borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ background: GOLD, padding: "12px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: NAVY, textTransform: "uppercase", letterSpacing: 0.5 }}>Startup Costs — $8,000–$10,000</div>
            <div style={{ fontSize: 10, color: "rgba(13,27,42,0.6)", marginTop: 1 }}>To open and run your first months.</div>
          </div>
          <div style={{ background: LIGHT, padding: "15px 16px", flex: 1 }}>
            {[["Space deposit + first month (if applicable)", "$0–$2,000"], ["Basic equipment and teaching supplies", "$1,500–$2,500"], ["Branded signage and printed materials", "$500–$1,000"], ["Technology: laptop, display, accessories", "$800–$1,500"], ["Insurance and business registration", "$500–$800"], ["Local launch marketing", "$500–$800"], ["Operating reserve (3 months)", "$2,000–$3,000"]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #e5e7eb", fontSize: 12 }}>
                <span style={{ color: "#4a5568" }}>{l}</span>
                <span style={{ fontWeight: 800, color: NAVY, whiteSpace: "nowrap", marginLeft: 8 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ margin: "12px 36px 0", background: LIGHT, borderRadius: 8, padding: "11px 16px", border: "1.5px solid #e0e3e8", flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: NAVY, fontWeight: 800 }}>After Year 1: </span>
        <span style={{ fontSize: 11, color: "#4a5568" }}>
          Standard terms apply — 6% royalty on revenue plus 2% brand marketing fund. Figures shown are estimates and may vary by location and individual business decisions. This document is for informational purposes only and does not constitute a franchise offering.
        </span>
      </div>
      <div style={{ height: 12 }} />
      <GoldBar />
      <Footer right="Personalized for Tom Che" />
    </div>
  );
}

// ── PAGE 7: NEXT STEPS ───────────────────────────────────────────────────────
function PageNextSteps() {
  const steps = [
    { n: 1, color: TEAL, title: "Book Your Discovery Call", body: "30 minutes with the CODEship team. Bring your questions — we'll answer every one and confirm this is the right fit for where you are right now." },
    { n: 2, color: GOLD, textColor: NAVY, title: "Review the Franchise Agreement", body: "Full transparency. You see exactly what you're getting and what's expected — in plain language, no surprises." },
    { n: 3, color: NAVY, title: "Choose Your Model and Territory", body: "We help you decide which of the three models fits your timeline and risk tolerance — and lock in your Markham or Scarborough territory before anyone else does." },
    { n: 4, color: PURPLE, title: "Complete Training and Launch Planning", body: "Two to three weeks of guided onboarding, curriculum training, and school outreach planning. You'll know exactly what to do from day one." },
    { n: 5, color: TEAL, title: "Launch — Your First School Partnership", body: "With CODEship's support, you approach your first school. We have the scripts, the proposals, and the curriculum. You show up as a credible, prepared educator." },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{
        background: `linear-gradient(160deg, #081828 0%, #1a4070 100%)`,
        padding: "40px 44px 36px", flexShrink: 0, position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(42,157,143,0.1)" }} />
        <div style={{ position: "absolute", bottom: -30, right: 100, width: 120, height: 120, borderRadius: "50%", background: "rgba(245,166,35,0.08)" }} />
        <SectionLabel n={6} label="Your Next Steps" />
        <div style={{ fontSize: 32, fontWeight: 900, color: GOLD, textTransform: "uppercase", lineHeight: 0.95, marginBottom: 3 }}>MARKHAM + SCARBOROUGH</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: WHITE, textTransform: "uppercase", marginBottom: 12 }}>ARE WAITING FOR YOU.</div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.65, maxWidth: 520 }}>
          Your teaching background. Your community connections. Your language skills. You have everything it takes.
          Here is the path from where you are today to the door of your own academy.
        </p>
      </div>
      <GoldBar />
      <div style={{ padding: "20px 44px 0", flex: 1, display: "flex", gap: 24 }}>
        <div style={{ flex: 1 }}>
          {steps.map((s) => (
            <div key={s.n} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: (s as { textColor?: string }).textColor || WHITE, flexShrink: 0 }}>{s.n}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: NAVY, textTransform: "uppercase", marginBottom: 3 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: GRAY, lineHeight: 1.6 }}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ width: 210, flexShrink: 0 }}>
          <div style={{ marginBottom: 12 }}>
            <StatBox label="Markham — Pop." value="338,503" sub="Territory available now" accent={TEAL} />
            <StatBox label="Scarborough — Pop." value="632,000+" sub="Underserved STEM market" accent={GOLD} />
          </div>
          <div style={{ background: NAVY, borderRadius: 10, padding: "16px 16px" }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: GOLD, lineHeight: 0.7, marginBottom: 8 }}>&ldquo;</div>
            <p style={{ fontSize: 13, fontStyle: "italic", color: WHITE, lineHeight: 1.65 }}>
              The best time to plant a tree was 20 years ago.
              <strong style={{ color: GOLD, fontStyle: "normal" }}> The second best time is now.</strong>
            </p>
          </div>
        </div>
      </div>
      <div style={{ margin: "16px 44px 0", background: GOLD, borderRadius: 10, padding: "16px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, color: NAVY }}>Book Your Discovery Call</div>
          <div style={{ fontSize: 12, color: "rgba(13,27,42,0.6)", fontWeight: 600, marginTop: 2 }}>codeshipacademy.com/franchise · admin@codeshipacademy.com</div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: NAVY }}>→</div>
      </div>
      <div style={{ height: 14 }} />
      <GoldBar />
      <Footer />
    </div>
  );
}

// ── SHELL ────────────────────────────────────────────────────────────────────
const pageComponents = [PageCover, PageMarket, PageCompetitors, PageAudience, PageModels, PageInvestment, PageNextSteps];

export default function TomCheKit() {
  const [page, setPage] = useState(0);
  const Page = pageComponents[page];

  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "#E5E7EB", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "16px 0 40px" }}>
      {/* Page nav tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap", justifyContent: "center", maxWidth: 760 }}>
        {pages.map((p, i) => (
          <button key={p} onClick={() => setPage(i)} style={{
            padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
            background: page === i ? NAVY : "rgba(255,255,255,0.7)",
            color: page === i ? WHITE : GRAY,
            fontSize: 11, fontWeight: page === i ? 800 : 500, letterSpacing: 0.3,
          }}>{i + 1}. {p}</button>
        ))}
      </div>

      {/* Mobile-safe scrollable frame */}
      <div style={{ overflowX: "auto", width: "100%" }}>
        <div style={{ minWidth: 768, display: "flex", justifyContent: "center", padding: "0 8px" }}>
          <div style={{
            width: 768, minHeight: 980,
            background: WHITE, borderRadius: 4,
            boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            <Page />
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center" }}>
        {page > 0 && <NavButton onClick={() => setPage(p => p - 1)} dir="prev" label="Previous" />}
        <span style={{ fontSize: 12, color: GRAY, fontWeight: 600 }}>{page + 1} / {pages.length}</span>
        {page < pages.length - 1 && <NavButton onClick={() => setPage(p => p + 1)} dir="next" label="Next" />}
      </div>
    </div>
  );
}
