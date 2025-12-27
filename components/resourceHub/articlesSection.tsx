import { Newspaper, Target, Clock, Brain, Mic, Users, TrendingUp, Book, ExternalLink } from 'lucide-react';

const articles = [
    {
        id: 'daily-habits',
        title: '10 Daily Habits to Improve Your English',
        description: 'Small consistent practices that yield big results',
        readTime: '5 min read',
        icon: Target,
        tips: ['Consistency over intensity', 'Practice daily', 'Track progress'],
        url: 'https://oxfordlanguageclub.com/page/blog/10-habits-to-learn-english-successfully',
    },
    {
        id: 'mastering-pronunciation',
        title: 'Mastering English Pronunciation',
        description: 'Techniques to sound like a native speaker',
        readTime: '8 min read',
        icon: Mic,
        tips: ['Listen and repeat', 'Record yourself', 'Use pronunciation guides'],
        url: '/articles/mastering-english-pronunciation',
    },
    {
        id: 'building-vocabulary',
        title: 'Building Vocabulary Efficiently',
        description: 'Learn 500+ words per month with these methods',
        readTime: '6 min read',
        icon: Brain,
        tips: ['Context learning', 'Spaced repetition', 'Word families'],
        url: '/articles/building-vocabulary-efficiently',
    },
    {
        id: 'grammar-made-simple',
        title: 'Grammar Made Simple',
        description: 'Common grammar mistakes and how to avoid them',
        readTime: '7 min read',
        icon: Book,
        tips: ['Pattern recognition', 'Practice exercises', 'Learn from errors'],
        url: '/articles/grammar-made-simple',
    },
    {
        id: 'learning-conversation',
        title: 'Learning Through Conversation',
        description: 'Finding language partners and practice opportunities',
        readTime: '4 min read',
        icon: Users,
        tips: ['Language exchange', 'Online communities', 'Practice groups'],
        url: '/articles/learning-through-conversation',
    },
    {
        id: 'intermediate-to-advanced',
        title: 'From Intermediate to Advanced',
        description: 'Breaking through the intermediate plateau',
        readTime: '10 min read',
        icon: TrendingUp,
        tips: ['Complex materials', 'Academic texts', 'Professional vocabulary'],
        url: '/articles/intermediate-to-advanced',
    }
];

interface ArticlesSectionProps {
    searchQuery: string;
    level: string;
}

export function ArticlesSection({ searchQuery, level }: ArticlesSectionProps) {
    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4">Learning Tips & Strategies</h2>
                <p className="text-gray-600">Evidence-based articles to accelerate your English learning journey</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => {
                    const Icon = article.icon;
                    return (
                        <div key={article.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-black rounded-lg">
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm text-gray-500">{article.readTime}</span>
                            </div>

                            <h3 className="text-xl font-semibold mb-3">{article.title}</h3>
                            <p className="text-gray-600 mb-4">{article.description}</p>

                            <div className="space-y-2 mb-6">
                                <h4 className="font-medium text-sm text-gray-500">Key Tips:</h4>
                                <ul className="space-y-1">
                                    {article.tips.map((tip, tipIndex) => (
                                        <li key={tipIndex} className="flex items-center text-sm">
                                            <div className="w-1.5 h-1.5 bg-black rounded-full mr-2"></div>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Read Article Button */}
                            <a
                                href={article.url}
                                className="inline-flex items-center justify-center gap-2 w-full py-2.5 border border-black rounded hover:bg-black hover:text-white transition-colors group"
                            >
                                <span>Read Article</span>
                                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </a>
                        </div>
                    );
                })}
            </div>

            {/* Featured Articles Section */}
            <div className="mt-12 bg-gray-50 rounded-xl p-8">
                <h3 className="text-2xl font-bold mb-6">Featured Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Weekly Challenge
                        </h4>
                        <p className="text-gray-600 mb-4">This week: Learn 50 new words related to technology</p>
                        <a href="/articles/weekly-challenges" className="text-black font-medium text-sm hover:underline">
                            View all challenges →
                        </a>
                    </div>
                    <div className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Progress Tracking
                        </h4>
                        <p className="text-gray-600 mb-4">Use our templates to track your learning milestones</p>
                        <a href="/resources/progress-templates" className="text-black font-medium text-sm hover:underline">
                            Download templates →
                        </a>
                    </div>
                    <div className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Community
                        </h4>
                        <p className="text-gray-600 mb-4">Join discussion forums to share experiences</p>
                        <a href="/community/forums" className="text-black font-medium text-sm hover:underline">
                            Join community →
                        </a>
                    </div>
                </div>
            </div>

            {/* Article Categories */}
            <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6">Browse by Category</h3>
                <div className="flex flex-wrap gap-3">
                    {[
                        { name: 'Pronunciation', count: 12, href: '/articles/category/pronunciation' },
                        { name: 'Grammar', count: 18, href: '/articles/category/grammar' },
                        { name: 'Vocabulary', count: 25, href: '/articles/category/vocabulary' },
                        { name: 'Listening', count: 15, href: '/articles/category/listening' },
                        { name: 'Speaking', count: 20, href: '/articles/category/speaking' },
                        { name: 'Writing', count: 14, href: '/articles/category/writing' },
                        { name: 'Study Tips', count: 22, href: '/articles/category/study-tips' },
                    ].map((category) => (
                        <a
                            key={category.name}
                            href={category.href}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
                        >
                            {category.name} <span className="text-gray-500">({category.count})</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}