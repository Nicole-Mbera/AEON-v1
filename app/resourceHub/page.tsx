'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    BookOpen, Newspaper, Globe, PlayCircle,
    CheckCircle, Clock, Award, Users, ArrowLeft
} from 'lucide-react';
import { BooksSection } from "@/components/resourceHub/booksSection"
import { ArticlesSection } from "@/components/resourceHub/articlesSection"
import { VideosSection } from "@/components/resourceHub/videosSection"
import { WebsitesSection } from "@/components/resourceHub/websitesSection"

const tabs = [

    { id: 'videos', label: 'Videos', icon: PlayCircle },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'articles', label: 'Articles', icon: Newspaper },
    { id: 'websites', label: 'Websites', icon: Globe },

];

export default function ResourceHub() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('videos');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeLevel, setActiveLevel] = useState('All');

    const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8">
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                {/* Top Controls: Search & Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <BookOpen className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black sm:text-sm"
                            placeholder="Search resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Level Filter */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {levels.map((level) => (
                            <button
                                key={level}
                                onClick={() => setActiveLevel(level)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeLevel === level
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Banner */}
                <div className="bg-black text-white rounded-xl p-6 mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                        <div className="text-center">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-2xl font-bold">150+</p>
                            <p className="text-gray-300">Resources</p>
                        </div>
                        <div className="text-center">
                            <Clock className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-2xl font-bold">All Levels</p>
                            <p className="text-gray-300">Beginner to Advanced</p>
                        </div>
                        <div className="text-center">
                            <Award className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-2xl font-bold">Free</p>
                            <p className="text-gray-300">Always Accessible</p>
                        </div>
                        <div className="text-center">
                            <Users className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-2xl font-bold">Updated</p>
                            <p className="text-gray-300">Regularly</p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-4 px-1 text-lg font-medium transition-colors ${activeTab === tab.id
                                        ? 'tab-active border-b-2 border-black text-black'
                                        : 'tab-inactive text-gray-500 hover:text-black'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="min-h-[600px]">
                    {activeTab === 'websites' && <WebsitesSection searchQuery={searchQuery} level={activeLevel} />}
                    {activeTab === 'videos' && <VideosSection searchQuery={searchQuery} level={activeLevel} />}
                    {activeTab === 'books' && <BooksSection searchQuery={searchQuery} level={activeLevel} />}
                    {activeTab === 'articles' && <ArticlesSection searchQuery={searchQuery} level={activeLevel} />}

                </div>
            </div>
            <style jsx>{`
                .tab-active {
                    color: black;
                }
            `}</style>
        </div>
    );
}