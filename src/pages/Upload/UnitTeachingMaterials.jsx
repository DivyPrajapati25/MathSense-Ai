import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, FileText, Plus, Trash2, Upload, X,
  CheckCircle, Lightbulb, Film, Link,
} from "lucide-react";
import { backdropVariants, modalVariants } from "../../utils/animations";

const INITIAL_UNITS = [
  {
    id: 1,
    title: "Unit 1: Algebra Fundamentals",
    desc: "Linear equations, expressions, and basic algebraic concepts",
    resources: [
      { id: 1, name: "Chapter 1 Textbook",  type: "PDF",  color: "red"    },
      { id: 2, name: "Practice Worksheets", type: "DOCX", color: "blue"   },
      { id: 3, name: "Video Tutorials",     type: "MP4",  color: "purple" },
    ],
  },
  {
    id: 2,
    title: "Unit 2: Geometry Basics",
    desc: "Angles, shapes, area, perimeter, and geometric properties",
    resources: [
      { id: 4, name: "Geometry Guide",       type: "PDF",  color: "red"   },
      { id: 5, name: "Interactive Diagrams", type: "PNG",  color: "green" },
      { id: 6, name: "Problem Sets",         type: "DOCX", color: "blue"  },
    ],
  },
  {
    id: 3,
    title: "Unit 3: Trigonometry Intro",
    desc: "Sine, cosine, tangent, and right triangle relationships",
    resources: [
      { id: 7, name: "Trig Reference Sheet", type: "PDF",  color: "red"   },
      { id: 8, name: "Practice Problems",    type: "DOCX", color: "blue"  },
      { id: 9, name: "Calculator Guide",     type: "PPT",  color: "green" },
    ],
  },
];

const extColorMap = {
  PDF: "red", DOCX: "blue", DOC: "blue",
  PPT: "green", PPTX: "green",
  MP4: "purple", MOV: "purple", AVI: "purple",
  PNG: "green", JPG: "green", JPEG: "green",
  CSV: "blue", URL: "blue",
};

const colorStyles = {
  red:    { bg: "bg-red-100",    icon: "text-red-600"    },
  blue:   { bg: "bg-blue-100",   icon: "text-blue-600"   },
  purple: { bg: "bg-purple-100", icon: "text-purple-600" },
  green:  { bg: "bg-green-100",  icon: "text-green-600"  },
};

const FileBadge = ({ type, color, size = "md" }) => {
  const styles = colorStyles[color] || colorStyles.blue;
  const isVideo = ["MP4", "MOV", "AVI"].includes(type);
  const isLink  = type === "URL";
  const IconComp = isVideo ? Film : isLink ? Link : FileText;
  const dim      = size === "sm" ? "w-6 h-6" : "w-8 h-8";
  const iconSize = size === "sm" ? 12 : 15;
  return (
    <div className={`${dim} rounded-lg ${styles.bg} flex items-center justify-center shrink-0`}>
      <IconComp size={iconSize} className={styles.icon} />
    </div>
  );
};

const useScrollLock = () => {
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflowY = "scroll";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, []);
};

const AddMaterialsModal = ({ unit, onClose, onSave }) => {
  const [resources, setResources] = useState([...unit.resources]);
  const [linkInput, setLinkInput] = useState("");
  const [dragOver,  setDragOver]  = useState(false);
  const fileRef = useRef(null);

  useScrollLock();

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleFiles = (files) => {
    const newRes = Array.from(files).map((f, i) => {
      const ext = f.name.split(".").pop().toUpperCase();
      return { id: Date.now() + i, name: f.name.replace(/\.[^/.]+$/, ""), type: ext, color: extColorMap[ext] || "blue" };
    });
    setResources((r) => [...r, ...newRes]);
  };

  const handleAddLink = () => {
    if (!linkInput.trim()) return;
    setResources((r) => [...r, { id: Date.now(), name: linkInput.trim(), type: "URL", color: "blue" }]);
    setLinkInput("");
  };

  const handleDelete = (id) => setResources((r) => r.filter((x) => x.id !== id));
  const handleSave   = () => { onSave(unit.id, resources); onClose(); };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      variants={backdropVariants}
      initial="hidden" animate="visible" exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden"
        style={{ maxHeight: "90vh" }}
        variants={modalVariants}
        initial="hidden" animate="visible" exit="hidden"
        onClick={(e) => e.stopPropagation()}
      >
     
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🗂️</span>
              <h2 className="text-base font-semibold text-gray-900 leading-tight">
                Add Teaching Materials
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-colors shrink-0 ml-2"
            >
              <X size={16} />
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            Attach resources, notes, or guides to this unit to enhance AI grading and learning recommendations.
          </p>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight">{unit.title}</h3>
                <p className="text-sm text-gray-600 mt-0.5 leading-snug">{unit.desc}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Upload or Link Materials</h4>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl py-8 px-4
                flex flex-col items-center justify-center cursor-pointer
                transition-all duration-150
                ${dragOver ? "border-purple-400 bg-purple-50" : "border-blue-300 bg-blue-50 hover:border-blue-400"}
              `}
            >
              <Upload size={24} className="text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-600">Click to browse files</span>
              <span className="text-xs text-gray-500 mt-1">or drag and drop</span>
            </div>
            <input
              ref={fileRef} type="file" multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov,image/*,.csv"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <p className="text-xs text-gray-500 mt-2">Supported formats: PDF, DOCX, PPT, MP4, PNG, CSV</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 block">Paste Resource Link</label>
            <div className="flex gap-2">
              <input
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
                placeholder="https://example.com/resource"
                className="flex-1 h-9 border border-gray-200 rounded-lg px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-gray-50 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
              />
              <button
                onClick={handleAddLink}
                className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-blue-300 bg-white text-blue-600 text-sm font-medium whitespace-nowrap hover:bg-blue-50 transition-colors"
              >
                <Plus size={13} /> Add Link
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Current Resources in This Unit</h4>
            <div className="space-y-2">
              {resources.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">No resources yet.</p>
              )}
              <AnimatePresence>
                {resources.map((r) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center justify-between px-3 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileBadge type={r.type} color={r.color} size="md" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.type}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors shrink-0 ml-2"
                    >
                      <Trash2 size={15} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
            <Lightbulb size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900 leading-relaxed">
              <strong>AI Enhancement:</strong> Uploading teaching materials helps AI align grading, feedback, and lesson suggestions with your curriculum.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="h-9 px-5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-purple-200"
          >
            <CheckCircle size={16} />
            Save &amp; Attach Materials
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CreateNewUnitModal = ({ onClose, onSave }) => {
  const [unitName,      setUnitName]      = useState("");
  const [description,   setDescription]   = useState("");
  const [links,         setLinks]         = useState([""]);
  const [tagInput,      setTagInput]      = useState("");
  const [tags,          setTags]          = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileRef = useRef(null);

  useScrollLock();

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleFiles     = (files) => setUploadedFiles((p) => [...p, ...Array.from(files).map((f) => f.name)]);
  const handleAddLink   = () => setLinks((l) => [...l, ""]);
  const handleLinkChange= (i, v) => setLinks((l) => l.map((x, idx) => idx === i ? v : x));
  const handleAddTag    = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((p) => [...p, t]);
    setTagInput("");
  };
  const handleSave = () => {
    if (!unitName.trim()) return;
    onSave({
      id: Date.now(),
      title: unitName.trim(),
      desc: description.trim() || "No description provided",
      resources: uploadedFiles.map((f, i) => ({
        id: Date.now() + i, name: f.replace(/\.[^/.]+$/, ""),
        type: f.split(".").pop().toUpperCase(),
        color: extColorMap[f.split(".").pop().toUpperCase()] || "blue",
      })),
    });
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden"
        style={{ maxHeight: "90vh" }}
        variants={modalVariants} initial="hidden" animate="visible" exit="hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-900">Add New Unit of Work</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-colors shrink-0 ml-2"><X size={16} /></button>
          </div>
          <p className="text-sm text-gray-500">Create a new unit and upload teaching materials, resources, and mark schemes</p>
        </div>
        <div className="overflow-y-auto flex-1 px-6 pb-4 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Unit Name <span className="text-red-500">*</span></label>
            <input value={unitName} onChange={(e) => setUnitName(e.target.value)} placeholder="e.g., Unit 4: Fractions and Decimals"
              className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm placeholder:text-gray-400 outline-none bg-gray-50 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Description <span className="text-red-500">*</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this unit covers..." rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 outline-none bg-gray-50 resize-none focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Upload Resources</label>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full inline-flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg h-14 text-sm font-medium text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all">
              <Upload size={18} className="text-gray-500" /> Upload files (textbook chapters, worksheets, slides)
            </button>
            <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            {uploadedFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {uploadedFiles.map((f, i) => <p key={i} className="text-xs text-gray-500 flex items-center gap-1"><FileText size={11} className="text-purple-500" /> {f}</p>)}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1.5">You can select multiple files at once</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Add Resource Links</label>
            <div className="space-y-2">
              {links.map((link, i) => (
                <input key={i} value={link} onChange={(e) => handleLinkChange(i, e.target.value)} placeholder="https://example.com/resource"
                  className="w-full h-9 border border-gray-200 rounded-lg px-3 text-sm placeholder:text-gray-400 outline-none bg-gray-50 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
              ))}
            </div>
            <button type="button" onClick={handleAddLink}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg h-9 text-sm font-medium text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-all">
              <Link size={14} /> Add Another Link
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Tags / Topics</label>
            <div className="flex gap-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddTag()} placeholder="Add a tag (e.g., Algebra, Geometry)"
                className="flex-1 h-9 border border-gray-200 rounded-lg px-3 text-sm placeholder:text-gray-400 outline-none bg-gray-50 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
              <button type="button" onClick={handleAddTag} disabled={!tagInput.trim()}
                className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    {t}<button onClick={() => setTags((p) => p.filter((x) => x !== t))} className="hover:text-purple-900"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3">
          <button onClick={onClose} className="h-9 px-5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!unitName.trim()}
            className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-sm shadow-purple-200">
            Save Unit
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const UnitCard = ({ unit, onAddMaterials }) => (
  <div className="bg-white flex flex-col rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
    <div className="flex items-start gap-3 mb-4">
      <div className="w-11 h-11 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
        <BookOpen className="w-5 h-5 text-purple-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-gray-900 mb-1">{unit.title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{unit.desc}</p>
      </div>
    </div>
    <div className="mb-4 flex-1">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Resources</p>
      <div className="space-y-1.5">
        {unit.resources.map((r) => (
          <div key={r.id} className="flex items-center gap-2">
            <FileBadge type={r.type} color={r.color} size="sm" />
            <span className="text-xs text-gray-700 truncate flex-1">{r.name}</span>
            <span className="text-xs text-gray-400 shrink-0">{r.type}</span>
          </div>
        ))}
      </div>
    </div>
    <button onClick={() => onAddMaterials(unit)}
      className="inline-flex items-center justify-center gap-1.5 w-full h-8 rounded-lg text-sm font-semibold border border-purple-300 text-purple-600 hover:bg-purple-50 transition-colors mt-auto">
      <Plus size={13} /> Add Materials
    </button>
  </div>
);

const AddMoreCard = ({ onCreateUnit }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileRef = useRef(null);

  const handleFiles = (e) => {
    const incoming = Array.from(e.target.files).map((f) => ({
      id: Date.now() + Math.random(), name: f.name, size: (f.size / (1024 * 1024)).toFixed(2),
    }));
    setUploadedFiles((prev) => [...prev, ...incoming]);
    e.target.value = "";
  };

  const removeFile = (id) => setUploadedFiles((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className="rounded-xl border border-purple-200 p-6 bg-linear-to-br from-purple-50 to-blue-50">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
          <BookOpen className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Add More Teaching Materials</h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">Help AI understand your curriculum by uploading relevant teaching materials from this unit</p>
          <div className="flex flex-wrap gap-2.5">
            <button onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 h-11 px-4 rounded-lg text-sm font-semibold border border-purple-300 bg-white text-purple-600 hover:bg-purple-50 transition-colors">
              <Plus size={14} /> Upload Files
            </button>
            <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,image/*" className="hidden" onChange={handleFiles} />
            <button onClick={onCreateUnit}
              className="inline-flex items-center gap-2 h-11 px-4 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors">
              <Plus size={14} /> Create New Unit
            </button>
          </div>
        </div>
      </div>
      {uploadedFiles.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Materials ({uploadedFiles.length})</h4>
          <div className="space-y-2">
            <AnimatePresence>
              {uploadedFiles.map((f) => (
                <motion.div key={f.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }}
                  className="flex items-center justify-between bg-white border border-purple-200 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText size={20} className="text-purple-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                      <p className="text-xs text-gray-500">{f.size} MB</p>
                    </div>
                  </div>
                  <button onClick={() => removeFile(f.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors shrink-0 ml-2">
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      <div className="bg-purple-100 rounded-lg p-3 flex items-start gap-2.5">
        <Lightbulb size={15} className="text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-xs text-purple-800 leading-relaxed">
          <strong>Tip:</strong> Uploading your unit materials helps AI provide more accurate grading and relevant feedback aligned with your teaching approach
        </p>
      </div>
    </div>
  );
};

const UnitTeachingMaterials = () => {
  const [units,          setUnits]          = useState(INITIAL_UNITS);
  const [activeUnit,     setActiveUnit]     = useState(null);
  const [createUnitOpen, setCreateUnitOpen] = useState(false);

  const handleSave       = (unitId, newRes) => setUnits((p) => p.map((u) => u.id === unitId ? { ...u, resources: newRes } : u));
  const handleCreateUnit = (newUnit)        => setUnits((p) => [...p, newUnit]);

  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Unit Teaching Materials</h2>
        <p className="text-gray-500 text-base">Upload textbooks, worksheets, and projects from the unit for better AI context</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {units.map((unit) => (
          <UnitCard key={unit.id} unit={unit} onAddMaterials={setActiveUnit} />
        ))}
      </div>
      <AddMoreCard onCreateUnit={() => setCreateUnitOpen(true)} />
      <AnimatePresence>
        {activeUnit     && <AddMaterialsModal  key="add-materials" unit={activeUnit} onClose={() => setActiveUnit(null)}     onSave={handleSave}       />}
        {createUnitOpen && <CreateNewUnitModal key="create-unit"                     onClose={() => setCreateUnitOpen(false)} onSave={handleCreateUnit} />}
      </AnimatePresence>
    </section>
  );
};

export default UnitTeachingMaterials;