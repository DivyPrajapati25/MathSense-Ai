import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, ChevronDown, Minus, Plus } from "lucide-react";
import { dropdownVariants } from "../../utils/animations";

const PERIODS = ["week", "month", "year"];

const InsightsHero = ({ standards = [], selectedStandard, onStandardChange, period, onPeriodChange, periodValue, onPeriodValueChange }) => {
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
            <p className="text-sm text-gray-500">
              {selectedStandard
                ? `Showing data for Class ${selectedStandard.standard}`
                : "Select a class to view insights"}
            </p>
          </div>
        </div>

        {/* Class dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropOpen((p) => !p)}
            className="flex h-9 items-center justify-between gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors min-w-[160px]"
          >
            <span className={selectedStandard ? "text-gray-900" : "text-gray-400"}>
              {selectedStandard ? `Class ${selectedStandard.standard}` : "Select class..."}
            </span>
            <motion.span animate={{ rotate: dropOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </motion.span>
          </button>

          <AnimatePresence>
            {dropOpen && (
              <motion.div
                className="absolute z-50 top-10 right-0 w-full bg-white border border-gray-100 rounded-md shadow-md overflow-hidden"
                variants={dropdownVariants}
                initial="hidden" animate="visible" exit="exit"
              >
                {standards.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-400">No classes found</div>
                ) : (
                  standards.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { onStandardChange(s); setDropOpen(false); }}
                      className={`flex w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors ${selectedStandard?.id === s.id ? "bg-gray-50 font-medium" : ""}`}
                    >
                      Class {s.standard}
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Period filter + value */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-500 mr-1">Period:</span>
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => { onPeriodChange(p); onPeriodValueChange(1); }}
            className={`h-8 px-3 rounded-md text-sm font-medium capitalize transition-all ${
              period === p
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}

        {/* Value stepper */}
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg bg-gray-50 h-8 px-1.5 ml-1">
          <button
            onClick={() => onPeriodValueChange(Math.max(1, periodValue - 1))}
            disabled={periodValue <= 1}
            className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-sm font-semibold text-gray-700 min-w-[48px] text-center">
            Last {periodValue}
          </span>
          <button
            onClick={() => onPeriodValueChange(periodValue + 1)}
            className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightsHero;