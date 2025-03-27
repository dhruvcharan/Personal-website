export interface Book {
    id : string;
    title : string;
    author : string;
    description : string;
    category : 'Fiction' | 'History' | 'Learning' | 'Growth';
    goodreads : string;
    imageUrl : string;
    thoughts : string;
    rating : number;
}

export const currentlyReading : Book[] = [
    {
        id : '1',
        title : 'India in the Persianate Age',
        author : 'Richard M. Eaton',
        description : 'A history of India from 1000-1765, focusing on the Persianate period.',
        category : 'History',
        goodreads : 'https://www.goodreads.com/book/show/44128461-india-in-the-persianate-age-1000-1765',
        imageUrl : 'https://webfiles.ucpress.edu/coverimage/isbn13/9780520325128.jpg',
        thoughts : '',
        rating : 4 
    },
    {
        id : '2',
        title : 'Algorithmic Thinking',
        author : 'Daniel Zingaro',
        description : 'Revisiting DSA in the context of challenging Competitive Programming Problems.',
        category : 'Learning',
        goodreads : 'https://www.goodreads.com/book/show/52555533-algorithmic-thinking',
        imageUrl : 'https://m.media-amazon.com/images/I/71b04BMZwKL._AC_UF1000,1000_QL80_.jpg',
        thoughts : '',
        rating : 5
    },
    {
        id : '3',
        title : 'The Light Fantastic',
        author : 'Terry Pratchett',
        description : 'The second book in the Discworld series, following the adventures of Rincewind and Twoflower.',
        category : 'Fiction',
        goodreads : 'https://www.goodreads.com/book/show/34506.The_Light_Fantastic',
        imageUrl : 'https://upload.wikimedia.org/wikipedia/en/8/87/TLF.cover.jpg',
        thoughts : '',
        rating : 4
    },
    {
        id : '4',
        title : 'The Comfort Crisis',
        author : 'Michael Easter',
        description : 'A book that explores the benefits of discomfort and the modern world\'s obsession with comfort.',
        category : 'Growth',
        goodreads : 'https://www.goodreads.com/book/show/55120630-the-comfort-crisis?ref=nav_sb_ss_1_17',
        imageUrl : 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1601481119i/55120630.jpg',
        thoughts : '',
        rating : 3
    }
];
export const bookCategories: Book['category'][] = ['Fiction', 'History', 'Learning', 'Growth'];