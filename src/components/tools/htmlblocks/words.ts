/**
 * The word bank (CEO, 2026-11-27): words for building a page without typing.
 * Grades 2 to 3, Canadian spelling, short sentences, nothing personal (no
 * names, ages, schools or addresses). Each word has a picture from public/art
 * (Fluent Emoji, MIT); within a topic, no two words of the same kind share a
 * picture. The "My website pages" topic has the capstone page words.
 * Wording is reviewed by the CEO and the curriculum role before release.
 */

export type WordKind = "heading" | "sentence" | "item" | "link";
export type Word = { text: string; art: string; kinds: WordKind[] };
export type WordTopic = { id: string; name: string; art: string; words: Word[] };

const group = (kind: WordKind, list: [string, string][]): Word[] => list.map(([text, art]) => ({ text, art, kinds: [kind] }));

export const WORD_BANK: WordTopic[] = [
  {
    id: "me",
    name: "About me",
    art: "1f4d3",
    words: [
      ...group("heading", [["All About Me", "2764"], ["Hello!", "1f4ac"], ["Things I Like", "2b50"], ["What I Can Do", "1f4a1"], ["My Day", "2600"]]),
      ...group("sentence", [["Hello! Welcome to my page.", "1f4ac"], ["I like to learn new things.", "1f4a1"], ["I am kind and helpful.", "2764"], ["I love to read books.", "1f4da"], ["I like to draw and paint.", "1f3a8"], ["I like to play outside.", "1f333"], ["I am learning to code.", "1f4bb"], ["I like to build things.", "1f9f1"], ["I can ride a bike.", "1f6b2"], ["I help at home.", "1f9f9"]]),
      ...group("item", [["Reading", "1f4da"], ["Drawing", "1f58d"], ["Soccer", "26bd"], ["Music", "1f3b5"], ["Coding", "1f4bb"], ["Building", "1f9f1"], ["Swimming", "1f30a"], ["Biking", "1f6b2"], ["Painting", "1f3a8"], ["Singing", "1f3a4"], ["Dancing", "1f3b6"], ["Skating", "26f8"], ["Puzzles", "1f9e9"], ["Gardening", "1f331"], ["Baking", "1f9c1"]]),
      ...group("link", [["About me", "1f4ac"], ["Things I like", "2b50"], ["Learn more", "1f50e"]]),
    ],
  },
  {
    id: "favourites",
    name: "Favourite things",
    art: "2b50",
    words: [
      ...group("heading", [["My Favourite Things", "2b50"], ["Favourite Foods", "1f355"], ["Favourite Colours", "1f308"], ["Favourite Games", "1f3ae"], ["Favourite Books", "1f4da"]]),
      ...group("sentence", [["My favourite food is pizza.", "1f355"], ["My favourite colour is blue.", "1f537"], ["I like to play games with my friends.", "1f3ae"], ["Rainbows make me happy.", "1f308"], ["I like sunny days.", "2600"], ["I love strawberries.", "1f353"], ["My favourite animal is a dog.", "1f415"], ["I like music with a good beat.", "1f941"], ["I love the smell of fresh bread.", "1f35e"], ["Cupcakes are a fun treat.", "1f9c1"]]),
      ...group("item", [["Pizza", "1f355"], ["Apples", "1f34e"], ["Strawberries", "1f353"], ["Cookies", "1f36a"], ["Games", "1f3ae"], ["Basketball", "1f3c0"], ["Kites", "1fa81"], ["Balloons", "1f388"], ["Books", "1f4da"], ["Music", "1f3b6"], ["Rainbows", "1f308"], ["Puppies", "1f415"], ["Kittens", "1f408"], ["Pancakes", "1f95e"], ["Bubbles", "1fae7"]]),
      ...group("link", [["My favourites", "2b50"], ["Learn more", "1f50e"]]),
    ],
  },
  {
    id: "animals",
    name: "Animals",
    art: "1f415",
    words: [
      ...group("heading", [["Animals I Love", "1f98b"], ["Pet Care", "1f415"], ["Food for Pets", "1f955"], ["Fresh Water", "1f4a7"], ["Wild Animals", "1f981"]]),
      ...group("sentence", [["Pets need food and water every day.", "1f4a7"], ["Be gentle with animals.", "2764"], ["Dogs need a walk every day.", "1f415"], ["Cats like a quiet place to sleep.", "1f408"], ["Fish live in water.", "1f420"], ["Birds build nests.", "1faba"], ["Rabbits like to eat hay.", "1f407"], ["Turtles grow very slowly.", "1f422"], ["Many owls are awake at night.", "1f989"], ["Bees make honey.", "1f41d"]]),
      ...group("item", [["Dog", "1f415"], ["Cat", "1f408"], ["Hamster", "1f439"], ["Turtle", "1f422"], ["Rabbit", "1f407"], ["Fish", "1f41f"], ["Bird", "1f426"], ["Horse", "1f40e"], ["Give fresh water", "1f964"], ["Feed every day", "1f955"], ["Clean the cage", "1f9f9"], ["Play together", "26bd"], ["Wash the bowl", "1f9fd"], ["Take a walk", "1f45f"], ["Give a cozy bed", "1f6cf"]]),
      ...group("link", [["Pet care", "1f415"], ["Learn more", "1f50e"]]),
    ],
  },
  {
    id: "space",
    name: "Space",
    art: "1f680",
    words: [
      ...group("heading", [["Space Explorer", "1f680"], ["The Night Sky", "1f303"], ["Our Solar System", "1fa90"], ["The Moon", "1f315"], ["Stars", "1f31f"]]),
      ...group("sentence", [["Rockets fly into space.", "1f680"], ["The Moon goes around the Earth.", "1f319"], ["The Earth goes around the Sun.", "1f30e"], ["The Sun is a star.", "2600"], ["Stars shine at night.", "1f31f"], ["A satellite goes around the Earth.", "1f6f0"], ["We can see stars with a telescope.", "1f52d"], ["Saturn has rings.", "1fa90"], ["A comet has a long tail.", "2604"], ["The Milky Way is our galaxy.", "1f30c"]]),
      ...group("item", [["Moon", "1f315"], ["Stars", "1f31f"], ["Earth", "1f30e"], ["Sun", "2600"], ["Rocket", "1f680"], ["Satellite", "1f6f0"], ["Telescope", "1f52d"], ["Comet", "2604"], ["Planets", "1fa90"], ["Galaxy", "1f30c"], ["Shooting star", "1f320"], ["Crescent moon", "1f319"], ["Night sky", "1f303"], ["Twinkling stars", "2728"], ["Sunrise", "1f305"]]),
      ...group("link", [["Explore space", "1f680"], ["Learn more", "1f50e"]]),
    ],
  },
  {
    id: "robots",
    name: "Robots",
    art: "1f916",
    words: [
      ...group("heading", [["My Robot", "1f916"], ["How Robots Help", "1f4a1"], ["Robot Parts", "1f529"], ["Coding My Robot", "1f4bb"], ["Robot Challenge", "1f3c6"]]),
      ...group("sentence", [["Robots follow the code we write.", "2328"], ["My robot can beep and move.", "1f50a"], ["A sensor helps a robot sense things.", "1f50d"], ["Robots need power from a battery.", "1f50b"], ["My robot can follow a line.", "2194"], ["Robots can help people at work.", "1f3ed"], ["I can make my robot turn.", "1f501"], ["Code is a list of steps.", "1f4cb"], ["Robots can sort things.", "1f4e6"], ["We test our code and fix it.", "1f9ea"]]),
      ...group("item", [["Sensors", "1f50d"], ["Wheels", "1f699"], ["Battery", "1f50b"], ["Code", "2328"], ["Motor", "2699"], ["Lights", "1f4a1"], ["Speaker", "1f50a"], ["Laptop", "1f4bb"], ["Bolts", "1f529"], ["Magnet", "1f9f2"], ["Toolbox", "1f9f0"], ["Timer", "23f0"], ["Steps", "1f4cb"], ["Tests", "1f9ea"], ["Robot", "1f916"]]),
      ...group("link", [["Meet my robot", "1f916"], ["Learn more", "1f50e"]]),
    ],
  },
  {
    id: "helping",
    name: "Helping",
    art: "2764",
    words: [
      ...group("heading", [["How to Help", "2764"], ["Plant Flowers for Bees", "1f41d"], ["Care for the Earth", "1f30e"], ["Be a Good Neighbour", "1f3e1"], ["Keep Our Park Clean", "1f3de"]]),
      ...group("sentence", [["We can all help our community.", "2764"], ["Flowers help bees.", "1f33b"], ["Recycling keeps the Earth clean.", "267b"], ["Turn off the lights to save energy.", "1f4a1"], ["Turn off the tap to save water.", "1f4a7"], ["Put litter in the bin.", "1f5d1"], ["Trees help keep the air clean.", "1f333"], ["Be kind to everyone.", "2728"], ["Bees need flowers to make honey.", "1f36f"], ["Walk or bike when you can.", "1f6b2"]]),
      ...group("item", [["Recycle", "267b"], ["Plant flowers", "1f337"], ["Save water", "1f4a7"], ["Be kind", "2764"], ["Pick up litter", "1f5d1"], ["Plant a tree", "1f333"], ["Turn off lights", "1f4a1"], ["Help a friend", "2b50"], ["Share", "1f381"], ["Walk or bike", "1f6b2"], ["Reuse things", "1f501"], ["Fix things", "1f9f0"], ["Feed the birds", "1f426"], ["Help at home", "1f9f9"], ["Grow a garden", "1f331"]]),
      ...group("link", [["How to help", "2764"], ["Learn more", "1f50e"], ["Read more", "1f4da"]]),
    ],
  },
  {
    id: "nature",
    name: "Nature",
    art: "1f333",
    words: [
      ...group("heading", [["Out in Nature", "1f333"], ["Trees", "1f332"], ["Flowers", "1f337"], ["Bugs", "1f41e"], ["The Seasons", "1f342"]]),
      ...group("sentence", [["Trees give us shade.", "1f333"], ["Flowers need sun and water.", "1f337"], ["Bees visit flowers.", "1f41d"], ["Leaves change colour in the fall.", "1f342"], ["Maple trees grow in Canada.", "1f341"], ["A seed grows into a plant.", "1f331"], ["Mushrooms grow in damp places.", "1f344"], ["Birds sing in the morning.", "1f426"], ["Butterflies start as caterpillars.", "1f98b"], ["Rocks can be big or small.", "1faa8"]]),
      ...group("item", [["Tree", "1f333"], ["Pine tree", "1f332"], ["Flower", "1f33c"], ["Tulip", "1f337"], ["Sunflower", "1f33b"], ["Leaf", "1f342"], ["Maple leaf", "1f341"], ["Seed", "1f331"], ["Mushroom", "1f344"], ["Rock", "1faa8"], ["Feather", "1fab6"], ["Nest", "1faba"], ["Ladybug", "1f41e"], ["Ant", "1f41c"], ["Caterpillar", "1f41b"]]),
      ...group("link", [["Explore nature", "1f333"], ["Learn more", "1f50e"]]),
    ],
  },
  {
    id: "weather",
    name: "Weather",
    art: "26c5",
    words: [
      ...group("heading", [["Today's Weather", "26c5"], ["Sunny Days", "2600"], ["Rainy Days", "1f327"], ["Snowy Days", "2744"], ["Weather Helper", "1f321"]]),
      ...group("sentence", [["It is sunny today.", "2600"], ["It is raining. Take an umbrella!", "2614"], ["It is snowing outside.", "2744"], ["It is cloudy today.", "2601"], ["It is windy today.", "1f343"], ["Drink water on hot days.", "1f964"], ["Build a snowman on snowy days.", "26c4"], ["A rainbow can come after rain.", "1f308"], ["Stay inside when there is lightning.", "1f329"], ["A thermometer shows how hot it is.", "1f321"]]),
      ...group("item", [["Sunny", "2600"], ["Cloudy", "2601"], ["Rainy", "1f327"], ["Snowy", "2744"], ["Windy", "1f343"], ["Stormy", "1f329"], ["Foggy", "1f301"], ["Rainbow", "1f308"], ["Umbrella", "2602"], ["Snowman", "26c4"], ["Thermometer", "1f321"], ["Tornado", "1f32a"], ["Partly sunny", "26c5"], ["Hot", "1f525"], ["Puddles", "1f4a7"]]),
      ...group("link", [["Check the weather", "26c5"], ["Learn more", "1f50e"]]),
    ],
  },
  {
    id: "food",
    name: "Food",
    art: "1f34e",
    words: [
      ...group("heading", [["Healthy Snacks", "1f34e"], ["Fruits", "1f347"], ["Vegetables", "1f966"], ["Breakfast", "1f95e"], ["Lunch", "1f957"]]),
      ...group("sentence", [["Fruit is a healthy snack.", "1f34e"], ["Vegetables help us grow strong.", "1f966"], ["Drink water every day.", "1f964"], ["Milk helps build strong bones.", "1f95b"], ["I like pancakes for breakfast.", "1f95e"], ["Wash your hands before you eat.", "1f9fc"], ["Carrots are crunchy.", "1f955"], ["Bananas are a good snack.", "1f34c"], ["Bread is made from flour.", "1f35e"], ["We share food with friends.", "1f9fa"]]),
      ...group("item", [["Apple", "1f34e"], ["Banana", "1f34c"], ["Orange", "1f34a"], ["Grapes", "1f347"], ["Pear", "1f350"], ["Strawberry", "1f353"], ["Watermelon", "1f349"], ["Carrot", "1f955"], ["Broccoli", "1f966"], ["Corn", "1f33d"], ["Cheese", "1f9c0"], ["Bread", "1f35e"], ["Rice", "1f35a"], ["Pasta", "1f35d"], ["Salad", "1f957"], ["Milk", "1f95b"], ["Pancakes", "1f95e"], ["Egg", "1f95a"]]),
      ...group("link", [["Snack ideas", "1f34e"], ["Learn more", "1f50e"]]),
    ],
  },
  {
    id: "sports",
    name: "Sports and play",
    art: "26bd",
    words: [
      ...group("heading", [["Let's Play!", "26bd"], ["Team Sports", "1f3c0"], ["Winter Fun", "26f8"], ["Game Day", "1f3df"], ["Fun Outside", "1fa81"]]),
      ...group("sentence", [["Playing outside is good for us.", "2600"], ["Soccer is played with a ball.", "26bd"], ["We play hockey on the ice.", "1f3d2"], ["I can ride my bike.", "1f6b2"], ["Stretch before you play.", "1f45f"], ["Drink water when you play.", "1f964"], ["Take turns and play fair.", "1f501"], ["Good teams work together.", "1f3c6"], ["Skating is fun in winter.", "26f8"], ["Sledding is fun on a snowy hill.", "1f6f7"]]),
      ...group("item", [["Soccer", "26bd"], ["Basketball", "1f3c0"], ["Baseball", "26be"], ["Hockey", "1f3d2"], ["Tennis", "1f3be"], ["Volleyball", "1f3d0"], ["Badminton", "1f3f8"], ["Ping pong", "1f3d3"], ["Skating", "26f8"], ["Skiing", "1f3bf"], ["Sledding", "1f6f7"], ["Biking", "1f6b2"], ["Skateboarding", "1f6f9"], ["Flying disc", "1f94f"], ["Running", "1f45f"], ["Kite flying", "1fa81"]]),
      ...group("link", [["Let's play", "26bd"], ["Learn more", "1f50e"]]),
    ],
  },
  {
    id: "arts",
    name: "Music and art",
    art: "1f3a8",
    words: [
      ...group("heading", [["Music and Art", "1f3a8"], ["My Art", "1f5bc"], ["Let's Make Music", "1f3b5"], ["Colours", "1f308"], ["Instruments", "1f3b8"]]),
      ...group("sentence", [["I like to draw pictures.", "1f58d"], ["Paint colours can mix to make new colours.", "1f3a8"], ["Blue and yellow make green.", "1f537"], ["A drum makes a beat.", "1f941"], ["A guitar has strings.", "1f3b8"], ["I like to sing songs.", "1f3a4"], ["Music can make us happy.", "1f3b6"], ["Art can be any shape and size.", "1f5bc"], ["A piano has black and white keys.", "1f3b9"], ["I can make art from paper.", "2702"]]),
      ...group("item", [["Drawing", "1f58d"], ["Painting", "1f58c"], ["Colours", "1f3a8"], ["Picture", "1f5bc"], ["Guitar", "1f3b8"], ["Piano", "1f3b9"], ["Drum", "1f941"], ["Violin", "1f3bb"], ["Trumpet", "1f3ba"], ["Flute", "1fa88"], ["Saxophone", "1f3b7"], ["Banjo", "1fa95"], ["Maracas", "1fa87"], ["Accordion", "1fa97"], ["Singing", "1f3a4"], ["Songs", "1f3b6"], ["Yarn art", "1f9f6"]]),
      ...group("link", [["See my art", "1f5bc"], ["Listen", "1f3a7"]]),
    ],
  },
  {
    id: "community",
    name: "Places in my community",
    art: "1f3d8",
    words: [
      ...group("heading", [["My Community", "1f3d8"], ["Community Helpers", "1f692"], ["Places to Go", "1f68c"], ["Our Park", "1f3de"], ["Our School", "1f3eb"]]),
      ...group("sentence", [["Firefighters help keep us safe.", "1f692"], ["Doctors and nurses help sick people.", "1f3e5"], ["Bus drivers take us places.", "1f68c"], ["The library has many books.", "1f4da"], ["We play at the park.", "1f3de"], ["Letters go in the mailbox.", "1f4ee"], ["Stores sell food we need.", "1f3ec"], ["Police officers help people.", "1f693"], ["Builders make new homes.", "1f3d7"], ["Neighbours help each other.", "1f3e1"]]),
      ...group("item", [["School", "1f3eb"], ["Park", "1f3de"], ["Library", "1f4da"], ["Hospital", "1f3e5"], ["Store", "1f3ec"], ["Bus stop", "1f68f"], ["Fire truck", "1f692"], ["Ambulance", "1f691"], ["Police car", "1f693"], ["Mailbox", "1f4ee"], ["Houses", "1f3d8"], ["Office", "1f3e2"], ["Bridge", "1f309"], ["Stadium", "1f3df"], ["Fountain", "26f2"]]),
      ...group("link", [["Explore my community", "1f3d8"], ["Learn more", "1f50e"]]),
    ],
  },
  {
    id: "toys",
    name: "Toys and games",
    art: "1f9f8",
    words: [
      ...group("heading", [["My Toys", "1f9f8"], ["Games We Play", "1f3b2"], ["Building Toys", "1f9f1"], ["Outdoor Toys", "1fa81"], ["Game Time", "1f3ae"]]),
      ...group("sentence", [["I like to build with blocks.", "1f9f1"], ["A puzzle has many pieces.", "1f9e9"], ["We roll the die to play.", "1f3b2"], ["A kite flies in the wind.", "1fa81"], ["A yo-yo goes up and down.", "1fa80"], ["I share my toys with friends.", "1f381"], ["We put toys away after we play.", "1f9fa"], ["A teddy bear is soft.", "1f9f8"], ["Board games teach us to take turns.", "265f"], ["Balloons float up high.", "1f388"]]),
      ...group("item", [["Teddy bear", "1f9f8"], ["Kite", "1fa81"], ["Yo-yo", "1fa80"], ["Puzzle", "1f9e9"], ["Blocks", "1f9f1"], ["Die", "1f3b2"], ["Video game", "1f3ae"], ["Balloon", "1f388"], ["Bubbles", "1fae7"], ["Chess", "265f"], ["Toy car", "1f697"], ["Toy train", "1f682"], ["Toy plane", "2708"], ["Robot", "1f916"], ["Joystick", "1f579"], ["Sailboat", "26f5"]]),
      ...group("link", [["My toys", "1f9f8"], ["Learn more", "1f50e"]]),
    ],
  },
  {
    id: "ocean",
    name: "Ocean",
    art: "1f30a",
    words: [
      ...group("heading", [["Under the Sea", "1f30a"], ["Ocean Animals", "1f433"], ["At the Beach", "1f3d6"], ["Coral Reefs", "1fab8"], ["Save the Ocean", "1f30e"]]),
      ...group("sentence", [["The blue whale is the biggest animal.", "1f433"], ["Dolphins swim in groups.", "1f42c"], ["An octopus has eight arms.", "1f419"], ["Fish breathe with gills.", "1f41f"], ["Most crabs walk sideways.", "1f980"], ["Sea turtles can swim very far.", "1f422"], ["Coral reefs are home to many fish.", "1fab8"], ["A jellyfish has no bones.", "1fabc"], ["Seals swim in the sea and rest on land.", "1f9ad"], ["Keep plastic out of the ocean.", "267b"]]),
      ...group("item", [["Whale", "1f433"], ["Dolphin", "1f42c"], ["Octopus", "1f419"], ["Fish", "1f41f"], ["Tropical fish", "1f420"], ["Crab", "1f980"], ["Shark", "1f988"], ["Jellyfish", "1fabc"], ["Seal", "1f9ad"], ["Lobster", "1f99e"], ["Squid", "1f991"], ["Shell", "1f41a"], ["Coral", "1fab8"], ["Waves", "1f30a"], ["Sailboat", "26f5"], ["Anchor", "2693"], ["Blowfish", "1f421"]]),
      ...group("link", [["Explore the ocean", "1f30a"], ["Learn more", "1f50e"]]),
    ],
  },
  {
    id: "website",
    name: "My website pages",
    art: "1f4bb",
    words: [
      ...group("heading", [["Home", "1f3e0"], ["About", "1f4ac"], ["How to Help", "2764"], ["Thank You!", "2728"], ["Welcome!", "1f389"]]),
      ...group("sentence", [["Welcome to our website.", "1f389"], ["This website is about helpers in our community.", "1f3d8"], ["Read our About page to learn more.", "1f4ac"], ["Here is how you can help.", "2764"], ["Thank you for visiting our website!", "2728"], ["Thank you for helping!", "1f381"], ["Click a link to see another page.", "2194"], ["We made this website in class.", "1f4bb"], ["Every helper makes a difference.", "2b50"], ["Come back soon!", "1f3e0"]]),
      ...group("item", [["Home page", "1f3e0"], ["About page", "1f4ac"], ["How to Help page", "2764"], ["Thank you page", "2728"], ["Our helpers", "2b50"], ["What we do", "1f4cb"], ["Ways to help", "1f4a1"], ["Who we help", "1f3d8"], ["Our pictures", "1f5bc"], ["Fun facts", "1f9e0"], ["Our team", "1f3c6"], ["Things to do", "2705"], ["Places to visit", "1f68c"], ["Helpful tips", "1f4d3"], ["Our goals", "1f3af"]]),
      ...group("link", [["Home", "1f3e0"], ["About", "1f4ac"], ["How to Help", "2764"], ["Thank you", "2728"], ["Back to Home", "1f3e1"], ["Next page", "2194"]]),
    ],
  },
];
