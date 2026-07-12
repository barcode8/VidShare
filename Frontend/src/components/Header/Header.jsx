import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom"; 
import { LuSearch, LuUpload, LuX, LuMenu, LuLogOut, LuUser, LuBell, LuMonitorPlay, LuCheck, LuArrowLeft } from "react-icons/lu";
import { useAuth } from '../../context/AuthContext.jsx';
import { useGetUnreadNotifications } from '../../hooks/Notifications/useGetUnreadNotifications.js';
import { useMarkNotificationAsRead } from '../../hooks/Notifications/useMarkNotificationAsRead.js';

export default function Header() {
    const [query, setQuery] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    
    // State for Mobile Search UX
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const searchInputRef = useRef(null);
    
    // State for the notification dropdown
    const [notifOpen, setNotifOpen] = useState(false);

    // Create references for the dropdown containers
    const notifRef = useRef(null);
    const profileRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const { user, logout } = useAuth();
    
    // Notification Hooks
    const { notifications, setNotifications, hasMore, loadMore } = useGetUnreadNotifications();
    const { markAsRead } = useMarkNotificationAsRead();
    
    const navigate = useNavigate(); 

    // Auto-focus the mobile search input when it opens
    useEffect(() => {
        if (mobileSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [mobileSearchOpen]);

    // Add the global click listener to close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotifOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault(); 
        if (query.trim()) {
            navigate(`/search?query=${encodeURIComponent(query)}`);
            setMobileSearchOpen(false); 
        }
    };

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Subscriptions', path: '/subscriptions' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-zinc-800 font-roboto h-16">
            <div className="px-4 sm:px-6 lg:px-8 h-full relative">
                <div className="flex items-center justify-between h-full gap-2">

                    {/* 1. Left Section */}
                    <div className="flex flex-1 items-center pr-2 lg:pr-8">
                        <Link to="/" className="shrink-0">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent cursor-pointer tracking-tight">
                                VidShare
                            </h1>
                        </Link>

                        <div className="hidden xl:flex items-center gap-6 mx-auto pl-8">
                            {navItems.map((item) => (
                                <Link 
                                    key={item.name} 
                                    to={item.path} 
                                    className="text-zinc-400 hover:text-pink-500 transition-colors text-sm font-medium"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* 2. Desktop Search Section */}
                    <div className="hidden lg:flex justify-center w-full max-w-2xl px-4">
                        <form onSubmit={handleSearchSubmit} className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search videos..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                className={`w-full bg-zinc-900 text-white px-4 py-2 pl-10 pr-10 rounded-full border transition-all duration-300 outline-none ${searchFocused
                                        ? 'border-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                                        : 'border-zinc-700'
                                    }`}
                            />
                            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2">
                                <LuSearch className="w-5 h-5 text-zinc-500 hover:text-white transition-colors" />
                            </button>
                            
                            {query && (
                                <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-800 rounded-full text-zinc-400">
                                    <LuX size={16} />
                                </button>
                            )}
                        </form>
                    </div>

                    {/* 3. Action Section */}
                    <div className="flex flex-1 items-center justify-end gap-1 sm:gap-3">
                        {/* Mobile Search Trigger Button */}
                        <button 
                            onClick={() => setMobileSearchOpen(true)}
                            className="lg:hidden p-2 hover:bg-zinc-800 rounded-full text-white shrink-0"
                        >
                            <LuSearch size={20} />
                        </button>

                        {user ? (
                            <div className="flex items-center gap-1 sm:gap-3">
                                
                                {/* ⬆️ UPLOAD BUTTON */}
                                <Link to="/upload" className="shrink-0 flex items-center">
                                    <motion.button
                                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <LuUpload size={18} className="sm:w-4 sm:h-4" />
                                        <span className="hidden sm:inline text-sm font-medium">Upload</span>
                                    </motion.button>
                                </Link>

                                {/* 🔔 NOTIFICATION DROPDOWN */}
                                <div className="relative shrink-0 flex items-center" ref={notifRef}>
                                    <button 
                                        onClick={() => {
                                            setNotifOpen(!notifOpen);
                                            if (profileOpen) setProfileOpen(false);
                                        }}
                                        className="p-2 hover:bg-zinc-800 rounded-full text-white relative"
                                    >
                                        <LuBell size={20} />
                                        {notifications?.length > 0 && (
                                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-black"></span>
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {notifOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                // Added top-full and mt-2
                                                className="absolute top-full -right-10 sm:right-0 mt-2 w-[90vw] max-w-[320px] sm:w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[80vh] sm:max-h-96"
                                            >
                                                <div className="px-4 py-3 border-b border-zinc-800 sticky top-0 bg-zinc-900/95 backdrop-blur-sm z-10 flex justify-between items-center">
                                                    <p className="text-white text-sm font-bold">Notifications</p>
                                                    {notifications?.length > 0 && (
                                                        <span className="bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                            {notifications.length} New
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="overflow-y-auto custom-scrollbar flex-1">
                                                    {notifications?.length === 0 ? (
                                                        <div className="p-6 text-center text-zinc-500 text-sm">No new notifications</div>
                                                    ) : (
                                                        notifications?.map(notif => (
                                                            <div key={notif._id} className="p-4 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors flex flex-col gap-2">
                                                                {notif.videoDetails?.thumbnail && (
                                                                    <img 
                                                                        src={notif.videoDetails.thumbnail} 
                                                                        alt="Video Thumbnail" 
                                                                        className="w-full h-24 object-cover rounded-lg border border-zinc-700" 
                                                                    />
                                                                )}
                                                                <p className="text-sm text-zinc-300 leading-snug">{notif.message}</p>
                                                                <div className="flex justify-end mt-1">
                                                                    <button 
                                                                        onClick={() => markAsRead(notif._id, setNotifications)}
                                                                        className="text-xs text-pink-500 hover:text-pink-400 font-medium transition-colors flex items-center gap-1"
                                                                    >
                                                                        <LuCheck size={14} /> Mark as read
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                    {hasMore && notifications?.length > 0 && (
                                                        <button 
                                                            onClick={loadMore}
                                                            className="w-full py-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-center border-t border-zinc-800"
                                                        >
                                                            Load More
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* 🧑 PROFILE DROPDOWN */}
                                <div className="relative shrink-0 flex items-center" ref={profileRef}>
                                    <motion.button
                                        onClick={() => {
                                            setProfileOpen(!profileOpen);
                                            if (notifOpen) setNotifOpen(false); 
                                        }}
                                        className="flex items-center"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover border-2 border-zinc-800" />
                                    </motion.button>
                                    <AnimatePresence>
                                        {profileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                // Added top-full and mt-2
                                                className="absolute top-full right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 overflow-hidden z-50"
                                            >
                                                <div className="px-4 py-3 border-b border-zinc-800">
                                                    <p className="text-white text-sm font-bold truncate">{user.fullName || user.username}</p>
                                                    <p className="text-zinc-500 text-xs truncate">@{user.username}</p>
                                                </div>

                                                <Link to="/change-details" onClick={() => setProfileOpen(false)} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800">
                                                    <LuUser size={16} /> Edit Details
                                                </Link>

                                                <Link to="/channel" onClick={() => setProfileOpen(false)} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 border-b border-zinc-800">
                                                    <LuMonitorPlay size={16} /> View Channel
                                                </Link>
                                                
                                                <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-zinc-800 text-left">
                                                    <LuLogOut size={16} /> Sign Out
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <div className="relative shrink-0 flex items-center" ref={mobileMenuRef}>
                                {/* Desktop/Tablet Auth Buttons */}
                                <div className="hidden md:flex gap-3">
                                    <Link to='/login' className="text-zinc-400 hover:text-white px-4 py-2 text-sm font-medium">Login</Link>
                                    <Link to="/register" className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">Register</Link>
                                </div>
                                
                                {/* Mobile Hamburger Icon */}
                                <button 
                                    className="md:hidden p-2 text-white hover:bg-zinc-800 rounded-full transition-colors flex items-center justify-center" 
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                >
                                    {mobileMenuOpen ? <LuX size={24} /> : <LuMenu size={24} />}
                                </button>

                                {/* Mobile Auth Dropdown Menu */}
                                <AnimatePresence>
                                    {mobileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            // Added top-full and mt-2
                                            className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 overflow-hidden z-50 md:hidden"
                                        >
                                            <Link 
                                                to="/login" 
                                                onClick={() => setMobileMenuOpen(false)} 
                                                className="w-full block px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border-b border-zinc-800/50"
                                            >
                                                Login
                                            </Link>
                                            <Link 
                                                to="/register" 
                                                onClick={() => setMobileMenuOpen(false)} 
                                                className="w-full block px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                                            >
                                                Register
                                            </Link>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

                {/* 📱 MOBILE SEARCH OVERLAY */}
                <AnimatePresence>
                    {mobileSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-0 left-0 w-full h-full bg-black z-50 flex items-center px-4 gap-2 lg:hidden"
                        >
                            <button
                                onClick={() => {
                                    setMobileSearchOpen(false);
                                    setQuery(""); 
                                }}
                                className="p-2 text-white rounded-full hover:bg-zinc-800 transition-colors"
                            >
                                <LuArrowLeft size={24} />
                            </button>
                            
                            <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search videos..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full bg-zinc-900 text-white px-4 py-2 pr-10 rounded-full border border-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.4)] outline-none"
                                />
                                {query && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQuery("");
                                            searchInputRef.current?.focus();
                                        }}
                                        className="absolute right-3 p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
                                    >
                                        <LuX size={18} />
                                    </button>
                                )}
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </nav>
    );
}