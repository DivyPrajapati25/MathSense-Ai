import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Upload, CircleCheckBig, BarChart2,
  MessageSquare, Menu, X,
} from "lucide-react";
import Logo from "./Logo";

const NAV_ITEMS = [
  { label: "Dashboard", icon: Brain,         id: "dashboard", path: "/"         },
  { label: "Upload",    icon: Upload,         id: "upload",    path: "/upload"   },
  { label: "Grading",  icon: CircleCheckBig, id: "grading",   path: "/grading"  },
  { label: "Insights", icon: BarChart2,      id: "insights",  path: "/insights" },
  { label: "Feedback", icon: MessageSquare,  id: "feedback",  path: "/feedback" },
];

const NavItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onClick(item)}
      className={`
        relative inline-flex items-center justify-center whitespace-nowrap
        text-sm font-medium h-8 rounded-md gap-1.5 px-4 py-2
        outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        transition-colors duration-150 cursor-pointer
        ${isActive ? "text-white hover:bg-black" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"}
      `}
    >
      {isActive && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-md bg-blue-600 shadow-md"
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 32,
            mass: 0.9,
          }}
          style={{ zIndex: -1 }}
        />
      )}

      <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
      {item.label}
    </button>
  );
};

const JoinBetaButton = ({ full = false }) => (
  <button
    className={`
      inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md
      text-sm font-medium transition-all duration-200 outline-none
      h-9 px-4 py-2
      bg-linear-to-r from-orange-500 to-red-500
      hover:from-orange-600 hover:to-red-600
      text-white shadow-lg cursor-pointer
      ${full ? "w-full" : ""}
    `}
  >
    Join Beta
  </button>
);

const mobileMenuVariants = {
  hidden:  { height: 0, opacity: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
  visible: { height: "auto", opacity: 1, transition: { duration: 0.3,  ease: [0.4, 0, 0.2, 1] } },
};

const mobileItemVariants = {
  hidden:  { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

const mobileContainerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const MobileMenu = ({ activePath, onItemClick, onClose }) => (
  <motion.div
    className="lg:hidden overflow-hidden border-t border-blue-100 bg-white"
    variants={mobileMenuVariants}
    initial="hidden"
    animate="visible"
    exit="hidden"
  >
    <motion.div
      className="px-4 pt-3 pb-4 space-y-1"
      variants={mobileContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activePath === item.path;
        return (
          <motion.button
            key={item.id}
            variants={mobileItemVariants}
            onClick={() => { onItemClick(item); onClose(); }}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-md
              text-sm font-medium transition-colors duration-150 min-h-[44px]
              ${isActive
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              }
            `}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {item.label}
          </motion.button>
        );
      })}
      <motion.div variants={mobileItemVariants} className="pt-2">
        <JoinBetaButton full />
      </motion.div>
    </motion.div>
  </motion.div>
);

const Navbar = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activePath = location.pathname;

  const handleNavClick = (item) => {
    navigate(item.path);
  };

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-blue-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div onClick={() => navigate("/")} className="cursor-pointer">
            <Logo />
          </div>

          <nav className="hidden lg:flex items-center space-x-1">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activePath === item.path}
                onClick={handleNavClick}
              />
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex">
              <JoinBetaButton />
            </div>

            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="lg:hidden inline-flex items-center justify-center h-[44px] min-w-[44px] rounded-md text-gray-600 hover:bg-gray-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{    rotate: 90,  opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90,  opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{    rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <MobileMenu
            activePath={activePath}
            onItemClick={handleNavClick}
            onClose={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;