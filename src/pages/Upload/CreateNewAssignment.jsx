import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FileText, Upload, X } from "lucide-react";
import { backdropVariants, modalVariants } from "../../utils/animations";

const UNITS = [
  { id: "unit-1", title: "Unit 1: Algebra Fundamentals",  desc: "Linear equations, expressions, and basic algebraic concepts"   },
  { id: "unit-2", title: "Unit 2: Geometry Basics",       desc: "Angles, shapes, area, perimeter, and geometric properties"     },
  { id: "unit-3", title: "Unit 3: Trigonometry Intro",    desc: "Sine, cosine, tangent, and right triangle relationships"       },
];

const CreateAssignmentModal = ({ onClose }) => {
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [checkedUnits, setCheckedUnits] = useState({});
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [markSchemeFile, setMarkSchemeFile] = useState(null);
  const assignmentRef = useRef(null);
  const markSchemeRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const toggleUnit = (id) =>
    setCheckedUnits((prev) => ({ ...prev, [id]: !prev[id] }));

  const canSubmit = name.trim() && assignmentFile;

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 bg-black/50"
        variants={backdropVariants}
        initial="hidden" animate="visible" exit="exit"
        onClick={onClose}
      />

      <motion.div
        className="
          fixed z-50 top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]
          bg-white rounded-lg border border-gray-200 shadow-lg
          w-full max-w-[calc(100%-2rem)] sm:max-w-lg
          max-h-[90vh] flex flex-col
          p-0
        "
        variants={modalVariants}
        initial="hidden" animate="visible" exit="exit"
      >
        <div className="px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-lg leading-none font-semibold mb-1">Create New Assignment</h2>
          <p className="text-sm text-gray-500">
            Create a new assignment template with mark schemes and link it to your units
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="space-y-4 py-4 pr-4">

            <div>
              <label htmlFor="newAssignmentName" className="flex items-center gap-2 text-sm font-medium leading-none mb-1 select-none">
                Assignment Name <span className="text-red-500">*</span>
              </label>
              <input
                id="newAssignmentName"
                type="text"
                placeholder="e.g., Algebra Practice 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors mt-1"
              />
            </div>

            <div>
              <label htmlFor="newAssignmentDescription" className="flex items-center gap-2 text-sm font-medium leading-none mb-1 select-none">
                Assignment Description
              </label>
              <textarea
                id="newAssignmentDescription"
                placeholder="Brief summary of what the assignment covers..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors mt-1 min-h-16"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium leading-none mb-2 select-none">
                Units Covered
              </label>
              <div className="space-y-2">
                {UNITS.map((unit) => (
                  <label
                    key={unit.id}
                    htmlFor={unit.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={unit.id}
                      checked={!!checkedUnits[unit.id]}
                      onChange={() => toggleUnit(unit.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{unit.title}</div>
                      <div className="text-sm text-gray-600">{unit.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium leading-none mb-1 select-none">
                Upload Assignment File <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => assignmentRef.current?.click()}
                className="
                  w-full mt-1 border-dashed border-2 border-gray-200 rounded-md
                  h-20 flex items-center justify-center gap-2
                  text-sm text-gray-500
                  hover:bg-gray-50 hover:border-gray-300
                  transition-colors
                "
              >
                <Upload className="w-5 h-5 mr-2 text-gray-400" />
                {assignmentFile ? assignmentFile.name : "Click to upload assignment file (PDF, Word)"}
              </button>
              <input
                ref={assignmentRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                onChange={(e) => setAssignmentFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium leading-none mb-1 select-none">
                Upload Mark Scheme <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => markSchemeRef.current?.click()}
                className="
                  w-full mt-1 border-dashed border-2 border-gray-200 rounded-md
                  h-20 flex items-center justify-center gap-2
                  text-sm text-gray-500
                  hover:bg-gray-50 hover:border-gray-300
                  transition-colors
                "
              >
                <Upload className="w-5 h-5 mr-2 text-gray-400" />
                {markSchemeFile ? markSchemeFile.name : "Click to upload mark scheme (PDF, Word)"}
              </button>
              <input
                ref={markSchemeRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                onChange={(e) => setMarkSchemeFile(e.target.files?.[0] ?? null)}
              />
            </div>

          </div>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-gray-200 bg-white shrink-0">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!canSubmit}
              className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium text-white bg-linear-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              Create Assignment
            </button>
          </div>
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

const CreateNewAssignment = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="mb-12 md:mb-16">
      <div className="
        rounded-xl border border-blue-200 p-6 md:p-8
        bg-linear-to-br from-blue-50 to-purple-50
        flex flex-col gap-6
      ">
        {/* Top: icon + text */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Create a New Assignment</h2>
            <p className="text-gray-600">
              Set up a new assignment template with mark schemes and link it to your teaching units
            </p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="
            w-full inline-flex items-center justify-center gap-2
            h-[44px] px-4 py-2 rounded-md
            text-sm font-medium text-white
            bg-linear-to-r from-blue-600 to-purple-600
            hover:from-blue-700 hover:to-purple-700
            transition-all min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          "
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Assignment
        </button>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <CreateAssignmentModal onClose={() => setModalOpen(false)} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default CreateNewAssignment;