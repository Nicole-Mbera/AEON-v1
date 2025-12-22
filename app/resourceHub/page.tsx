'use client';
import Link from "next/link";
import { useState } from 'react';
import {
    BookOpen, Newspaper, Globe, PlayCircle,
    CheckCircle, Clock, Award, Users
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
    const [activeTab, setActiveTab] = useState('videos');

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8">

                {/* Stats Banner */}
                <div className="bg-black text-white rounded-xl p-6 mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                        <Link
                            href="/"
                            className="flex items-center gap-3 text-base font-semibold tracking-tight"
                        >
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-bold uppercase text-white">
                                AEON
                            </span>
                            AEON Education
                        </Link>
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
                                        ? 'tab-active'
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
                    {activeTab === 'websites' && <WebsitesSection />}
                    {activeTab === 'videos' && <VideosSection />}
                    {activeTab === 'books' && <BooksSection />}
                    {activeTab === 'articles' && <ArticlesSection />}

                </div>
            </div>
        </div>
    );
}