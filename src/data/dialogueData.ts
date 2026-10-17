import { VerbType } from '../components/InteractionWheel';

export interface DialogueOption {
  id: string;
  promptText: string;
  characterResponse?: string;
  npcResponse: string | string[];
  action?: 'navigate_now' | 'navigate_blog' | 'navigate_github' | 'navigate_linkedin' | 'open_contact';
  followUpPrompt?: string;
}

export interface DialogueTopic {
  npcGreeting: string;
  options: DialogueOption[];
}

export type HotspotId =
  | 'tavern-sign'
  | 'tavern-door'
  | 'archway'
  | 'guild-sign'
  | 'guild-door'
  | 'moon';

export type InventoryItemId = 'blog' | 'github' | 'linkedin' | 'mail' | 'now';

export interface VerbInteractionOutcome {
  /** Line spoken by the player character above their head */
  characterSpeech?: string;
  /** Optional reply spoken from the building/door/world after a delay */
  worldReply?: {
    speakerId: string;
    text: string;
    color?: string;
    delayMs?: number;
    durationMs?: number;
  };
  /** Optional sound effect trigger */
  sound?: 'knock' | 'magic' | 'satchel';
  /** Optional navigation route to trigger (e.g. '/now', '/about', '/projects', '/linkedin', '/mail') */
  navigate?: {
    type: InventoryItemId;
    path: string;
  };
}

export interface WorldHotspotConfig {
  id: HotspotId;
  label: string;
  defaultHoverVerb: string;
  defaultLeftClickVerb: VerbType;
  nativeRect: { nx: number; ny: number; nw: number; nh: number };
  walkToNativeX?: number;
  verbs: {
    hand: string;
    eye: string;
    mouth: string;
  };
  responses: Record<VerbType, VerbInteractionOutcome>;
}

export interface InventoryItemDialogueConfig {
  id: InventoryItemId;
  label: string;
  defaultVerbText: string;
  path: string;
  wheelName: string;
  verbs: {
    hand: string;
    eye: string;
    mouth: string;
  };
  mouthSpeech: string;
}

/* ══════════════════════════════════════════════════════════════════════════
   1. ARCHIVIST NPC DIALOGUE TREE & INTERACTIONS
   ══════════════════════════════════════════════════════════════════════════ */

export const SCHOLAR_DIALOGUE: DialogueTopic = {
  npcGreeting: "Greetings, traveler! I am the City Archivist. What knowledge do you seek about Dhruv?",
  options: [
    {
      id: "background",
      promptText: "Who is this Dhruv I keep hearing about?",
      characterResponse: "Tell me more about this Dhruv fella?",
      npcResponse: [
        "Oh he's just some two bit code caster working out the land of the briny lake, he has been writing some dispatches about AI and software engineering that you can find on the town message board which for some reason you appear to be carrying in your satchel"
      ]
    },
    {
      id: "current_role",
      promptText: " What's he upto?",
      characterResponse: "What's he upto",
      npcResponse: [
        " How should I know, that stuff is usually reserved for Linkedin and Github, there should be a phonebook and a code scroll somewhere that should point you to the github and Linkedin pages"
      ]
    },
    {
      id: "reading",
      promptText: " What books is he currently reading?",
      characterResponse: "I hear he's an avid reader. What's on his reading list?",
      npcResponse: [
        "Do I look like a librarian to you? People usually keep their reading lists on their Now pages, I bet thats where you'd find it",
        "Examine the hourglass that you picked up from the street"
      ],
      action: "navigate_now"
    },
    {
      id: "contact",
      promptText: " How can I reach out to him or see his resume?",
      characterResponse: "How can someone get in touch with Dhruv?",
      npcResponse: [
        "Carrier Pigeon or Email"
      ],
      action: "open_contact"
    },
    {
      id: "exit",
      promptText: " Thank you, I'll look around on my own.",
      characterResponse: "Thank you, I'll look around on my own.",
      npcResponse: "You've probably seen all there is to, he didn't program a second scene"
    }
  ]
};

export const SCHOLAR_INTERACTION_CONFIG = {
  name: "Archivist",
  hoverVerbText: "Talk to Archivist (City Guide)",
  verbs: {
    hand: "Poke Archivist",
    eye: "Examine Archivist",
    mouth: "Talk to Archivist",
  },
  examineSpeech: "He looks like he knows a thing or two about a thing or two.",
  pokeResponses: [
    "Knock it off!",
    " I ",
  ],
};

/* ══════════════════════════════════════════════════════════════════════════
   2. STAGE HUD & SATCHEL / INVENTORY DIALOGUE
   ══════════════════════════════════════════════════════════════════════════ */

export const STAGE_UI_TEXT = {
  title: "Dhruv Charan",
  defaultStatusPrompt: "Click floor to walk • Right-click scenery, items & NPCs to interact",
  inventoryModalDefaultPrompt: "Inventory (Right-Click to Interact)",
  satchelTooltip: "INVENTORY (Right-Click to Interact)",
  audioMutedVerb: "Unmute 8-Bit Sound Effects",
  audioActiveVerb: "Mute 8-Bit Sound Effects",
};

export const SATCHEL_INTERACTION_CONFIG = {
  name: "Inventory Satchel",
  hoverVerbText: "Open Inventory Satchel (Right-Click to Examine)",
  verbs: {
    hand: "Open Satchel",
    eye: "Examine Satchel",
    mouth: "Whisper into Satchel",
  },
  examineSpeech: "Standard-issue adventurer satchel. Holds five items or one small anvil.",
  mouthSpeech: "It doesn't answer back, not that I expected it to.",
};


export const INVENTORY_DIALOGUE_CONFIG: Record<InventoryItemId, InventoryItemDialogueConfig> = {
  blog: {
    id: 'blog',
    label: 'Message Board',
    defaultVerbText: 'Examine Message Board (Go to Blog)',
    path: '/about',
    wheelName: 'Message Board',
    verbs: {
      hand: 'Examine Notices (Go to Blog)',
      eye: 'Read Town Decrees',
      mouth: 'Lick Parchment',
    },
    mouthSpeech: "It's just paper",
  },
  github: {
    id: 'github',
    label: 'Code Scroll',
    defaultVerbText: 'Inspect Code Scroll (Go to GitHub)',
    path: '/projects',
    wheelName: 'Code Scroll',
    verbs: {
      hand: 'Inspect Code Scroll (Go to GitHub)',
      eye: 'Examine Algorithms',
      mouth: 'Recite Incantation',
    },
    mouthSpeech: "Commitanti et pushus!",
  },
  linkedin: {
    id: 'linkedin',
    label: 'Phonebook',
    defaultVerbText: 'Open Phonebook (Go to LinkedIn)',
    path: '/linkedin',
    wheelName: 'Guild Phonebook',
    verbs: {
      hand: 'Open Phonebook (Go to LinkedIn)',
      eye: 'Browse Guild Directory',
      mouth: 'Call Contact',
    },
    mouthSpeech: "Connecting to the guild network...",
  },
  mail: {
    id: 'mail',
    label: 'Mailbox',
    defaultVerbText: 'Open Mailbox (Contact / Email)',
    path: '/mail',
    wheelName: 'Enchanted Mailbox',
    verbs: {
      hand: 'Open Mailbox (Send Email)',
      eye: 'Inspect Brass Latch',
      mouth: 'Whisper Message',
    },
    mouthSpeech: "Owls are just too gauche, all the best wizards use gmail",
  },
  now: {
    id: 'now',
    label: 'Hourglass',
    defaultVerbText: 'Look at Hourglass (Go to Now Page)',
    path: '/now',
    wheelName: 'Hourglass',
    verbs: {
      hand: 'Inspect Timeline (Go to Now)',
      eye: 'Watch the Sands of Time',
      mouth: 'Taste Sand of Time',
    },
    mouthSpeech: "Hmm, notes of silicon, glass, and the fleeting present moment.",
  },
};

/* ══════════════════════════════════════════════════════════════════════════
   3. BACKGROUND STAGE HOTSPOTS & DIALOGUE
   ══════════════════════════════════════════════════════════════════════════ */

export const WORLD_HOTSPOTS_CONFIG: WorldHotspotConfig[] = [
  {
    id: 'tavern-sign',
    label: 'Sign: The Mended Drum',
    defaultHoverVerb: 'Look at Tavern Sign',
    defaultLeftClickVerb: 'eye',
    nativeRect: { nx: 424, ny: 235, nw: 98, nh: 108 },
    walkToNativeX: 430,
    verbs: {
      hand: 'Tap Tavern Sign',
      eye: 'Read Tavern Sign',
      mouth: 'Toast the Sign',
    },
    responses: {
      eye: {
        characterSpeech: "The local haunt",
      },
      hand: {
        sound: 'knock',
        characterSpeech: "Solid oak seasoned with a century of flying barstools.",
      },
      mouth: {
        characterSpeech: " Cheers",
      },
    },
  },
  {
    id: 'tavern-door',
    label: 'Tavern Door',
    defaultHoverVerb: 'Knock on Tavern Door',
    defaultLeftClickVerb: 'hand',
    nativeRect: { nx: 140, ny: 430, nw: 118, nh: 165 },
    walkToNativeX: 199,
    verbs: {
      hand: 'Knock on Tavern Door',
      eye: 'Peer Through Peephole',
      mouth: 'Bellow at Bouncer',
    },
    responses: {
      hand: {
        sound: 'knock',
        worldReply: {
          speakerId: 'tavern-bouncer',
          text: "PRIVATE FUNCTION!'ANNUAL GUILD AUDIT! COME BACK AFTER MIDNIGHT!",
          color: '#ff8c66',
          delayMs: 420,
          durationMs: 3800,
        },
      },
      eye: {
        characterSpeech: "Someone appears to be swinging from the chandelier inside. Best not get involved.",
      },
      mouth: {
        characterSpeech: "I demand a pint!",
        worldReply: {
          speakerId: 'tavern-bouncer',
          text: "AND I DEMAND QUIET IN THE STREET! BUZZ OFF!",
          color: '#ff8c66',
          delayMs: 2500,
          durationMs: 3200,
        },
      },
    },
  },
  {
    id: 'archway',
    label: 'The Alleyway',
    defaultHoverVerb: 'Peer into the Foggy Alleyway',
    defaultLeftClickVerb: 'eye',
    nativeRect: { nx: 560, ny: 345, nw: 205, nh: 245 },
    walkToNativeX: 662,
    verbs: {
      hand: 'Venture in',
      eye: 'Examine Foggy Alleyway',
      mouth: 'Yodel into the Echoes',
    },
    responses: {
      eye: {
        characterSpeech: " Fog as far as the eye can see and mine can only see a few feet ahead",
      },
      hand: {
        characterSpeech: "I'd love to explore the alleyway, but it's painted onto a 2D backdrop and I left my pepper spray in my other satchel.",
      },
      mouth: {
        characterSpeech: "HULLLOO",
      },
    },
  },
  {
    id: 'guild-sign',
    label: 'Sign: Guild of Scribes & Chronicles',
    defaultHoverVerb: 'Examine Guild Sign (Chronolog)',
    defaultLeftClickVerb: 'eye',
    nativeRect: { nx: 916, ny: 382, nw: 72, nh: 78 },
    walkToNativeX: 950,
    verbs: {
      hand: 'Consult Chronolog (/now)',
      eye: 'Inspect Guild Emblem',
      mouth: 'Read Inscription Aloud',
    },
    responses: {
      eye: {
        characterSpeech: "The Guild of Scribes & Temporal Chroniclers. Care to see what Dhruv is up to right now?",
      },
      hand: {
        navigate: { type: 'now', path: '/now' },
      },
      mouth: {
        characterSpeech: " Wish I knew how to read cursive ",
      },
    },
  },
  {
    id: 'guild-door',
    label: 'Guild Archive Door',
    defaultHoverVerb: 'Inspect Guild Archive Door (Dispatches)',
    defaultLeftClickVerb: 'eye',
    nativeRect: { nx: 1228, ny: 432, nw: 92, nh: 165 },
    walkToNativeX: 1255,
    verbs: {
      hand: 'Read Pinned Dispatches (Blog)',
      eye: 'Examine Heavy Oak Door',
      mouth: 'Whisper Password to Keyhole',
    },
    responses: {
      eye: {
        characterSpeech: "The Guild Archive door. Several field dispatches and essays are pinned to the oak panels.",
      },
      hand: {
        navigate: { type: 'blog', path: '/about' },
      },
      mouth: {
        characterSpeech: "Swordfish? ...Moonlight? ...Sudo?",
        worldReply: {
          speakerId: 'guild-scribe',
          text: "Its not voice activated dummy, just locked",
          color: '#80e5ff',
          delayMs: 2300,
          durationMs: 3800,
        },
      },
    },
  },
  {
    id: 'moon',
    label: 'Waxing Crescent Moon',
    defaultHoverVerb: 'Gaze at the Crescent Moon',
    defaultLeftClickVerb: 'eye',
    nativeRect: { nx: 615, ny: 24, nw: 68, nh: 68 },
    verbs: {
      hand: 'Reach for the Moon',
      eye: 'Contemplate the Cosmos',
      mouth: 'Howl at the Moon',
    },
    responses: {
      eye: {
        characterSpeech: " Pretty sure that's the moon .... unless",
      },
      hand: {
        characterSpeech: "My arms are at least 240,000 miles too short for that.",
      },
      mouth: {
        characterSpeech: "Awoooo! .... worth the try, I guess",
      },
    },
  },
];

