/**
 * SERVER ONLY: Prompt Pilot missions 6–10 (paid: Builders or Developers).
 * Imported only by src/app/api/arcade/levels/route.ts. Do not import this from
 * any client component, or these levels become readable in the public bundle.
 */
import type { PromptLevel } from "../prompt";

export const PROMPT_PAID_LEVELS: PromptLevel[] = [
  {
    id: "what-could-go-wrong",
    title: "What Could Go Wrong?",
    emoji: "🧐",
    skill: "Challenge your idea",
    tip: "Great inventors ask: “What could go wrong?” Then they fix it.",
    steps: [
      {
        kind: "choose",
        astro: "Your plant robot is looking good!",
        ask: "Which prompt helps you test your idea?",
        options: [
          { text: "What could go wrong with my plant robot?", good: true, why: "Brave question! It might water too much, its battery could run out, or it could tip over." },
          { text: "Tell me my idea is perfect.", good: false, why: "That feels nice, but it won’t help you make it better. Try again!" },
          { text: "Make my robot for me.", good: false, why: "It’s your invention! Ask me to help you test it instead." },
        ],
      },
      {
        kind: "choose",
        ask: "Problem: the robot might water too much. 💦 How could YOU fix it?",
        options: [
          { text: "Stop watering when the soil is wet.", good: true, why: "Yes! A sensor can tell the robot when to stop." },
          { text: "Water the plants even more.", good: false, why: "Uh oh, that makes the problem bigger! Try another." },
          { text: "Ignore the problem.", good: false, why: "Problems don’t go away when we ignore them. Try a fix!" },
        ],
      },
    ],
  },
  {
    id: "find-the-gap",
    title: "Find the Gap",
    emoji: "🧩",
    skill: "Spot missing steps",
    tip: "Ask AI: “What did I forget?” Gaps hide in every plan.",
    steps: [
      {
        kind: "choose",
        astro: "Your class bake sale plan: 1) Bake cookies. 2) Make signs. 3) Sell cookies.",
        ask: "Which prompt helps you find what’s missing?",
        options: [
          { text: "What did I forget in my plan?", good: true, why: "Great question! Let’s look for the gap together." },
          { text: "Write a new plan for me.", good: false, why: "Your plan is a good start! Ask me to help you check it instead." },
          { text: "How many cookies are in the world?", good: false, why: "Ha! Fun, but it won’t help your plan. Try again." },
        ],
      },
      {
        kind: "choose",
        ask: "Astro found a gap! Which step is missing?",
        options: [
          { text: "Ask the teacher and pick a day.", good: true, why: "Yes! Without a day and permission, nobody would come. Gap fixed!" },
          { text: "Eat all the cookies first.", good: false, why: "Tasty, but then there’s nothing to sell! 😄 Try again." },
          { text: "Sing a song.", good: false, why: "Fun, but it’s not the missing step. Look again!" },
        ],
      },
    ],
  },
  {
    id: "fact-or-opinion",
    title: "Fact or Opinion?",
    emoji: "⚖️",
    skill: "Facts vs opinions",
    tip: "A fact can be checked. An opinion is what someone thinks.",
    steps: [
      {
        kind: "sort",
        ask: "Sort what Astro said: fact or opinion?",
        bins: ["Fact 📏", "Opinion 💭"],
        items: [
          { text: "The Moon goes around Earth.", bin: 0, why: "Scientists can measure and check it." },
          { text: "Pizza is the best food.", bin: 1, why: "Some people love pizza, some don’t." },
          { text: "Water freezes at 0 °C.", bin: 0, why: "You can test it with a thermometer!" },
          { text: "Blue is the prettiest colour.", bin: 1, why: "Everyone has a different favourite." },
        ],
      },
      {
        kind: "choose",
        astro: "Dogs are better pets than cats.",
        ask: "Hmm! What can you ask Astro?",
        options: [
          { text: "Is that a fact or an opinion?", good: true, why: "Good catch! That was my opinion. Some families love cats more." },
          { text: "Okay, it must be true.", good: false, why: "Wait! Is that something we can check? Try again." },
          { text: "Write it in my report as a fact.", good: false, why: "Careful! Opinions aren’t facts. Try another." },
        ],
      },
    ],
  },
  {
    id: "both-sides",
    title: "Both Sides",
    emoji: "🔁",
    skill: "Hear both sides",
    tip: "Ask for reasons FOR and AGAINST before you decide.",
    steps: [
      {
        kind: "choose",
        ask: "Your class wants to get a hamster. 🐹 Which prompt helps you decide fairly?",
        options: [
          { text: "Give me reasons for AND against a class hamster.", good: true, why: "Fair thinking! Now you’ll hear both sides." },
          { text: "Tell me why a hamster is great.", good: false, why: "Then you only hear one side. Try again!" },
          { text: "Tell me why hamsters are bad.", good: false, why: "That’s only one side too. Ask for both!" },
        ],
      },
      {
        kind: "sort",
        ask: "Sort Astro’s reasons.",
        bins: ["For 👍", "Against 👎"],
        items: [
          { text: "We can learn to care for an animal.", bin: 0, why: "Taking care of a pet teaches responsibility." },
          { text: "Who will feed it on weekends?", bin: 1, why: "A good question to plan for!" },
          { text: "It makes the classroom fun.", bin: 0, why: "Pets can make school feel cozy." },
          { text: "Some kids might be allergic.", bin: 1, why: "Safety matters for everyone." },
        ],
      },
    ],
  },
  {
    id: "super-prompter",
    title: "Super Prompter",
    emoji: "🚀",
    skill: "Put it all together",
    tip: "Ask clearly, check sources, catch mistakes, and keep improving!",
    steps: [
      {
        kind: "build",
        ask: "Final mission: build a prompt for your volcano report.",
        slots: [
          {
            label: "What",
            emoji: "🎯",
            options: [
              { text: "Tell me about stuff", good: false },
              { text: "Explain why volcanoes erupt", good: true },
              { text: "Give me 5 facts about volcanoes", good: true },
            ],
          },
          {
            label: "Who",
            emoji: "🧒",
            options: [
              { text: "for whoever", good: false },
              { text: "for a Grade 3 student", good: true },
              { text: "for my class presentation", good: true },
            ],
          },
          {
            label: "Check",
            emoji: "🔎",
            options: [
              { text: "and that’s it.", good: false },
              { text: "and tell me your sources.", good: true },
              { text: "and say which parts are facts.", good: true },
            ],
          },
        ],
        answers: [
          "Volcanoes… are things? I wasn’t sure what you needed. 🤷",
          "Here’s some volcano info. I had to guess a lot!",
          "Here’s a good volcano explanation for you!",
          "Here’s a clear volcano explanation for your class, with sources you can check! 🌋📚",
        ],
      },
      {
        kind: "spot",
        ask: "Astro’s answer has ONE mistake. Check the fact book, then tap it.",
        astro: ["Volcanoes can erupt hot, melted rock called lava.", "Lava is very cold.", "Some volcanoes are under the ocean."],
        wrong: 1,
        check: "📘 Fact book: Lava is super hot, over 700 °C!",
        why: "Mistake caught! You checked instead of trusting blindly.",
      },
      {
        kind: "choose",
        ask: "Your report is almost done. What’s the best last prompt?",
        options: [
          { text: "What is one part of my report I could explain better?", good: true, why: "That’s what super prompters do: keep improving their OWN work. 🏆" },
          { text: "Rewrite my whole report for me.", good: false, why: "Then it isn’t your report anymore! Ask for one way to improve instead." },
          { text: "Say my report is the best ever.", good: false, why: "Nice, but it won’t help you grow. Try again!" },
        ],
      },
    ],
  },
];
