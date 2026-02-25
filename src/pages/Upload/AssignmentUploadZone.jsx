import { useState, useRef } from "react";
import {
  Users, Upload, FileUp,
  ArrowRight, Zap, FileText, Check,
  X, CircleCheck, Loader, File,
} from "lucide-react";
import CustomSelect from "../../components/common/CustomSelect/CustomSelect";
import Field from "../../components/common/Field/Field";
import { CLASSES_DATA, MARKING_SCHEMES, ASSIGNMENT_TITLES } from "../../data/uploadConstants";
const TEMPLATES = [
  { emoji: "📊", name: "Algebra Worksheet", questions: 15, time: "3-5 min" },
  { emoji: "📐", name: "Geometry Quiz", questions: 10, time: "2-3 min" },
  { emoji: "📝", name: "Word Problems", questions: 8, time: "4-6 min" },
  { emoji: "🧠", name: "Mental Math", questions: 20, time: "2-3 min" },
];
const FEATURES = [
  { icon: Zap, bg: "bg-blue-100", color: "text-blue-600", label: "Smart Detection", desc: "AI analyzes document structure and question types" },
  { icon: FileText, bg: "bg-green-100", color: "text-green-600", label: "Auto Organization", desc: "Assignments sorted by type and difficulty level" },
  { icon: Check, bg: "bg-purple-100", color: "text-purple-600", label: "Ready to Grade", desc: "Optimized for fastest grading experience" },
];


const StudentRow = ({ name, fileState, onFileSelect, onRemove }) => {
  const inputRef = useRef(null);
  const { file, status, progress = 0 } = fileState;

  return (
    <div className={`
      flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white border rounded-lg transition-colors
      ${status === "uploading" ? "border-blue-300" : "border-gray-200 hover:border-blue-300"}
    `}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm sm:text-base truncate">{name}</span>
          {status === "complete" && <CircleCheck className="w-4 h-4 text-green-500 shrink-0" />}
          {status === "uploading" && <Loader className="w-4 h-4 text-blue-500 shrink-0 animate-spin" />}
        </div>
        {file && (
          <div className="flex items-center gap-1 mt-0.5">
            <File className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500 truncate">{file.name}</span>
          </div>
        )}
        {status === "uploading" && (
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gray-900 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 shrink-0 w-8">{progress}%</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 shrink-0 items-center">
        {status === "complete" ? (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md">
            Complete
          </span>
        ) : status === "uploading" ? (
          null
        ) : file ? (
          <button type="button" onClick={onRemove}
            className="inline-flex items-center justify-center w-8 h-8 border border-red-200 text-red-500 rounded-md hover:bg-red-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 h-8 text-xs font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors sm:min-h-0 min-h-[44px] w-full sm:w-auto justify-center"
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFileSelect(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
};

const BatchUploadPanel = ({ onExit }) => {
  const [selectedClass, setSelectedClass] = useState("");
  const [markingScheme, setMarkingScheme] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [totalPoints, setTotalPoints] = useState("");
  const [studentFiles, setStudentFiles] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const classData = CLASSES_DATA.find((c) => c.label === selectedClass);
  const students = classData?.students ?? [];
  const uploadedCount = Object.values(studentFiles).filter((s) => s.status === "complete").length;
  const pendingCount = Object.values(studentFiles).filter((s) => s.status === "pending").length;
  const allDone = students.length > 0 && uploadedCount === students.length;

  const handleFileSelect = (name, file) =>
    setStudentFiles((prev) => ({ ...prev, [name]: { file, status: "pending" } }));

  const handleRemove = (name) =>
    setStudentFiles((prev) => { const n = { ...prev }; delete n[name]; return n; });

  const handleUploadAll = async () => {
    const pending = Object.entries(studentFiles).filter(([, s]) => s.status === "pending");
    if (!pending.length) return;
    setIsUploading(true);
    for (const [name] of pending) {
      setStudentFiles((prev) => ({ ...prev, [name]: { ...prev[name], status: "uploading", progress: 0 } }));
      for (let p = 10; p <= 100; p += 10) {
        await new Promise((r) => setTimeout(r, 80));
        setStudentFiles((prev) => ({ ...prev, [name]: { ...prev[name], progress: p } }));
      }
      setStudentFiles((prev) => ({ ...prev, [name]: { ...prev[name], status: "complete", progress: 100 } }));

    }
    setIsUploading(false);
  };

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white shadow-lg p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <h4 className="font-medium text-lg">Batch Upload Mode</h4>
          <p className="text-sm text-gray-600">Upload assignments for multiple students at once</p>
        </div>
        <button type="button" onClick={onExit}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors min-h-[44px] w-full sm:w-auto shrink-0"
        >
          <X className="w-4 h-4" />
          Exit Batch Mode
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Student Class">
          <CustomSelect value={selectedClass} onChange={setSelectedClass} options={CLASSES_DATA.map((c) => c.label)} placeholder="Select class..." />
        </Field>
        <Field label="Marking Scheme">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 min-w-0">
              <CustomSelect value={markingScheme} onChange={setMarkingScheme} options={MARKING_SCHEMES} placeholder="Select marking scheme..." />
            </div>
            <button type="button" className="inline-flex items-center justify-center px-3 h-9 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors whitespace-nowrap w-full sm:w-auto shrink-0">
              <FileUp className="w-4 h-4 mr-1" /> Upload New
            </button>
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Assignment Title">
          <CustomSelect value={assignmentTitle} onChange={setAssignmentTitle} options={ASSIGNMENT_TITLES} placeholder="Select assignment title..." />
        </Field>
        <Field label="Total Points">
          <input type="number" placeholder="Enter total points..." value={totalPoints}
            onChange={(e) => setTotalPoints(e.target.value)}
            className="flex h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
        </Field>
      </div>

      <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium">Upload Student's Work (Batch Mode)</h4>
          </div>
          {students.length > 0 && (
            <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
              {uploadedCount} / {students.length} uploaded
            </span>
          )}
        </div>

        {students.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Please select a class to see the student list</p>
          </div>
        ) : (
          <div className="relative max-h-[400px] pr-1 overflow-y-auto space-y-3">
            {students.map((name) => (
              <StudentRow
                key={name}
                name={name}
                fileState={studentFiles[name] ?? { file: null, status: "idle" }}
                onFileSelect={(file) => handleFileSelect(name, file)}
                onRemove={() => handleRemove(name)}
              />
            ))}
          </div>
        )}

        {students.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button type="button" onClick={handleUploadAll}
              disabled={pendingCount === 0 || isUploading}
              className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-md text-sm font-medium bg-linear-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isUploading ? (
                <><Loader className="w-5 h-5 animate-spin" /> Uploading... ({uploadedCount}/{students.length})</>
              ) : allDone ? (
                <><CircleCheck className="w-5 h-5" /> All Assignments Uploaded</>
              ) : (
                <><Upload className="w-5 h-5" /> Upload All Assignments ({pendingCount})</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const SingleUploadForm = ({ onBatchClick }) => {
  const [form, setForm] = useState({
    studentClass: "", markingScheme: "", assignmentTitle: "",
    studentName: "", totalPoints: "", file: null,
  });
  const fileRef = useRef(null);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-4 md:p-8 flex flex-col gap-6">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-2xl font-bold">Student Assignments Upload Zone</h3>
        <button type="button" onClick={onBatchClick}
          className="inline-flex items-center justify-center gap-2 px-4 h-9 rounded-md text-sm font-medium text-white bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all whitespace-nowrap w-full sm:w-auto">
          <Users className="w-4 h-4" /> Batch Upload
        </button>
      </div>

      <div className="space-y-4">
        <Field label="Student Class">
          <CustomSelect value={form.studentClass} onChange={(v) => set("studentClass", v)} options={CLASSES_DATA.map((c) => c.label)} placeholder="Select class..." />
        </Field>
        <Field label="Marking Scheme">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 min-w-0">
              <CustomSelect value={form.markingScheme} onChange={(v) => set("markingScheme", v)} options={MARKING_SCHEMES} placeholder="Select marking scheme..." />
            </div>
            <button type="button" className="inline-flex items-center justify-center px-3 h-9 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors whitespace-nowrap w-full sm:w-auto shrink-0">
              <FileUp className="w-4 h-4 mr-1" /> Upload New
            </button>
          </div>
        </Field>
        <Field label="Assignment Title">
          <CustomSelect value={form.assignmentTitle} onChange={(v) => set("assignmentTitle", v)} options={ASSIGNMENT_TITLES} placeholder="Select assignment title..." />
        </Field>
        <Field label="Student Name">
          <input type="text" placeholder="Enter student name..." value={form.studentName}
            onChange={(e) => set("studentName", e.target.value)}
            className="flex h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
        </Field>
        <Field label="Total Points">
          <input type="number" placeholder="Enter total points..." value={form.totalPoints}
            onChange={(e) => set("totalPoints", e.target.value)}
            className="flex h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" />
        </Field>
        <Field label="Upload Student Work">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="w-full mt-1 border-2 border-dashed border-gray-200 rounded-md min-h-[100px] flex flex-col items-center justify-center gap-2 text-sm text-gray-500 hover:bg-blue-50 hover:border-blue-400 transition-colors">
            <Upload className="w-6 h-6 text-gray-700" />
            <span className="font-semibold text-black">{form.file ? form.file.name : "Click to browse files"}</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
            onChange={(e) => set("file", e.target.files?.[0] ?? null)} />
        </Field>
        <button type="button"
          className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-md text-sm font-medium text-white bg-linear-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all">
          <Upload className="w-5 h-5" /> Upload Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 pt-4 border-t border-gray-100">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.label} className="flex items-start md:flex-col md:items-center md:text-center p-3 md:p-0 bg-gray-50 md:bg-transparent rounded-lg gap-3 md:gap-2">
              <div className={`w-10 h-10 md:w-12 md:h-12 ${f.bg} rounded-full flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">{f.label}</h4>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TemplateLibrary = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-4 h-fit">
    <h3 className="text-xl font-bold">Template Library</h3>
    <p className="text-gray-600 text-sm -mt-2">Pre-configured grading schemes for common assignment types</p>
    <div className="space-y-3">
      {TEMPLATES.map((t) => (
        <div key={t.name}
          className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{t.emoji}</span>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{t.name}</h4>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{t.questions} questions</span><span>•</span><span>{t.time}</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const UploadZoneWithTemplates = () => {
  const [batchMode, setBatchMode] = useState(false);

  return (
    <section className="mb-12 md:mb-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          {batchMode
            ? <BatchUploadPanel onExit={() => setBatchMode(false)} />
            : <SingleUploadForm onBatchClick={() => setBatchMode(true)} />
          }
        </div>
        <div>
          <TemplateLibrary />
        </div>
      </div>
    </section>
  );
};

export default UploadZoneWithTemplates;