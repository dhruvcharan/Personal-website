export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: "Fiction" | "History" | "Learning" | "Growth";
  goodreads: string;
  imageUrl: string;
  thoughts?: string;
  rating?: number;
}

export const currentlyReading: Book[] = [
  {
    id: "1",
    title: "Ninety-Three",
    author: "Victor Hugo",
    description:
      "Victor Hugo's last novel, set in 1793 during the Reign of Terror and the peasant revolt in the Vendée, exploring the moral complexities and ideals of the French Revolution.",
    category: "Fiction",
    goodreads: "https://www.goodreads.com/book/show/59691594-ninety-three-by-victor-hugo",
    imageUrl: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1637720669i/59691594.jpg",
    thoughts: "Started getting into this one after reading A Place Of Greater Safety which has Really Sparked my interest in that period of history. Still early in the book but the human stories at the heart of the conflict are compelling as ever ",
  },
  {
    id: "2",
    title: "Advances in Active Portfolio Management",
    author: "Richard C. Grinold & Ronald N. Kahn",
    description:
      "New developments in quantitative investing and modern portfolio design, expanding on Grinold & Kahn's foundational active management framework.",
    category: "Learning",
    goodreads: "https://www.goodreads.com/book/show/44130326-advances-in-active-portfolio-management",
    imageUrl: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1571123575i/44130326.jpg",
    thoughts: "A real gem of a book that illuminates the core ideas at the beating heart of the current finance industry. Reading this alongside the original to see how the framework has evolved and what information has been gleaned from the research and more importantly the nuances of putting the ideas to work",
  },
  {
    id: "3",
    title: "The Gormenghast Trilogy",
    author: "Mervyn Peake",
    description:
      "A towering gothic fantasy epic following Titus Groan in the ancient, ritual-bound castle of Gormenghast.",
    category: "Fiction",
    goodreads: "https://www.goodreads.com/book/show/39058.The_Gormenghast_Trilogy",
    imageUrl: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1651356062i/39058.jpg",
    thoughts: "Just a perfect book to immerse yourself in, the characters, the world and the story are all so vividly dreamt and the prose is incredibly rich and evocative without feeling drawn out. Its a book i find myself returning to almost once a year and its never not a joy",
  },
  {
    id: "4",
    title: "When Everyone Knows That Everyone Knows",
    author: "Steven Pinker",
    description:
      "An exploration of common knowledge and the hidden logic behind human coordination, money, power, and everyday life.",
    category: "Growth",
    goodreads: "https://www.goodreads.com/book/show/224003186-when-everyone-knows-that-everyone-knows",
    imageUrl: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1743337118i/224003186.jpg",
    thoughts: "The ideas explored are fascinating and some of the Game Theoretical concepts are really fascinating to ponder however the book is a bit of a slog particularly in the latter half as the fundamental premise is repeated over and over and the ideas all start to feel a bit samey, really wouldve benefited from aggresive editing and conciseness, still the ideas are interesting enough to make it worth reading ",
  },
  {
    id: "5",
    title: "The Shifts and the Shocks",
    author: "Martin Wolf",
    description:
      "What we've learned—and have still to learn—from the financial crisis, offering an incisive critique of global macroeconomic imbalances and financial fragility.",
    category: "Growth",
    goodreads: "https://www.goodreads.com/book/show/20821320-the-shifts-and-the-shocks",
    imageUrl: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1403180496i/20821320.jpg",
    thoughts: "I think Wolf is perhaps one of the most insightful and clear thinkers in the financial space and this book is a great read for anyone looking to understand the aftermath of the financial crisis and the foundational issues that are still present in the plumbing of our fiscal and monetary systems, not a light read but a rich one nonetheless",
  },
];

export const bookCategories: Book["category"][] = [
  "Fiction",
  "History",
  "Learning",
  "Growth",
];


