// © 2026 CODEship Academy. All rights reserved. Proprietary and confidential: see LICENSE.
/**
 * Port CODEship challenge content: goals, hints, starter code, starter blocks,
 * and the worlds each challenge is played and tested in.
 *
 * SERVER ONLY. This file must never be imported by game (client) code: it is
 * sent only to CODEship students, by /api/arcade/port/, after the class
 * password check. The tests import it directly.
 */

import { build } from "./blocks";
import {
  APPOINTMENTS,
  makeLitter,
  type BankWorld,
  type BeachWorld,
  type HomeWorld,
  type LibraryWorld,
  type MarketWorld,
  type MissionId,
  type MissionInfo,
  type SecurityWorld,
} from "./missions";

const { chain, blk, ws } = build;
void APPOINTMENTS;

/** The world each challenge is played in when you're standing there. */
function liveWorld(mission: "security" | "bank" | "library"): unknown {
  if (mission === "security")
    return {
      visitors: [
        { name: "Ms. Rivera", id: true },
        { name: "Mr. Lopez", id: true },
        { name: "Mr. Chen", id: false },
        { name: "Dr. Okafor", id: true },
        { name: "Ms. Kim", id: false },
        { name: "Mrs. Singh", id: true },
      ],
    } satisfies SecurityWorld;
  if (mission === "bank") return { amounts: [87, 23, 4] } satisfies BankWorld;
  return { books: [412, 105, 733, 268, 590, 321, 884, 150] } satisfies LibraryWorld;
}

/** The hidden worlds every solution must also pass, after the live one. */
function testWorlds(mission: MissionId): unknown[] {
  if (mission === "home") return [{ blocks: [] } satisfies HomeWorld];
  if (mission === "market")
    return [
      { orders: ["eggs", "rice", "oranges", "cookies"] },
      { orders: ["flour", "cereal", "milk"] },
      { orders: ["mangoes"] },
    ] satisfies MarketWorld[];
  if (mission === "security")
    return [
      { visitors: [{ name: "Mr. Baptiste", id: true }, { name: "Ms. Haddad", id: true }, { name: "Mrs. Singh", id: false }, { name: "Mr. Chen", id: true }] },
      { visitors: [{ name: "Mr. Grant", id: false }, { name: "Dr. Okafor", id: true }] },
      { visitors: [] },
    ] satisfies SecurityWorld[];
  if (mission === "bank") return [{ amounts: [99, 50, 7, 136] }, { amounts: [1, 65, 38] }, { amounts: [] }] satisfies BankWorld[];
  if (mission === "library")
    return [
      { books: [9, 8, 7, 6, 5, 4, 3, 2, 1] },
      { books: [100, 200, 300] },
      { books: [530, 112, 530, 87, 941, 300] },
      { books: [42] },
    ] satisfies LibraryWorld[];
  return [{ litter: makeLitter(9, 7) }, { litter: makeLitter(14, 42) }, { litter: [] }] satisfies BeachWorld[];
}


const MISSIONS: Record<MissionId, MissionInfo> = {
  home: {
    id: "home",
    bot: "Builder Bot",
    title: "Build your house",
    goal: "Build the walls of your house: a 6 × 5 outline, 3 blocks high (54 blocks). The bot starts in the corner of your plot, facing east.",
    api: [
      { sig: "place()", doc: "Put a block where the bot is." },
      { sig: "move(n)", doc: "Drive n blocks forward." },
      { sig: "turn_right() / turn_left()", doc: "Turn 90°." },
      { sig: "up() / down()", doc: "Go up or down one layer." },
      { sig: 'set_color("wood")', doc: "brick, wood, stone, white, teal, yellow, glass" },
      { sig: "remove()", doc: "Take away the block where the bot is." },
    ],
    starter: {
      py: `# Builder Bot: build one wall, then turn the corner.
# Your job: finish all 4 walls, 3 layers high.
# Hint: a loop can repeat a wall, and another loop can repeat a layer.

set_color("brick")

for step in range(5):
    place()
    move(1)
turn_right()
`,
      js: `// Builder Bot: build one wall, then turn the corner.
// Your job: finish all 4 walls, 3 layers high.
// Hint: a loop can repeat a wall, and another loop can repeat a layer.

set_color("brick");

for (let step = 0; step < 5; step++) {
  place();
  move(1);
}
turn_right();
`,
    },
    hint: "The long walls need 5 place-and-move steps, the short walls 4. After 4 walls the bot is back at the corner: call up() and do it again.",
  },
  market: {
    id: "market",
    bot: "Ladder Bot",
    title: "Help at the Portside Market",
    goal: "Program the Ladder Bot to serve every customer: find their product's aisle and shelf, pick it, and deliver it. Read the aisle signs in the market to finish shelf_map.",
    api: [
      { sig: "has_customer()", doc: "True while someone is waiting." },
      { sig: "next_order()", doc: 'The product the customer wants, e.g. "cereal".' },
      { sig: "go_to_aisle(n)", doc: "Drive to aisle 1–4." },
      { sig: "raise_to(level)", doc: "Raise the ladder to shelf 1 (bottom) to 4 (top)." },
      { sig: "pick()", doc: "Take the product on this shelf." },
      { sig: "deliver()", doc: "Bring it to the customer at the counter." },
    ],
    starter: {
      py: `# Where is everything? [aisle, shelf]
# Walk the aisles and read the signs to fill in the rest.
shelf_map = {
    "rice": [1, 1],
    "cereal": [4, 4],
}

while has_customer():
    product = next_order()
    aisle, level = shelf_map[product]
    go_to_aisle(aisle)
    raise_to(level)
    pick()
    deliver()
`,
      js: `// Where is everything? [aisle, shelf]
// Walk the aisles and read the signs to fill in the rest.
const shelf_map = {
  "rice": [1, 1],
  "cereal": [4, 4],
};

while (has_customer()) {
  const product = next_order();
  const [aisle, level] = shelf_map[product];
  go_to_aisle(aisle);
  raise_to(level);
  pick();
  deliver();
}
`,
    },
    hint: "Each aisle sign lists its 4 shelves from bottom (1) to top (4). There are 16 products in all, and the bot is tested on new customers.",
  },
  beach: {
    id: "beach",
    bot: "Shore Bot",
    title: "Clean up the beach",
    goal: "Program the Shore Bot to pick up every piece of litter and sort it into the right bin. It runs again every time the tide brings more.",
    api: [
      { sig: "has_litter()", doc: "True while litter is left on the beach." },
      { sig: "scan()", doc: 'What the nearest litter is, e.g. "can".' },
      { sig: "pick_up()", doc: "Drive to the nearest litter and grab it." },
      { sig: 'drop_in("recycling")', doc: "Drive to a bin and drop it: recycling, compost or garbage." },
    ],
    starter: {
      py: `# Recycling: bottle, can, newspaper
# Compost:   apple core, banana peel
# Garbage:   chip bag, straw

while has_litter():
    item = scan()
    pick_up()
    if item == "can":
        drop_in("recycling")
    else:
        drop_in("garbage")
`,
      js: `// Recycling: bottle, can, newspaper
// Compost:   apple core, banana peel
// Garbage:   chip bag, straw

while (has_litter()) {
  const item = scan();
  pick_up();
  if (item === "can") {
    drop_in("recycling");
  } else {
    drop_in("garbage");
  }
}
`,
    },
    hint: "Use elif (Python) or else if (JavaScript) for each bin, or make a dictionary that maps each item to its bin.",
  },
  security: {
    id: "security",
    bot: "Gate Bot",
    title: "Town Hall security",
    goal: "Program the security gate. Let a visitor in only if they have an appointment today AND show photo ID. Everyone else goes to the front desk. The appointment board is on the lobby wall.",
    api: [
      { sig: "has_visitor()", doc: "True while someone is waiting at the gate." },
      { sig: "next_visitor()", doc: 'The next visitor\'s name, e.g. "Mr. Chen".' },
      { sig: "has_id()", doc: "True if this visitor showed photo ID." },
      { sig: "let_in()", doc: "Open the gate for them." },
      { sig: "send_to_desk()", doc: "Send them to the front desk instead." },
    ],
    starter: {
      py: `# Who is expected today? Read the board in the lobby.
appointments = ["Ms. Rivera", "Mr. Chen"]

while has_visitor():
    name = next_visitor()
    if name in appointments:
        let_in()
    else:
        send_to_desk()
`,
      js: `// Who is expected today? Read the board in the lobby.
const appointments = ["Ms. Rivera", "Mr. Chen"];

while (has_visitor()) {
  const name = next_visitor();
  if (appointments.includes(name)) {
    let_in();
  } else {
    send_to_desk();
  }
}
`,
    },
    hint: "Two things must both be true: the name is on the board, and has_id() is True. In Python use 'and', in JavaScript '&&'. And copy every name from the board.",
  },
  bank: {
    id: "bank",
    bot: "Change Machine",
    title: "Bank change machine",
    goal: "Program the change machine to pay each customer exactly what they're owed, using the fewest bills. Bills come in 50, 20, 10, 5 and 1.",
    api: [
      { sig: "has_customer()", doc: "True while someone is in line." },
      { sig: "next_customer()", doc: "Serve the next customer; returns how much they're owed." },
      { sig: "amount_left()", doc: "How much this customer still needs." },
      { sig: "give(bill)", doc: "Hand over one bill: 50, 20, 10, 5 or 1." },
    ],
    starter: {
      py: `while has_customer():
    amount = next_customer()
    # This pays the right amount... in a LOT of bills.
    while amount_left() >= 1:
        give(1)
`,
      js: `while (has_customer()) {
  const amount = next_customer();
  // This pays the right amount... in a LOT of bills.
  while (amount_left() >= 1) {
    give(1);
  }
}
`,
    },
    hint: "Try the biggest bill first: while amount_left() is at least 50, give(50). Then do the same for 20, 10, 5 and 1. A list of bills and a for loop keeps it short.",
  },
  library: {
    id: "library",
    bot: "Shelf Bot",
    title: "Sort the library books",
    goal: "Program the Shelf Bot to put the returned books in order, smallest call number on the left. Spots are numbered from 0.",
    api: [
      { sig: "book_count()", doc: "How many books are on the shelf." },
      { sig: "call_number(i)", doc: "The number on the book at spot i." },
      { sig: "swap(i, j)", doc: "Swap the books at spots i and j." },
    ],
    starter: {
      py: `n = book_count()

# One pass: swap any neighbours that are the wrong way round.
for i in range(n - 1):
    if call_number(i) > call_number(i + 1):
        swap(i, i + 1)
`,
      js: `const n = book_count();

// One pass: swap any neighbours that are the wrong way round.
for (let i = 0; i < n - 1; i++) {
  if (call_number(i) > call_number(i + 1)) {
    swap(i, i + 1);
  }
}
`,
    },
    hint: "One pass moves the biggest book to the end, but the rest may still be mixed up. Repeat the pass: a loop around your loop (this is called bubble sort).",
  },
};


const STARTER_BLOCKS: Record<MissionId, unknown> = {
  home: ws(chain(blk("port_start"), blk("port_color", { C: "brick" }), blk("port_repeat", { N: 5 }, { DO: chain(blk("port_place"), blk("port_move", { N: 1 })) }), blk("port_turn", { D: "right" }))!),
  market: ws(
    chain(
      blk("port_start"),
      blk("port_map", undefined, { DO: chain(blk("port_map_entry", { P: "rice", A: 1, L: 1 }), blk("port_map_entry", { P: "cereal", A: 4, L: 4 })) }),
      blk("port_while", undefined, { COND: blk("port_customer"), DO: chain(blk("port_next_order"), blk("port_go_order"), blk("port_pick"), blk("port_deliver")) })
    )!
  ),
  beach: ws(
    chain(
      blk("port_start"),
      blk("port_while", undefined, {
        COND: blk("port_litter"),
        DO: chain(blk("port_scan"), blk("port_pick_up"), blk("port_if_else", undefined, { COND: blk("port_item_is", { K: "can" }), DO: blk("port_drop_in", { B: "recycling" }), ELSE: blk("port_drop_in", { B: "garbage" }) })),
      })
    )!
  ),
  security: ws(
    chain(
      blk("port_start"),
      blk("port_board", undefined, { DO: chain(blk("port_board_name", { N: "Ms. Rivera" }), blk("port_board_name", { N: "Mr. Chen" })) }),
      blk("port_while", undefined, {
        COND: blk("port_visitor_waiting"),
        DO: chain(blk("port_next_visitor"), blk("port_if_else", undefined, { COND: blk("port_on_board"), DO: blk("port_let_in"), ELSE: blk("port_to_desk") })),
      })
    )!
  ),
  bank: ws(
    chain(
      blk("port_start"),
      blk("port_while", undefined, {
        COND: blk("port_customer"),
        DO: chain(blk("port_next_customer"), blk("port_while", undefined, { COND: blk("port_left_at_least", { N: 1 }), DO: blk("port_give", { B: "1" }) })),
      })
    )!
  ),
  library: ws(chain(blk("port_start"), blk("port_each_pair", undefined, { DO: blk("port_if", undefined, { COND: blk("port_pair_wrong"), DO: blk("port_swap_pair") }) }))!),
};


export type PortContent = {
  missions: Record<MissionId, MissionInfo>;
  starterBlocks: Record<MissionId, unknown>;
  testWorlds: Record<MissionId, unknown[]>;
  live: { security: SecurityWorld; bank: BankWorld; library: LibraryWorld };
};

const IDS: MissionId[] = ["home", "market", "beach", "security", "bank", "library"];

/** Everything a student's game needs to play the challenges. */
export function portContent(): PortContent {
  return {
    missions: MISSIONS,
    starterBlocks: STARTER_BLOCKS,
    testWorlds: Object.fromEntries(IDS.map((id) => [id, testWorlds(id)])) as Record<MissionId, unknown[]>,
    live: {
      security: liveWorld("security") as SecurityWorld,
      bank: liveWorld("bank") as BankWorld,
      library: liveWorld("library") as LibraryWorld,
    },
  };
}

/** For the tests. */
export { MISSIONS, STARTER_BLOCKS, liveWorld, testWorlds };
