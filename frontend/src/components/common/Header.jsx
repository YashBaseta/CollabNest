import { LogOut, Search, Settings, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"; // adjust the path based on your folder structure

function Header(params) {
   const [isDropdownOpen, setIsDropdownOpen] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate()
  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  
  navigate("/");
};
  const [user, setUser] = useState(null);

useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const res = await api.get(`/users/${userId}`);
        const fetchedUser = Array.isArray(res.data)
          ? res.data.find((u) => u._id === userId)
          : res.data;

        if (!fetchedUser) return;

        setUser(fetchedUser);
       
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);


   return (<>
    <nav className="flex items-center justify-between px-6 py-4 bg-gray-100 shadow relative">
      {/* Left Side */}
      
      <h1 style={{fontSize:"25px" }}>Welcome to CollabNest <span className="text-blue-900" style={{fontWeight:"bold" }}>{user?.name}</span></h1>

      {/* Right Side */}
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
        </div>

        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full bg-purple-900 text-white flex items-center justify-center cursor-pointer relative"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <User className="h-5 w-5" />
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-14 w-44 bg-white border border-gray-200 rounded-lg shadow-md z-10">
            <ul className="text-sm text-gray-700">
              <li className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                <User className="w-4 h-4" />
                Profile
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
                <Settings className="w-4 h-4" />

                Settings
              </li>
              <li onClick={logout} className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer border-t border-gray-200">
                <LogOut  className="w-4 h-4" />
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
   
   </>
   )
}
export default Header;