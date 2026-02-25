import { useState, useRef, useEffect } from "react";
import { Funnel, Calendar, Download, CircleCheckBig } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sectionVariants, dropdownVariants } from "../../utils/animations";

const CLASS_OPTIONS = [
  { label: "All Classes", value: "all" },
  { label: "Class 1", value: "class1" },
  { label: "Class 2", value: "class2" },
];

const InsightsHero = ({ period, onPeriodChange, selectedClass, onClassChange }) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedClassObj = CLASS_OPTIONS.find((c) => c.value === selectedClass);
  const isFiltered = selectedClass !== "all";

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="mb-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Data That Drives Teaching
          </h1>
          <p className="text-gray-600 mt-1">Actionable insights to improve student outcomes</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium h-9 rounded-md gap-1.5 px-3 border border-gray-200 bg-white hover:bg-gray-100 transition-all min-h-[44px]"
            >
              <Funnel className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Filter</span>
              {isFiltered && (
                <span className="ml-1 inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 border-transparent">
                  {selectedClassObj?.label}
                </span>
              )}
            </button>

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-md z-50 py-1 overflow-hidden"
                >
                  <div className="px-2 py-1.5 text-sm font-medium text-gray-700">
                    Filter by Class
                  </div>
                  <div className="border-t border-gray-100 my-1 mx-1" />
                  {CLASS_OPTIONS.map((cls) => {
                    const isSelected = selectedClass === cls.value;
                    return (
                      <button
                        key={cls.value}
                        onClick={() => {
                          onClassChange(cls.value);
                          setFilterOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <CircleCheckBig
                          className={`w-4 h-4 mr-2 shrink-0 ${isSelected ? "text-blue-600" : "text-transparent"
                            }`}
                        />
                        {cls.label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md p-1 min-h-[44px]">
            {["Week", "Month"].map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium h-8 rounded-md gap-1.5 px-3 transition-all ${period === p
                    ? "bg-blue-600 text-white shadow-md"
                    : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                <Calendar className="w-4 h-4 mr-1" />
                {p}
              </button>
            ))}
          </div>

          <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium h-9 px-4 py-2 rounded-md gap-1.5 bg-linear-to-r from-blue-600 to-green-600 text-white shadow-md hover:opacity-90 transition-all min-h-[44px]">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="flex flex-wrap gap-2 mt-3"
      >
        <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 border-transparent">
          Showing:{" "}
          {selectedClass === "all"
            ? "All Classes"
            : selectedClass === "class1"
              ? "Class 1 (Grade 9)"
              : "Class 2 (Grade 10)"}
        </span>
        <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 border-transparent">
          Period: This {period}
        </span>
      </motion.div>
    </motion.div>
  );
};

export default InsightsHero;