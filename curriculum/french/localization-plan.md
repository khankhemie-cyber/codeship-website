# CODEship Academy French Curriculum Localization Plan / Plan de localisation du curriculum en français
**Document ID:** CSA-STD-FR-EN/FR-v1.0 · **Status:** Approved for production · **Scope:** all programs, Canadian French (Québec conventions)

---

## 1. Decision: should every program have a Canadian French equivalent?

**Yes — phased, in the order the brand has already made public promises.** The website establishes two explicit French commitments:

1. The Québec landing page markets **« La Trousse Explorateurs, entièrement en français »** — Explorers fully in French, delivered online across Québec, with French project names already published: *Mon robot serviable*, *Cartes de gentillesse*, *Trieur de recyclage*.
2. The Engineers program page states its Québec alignment (Cadre de référence de la compétence numérique) is **"available in French."**

Because the public promises exist, French delivery is not optional for these two programs — it is a brand-integrity requirement. Builders and Developers carry no current public French promise, so their localization is planned but not yet owed.

**Phasing:**

| Phase | Deliverable | Rationale |
|-------|-------------|-----------|
| 1 (owed now) | Explorateurs: full 8-volume set in French | "Entièrement en français" is live marketing; K–1 materials are icon-first, making this the fastest full localization |
| 1 (owed now) | Ingénieurs: teacher-facing set (MCM, TM, AM, QRG) + parent handbook in French | Public "available in French" claim + Québec digital-competency alignment |
| 2 | Ingénieurs: student workbook, project manual, printables | Completes the promised program |
| 3 | Bâtisseurs (Builders) & Développeurs (Developers) full sets | Completes the Journey in French before any Québec in-person expansion |

**Components not localized, and why:** the shared standards volumes (STD-PUB, STD-CF, STD-OPS, STD-FDS) remain English-master documents with French *terminology annexes* rather than full translations until a French-first location opens — instructors delivering in French still onboard through head office, and dual-language masters double every future edit. This is a cost-of-synchronization decision, revisited when Québec in-person operations begin.

## 2. Localization principles (not literal translation)

- **Educational equivalence over word equivalence.** Each French volume is re-authored against the same learning outcomes, session structure, and rubrics — jokes, examples, and cultural references are replaced with Québec-natural ones (e.g., neighbourhood-map landmarks include the dépanneur; weather sections lean into real Québec winters).
- **Québec educational conventions:** grade naming (maternelle, 1re année, 2e année… 1re secondaire, 2e secondaire for grades 7–8); French quotation marks « »; SI/CSA number formats (12 pt space as thousands separator, comma decimal in student-facing math contexts per school norms).
- **Pedagogical register:** vouvoiement for parent-facing documents; tutoiement for student-facing materials (standard in Québec children's publishing); instructor documents use the professional register of Québec teaching guides.
- **Alignment language:** French volumes cite the *Cadre de référence de la compétence numérique* dimensions where English volumes cite provincial curricula, with the same non-endorsement disclaimer: *« Non approuvé ni endossé par aucun ministère de l'Éducation. »*
- **Brand fixed phrases:** "Dream. Code. Achieve." stays in English as the trademark tagline, always accompanied on first use by the French gloss « Rêver. Coder. Réussir. ». "Creativity Before Code" renders as « La créativité avant le code ».

## 3. Canonical French terminology glossary

**Program & structure**

| English | Français (canonique) |
|---------|----------------------|
| Explorers / Builders / Developers / Engineers | Explorateurs / Bâtisseurs / Développeurs / Ingénieurs |
| The CODEship Journey | Le parcours CODEship |
| semester / session / capstone | semestre / séance / projet synthèse |
| Warm-up → Teach → Build → Reflect | Mise en train → Enseignement → Construction → Retour |
| quiz / knowledge check | jeu-questionnaire / vérification des acquis |
| workbook / rubric / showcase | cahier de l'élève / grille d'évaluation / vitrine des projets |
| Emerging / Developing / Proficient / Extending | En émergence / En développement / Maîtrisé / Enrichi |

**Concepts (K–8 strands)**

| English | Français |
|---------|----------|
| computational thinking | pensée informatique |
| sequencing / trigger / event | séquence / déclencheur / événement |
| if-then logic / conditional | logique si-alors / structure conditionnelle |
| debugging / bug | débogage / bogue |
| digital footprint / kindness online | empreinte numérique / bienveillance en ligne |
| tag / structure / styling | balise / structure / mise en forme |
| variable / function / loop / array | variable / fonction / boucle / tableau |
| media literacy / financial literacy | éducation aux médias / littératie financière |
| machine learning / training data / model | apprentissage automatique / données d'entraînement / modèle |
| bias / responsible AI | biais / IA responsable |
| dataset / data analysis / outlier | jeu de données / analyse de données / valeur aberrante |
| cybersecurity / password strength / phishing | cybersécurité / robustesse du mot de passe / hameçonnage |
| prototype / pitch | prototype / présentation-éclair (« pitch » accepted orally) |

**Published French project names (already public — do not re-translate)**

| English | Français (public, verbatim) |
|---------|------------------------------|
| My Helpful Robot | Mon robot serviable |
| Kindness Cards | Cartes de gentillesse |
| Recycling Sorter | Trieur de recyclage |

Extended canon for remaining Explorateurs components: My Neighbourhood Map → *Ma carte de quartier*; Show-and-Tell App → *Mon appli à présenter*.

## 4. Version control & synchronization strategy

- French volumes carry the same document IDs with `FR`: e.g., `CSA-EXP-PH-FR-v1.0`. **The English edition is the master**; French editions track it.
- **Major version lockstep:** a major change to an English volume (outcomes, projects, sequencing, assessment) automatically opens a localization ticket; the French counterpart may not lag more than one release cycle. Minor English edits batch into the French edition's next minor release.
- Every French volume's revision history records the English version it is equivalent to: *« Équivalent pédagogique de CSA-EXP-PH-EN-v1.0 »*.
- The glossary above is the binding terminology authority; changes to it are major versions of this plan and trigger a consistency sweep of all FR volumes.
- Marketing may not publish French program claims beyond what localized volumes exist to support (mirror of the website-alignment rule, FDS §8).

## 5. Quality assurance for French editions

Every FR volume passes: (1) educational-equivalence review against the EN master's outcomes and rubrics; (2) Québec-French language review by a qualified Canadian French education reviewer (not France-French); (3) terminology audit against §3; (4) the standard publishing QA of CSA-STD-PUB. Reviewer sign-offs are recorded in the revision history.

## 6. Delivered in this release (v1.0)

- This plan and binding glossary.
- **CSA-EXP-PH-FR-v1.0** — Guide des parents, Explorateurs (→ `curriculum/french/explorateurs-guide-des-parents.md`): the first Phase-1 volume, chosen because parents are the first French-language audience the Québec landing page converts.
- **CSA-EXP-SMAP-FR-v1.0** — Aperçu du programme et carte des semestres, Explorateurs (→ `curriculum/french/explorateurs-apercu-du-programme.md`): the French master reference from which the remaining Explorateurs volumes localize.

Remaining Phase-1 volumes (full Explorateurs set; Ingénieurs teacher set) are logged as open work in the library's Version Control Log with this plan as their specification.

## 7. Revision history

| Version | Date | Author role | Change |
|---------|------|-------------|--------|
| 1.0 | 2026-07-14 | Canadian French Education Consultant | Initial localization strategy, binding glossary, Phase-1 scope |
