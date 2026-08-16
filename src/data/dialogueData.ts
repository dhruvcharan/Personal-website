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
