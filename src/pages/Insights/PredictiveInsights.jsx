import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CircleCheckBig, X } from "lucide-react";
import { cardVariants, staggerContainer, backdropVariants, modalVariants } from "../../utils/animations";

const PREDICTIVE_DATA = {
  all: {
    struggle:     { count: 3, label: "students", topic: "With upcoming quadratic equations", names: ["Marcus Williams", "Ava Thompson", "Noah Jackson"] },
    advance:      { count: 19, label: "students", desc: "Strong foundations for next concepts" },
    intervention: { rate: "85%", sub: "Based on historical data" },
  },
  class1: {
    struggle:     { count: 1, label: "student",  topic: "With upcoming quadratic equations", names: ["Ava Thompson"] },
    advance:      { count: 10, label: "students", desc: "Strong foundation for next concepts" },
    intervention: { rate: "88%", sub: "Based on historical data" },
  },
  class2: {
    struggle:     { count: 2, label: "students", topic: "With upcoming quadratic equations", names: ["Marcus Williams", "Noah Jackson"] },
    advance:      { count: 9,  label: "students", desc: "Strong foundation for next concepts" },
    intervention: { rate: "82%", sub: "Based on historical data" },
  },
};

const NEXT_CONCEPTS = [
  { title: "Quadratic Equations",   desc: "Strong foundation in linear equations and factoring" },
  { title: "Systems of Equations",  desc: "Excellent grasp of solving single-variable equations" },
  { title: "Polynomial Functions",  desc: "Ready for advanced algebraic manipulation" },
  { title: "Rational Expressions",  desc: "Mastered fractions and algebraic fractions" },
];

const ViewDetailsModal = ({ onClose, advanceData }) => {

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <>
   
      <motion.div
        className="fixed inset-0 z-50 bg-black/50"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      />

      <motion.div
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          bg-white rounded-lg shadow-lg border
          w-full max-w-[calc(100%-2rem)] sm:max-w-md
          max-h-[90vh] flex flex-col p-0"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
 
        <div className="px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-lg font-semibold leading-none mb-1">
            Students Ready to Advance
          </h2>
          <p className="text-sm text-gray-500">
            {advanceData.count} students have demonstrated strong foundation for next concepts
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-2">
          <h4 className="font-medium mb-4">Next Concepts These Students Are Ready For:</h4>
          <div className="space-y-3">
            {NEXT_CONCEPTS.map((concept) => (
              <div
                key={concept.title}
                className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <CircleCheckBig className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <h5 className="font-medium text-green-900">{concept.title}</h5>
                  <p className="text-sm text-green-700">{concept.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </>
  );
};

const PredictiveInsights = ({ selectedClass = "all" }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const data = PREDICTIVE_DATA[selectedClass] ?? PREDICTIVE_DATA.all;

  return (
    <section className="mb-12">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="rounded-xl border border-purple-200 p-6 bg-linear-to-r from-purple-50 to-blue-50 flex flex-col gap-6"
      >
   
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Predictive Insights</h2>
            <p className="text-gray-600 text-sm">AI-powered predictions for next unit</p>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          key={selectedClass}
        >

          <motion.div variants={cardVariants} className="bg-white rounded-lg p-4">
            <h4 className="font-bold mb-2 text-orange-700">Likely to Struggle</h4>
            <motion.div
              key={data.struggle.count}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold text-orange-600 mb-1"
            >
              {data.struggle.count} {data.struggle.label}
            </motion.div>
            <p className="text-sm text-gray-600">{data.struggle.topic}</p>
            <div className="mt-3 space-y-1">
              {data.struggle.names.map((name) => (
                <p key={name} className="text-xs text-gray-500">• {name}</p>
              ))}
            </div>
          </motion.div>

          <motion.div variants={cardVariants} className="bg-white rounded-lg p-4">
            <h4 className="font-bold mb-2 text-green-700">Ready to Advance</h4>
            <motion.div
              key={data.advance.count}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold text-green-600 mb-1"
            >
              {data.advance.count} {data.advance.label}
            </motion.div>
            <p className="text-sm text-gray-600">{data.advance.desc}</p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-3 inline-flex items-center justify-center h-8 px-3 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              View Details
            </button>
          </motion.div>

          <motion.div variants={cardVariants} className="bg-white rounded-lg p-4">
            <h4 className="font-bold mb-2 text-blue-700">Intervention Success</h4>
            <motion.div
              key={data.intervention.rate}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold text-blue-600 mb-1"
            >
              {data.intervention.rate}
            </motion.div>
            <p className="text-sm text-gray-600">Expected improvement rate</p>
            <p className="text-xs text-gray-500 mt-1">{data.intervention.sub}</p>
          </motion.div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {modalOpen && (
          <ViewDetailsModal
            onClose={() => setModalOpen(false)}
            advanceData={data.advance}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default PredictiveInsights;