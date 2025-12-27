import {
    BookOpen, BookText, GraduationCap, Castle,
    Globe, Feather, Sparkles, Target,
    Users, TrendingUp, Brain, Star,
    Download, ExternalLink,
    LucideIcon // Import this type
} from 'lucide-react';

// Define proper interface for book items
interface BookItem {
    title: string;
    author: string;
    level: string;
    icon: LucideIcon;
    pdfUrl?: string; // Optional PDF download link
    externalUrl?: string; // Optional external reading link
}

// Update books array with download links
const books: Array<{
    category: string;
    items: BookItem[];
}> = [
        {
            category: 'Beginner',
            items: [
                {
                    title: 'English for Everyone',
                    author: 'DK Publishing',
                    level: 'Beginner',
                    icon: BookOpen,
                    pdfUrl: 'https://www.pdfdrive.com/english-for-everyone-level-1-course-book-e176537656.html',
                    externalUrl: 'https://www.dk.com/us/book/9781465447633-english-for-everyone-level-1-course-book/'
                },
                {
                    title: 'Essential Grammar in Use',
                    author: 'Raymond Murphy',
                    level: 'Beginner',
                    icon: BookText,
                    pdfUrl: 'https://archive.org/details/essential-grammar-in-use-4th-edition',
                    externalUrl: 'https://www.cambridge.org/us/cambridgeenglish/catalog/grammar-vocabulary-and-pronunciation/essential-grammar-use-4th-edition'
                },
                {
                    title: 'Oxford Picture Dictionary',
                    author: 'Jayme Adelson-Goldstein',
                    level: 'Beginner',
                    icon: Globe,
                    pdfUrl: 'https://archive.org/details/oxford-picture-dictionary-english',
                    externalUrl: 'https://elt.oup.com/catalogue/items/global/dictionaries/9780194505291?cc=us&selLanguage=en'
                },
            ]
        },
        {
            category: 'Intermediate Literature',
            items: [
                {
                    title: 'To Kill a Mockingbird',
                    author: 'Harper Lee',
                    level: 'Intermediate',
                    icon: Feather,
                    pdfUrl: 'https://www.pdfdrive.com/to-kill-a-mockingbird-e33589475.html',
                    externalUrl: 'https://www.gutenberg.org/ebooks/2658'
                },
                {
                    title: 'Animal Farm',
                    author: 'George Orwell',
                    level: 'Intermediate',
                    icon: Users,
                    pdfUrl: 'https://www.pdfdrive.com/animal-farm-george-orwell-e33497341.html',
                    externalUrl: 'https://www.gutenberg.org/ebooks/521'
                },
                {
                    title: 'The Great Gatsby',
                    author: 'F. Scott Fitzgerald',
                    level: 'Intermediate',
                    icon: Sparkles,
                    pdfUrl: 'https://www.pdfdrive.com/the-great-gatsby-e33568573.html',
                    externalUrl: 'https://www.gutenberg.org/ebooks/64317'
                },
            ]
        },
        {
            category: 'Advanced Novels',
            items: [
                {
                    title: '1984',
                    author: 'George Orwell',
                    level: 'Advanced',
                    icon: Target,
                    pdfUrl: 'https://www.pdfdrive.com/1984-george-orwell-e33477151.html',
                    externalUrl: 'https://www.gutenberg.org/ebooks/24280'
                },
                {
                    title: 'Pride and Prejudice',
                    author: 'Jane Austen',
                    level: 'Advanced',
                    icon: BookText,
                    pdfUrl: 'https://www.pdfdrive.com/pride-and-prejudice-e33483553.html',
                    externalUrl: 'https://www.gutenberg.org/ebooks/1342'
                },
                {
                    title: 'Moby Dick',
                    author: 'Herman Melville',
                    level: 'Advanced',
                    icon: Globe,
                    pdfUrl: 'https://www.pdfdrive.com/moby-dick-e33574815.html',
                    externalUrl: 'https://www.gutenberg.org/ebooks/2701'
                },
            ]
        },
        {
            category: 'History & Non-Fiction',
            items: [
                {
                    title: 'A Short History of Nearly Everything',
                    author: 'Bill Bryson',
                    level: 'Intermediate+',
                    icon: GraduationCap,
                    externalUrl: 'https://www.billbryson.co.uk/books/a-short-history-of-nearly-everything'
                },
                {
                    title: 'Sapiens',
                    author: 'Yuval Noah Harari',
                    level: 'Advanced',
                    icon: Brain,
                    externalUrl: 'https://www.ynharari.com/book/sapiens/'
                },
                {
                    title: 'The Diary of a Young Girl',
                    author: 'Anne Frank',
                    level: 'Intermediate',
                    icon: BookOpen,
                    pdfUrl: 'https://www.pdfdrive.com/the-diary-of-a-young-girl-e33491137.html',
                    externalUrl: 'https://www.annefrank.org/en/anne-frank/diary/'
                },
            ]
        },
        {
            category: 'Classic Literature',
            items: [
                {
                    title: 'Wuthering Heights',
                    author: 'Emily Brontë',
                    level: 'Advanced',
                    icon: Castle,
                    pdfUrl: 'https://www.pdfdrive.com/wuthering-heights-e33592449.html',
                    externalUrl: 'https://www.gutenberg.org/ebooks/768'
                },
                {
                    title: 'The Catcher in the Rye',
                    author: 'J.D. Salinger',
                    level: 'Intermediate',
                    icon: TrendingUp,
                    pdfUrl: 'https://www.pdfdrive.com/the-catcher-in-the-rye-e33565957.html',
                    externalUrl: 'https://www.salinger.org/the-catcher-in-the-rye/'
                },
                {
                    title: 'Lord of the Flies',
                    author: 'William Golding',
                    level: 'Intermediate',
                    icon: Users,
                    pdfUrl: 'https://www.pdfdrive.com/lord-of-the-flies-e33563571.html',
                    externalUrl: 'https://www.william-golding.co.uk/books/lord-of-the-flies'
                },
            ]
        },
        {
            category: 'Modern Stories',
            items: [
                {
                    title: 'The Alchemist',
                    author: 'Paulo Coelho',
                    level: 'Intermediate',
                    icon: Sparkles,
                    pdfUrl: 'https://www.pdfdrive.com/the-alchemist-e33477005.html',
                    externalUrl: 'https://www.paulocoelho.com/reader/alchemist/alchemist_en.html'
                },
                {
                    title: 'The Kite Runner',
                    author: 'Khaled Hosseini',
                    level: 'Advanced',
                    icon: Feather,
                    externalUrl: 'https://khaledhosseini.com/books/the-kite-runner/'
                },
                {
                    title: 'Life of Pi',
                    author: 'Yann Martel',
                    level: 'Intermediate+',
                    icon: Globe,
                    externalUrl: 'https://www.yannmartel.com/books/life-of-pi/'
                },
            ]
        }
    ];

const levelColors = {
    'Beginner': 'bg-green-100 text-green-800',
    'Intermediate': 'bg-blue-100 text-blue-800',
    'Intermediate+': 'bg-purple-100 text-purple-800',
    'Advanced': 'bg-red-100 text-red-800'
};

interface BooksSectionProps {
    searchQuery: string;
    level: string;
}

export function BooksSection({ searchQuery, level }: BooksSectionProps) {
    const filteredCategories = books.map(category => ({
        ...category,
        items: category.items.filter(book => {
            const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.author.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesLevel = level === 'All' || book.level.includes(level) || level.includes(book.level);
            return matchesSearch && matchesLevel;
        })
    })).filter(category => category.items.length > 0);

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4">English Books & Literature</h2>
                <p className="text-gray-600">Carefully curated books ranging from beginner to advanced levels. Download PDFs or read online.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white">
                        <h3 className="text-xl font-semibold mb-4 border-b pb-2">{category.category}</h3>
                        <div className="space-y-4">
                            {category.items.map((book, bookIndex) => {
                                const IconComponent = book.icon;
                                return (
                                    <div key={bookIndex} className="p-3 hover:bg-gray-50 rounded transition-colors">
                                        <div className="flex items-start space-x-3">
                                            <div className="p-2 bg-black rounded flex-shrink-0">
                                                <IconComponent className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 truncate">{book.title}</h4>
                                                <p className="text-sm text-gray-600 truncate">{book.author}</p>
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${levelColors[book.level as keyof typeof levelColors]}`}>
                                                    {book.level}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Download/Read Links */}
                                        <div className="flex flex-wrap gap-2 mt-3 ml-11">
                                            {book.pdfUrl && (
                                                <a
                                                    href={book.pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
                                                >
                                                    <Download className="w-3 h-3" />
                                                    Download PDF
                                                </a>
                                            )}

                                            {book.externalUrl && (
                                                <a
                                                    href={book.externalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    Read Online
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Reading Tips</h3>
                <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Start with books slightly below your current level to build confidence
                    </li>
                    <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Keep a vocabulary journal for new words
                    </li>
                    <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Read aloud to improve pronunciation
                    </li>
                    <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Use audiobooks along with physical books for better comprehension
                    </li>
                </ul>

                <div className="mt-6 p-4 bg-white rounded border">
                    <h4 className="font-semibold mb-2">📚 More Free Book Resources</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <a href="https://www.gutenberg.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Project Gutenberg (60,000+ free ebooks)
                        </a>
                        <a href="https://archive.org/details/texts" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Internet Archive (Millions of free books)
                        </a>
                        <a href="https://www.pdfdrive.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            PDF Drive (Free PDF downloads)
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}