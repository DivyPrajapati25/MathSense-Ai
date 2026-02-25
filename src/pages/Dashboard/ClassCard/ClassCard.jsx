import { useState, useRef, useEffect } from "react";
import { GraduationCap, Users, MoreVertical, Pen } from "lucide-react";

const DropdownMenu = ({ onClose }) => (
  <div className="absolute right-0 top-8 z-50 min-w-[160px] bg-white rounded-md border border-gray-100 shadow-md p-1">
    <button
      onClick={onClose}
      className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 rounded-sm hover:bg-gray-100 cursor-pointer select-none outline-none"
    >
      <Pen className="w-4 h-4 mr-2" />
      Rename Class
    </button>
    <button
      onClick={onClose}
      className="flex items-center w-full px-2 py-1.5 text-sm text-gray-700 rounded-sm hover:bg-gray-100 cursor-pointer select-none outline-none"
    >
      <GraduationCap className="w-4 h-4 mr-2" />
      Edit Grade Level
    </button>
  </div>
);

const ClassCard = ({ name, grade, studentCount, color = "blue" }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const colorMap = {
    blue: {
      border: "border-blue-200",
      bg: "bg-blue-50/50",
      iconBg: "bg-blue-100",
      icon: "text-blue-600",
    },
    green: {
      border: "border-green-200",
      bg: "bg-green-50/50",
      iconBg: "bg-green-100",
      icon: "text-green-600",
    },
  };

  const c = colorMap[color];

  return (
    <div className={`flex flex-col gap-6 rounded-xl p-6 border-2 ${c.border} ${c.bg}`}>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${c.iconBg}`}>
            <GraduationCap className={`w-6 h-6 ${c.icon}`} />
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-900">{name}</h3>
            <p className="text-gray-600 text-sm">{grade}</p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="
              inline-flex items-center justify-center h-8 w-8 p-0
              rounded-md text-gray-500
              hover:bg-gray-100 hover:text-gray-700
              transition-colors duration-150
              outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            "
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && <DropdownMenu onClose={() => setMenuOpen(false)} />}
        </div>
      </div>

      <div className="flex items-center text-gray-600 text-sm">
        <Users className="w-4 h-4 mr-2" />
        <span>{studentCount} students</span>
      </div>
    </div>
  );
};

export default ClassCard;