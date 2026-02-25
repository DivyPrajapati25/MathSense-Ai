import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, MessageSquare, Award, Mail } from "lucide-react";
import { cardVariants } from "../../utils/animations";

const FeedbackPreview = () => {
  const [tab, setTab] = useState("student");

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <h3 className="text-xl font-bold">Feedback Preview</h3>
        <div className="bg-gray-100 rounded-xl p-1 grid grid-cols-2 gap-1 text-sm w-full sm:w-auto">
          {["student", "parent"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap
                ${tab === t ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              {t === "student" ? "Student View" : "Parent View"}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === "student" ? (
          <motion.div
            key="student"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-linear-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                  EJ
                </div>
                <div>
                  <h4 className="font-bold text-lg">Hey Emma! 👋</h4>
                  <p className="text-gray-600 text-sm">Your Algebra Quiz results are here</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-green-600">92/100</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                    <Award className="w-3 h-3 mr-1" /> Excellent!
                  </span>
                </div>
                <p className="text-gray-700 text-sm">Your problem-solving approach is developing well. Next challenge: word problems!</p>
              </div>

              <div className="mb-4">
                <h5 className="font-medium mb-2 text-sm">🏆 Achievements Unlocked:</h5>
                <div className="flex space-x-2">
                  <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">Equation Master</span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-800">Perfect Process</span>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="font-medium mb-2 text-sm">🎯 Next Challenges:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Quadratic equations</li>
                  <li>• Complex word problems</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <h5 className="font-medium mb-3 flex items-center text-sm">
                  <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                  📚 Recommended Practice:
                </h5>
                <div className="space-y-3 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h6 className="text-sm font-medium text-blue-900 mb-1">From Your Class Materials:</h6>
                    <ul className="text-xs text-blue-800 space-y-0.5">
                      <li>• Unit 2, Worksheet 3: Quadratic Foundations</li>
                      <li>• Unit 2, Practice Set: Word Problem Strategies</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <h6 className="text-sm font-medium text-green-900 mb-1">Online Practice:</h6>
                    <ul className="text-xs text-green-800 space-y-0.5">
                      <li>• Khan Academy: Quadratic Equations Basics</li>
                      <li>• IXL: Advanced Problem Solving</li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-gray-600 italic">
                  💡 Next Steps: These resources will help you prepare for your next challenges in quadratic equations and complex word problems.
                </p>
              </div>

              <button className="mt-4 w-full inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-white bg-linear-to-r from-blue-500 to-green-500 hover:opacity-90 transition-opacity">
                <MessageSquare className="w-4 h-4" />
                Ask a Question
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="parent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-linear-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">

              <h4 className="font-bold text-lg mb-4">Emma's Progress Report</h4>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-medium mb-2 text-sm text-gray-700">Assignment Score</h5>
                  <div className="text-3xl font-bold text-green-600 mb-1">92%</div>
                  <p className="text-sm text-gray-600">Above class average (85%)</p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-medium mb-2 text-sm text-gray-700">Overall Progress</h5>
                  <div className="text-3xl font-bold text-blue-600 mb-1">A-</div>
                  <p className="text-sm text-gray-600">Consistent improvement</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <h5 className="font-medium mb-2 text-sm text-gray-700">Teacher Notes</h5>
                <p className="text-gray-700 text-sm mb-3">
                  Emma continues to excel in algebra. Her systematic approach to problem-solving is
                  impressive. She's ready for more challenging concepts.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">Strengths:</p>
                    <ul className="text-sm text-gray-600">
                      <li>• Logical problem-solving</li>
                      <li>• Clear work organization</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-700 mb-1">Next Steps:</p>
                    <ul className="text-sm text-gray-600">
                      <li>• Quadratic equations</li>
                      <li>• Advanced applications</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-gray-700">
                <Mail className="w-4 h-4" />
                Schedule Parent Conference
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FeedbackPreview;