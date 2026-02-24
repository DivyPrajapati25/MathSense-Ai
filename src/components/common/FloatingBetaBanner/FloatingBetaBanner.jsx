import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { floatingBannerVariants } from "../../../utils/animations";

const NAVBAR_HEIGHT = 64;

const FloatingBetaBanner = () => {
  const [visible, setVisible] = useState(true);
  const constraintRef = useRef(null);

  return (
    <AnimatePresence>
      {visible && (
        <div
          ref={constraintRef}
          className="fixed inset-0 z-40 pointer-events-none"
          style={{ top: NAVBAR_HEIGHT }}
        >
          <motion.div
            className="absolute bottom-4 right-4 md:bottom-6 md:right-6 pointer-events-auto"

            variants={floatingBannerVariants}
            initial="hidden"
            animate="visible"    

            drag
            dragConstraints={constraintRef}
            dragMomentum={true}
            dragElastic={0}
            dragTransition={{
              power: 0.3,
              timeConstant: 250,
              bounceStiffness: 200,
              bounceDamping: 30,
              restDelta: 0.5,
              restSpeed: 2,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 40,
            }}

            whileDrag={{
              scale: 1.06,
              rotate: 0,      // no tilt while dragging
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
              cursor: "grabbing",
            }}

            style={{
              cursor: "grab",
              rotate: 0,      // no tilt at rest
            }}
          >
            <div className="
              flex flex-col gap-6 rounded-xl p-3 md:p-4
              bg-linear-to-r from-orange-500 to-red-500
              text-white shadow-xl hover:shadow-2xl
              transition-shadow border-0
              max-w-[280px] sm:max-w-sm
              relative select-none
            ">
              <button
                onClick={() => setVisible(false)}
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm md:text-base">
                    Join 1,247 teachers in beta!
                  </p>
                  <p className="text-xs md:text-sm opacity-90 truncate">
                    Early access pricing available
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FloatingBetaBanner;