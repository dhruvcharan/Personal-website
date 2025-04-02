export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: "Fiction" | "History" | "Learning" | "Growth";
  goodreads: string;
  imageUrl: string;
  thoughts: string;
  rating: number;
}

export const currentlyReading: Book[] = [
  {
    id: "1",
    title: "Amusing Ourselves to Death",
    author: "Neil Postman",
    description:
      "A highly detailed and critical look into the impact of technology and the subtle ways in which it alters our perception of the information we consume.",
    category: "Growth",
    goodreads:
      "https://www.goodreads.com/book/show/74034.Amusing_Ourselves_to_Death",
    imageUrl:
      "https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe60e3906-e719-4332-a3c9-087d794fd918_316x423.png",
    thoughts:
      "A thorough examination of the ways in which the nature of the content is warped by the means which we consume it. So much more pertinent in the era of quick digestible 15sec tiktoks and instagram reels pretending to condense knowledge while shaving off the edges of what makes the ideas worth engaging in.",
    rating: 5,
  },
  {
    id: "2",
    title: "The Master and Margarita",
    author: "Mikhail Bulgakov",
    description:
      "A fantastical tale about the importance of the written word and a biting satirical critique of Soviet society. Also there is a big cat.",
    category: "Fiction",
    goodreads:
      "https://www.goodreads.com/book/show/117833.The_Master_and_Margarita",
    imageUrl: "https://images.penguinrandomhouse.com/cover/9780143108276",
    thoughts:
      "Went back to what is probably my favorite book of all time and reading it is still a fascinating and magical experience no matter how often I do it. If there is one book I implore anybody that visits this webpage to read it would be this one.",
    rating: 5,
  },
  {
    id: "3",
    title: "India in the Persianate Age",
    author: "Richard M. Eaton",
    description:
      "A history of India from 1000-1765, focusing on the Persianate period.",
    category: "History",
    goodreads:
      "https://www.goodreads.com/book/show/44128461-india-in-the-persianate-age-1000-1765",
    imageUrl:
      "https://webfiles.ucpress.edu/coverimage/isbn13/9780520325128.jpg",
    thoughts:
      "A nuanced look into the arrival of Persianate and Islamic powers into the Indian subcontinent from the early Ghaznavid conquests to the waning years of the Mughal empire weaving in the goings-on at the regions not directly under the authority of those empires, it builds a compelling and holistic picture of the state of the Indian subcontinent and the evolution of the relationships between the Islamic world and regional powers.",
    rating: 4,
  },
  {
    id: "4",
    title: "Algorithmic Thinking",
    author: "Daniel Zingaro",
    description:
      "Revisiting DSA in the context of challenging Competitive Programming Problems.",
    category: "Learning",
    goodreads:
      "https://www.goodreads.com/book/show/52555533-algorithmic-thinking",
    imageUrl:
      "https://m.media-amazon.com/images/I/71b04BMZwKL._AC_UF1000,1000_QL80_.jpg",
    thoughts:
      "A very thorough and stripped down approach to building an understanding of Algorithms by associating them with solidly challenging competitive programming exercises and then drawing out the underlying need for specific algorithms in a rather organic manner.",
    rating: 5,
  },
  {
    id: "5",
    title: "The Light Fantastic",
    author: "Terry Pratchett",
    description:
      "The second book in the Discworld series, following the adventures of Rincewind and Twoflower.",
    category: "Fiction",
    goodreads: "https://www.goodreads.com/book/show/34506.The_Light_Fantastic",
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/8/87/TLF.cover.jpg",
    thoughts:
      "Re-reading the entirety of the Discworld series and the early Rincewind books are always a joy, full of tongue-in-cheek humor and well disguised social and (contemporary fantasy literature) commentary, only giving it 4 stars because it gets so so much better.",
    rating: 4,
  },
  {
    id: "6",
    title: "The Comfort Crisis",
    author: "Michael Easter",
    description:
      "A book that explores the benefits of discomfort and the modern world's obsession with comfort.",
    category: "Growth",
    goodreads:
      "https://www.goodreads.com/book/show/55120630-the-comfort-crisis?ref=nav_sb_ss_1_17",
    imageUrl:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1601481119i/55120630.jpg",
    thoughts:
      "Feels a little too preachy for my taste and the whole Alaska adventure doesn’t quite convince me in the way the author hoped it would, it is nevertheless a book that deals with a very formative idea, that of us getting far too comfortable with being comfortable and running away from friction at the first sign of it.",
    rating: 3,
  },
  {
    id: "7",
    title: "Cryptocurrency, Casino Capitalism, and the Golden Age of Fraud",
    author: "Ben Mckenzie, Jacob Silverman",
    description:
      "A well researched deep dive into the tangled and dodgy world of Crypto and DeFi Tokens and MemeCoins and the mania associated with them.",
    category: "Learning",
    goodreads: "https://www.goodreads.com/book/show/61783837-easy-money",
    imageUrl: "https://m.media-amazon.com/images/I/71PbrcU-umL._SL1500_.jpg",
    thoughts:
      "I am kinda bummed this book didn’t come out in the later half of 2024 with the unprecedented boom in shitcoins and the rise of http://pump.fun but it is nevertheless a very well researched and frankly unsettling look into the seedy underbelly of an industry that seems to be driven very much by profit over principles and financial nihilism and antagonism.",
    rating: 4,
  },
  {
    id: "8",
    title: "Meditations For Mortals",
    author: "Oliver Burkeman",
    description:
      "A human approach towards productivity and personal satisfaction that acknowledges the finitude and the unpredictability of the Human Experience as a backdrop for a sustainable growth plan",
    category: "Growth",
    goodreads:
      "https://www.goodreads.com/book/show/205363955-meditations-for-mortals",
    imageUrl:
      "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1718696458i/205363955.jpg",
    thoughts:
      'It would not be an exaggeration to say that this is the most honest book in the self-help genre I have come across. I have read Oliver`s previous book "Four Thousand Weeks" and found it super illuminating, and this is in direct continuation of that fundamental principle of embracing the fact that we only have so much time and there is a plethora of things to do and see but we must narrow our gaze and be prepared to miss out while not indulging in self-flagellation on account of not being able to meet the aspirations of the perfectionist within ourselves. Highly recommended for anybody struggling with what I find is a very self-critical purview that the self-help genre can often take ',
    rating: 5,
  },
];

export const bookCategories: Book["category"][] = [
  "Fiction",
  "History",
  "Learning",
  "Growth",
];

