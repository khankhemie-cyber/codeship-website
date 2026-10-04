// The finished Explorers projects from the lesson plans, as CODEship Blocks
// project data. Used by test-blocks.mjs (engine, Node) and
// test-blocks-e2e.mjs (the real page). Each fixture's comment is the block
// listing from the lesson plan.

// A stack from a list: "move_right", ["say", "Hi"], ["wait", 2], ["repeat", 5, [...]] ...
export function stack(items, x = 20, y = 20) {
  const make = (item) => {
    const [type, arg, inner] = Array.isArray(item) ? item : [item];
    const b = { type };
    if (type === "say") b.fields = { TEXT: arg };
    if (type === "wait" || type === "repeat") b.fields = { N: String(arg) };
    if (type === "go_page") b.fields = { PAGE: String(arg) };
    if (type === "send_message" || type === "start_message") b.fields = { COLOUR: arg };
    if (type === "record") b.data = arg;
    if (type === "repeat" && inner?.length) b.inputs = { DO: { block: chain(inner) } };
    return b;
  };
  const chain = (list) => {
    const blocks = list.map(make);
    for (let i = 0; i < blocks.length - 1; i++) blocks[i].next = { block: blocks[i + 1] };
    return blocks[0];
  };
  return { ...chain(items), x, y };
}
const scripts = (...stacks) => ({ blocks: { languageVersion: 0, blocks: stacks } });
const project = (name, characters, pages, recordings = {}) => ({ format: "codeship-blocks", version: 1, name, characters, pages, recordings });

/** A 1-second silent WAV (16 kHz mono) as a data URL, standing in for a child's voice. */
export function silentWav(seconds = 1, rate = 16000) {
  const n = Math.round(seconds * rate), buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  return { mime: "audio/wav", data: "data:audio/wav;base64," + buf.toString("base64"), durationMs: seconds * 1000 };
}

// 1. Semester 1 — My Helpful Robot
//    Start on Tap, Move Right x2, Say "Got it!", Move Left x2, Say "All tidy!", Pop, Grow
export const robotSteps = ["start_tap", "move_right", "move_right", ["say", "Got it!"], "move_left", "move_left", ["say", "All tidy!"], "pop", "grow"];
export const helpfulRobot = (steps = robotSteps) =>
  project("My Helpful Robot", [{ id: "robot", costume: "robot" }], [
    { id: "p1", background: "room", actors: [{ id: "robot1", characterId: "robot", x: 2, y: 4, scripts: scripts(stack(steps)) }] },
  ]);

// 2. Semester 2 — Kindness Cards (one character on two pages, one recording)
//    P1: Start on Tap, Say "Happy birthday Grandma!", Wait 2, Say "I made this for you", Wait 2, Go to Page 2
//    P2: Start on Green Flag, Record, Wait 1, Grow, Shrink, Pop
export const kindnessCards = () =>
  project(
    "Kindness Cards",
    [{ id: "card", costume: "card" }],
    [
      { id: "p1", background: "sky", actors: [{ id: "card1", characterId: "card", x: 4, y: 3, scripts: scripts(stack(["start_tap", ["say", "Happy birthday Grandma!"], ["wait", 2], ["say", "I made this for you"], ["wait", 2], ["go_page", 2]])) }] },
      { id: "p2", background: "party", actors: [{ id: "card2", characterId: "card", x: 4, y: 3, scripts: scripts(stack(["start_flag", ["record", "voice1"], ["wait", 1], "grow", "shrink", "pop"])) }] },
    ],
    { voice1: silentWav(2) },
  );

// 3. Semester 3 — Recycling Sorter. The bin is exactly five squares right of the can.
//    Can travel stack: Start on Tap, Show, Repeat 5 { Move Right }
//    Can bump stack:   Start on Bump, Say "Yes! That one recycles", Pop, Wait 1, Hide
export const sorterTravel = (n = 5, inner = ["move_right"], withShow = true) => ["start_tap", ...(withShow ? ["show"] : []), ["repeat", n, inner]];
export const sorterBump = ["start_bump", ["say", "Yes! That one recycles"], "pop", ["wait", 1], "hide"];
export const recyclingSorter = ({ travel = sorterTravel(), onBin = false } = {}) => {
  const canScripts = scripts(stack(travel), stack(sorterBump, 20, 260));
  const empty = scripts();
  return project("Recycling Sorter", [{ id: "can", costume: "can" }, { id: "bin", costume: "bin" }], [
    { id: "p1", background: "street", actors: [
      { id: "can1", characterId: "can", x: 1, y: 4, scripts: onBin ? empty : canScripts },
      { id: "bin1", characterId: "bin", x: 6, y: 4, scripts: onBin ? canScripts : empty },
    ] },
  ]);
};

// 4. Semester 4 — My Neighbourhood Map (4 pages, park on two of them, 3 recordings, a message)
//    P1 park:    Start on Tap, Say "The park!", Send Message blue, Wait 1, Go to Page 2
//    P1 library: Start on Message blue, Grow, Pop, Wait 1, Shrink
//    P2 park:    Start on Green Flag, Record, Wait 2, Go Home   (pages 3 and 4 likewise for the library and school)
export const neighbourhoodMap = ({ listen = "blue", goHome = true } = {}) => {
  const placePage = (id, actorId, characterId, clip) => ({
    id, background: "grass", actors: [{ id: actorId, characterId, x: 4, y: 3, scripts: scripts(stack(["start_flag", ["record", clip], ["wait", 2], ...(goHome ? ["go_home"] : [])])) }],
  });
  return project(
    "My Neighbourhood Map",
    [{ id: "park", costume: "tree" }, { id: "library", costume: "library" }, { id: "school", costume: "school" }],
    [
      { id: "p1", background: "map", actors: [
        { id: "park1", characterId: "park", x: 1, y: 1, scripts: scripts(stack(["start_tap", ["say", "The park!"], ["send_message", "blue"], ["wait", 1], ["go_page", 2]])) },
        { id: "library1", characterId: "library", x: 6, y: 2, scripts: scripts(stack([["start_message", listen], "grow", "pop", ["wait", 1], "shrink"]), stack(["start_tap", ["go_page", 3]], 20, 300)) },
        { id: "school1", characterId: "school", x: 3, y: 6, scripts: scripts(stack(["start_tap", ["go_page", 4]])) },
      ] },
      placePage("p2", "park2", "park", "voice-park"),
      placePage("p3", "library3", "library", "voice-library"),
      placePage("p4", "school4", "school", "voice-school"),
    ],
    { "voice-park": silentWav(2), "voice-library": silentWav(1.5), "voice-school": silentWav(1) },
  );
};
