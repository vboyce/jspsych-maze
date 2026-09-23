// Stimuli for the kid-friendly demo, copied from kid-maze-passages expt-1
// (https://github.com/vboyce/kid-maze-passages). Distractors were made with
// maze-distractor-generator; "---" marks the first word, which has no real
// distractor.

import { kidImage } from "./images.js";

// Two short informational passages. Each sentence may be followed by an image.
export const passages = [
  {
    title: "T. rex's Tiny Arms",
    topic: "dinosaurs",
    sentences: [
      {"num": 1, "sent": "Tyrannosaurus rex is one of the most famous dinosaurs ever.", "distractor": "--- pies vote meet mike idea touch clubs throttle feels.", "img": "trex_recon.jpg", "credit": "by Nobu Tamura (CC-BY-SA)"},
      {"num": 2, "sent": "For such a huge, powerful hunter, it had surprisingly tiny arms.", "distractor": "--- worth soon onto, symptoms replies, hour link bibliography josh wrote.", "img": null, "credit": null},
      {"num": 3, "sent": "T-rex was about forty feet long and could weigh as much as nine tons.", "distractor": "--- nice feet joke china wife fund songs polo sale page lady wish harry.", "img": null, "credit": null},
      {"num": 4, "sent": "Its arms were only about three feet long.", "distractor": "--- roman peter smith song lose enjoy users.", "img": "trex_forelimb.jpeg", "credit": "By Eduard Sol\u00e0 (CC-BY)"},
      {"num": 5, "sent": "With arms that short, it couldn't even reach its own mouth.", "distractor": "--- dean civil senate, whom purchase terms prices lot none miller.", "img": null, "credit": null},
      {"num": 6, "sent": "Why would such a fierce predator have arms that seem almost useless?", "distractor": "--- larger march yes chords funerals funny tower plays tea happens basics?", "img": "trex_skeleton_2.jpg", "credit": "by AbstractionBlue (CC-BY)"},
      {"num": 7, "sent": "Scientists have known for decades that T-rex isn't the only dinosaur like this.", "distractor": "--- door board glad handled fifth Canyon award west heard swearing notes apply.", "img": null, "credit": null},
      {"num": 8, "sent": "Fossils from several other dinosaur families show the same pattern.", "distractor": "--- peace accept anyway hangover sentence boys kid knows realize.", "img": "Carnotaurus_skeleton.jpg", "credit": "by https://www.flickr.com/photos/23992608@N06/ (CC-BY)"},
      {"num": 9, "sent": "They too had tiny arms, giant bodies, and huge heads with powerful jaws.", "distractor": "--- week laws robin theme, poem session, unit route edited owner elsewhere juror.", "img": null, "credit": null},
      {"num": 10, "sent": "These groups were only distantly related, yet these same features evolved independently multiple times.", "distractor": "--- anymore queen dude melodrama victory, guy option beach tomorrow losers firefighters chocolate sure.", "img": null, "credit": null},
      {"num": 11, "sent": "What could have driven dinosaurs to separately develop small arms so many times?", "distractor": "--- minute goal nearest midlands role countdown savings nobody yep lord legal signed?", "img": "Carnotaurus.png", "credit": "by Fred Wierum (CC-BY-SA)"},
      {"num": 12, "sent": "To understand why, scientists measured skull sizes alongside arm sizes across many different species.", "distractor": "--- happening hill, federation commons prank papa ignorance lock filed august yeah received somebody.", "img": "fossil.jpg", "credit": ""},
      {"num": 13, "sent": "A clear pattern emerged.", "distractor": "--- ever tigers selfie.", "img": null, "credit": null},
      {"num": 14, "sent": "Where skulls grew bigger and more robust, the arms tended to get shorter and the overall body size increased.", "distractor": "--- azalea ford invest shop view jockey, tour via bowler born fans titans hate lake directed aware enemy identify.", "img": "trex_skull.jpg", "credit": ""},
      {"num": 15, "sent": "One idea is that as the prey animals got bigger and tougher, a powerful bite became more and more important.", "distractor": "--- hurt buy miles hall gave sally purposes says smile seat shaming, list sessions derby mention coach ran sea chairman.", "img": "Stegosaurus_TD.png", "credit": "by TotalDino (CC-BY)"},
      {"num": 16, "sent": "Over millions of years, skulls grew larger and jaws grew more powerful.", "distractor": "--- rangers dad decide, cologne bye cares cash vans walks ride comments.", "img": null, "credit": null},
      {"num": 17, "sent": "As the skull became the main tool for catching prey, the arms were no longer needed.", "distractor": "--- park classy driving luck ago twice wow excuses grove, deal lets hotel news google program.", "img": "trex_head.jpg", "credit": ""},
      {"num": 18, "sent": "Growing large arms takes energy, so gradually the arms got smaller and smaller.", "distractor": "--- okay saved author posted, sad sentenced girl frank son speaks sit actress.", "img": null, "credit": null},
      {"num": 19, "sent": "Not all dinosaurs followed this path.", "distractor": "--- fell maverick attorney miss funds.", "img": null, "credit": null},
      {"num": 20, "sent": "Plant-eating dinosaurs kept their smaller heads and longer arms.", "distractor": "--- portrays navy county realized sudden hey agent guest.", "img": "herbivore.png", "credit": ""},
      {"num": 21, "sent": "So did dinosaurs that hunted in different ways.", "distractor": "--- eyes preferring views baseman note employees write.", "img": "Compsognathus_BW.jpeg", "credit": "by Nobu Tamura (CC-BY-SA)"},
      {"num": 22, "sent": "T-rex's tiny arms may look strange, but they weren't a flaw.", "distractor": "--- aids tony soul ways managers, rate party avenue film airs.", "img": null, "credit": null},
      {"num": 23, "sent": "By that point, T-rex's jaws had simply taken over the job.", "distractor": "--- dance losing, Ninjas dyer lots discuss review rules else came.", "img": "trex_skull.jpg", "credit": ""},
      {"num": 24, "sent": "The tiny arms were a consequence of the skull becoming T-rex's main weapon.", "distractor": "--- owned puts worse rule whatsoever cars join belle promote Replays rates alright.", "img": null, "credit": null},
      {"num": 25, "sent": "It was becoming one of the most powerful predators on Earth.", "distractor": "--- ice regions uses runs hear nor democrats acquitted gift Hours.", "img": "trex_recon.jpg", "credit": "by Nobu Tamura (CC-BY-SA)"},
    ],
  },
  {
    title: "Whale Culture",
    topic: "whales",
    sentences: [
      {"num": 1, "sent": "Humpback whales are known for their complex songs and exciting jumps out of the water.", "distractor": "--- worldly real choose felt winner replaced stayed guys candidate grail name own told choice.", "img": "humpback_sing.jpg", "credit": ""},
      {"num": 2, "sent": "They are also some of the most creative hunters in the ocean.", "distractor": "--- eye jack push fit gain doubt yesterday tribune trip gone assume.", "img": null, "credit": null},
      {"num": 3, "sent": "These whales use bubbles to trap and catch fish, in a hunting technique called bubble net feeding.", "distractor": "--- hostess firm disliked wait ugh seem agreed voted, city sold scores musicians floor thrones dear citizen.", "img": "humpback_bubble_4.jpg", "credit": ""},
      {"num": 4, "sent": "Here's how it works.", "distractor": "--- knew lack charge.", "img": null, "credit": null},
      {"num": 5, "sent": "A whale dives below a school of fish.", "distractor": "--- welsh levied judge paid ideas mind costs.", "img": null, "credit": null},
      {"num": 6, "sent": "It swims in a slow upward spiral, blowing air through its blowhole.", "distractor": "--- plaid card term votes halls midland, handbook site website bet partake.", "img": null, "credit": null},
      {"num": 7, "sent": "The bubbles rise to the surface and form a curtain.", "distractor": "--- coaster honor van did somehow fact books eat puppies.", "img": "humpback_bubble_3.jpg", "credit": ""},
      {"num": 8, "sent": "It is like a net made of air, and the fish trapped inside can't escape.", "distractor": "--- army gets rise thus areas cent went, mark date loans duchess wedding basis rated.", "img": null, "credit": null},
      {"num": 9, "sent": "Then the whale lunges up through the middle with its mouth open wide.", "distractor": "--- gold spree twister jobs thinks died served proud goes phase law fees.", "img": "humpback_bubble_2.jpg", "credit": ""},
      {"num": 10, "sent": "It swallows an enormous mouthful of fish in one gulp.", "distractor": "--- sidekick move gentlemen fittings mom event send lie studs.", "img": null, "credit": null},
      {"num": 11, "sent": "Some humpback whales do this alone, but others hunt in teams.", "distractor": "--- pinball taxed late meant cities, rose edition metro draw ending.", "img": "humpback_bubble_1.jpg", "credit": ""},
      {"num": 12, "sent": "When they work together, they take on different roles.", "distractor": "--- river ones opinion, metal huge star consider cried.", "img": null, "credit": null},
      {"num": 13, "sent": "Some whales produce the bubbles, and others herd the fish toward the center.", "distractor": "--- reborn premier gets aspire, job library evils ask chair critics took alone.", "img": "humpback_bubble_6.jpg", "credit": ""},
      {"num": 14, "sent": "Some even make loud calls that may help herd the fish tighter.", "distractor": "--- apart least inch prove spend east wants shire cup hello smoothie.", "img": null, "credit": null},
      {"num": 15, "sent": "Each whale has a role, and the whole team has to coordinate for the hunt to succeed.", "distractor": "--- nanny fair oh evil, fan town moved today low stop espionage age bill sucks poor argued.", "img": "humpback_bubble_7.jpg", "credit": ""},
      {"num": 16, "sent": "Scientists tracked hundreds of individual humpback whales in British Columbia, Canada, over twenty years.", "distractor": "--- ottoman enjoyed sell appointed concierge mansion book Bought Copyright, Happen, worry forgive save.", "img": null, "credit": null},
      {"num": 17, "sent": "Humpback whales have distinctive tail markings which scientists used to tell individual whales apart.", "distractor": "--- curator voice inauguration hoped deleting faith believing bed bus plus delivered lighten ticket.", "img": "humpback_tail.jpg", "credit": ""},
      {"num": 18, "sent": "The scientists tracked which whales spent time together.", "distractor": "--- everybody grandpa sorry rejoice office named authority.", "img": null, "credit": null},
      {"num": 19, "sent": "They also noted which whales knew how to bubble net feed and when they fed alone or together.", "distractor": "--- royal doors estate craze weird wide club denies ward scope main wrong walk maps stated pop version.", "img": "three_humpbacks.jpg", "credit": ""},
      {"num": 20, "sent": "They found strong evidence that the bubble net technique spreads through social contact.", "distractor": "--- degree finish seriously dream die turner sake lieutenant barracks telling please tonight.", "img": null, "credit": null},
      {"num": 21, "sent": "Whales that spent more time together were far more likely to both use it.", "distractor": "--- items adding thank begin ability stone size issue earlier boy words till give.", "img": "humpback_bubble_5.jpg", "credit": ""},
      {"num": 22, "sent": "This suggests that bubble net feeding is not something whales are born knowing or that they invent on their own.", "distractor": "--- donated lived brooks bike forehead tell box secretary phoebe him stay offices red road broke rouge kept done used.", "img": "humpback_calf.jpg", "credit": ""},
      {"num": 23, "sent": "It is a skill that is learned by watching and copying other whales.", "distractor": "--- skin tree lions gas drop pounds see announced find sculptor avoid reprint.", "img": null, "credit": null},
      {"num": 24, "sent": "This is similar to how you might learn how to cook by watching family members in the kitchen.", "distractor": "--- rich officers sent held shut nation south hit camp seats band released united century male upon assuming.", "img": "humpback_bubble_8.jpg", "credit": ""},
    ],
  },
];

// Practice sentences: a 3-level guided progression.
//   Level 1: fixed left/right order, a tip for every word, and the sentence
//            so far shown above the words.
//   Level 2: the sentence so far is shown, but no tips.
//   Level 3: no help, like the main passages.
export const PRACTICE_SENTENCES = [
  {
    level: 1,
    sent: "The cat sat on the mat.",
    distractor: "--- earn vary help goes take.",
    order: [0, 0, 1, 0, 0, 1],
    img: "cat.jpg",
    credit: "by Elisa (https://www.flickr.com/photos/37996605603@N01/, CC-BY-NC)",
    instruction:
      "<h2>Let's try it together first!</h2>" +
      "<p>You'll see two words at a time. One belongs in the sentence — pick it!</p>" +
      "<p>Press <b>E</b> for the word on the left, <b>I</b> for the word on the right.</p>" +
      `<p>If you see "---" that's not a real word, so pick the other word!</p>` +
      `<img src="${kidImage("keyboard_hand.jpg")}"` +
      ` alt="Hands on a keyboard with E and I highlighted" style="width:70%;max-height:40vh;object-fit:contain;display:block;margin:16px auto;">`,
    word_tips: [
      "The sentence starts with <b>The</b> — find it!",
      "Great! Now what makes sense after 'The' ... how about <b>cat</b>.",
      "Awesome! Now we have 'The cat', so what belongs next -- vary or <b>sat</b>?",
      "What word comes next -- <b>on</b> or help?",
      "What word belongs here -- the or goes?",
      "What word finishes the sentence?",
    ],
  },
  {
    level: 2,
    sent: "The dog barked at a squirrel.",
    distractor: "--- wake stardom sun sort outputs.",
    order: [0, 0, 1, 0, 0, 0],
    img: "dog.jpg",
    credit: "by Mark Robinson (https://www.flickr.com/photos/66176388@N00/, CC-BY-NC)",
    instruction:
      "<h2>Your turn!</h2>" +
      "<p>Now you try it — pick the words that fit the sentence.</p>" +
      `<p>If you see "---" that's not a real word, so pick the other word!</p>` +
      "<p>If you need a hint, you can watch the sentence build up at the top as you go!</p>",
  },
  {
    level: 3,
    sent: "The bunny rabbit nibbled a carrot.",
    distractor: "--- rocked carol carefree same ballots.",
    order: [0, 0, 0, 0, 1, 0],
    img: "bunny.jpg",
    credit: "by sunnyelou (https://www.flickr.com/photos/sunnyelou/, CC-BY-NC)",
    instruction:
      "<h2>One more time — on your own!</h2>" +
      "<p>This time, the sentence won't build up at the top. Just pick the words that belong. You've got this!</p>",
  },
];

export const PRACTICE_IMAGES = PRACTICE_SENTENCES
  .map((s) => s.img)
  .filter(Boolean)
  .map(kidImage);

export const PASSAGE_IMAGES = passages
  .flatMap((p) => p.sentences)
  .map((s) => s.img)
  .filter(Boolean)
  .map(kidImage);

export const THANKS_IMAGE = kidImage("115176-703930484_tiny-ezgif.com-video-to-gif-converter.gif");
