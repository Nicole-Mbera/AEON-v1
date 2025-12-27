import { Globe, Award, Target, TrendingUp, Clock, Users, BookOpen, CheckCircle } from 'lucide-react';

const websites = [
    {
        name: 'Khan Academy',
        description: 'Comprehensive SAT practice tests and English grammar lessons',
        url: 'https://www.khanacademy.org',
        icon: Award,
        features: ['SAT Practice Tests', 'Grammar Lessons', 'Writing Exercises', 'Reading Comprehension']
    },
    {
        name: 'Duolingo',
        description: 'Gamified language learning with daily practice',
        url: 'https://www.duolingo.com',
        icon: Target,
        features: ['Daily Practice', 'Speaking Exercises', 'Vocabulary Building', 'Progress Tracking']
    },
    {
        name: 'British Council',
        description: 'Official English learning resources and courses',
        url: 'https://learnenglish.britishcouncil.org',
        icon: Globe,
        features: ['Free Courses', 'Practice Tests', 'Learning Materials', 'Expert Advice']
    },
    {
        name: 'Grammarly',
        description: 'Writing assistant and grammar checker',
        url: 'https://www.grammarly.com',
        icon: CheckCircle,
        features: ['Grammar Check', 'Writing Suggestions', 'Plagiarism Checker', 'Style Guide']
    },
    {
        name: 'Quizlet',
        description: 'Flashcards and study tools for vocabulary',
        url: 'https://quizlet.com',
        icon: BookOpen,
        features: ['Flashcards', 'Study Games', 'Learning Modes', 'Shared Decks']
    },
    {
        name: 'BBC Learning English',
        description: 'News-based English learning resources',
        url: 'https://www.bbc.co.uk/learningenglish',
        icon: TrendingUp,
        features: ['Daily Lessons', 'News Articles', 'Video Content', 'Pronunciation Guide']
    }
];

const assessmentData = [
    { test: 'SAT Reading', practiceTests: 8, avgScore: '650', improvement: '+15%' },
    { test: 'SAT Writing', practiceTests: 6, avgScore: '680', improvement: '+12%' },
    { test: 'Grammar Mastery', practiceTests: 10, avgScore: '92%', improvement: '+20%' },
    { test: 'Vocabulary', practiceTests: 12, avgScore: '88%', improvement: '+18%' }
];

interface WebsitesSectionProps {
    searchQuery: string;
    level: string;
}

export function WebsitesSection({ searchQuery, level }: WebsitesSectionProps) {
    const filteredWebsites = websites.filter(site => {
        const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            site.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4">Learning Platforms & Resources</h2>
                <p className="text-gray-600">Curated websites and platforms for comprehensive English learning</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredWebsites.map((site, index) => {
                    const Icon = site.icon;
                    return (
                        <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-black rounded-lg">
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <a
                                    href={site.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Visit Site →
                                </a>
                            </div>

                            <h3 className="text-xl font-semibold mb-2">{site.name}</h3>
                            <p className="text-gray-600 mb-4">{site.description}</p>

                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-gray-500">Key Features:</h4>
                                <ul className="space-y-1">
                                    {site.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center text-sm">
                                            <div className="w-1.5 h-1.5 bg-black rounded-full mr-2"></div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Assessment Section */}
            <div className="bg-black text-white rounded-xl p-6 mb-8">
                <div className="flex items-center mb-6">
                    <Award className="w-8 h-8 mr-3" />
                    <div>
                        <h3 className="text-2xl font-bold">Continuous Assessment Tracking</h3>
                        <p className="text-gray-300">SAT Practice Tests on Khan Academy</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {assessmentData.map((item, index) => (
                        <div key={index} className="bg-gray-900 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold">{item.test}</h4>
                                <span className="text-green-400 text-sm font-medium">{item.improvement}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-2xl font-bold">{item.avgScore}</p>
                                    <p className="text-gray-400 text-sm">Average Score</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-semibold">{item.practiceTests}</p>
                                    <p className="text-gray-400 text-sm">Tests Taken</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold">Recommended Study Plan</h4>
                            <p className="text-gray-300 text-sm">Based on your assessment results</p>
                        </div>
                        <button className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200">
                            Generate Plan
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Study Schedule</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Daily Practice</span>
                            <span className="font-semibold">30 mins</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Weekly Assessments</span>
                            <span className="font-semibold">2 tests</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Monthly Review</span>
                            <span className="font-semibold">Progress report</span>
                        </div>
                    </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Resource Usage Tips</h3>
                    <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Schedule regular practice sessions
                        </li>
                        <li className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            Join study groups on platforms
                        </li>
                        <li className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Track progress with built-in tools
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}