
import { PlayCircle, Clock, Users, Target, Award, TrendingUp } from 'lucide-react';

const videoCategories = [
    {
        category: 'Pronunciation & Speaking',
        videos: [
            { title: 'Perfect Your American Accent', duration: '15:23', views: '2.4M', channel: 'English with Lucy' },
            { title: 'Common Pronunciation Mistakes', duration: '12:45', views: '1.8M', channel: 'BBC Learning English' },
            { title: 'Speak English Fluently', duration: '20:10', views: '3.2M', channel: 'EnglishAnyone' }
        ]
    },
    {
        category: 'Grammar Mastery',
        videos: [
            { title: 'All Tenses in 30 Minutes', duration: '28:15', views: '4.1M', channel: 'Learn English Lab' },
            { title: 'Conditionals Made Easy', duration: '18:32', views: '1.2M', channel: 'English Grammar Pro' },
            { title: 'Common Grammar Errors', duration: '22:45', views: '2.9M', channel: 'English with Emma' }
        ]
    },
    {
        category: 'Vocabulary Building',
        videos: [
            { title: '100 Most Common Words', duration: '25:30', views: '5.6M', channel: 'English Class 101' },
            { title: 'Business English Vocabulary', duration: '19:45', views: '890K', channel: 'Business English Pod' },
            { title: 'Academic Word List', duration: '32:10', views: '1.5M', channel: 'IELTS Liz' }
        ]
    },
    {
        category: 'Listening Practice',
        videos: [
            { title: 'English Conversations - Real Life', duration: '45:20', views: '3.8M', channel: 'Learn English TV' },
            { title: 'News in Slow English', duration: '22:15', views: '2.1M', channel: 'VOA Learning English' },
            { title: 'Movie Dialogues Analysis', duration: '28:45', views: '4.3M', channel: 'Learn English With TV' }
        ]
    },
    {
        category: 'Test Preparation',
        videos: [
            { title: 'SAT Reading Strategies', duration: '35:10', views: '950K', channel: 'Khan Academy' },
            { title: 'IELTS Speaking Test Tips', duration: '26:45', views: '3.4M', channel: 'IELTS Advantage' },
            { title: 'TOEFL Writing Guide', duration: '31:20', views: '1.7M', channel: 'Notefull' }
        ]
    },
    {
        category: 'Learning Strategies',
        videos: [
            { title: 'How to Think in English', duration: '17:55', views: '4.8M', channel: 'English Fluency Journey' },
            { title: 'Immersion Techniques', duration: '24:30', views: '2.3M', channel: 'FluentU English' },
            { title: 'Overcoming Language Plateaus', duration: '29:15', views: '1.9M', channel: 'Polyglot Tips' }
        ]
    }
];

const youtubeLinks = {
    'English with Lucy': 'https://www.youtube.com/c/EnglishwithLucy',
    'BBC Learning English': 'https://www.youtube.com/user/bbclearningenglish',
    'EnglishAnyone': 'https://www.youtube.com/user/EnglishAnyone',
    'Learn English Lab': 'https://www.youtube.com/c/LearnEnglishLab',
    'English Grammar Pro': 'https://www.youtube.com/c/EnglishGrammarPro',
    'English with Emma': 'https://www.youtube.com/c/EnglishTeacherEmma',
    'English Class 101': 'https://www.youtube.com/c/EnglishClass101',
    'Business English Pod': 'https://www.youtube.com/c/BusinessEnglishPod',
    'IELTS Liz': 'https://www.youtube.com/c/IELTSLiz',
    'Learn English TV': 'https://www.youtube.com/c/LearnEnglishTV',
    'VOA Learning English': 'https://www.youtube.com/user/VOALearningEnglish',
    'Learn English With TV': 'https://www.youtube.com/c/LearnEnglishWithTVSeries',
    'Khan Academy': 'https://www.youtube.com/c/khanacademy',
    'IELTS Advantage': 'https://www.youtube.com/c/IELTSAdvantage',
    'Notefull': 'https://www.youtube.com/c/NotefullTOEFL',
    'English Fluency Journey': 'https://www.youtube.com/c/EnglishFluencyJourney',
    'FluentU English': 'https://www.youtube.com/c/FluentUEnglish',
    'Polyglot Tips': 'https://www.youtube.com/c/PolyglotTips'
};

interface VideosSectionProps {
    searchQuery: string;
    level: string;
}

export function VideosSection({ searchQuery, level }: VideosSectionProps) {
    const filteredCategories = videoCategories.map(category => ({
        ...category,
        videos: category.videos.filter(video => {
            const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                video.channel.toLowerCase().includes(searchQuery.toLowerCase());
            // Videos don't have explicit levels in data yet, so we show them unless filtered by search
            // In a real app we'd add level tags to videos
            return matchesSearch;
        })
    })).filter(category => category.videos.length > 0);

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4">Video Lessons & Tutorials</h2>
                <p className="text-gray-600">YouTube channels and video resources for visual learning</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-semibold mb-4 border-b pb-2">{category.category}</h3>
                        <div className="space-y-4">
                            {category.videos.map((video, videoIndex) => (
                                <a
                                    key={videoIndex}
                                    href={youtubeLinks[video.channel as keyof typeof youtubeLinks]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block group"
                                >
                                    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded transition-colors">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-16 h-16 bg-black rounded flex items-center justify-center">
                                                <PlayCircle className="w-8 h-8 text-white" />
                                            </div>
                                            <span className="absolute bottom-1 right-1 bg-black text-white text-xs px-1 rounded">
                                                {video.duration}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold group-hover:text-blue-600 transition-colors">
                                                {video.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">{video.channel}</p>
                                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {video.duration}
                                                </span>
                                                <span className="flex items-center">
                                                    <Users className="w-3 h-3 mr-1" />
                                                    {video.views} views
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black text-white rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <Target className="w-6 h-6 mr-3" />
                        <h3 className="text-lg font-semibold">Learning Path</h3>
                    </div>
                    <p className="text-gray-300">Follow our recommended video playlist order for structured learning</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <Award className="w-6 h-6 mr-3" />
                        <h3 className="text-lg font-semibold">Certification Prep</h3>
                    </div>
                    <p className="text-gray-600">Video courses for TOEFL, IELTS, and SAT preparation</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                        <TrendingUp className="w-6 h-6 mr-3" />
                        <h3 className="text-lg font-semibold">Progress Tracking</h3>
                    </div>
                    <p className="text-gray-600">Monitor your improvement with video-based assessments</p>
                </div>
            </div>

            <div className="mt-8 p-6 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Video Learning Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center">
                            <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                            Use subtitles for better comprehension
                        </li>
                        <li className="flex items-center">
                            <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                            Pause and repeat difficult sections
                        </li>
                        <li className="flex items-center">
                            <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                            Take notes while watching
                        </li>
                    </ul>
                    <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center">
                            <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                            Watch at different playback speeds
                        </li>
                        <li className="flex items-center">
                            <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                            Practice shadowing (repeat after speaker)
                        </li>
                        <li className="flex items-center">
                            <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                            Create video playlists by topic
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}