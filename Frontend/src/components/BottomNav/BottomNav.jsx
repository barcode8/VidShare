import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LuHouse, 
    LuSquarePlay, 
    LuHistory, 
    LuThumbsUp,
    LuListVideo
} from "react-icons/lu";

export default function BottomNav() {
    const navItems = [
        { icon: LuHouse, label: "Home", path: "/" },
        { icon: LuSquarePlay, label: "Subs", path: "/subscriptions" },
        { icon: LuListVideo, label: "Playlists", path: "/playlists" },
        { icon: LuThumbsUp, label: "Liked", path: "/liked-videos" },
        { icon: LuHistory, label: "History", path: "/watch-history" },
    ];

    return (
        // md:hidden hides this entirely on tablets and desktops
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-zinc-800 z-50 flex justify-around items-center h-16 pb-safe">
            {navItems.map((item) => (
                <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                        isActive 
                        ? 'text-white' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    {/* Render the icon component dynamically */}
                    <item.icon size={22} />
                    <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}