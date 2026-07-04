import { 
    LuHouse, 
    LuSquarePlay, 
    LuHistory, 
    LuThumbsUp,
    LuListVideo
} from "react-icons/lu";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
    const menuItems = [
        { icon: <LuHouse size={20} />, label: "Home", path: "/"},
        // { icon: <LuTrendingUp size={20} />, label: "Trending", path: "/trending" }, 
        { icon: <LuSquarePlay size={20} />, label: "Subscriptions", path: "/subscriptions" }, 
        { divider: true },
        { icon: <LuHistory size={20} />, label: "History", path: "/watch-history" }, 
        { icon: <LuThumbsUp size={20} />, label: "Liked Videos", path: "/liked-videos" },
        { icon: <LuListVideo size={20} />, label: "Playlists", path: "/playlists" },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto bg-black p-3 gap-1">
            {menuItems.map((item, index) => (
                item.divider ? (
                    <hr key={index} className="my-2 border-zinc-800" />
                ) : (
                    /* 👇 Changed button to NavLink */
                    <NavLink
                        key={item.label}
                        to={item.path || "#"}
                        className={({ isActive }) => `flex items-center gap-4 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                            isActive 
                            ? 'bg-zinc-800 text-white' 
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                        }`}
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                )
            ))}
        </aside>
    );
}