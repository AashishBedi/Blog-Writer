import React, { useState, useEffect, useCallback } from 'react';
import { type Theme } from './types';
import { generateBlogPost } from './services/geminiService';
import ThemeToggle from './components/ThemeToggle';
import Loader from './components/Loader';
import GeneratedPost from './components/GeneratedPost';
import { Icon } from './components/Icon';

const App: React.FC = () => {
    const [theme, setTheme] = useState<Theme>('light');
    const [prompt, setPrompt] = useState<string>('');
    const [generatedPost, setGeneratedPost] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
        setTheme(initialTheme);
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const handleGeneratePost = useCallback(async () => {
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedPost('');

        try {
            const result = await generateBlogPost(prompt);
            setGeneratedPost(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, isLoading]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500 font-sans">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <header className="flex justify-between items-center py-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Icon icon="logo" className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">AI Blog Writer</h1>
                    </div>
                    <ThemeToggle theme={theme} setTheme={setTheme} />
                </header>

                <main className="py-10">
                    <section id="generator" className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Turn Your Ideas into Engaging Blogs</h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                                Simply enter a topic or a prompt, and let our AI craft a well-structured blog post for you.
                            </p>
                        </div>

                        <div className="relative">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., 'The future of renewable energy' or 'A beginner's guide to React Hooks'"
                                className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none transition-shadow"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="text-center">
                            <button
                                onClick={handleGeneratePost}
                                disabled={isLoading || !prompt.trim()}
                                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:dark:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader className="w-5 h-5 mr-3" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="sparkles" className="w-5 h-5 mr-3" />
                                        Generate Post
                                    </>
                                )}
                            </button>
                        </div>
                    </section>

                    <section id="output" className="mt-12">
                        <div className="w-full min-h-[200px] bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                    <Loader className="w-12 h-12 mb-4" />
                                    <p className="text-lg">AI is thinking...</p>
                                    <p className="text-sm">This may take a moment.</p>
                                </div>
                            )}
                            {error && (
                                <div className="flex flex-col items-center justify-center h-full text-red-500">
                                    <p className="font-bold">An Error Occurred</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}
                            {!isLoading && !error && generatedPost && (
                                <GeneratedPost content={generatedPost} />
                            )}
                            {!isLoading && !error && !generatedPost && (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 text-center">
                                    <Icon icon="document" className="w-16 h-16 mb-4" />
                                    <h3 className="text-xl font-semibold">Your AI-generated post will appear here</h3>
                                    <p className="mt-1">Get started by entering a prompt above and clicking generate!</p>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default App;