import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ChevronDown } from "lucide-react";
import ClassCard from "../ClassCard/ClassCard";
import { backdropVariants, modalVariants, dropdownVariants } from "../../../utils/animations";
import api from "../../../services/api"; 

const GRADE_OPTIONS = [
    "Grade 6", "Grade 7", "Grade 8",
    "Grade 9", "Grade 10", "Grade 11", "Grade 12",
];

const CreateClassModal = ({ onClose, onCreate }) => {
    const [className, setClassName] = useState("");
    const [grade, setGrade] = useState("");
    const [dropOpen, setDropOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", onKey);
        };
    }, [onClose]);

    const handleCreate = () => {
        if (!className.trim() || !grade) return;
        onCreate({ name: className.trim(), grade });
        onClose();
    };

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
                    p-6 gap-4
                "
                variants={modalVariants}
                initial="hidden" animate="visible" exit="exit"
            >
                <div className="flex flex-col gap-2 text-center sm:text-left mb-4">
                    <h2 className="text-lg leading-none font-semibold">Create New Class</h2>
                    <p className="text-sm text-gray-500">
                        Add a new class to organize your students and assignments
                    </p>
                </div>

                <div className="space-y-4 py-4">
                    <div>
                        <label htmlFor="className" className="flex items-center gap-2 text-sm font-medium leading-none mb-1 select-none">
                            Class Name
                        </label>
                        <input
                            id="className" type="text" placeholder="e.g., Class 3"
                            value={className} onChange={(e) => setClassName(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium leading-none mb-1 select-none">
                            Grade Level
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setDropOpen((p) => !p)}
                                className="flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                            >
                                <span className={grade ? "text-gray-900" : "text-gray-400"}>
                                    {grade || "Select grade level"}
                                </span>
                                <motion.span
                                    animate={{ rotate: dropOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown className="w-4 h-4 opacity-50" />
                                </motion.span>
                            </button>

                            <AnimatePresence>
                                {dropOpen && (
                                    <motion.div
                                        className="absolute z-50 top-10 left-0 w-full bg-white border border-gray-100 rounded-md shadow-md overflow-hidden"
                                        variants={dropdownVariants}
                                        initial="hidden" animate="visible" exit="exit"
                                    >
                                        {GRADE_OPTIONS.map((g) => (
                                            <button
                                                key={g} type="button"
                                                onClick={() => { setGrade(g); setDropOpen(false); }}
                                                className={`flex w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors ${grade === g ? "bg-gray-50 font-medium" : ""}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-2">
                    <button onClick={onClose} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors h-9 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                        Cancel
                    </button>
                    <button onClick={handleCreate} disabled={!className.trim() || !grade}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors h-9 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none">
                        Create Class
                    </button>
                </div>

                <button onClick={onClose} className="absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none" aria-label="Close">
                    <X className="w-4 h-4" />
                </button>
            </motion.div>
        </>
    );
};

const ClassManagement = () => {
    const [classes, setClasses] = useState([]); 
    const [modalOpen, setModalOpen] = useState(false);
    const COLORS = ["blue", "green", "blue", "green"];

    // useEffect(() => {
    //     api.get("/teacher/dashboard").then((res) => {
    //         const standards = res.data?.data?.standards ?? [];
    //         setClasses(standards.map((s, i) => ({
    //             id: s.standard_id,
    //             name: `Class ${s.standard}`,
    //             grade: `Grade ${s.standard}`,
    //             studentCount: s.total_students,
    //             color: COLORS[i % COLORS.length],
    //         })));
    //     }).catch(() => setClasses([]));
    // }, []);

    const handleCreate = ({ name, grade }) => {
        setClasses((prev) => [
            ...prev,
            { id: Date.now(), name, grade, studentCount:  0, color: COLORS[prev.length % COLORS.length] },
        ]);
    };

    return (
        <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Class Management</h2>
                <button onClick={() => setModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 outline-none h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />Create New Class
                </button>
            </div>
            {classes.length === 0 ? (
                <div className="flex items-center justify-center h-32 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm">No classes found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {classes.map((cls) => (
                        <ClassCard key={cls.id} name={cls.name} grade={cls.grade} studentCount={cls.studentCount} color={cls.color} />
                    ))}
                </div>
            )}

            <AnimatePresence>
                {modalOpen && (
                    <CreateClassModal onClose={() => setModalOpen(false)} onCreate={handleCreate} />
                )}
            </AnimatePresence>
        </section>
    );
};

export default ClassManagement;