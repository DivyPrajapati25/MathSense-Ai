import { useState } from "react";
import { motion } from "framer-motion";
import { Palette, Settings, Heart, Target, Gamepad2, Star } from "lucide-react";
import { cardVariants, staggerContainer } from "../../utils/animations";

const STYLES = [
  {
    id: "encouraging",
    label: "Encouraging",
    sublabel: "colorful",
    gradient: "from-green-400 to-blue-500",
    Icon: Heart,
    desc: "Motivational tone with emphasis on progress",
    quote: "Great effort on this assignment! You're showing real improvement in algebraic thinking.",
  },
  {
    id: "detailed",
    label: "Detailed Analysis",
    sublabel: "professional",
    gradient: "from-blue-500 to-purple-600",
    Icon: Target,
    desc: "Comprehensive breakdown of strengths and areas for improvement",
    quote: "Strong grasp of basic concepts. Focus on accuracy in multi-step problems.",
  },
  {
    id: "gamified",
    label: "Gamified",
    sublabel: "fun",
    gradient: "from-orange-400 to-red-500",
    Icon: Gamepad2,
    desc: "Achievement-based feedback with badges and levels",
    quote: "🏆 Achievement Unlocked: Algebra Explorer! You've mastered 85% of this unit.",
  },
  {
    id: "growth",
    label: "Growth Focused",
    sublabel: "developmental",
    gradient: "from-purple-400 to-pink-500",
    Icon: Star,
    desc: "Emphasizes learning journey and next steps",
    quote: "Your problem-solving approach is developing well. Next challenge: word problems!",
  },
];

const FeedbackStyles = ({ onStyleChange }) => {
  const [selected, setSelected] = useState("growth");

  const handleSelect = (id) => {
    setSelected(id);
    onStyleChange?.(id);
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-6 sticky top-8"
    >
      <h3 className="text-xl font-bold flex items-center">
        <Palette className="w-5 h-5 mr-2 text-blue-600" />
        Feedback Styles
      </h3>

      <motion.div
        className="space-y-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {STYLES.map((style) => {
          const isActive = selected === style.id;
          const Icon = style.Icon;
          return (
            <motion.div
              key={style.id}
              variants={cardVariants}
              onClick={() => handleSelect(style.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${isActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
            >

              <div className="flex items-center space-x-3 mb-2 ">
                <div
                  className={`w-8 h-8  rounded-lg bg-linear-to-r ${style.gradient} flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-sm  leading-tight">{style.label}</h4>
                  <p className="text-xs text-gray-500">{style.sublabel}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3">{style.desc}</p>

              <div className="bg-white p-3 rounded border border-gray-200 text-sm italic text-gray-900">
                "{style.quote}"
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <button className="inline-flex items-center justify-center gap-2 w-full h-9 px-4 rounded-md text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-colors mt-2">
        <Settings className="w-4 h-4 mr-1" />
        Customize Template
      </button>
    </motion.div>
  );
};

export default FeedbackStyles;