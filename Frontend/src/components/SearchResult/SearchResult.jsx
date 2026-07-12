import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchVideoCard from '../VideoCard/SearchVideoCard.jsx'; 
import { VideoSkeleton } from '../Skeleton/VideoSkeleton.jsx';
import Sidebar from '../Sidebar/Sidebar.jsx';
import BottomNav from '../BottomNav/BottomNav.jsx';
import { useSearchResults } from '../../hooks/Video/useSearchResults.js';

const SearchResult = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    //Grab the URL parameters
    const query = searchParams.get('query') || '';
    const sortBy = searchParams.get('sortBy') || '';
    const sortType = searchParams.get('sortType') || '';

    // Filter modal state
    const [showFilters, setShowFilters] = useState(false);

    // 2. Pass those parameters directly into the custom query hook
    const { videos, loading, error } = useSearchResults(query, sortBy, sortType);

    // Updates the URL parameters, which triggers the hook to automatically re-fetch
    const handleFilterChange = (key, value) => {
        setSearchParams(prev => { 
            prev.set(key, value); 
            return prev; 
        });
    };

    return (
        <div className="flex w-full min-h-screen bg-black overflow-hidden pb-16 md:pb-0">
            <Sidebar />

            <main className="flex-1 bg-[#0f0f0f] text-white p-4 md:p-8 relative overflow-y-auto h-[calc(100vh-64px)] mt-16">
                
                <div className="w-full max-w-[1200px] md:pl-6 lg:pl-12 pt-4">
                    
                    {/* Top Bar: Title and Filter Button */}
                    <div className="flex justify-between items-center mb-6 pb-2 border-b border-[#272727]">
                        <h1 className="text-xl font-medium">Search results for "{query}"</h1>
                        
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${showFilters ? 'bg-white text-black' : 'hover:bg-[#272727] text-white'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                            </svg>
                            Filters
                        </button>
                    </div>

                    {/* Filter Modal Overlay */}
                    {showFilters && (
                        <div className="absolute right-4 md:right-auto md:left-1/2 md:-translate-x-1/2 top-20 z-50 bg-[#212121] rounded-xl p-6 shadow-2xl border border-[#3f3f3f] w-full max-w-md">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#3f3f3f]">
                                <h2 className="text-lg font-medium">Search filters</h2>
                                <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                            </div>
                            
                            <div className="flex justify-between px-2">
                                {/* Sort By Column */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sort By</h3>
                                    <button onClick={() => handleFilterChange('sortBy', 'createdAt')} className={`text-left text-sm transition-colors ${sortBy === 'createdAt' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}>Upload Date</button>
                                    <button onClick={() => handleFilterChange('sortBy', 'views')} className={`text-left text-sm transition-colors ${sortBy === 'views' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}>View Count</button>
                                </div>

                                {/* Sort Type Column */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Order</h3>
                                    <button onClick={() => handleFilterChange('sortType', 'desc')} className={`text-left text-sm transition-colors ${sortType === 'desc' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}>Descending</button>
                                    <button onClick={() => handleFilterChange('sortType', 'asc')} className={`text-left text-sm transition-colors ${sortType === 'asc' ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}>Ascending</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Video List Container */}
                    <div className="flex flex-col gap-4 w-full mt-6">
                        
                        {/* Handle Axios Error Output */}
                        {error && (
                            <div className="p-4 mb-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-center">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            [...Array(5)].map((_, i) => <VideoSkeleton key={`skeleton-${i}`} />)
                        ) : videos?.length > 0 ? (
                            videos.map(video => (
                                <SearchVideoCard key={video._id} video={video} />
                            ))
                        ) : !error && (
                            <div className="flex flex-col items-center justify-center py-32 text-gray-400">
                                <svg className="w-24 h-24 mb-4 text-[#272727]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
                                <p className="text-xl font-medium text-white mb-2">No results found</p>
                                <p className="text-sm">Try different keywords or remove search filters</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
            <BottomNav />
        </div>
    );
};

export default SearchResult;