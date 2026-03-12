import { useState, useRef } from "react";
import {
  Users, Upload, X, CircleCheck,
  Loader, File
} from "lucide-react";
import CustomSelect from "../../../components/common/CustomSelect/CustomSelect";
import Field from "../../../components/common/Field/Field";
import { CLASSES_DATA, MARKING_SCHEMES, ASSIGNMENT_TITLES } from "../../../data/uploadConstants";

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
          <>
            {/* <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 h-8 text-xs font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload File
            </button> */}
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center justify-center w-8 h-8 border border-red-200 text-red-500 rounded-md hover:bg-red-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 h-8 text-xs font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors sm:min-h-0 min-h-[44px] w-full sm:w-auto justify-center"
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
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

  const uploadedCount = Object.values(studentFiles).filter(
    (s) => s.status === "complete"
  ).length;

  const handleFileSelect = (studentName, file) => {
    setStudentFiles((prev) => ({
      ...prev,
      [studentName]: { file, status: "pending" },
    }));
  };

  const handleRemove = (studentName) => {
    setStudentFiles((prev) => {
      const next = { ...prev };
      delete next[studentName];
      return next;
    });
  };

  const handleUploadAll = async () => {
    const pending = Object.entries(studentFiles).filter(
      ([, s]) => s.status === "pending"
    );
    if (!pending.length) return;

    setIsUploading(true);

    for (const [name] of pending) {
      setStudentFiles((prev) => ({
        ...prev,
        [name]: { ...prev[name], status: "uploading", progress: 0 },
      }));

      for (let p = 10; p <= 100; p += 10) {
        await new Promise((r) => setTimeout(r, 80));
        setStudentFiles((prev) => ({
          ...prev,
          [name]: { ...prev[name], progress: p },
        }));
      }

      setStudentFiles((prev) => ({
        ...prev,
        [name]: { ...prev[name], status: "complete", progress: 100 },
      }));
    }
    setIsUploading(false);
  };

  const pendingCount = Object.values(studentFiles).filter(
    (s) => s.status === "pending"
  ).length;
  const allDone = students.length > 0 && uploadedCount === students.length;

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
        <div>
          <h4 className="font-medium text-lg">Batch Upload Mode</h4>
          <p className="text-sm text-gray-600">Upload assignments for multiple students at once</p>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors min-h-[44px] w-full sm:w-auto shrink-0"
        >
          <X className="w-4 h-4" />
          Exit Batch Mode
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Student Class">
          <CustomSelect
            value={selectedClass}
            onChange={setSelectedClass}
            options={CLASSES_DATA.map((c) => c.label)}
            placeholder="Select class..."
          />
        </Field>
        <div>
          <Field label="Marking Scheme">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 min-w-0">
                <CustomSelect
                  value={markingScheme}
                  onChange={setMarkingScheme}
                  options={MARKING_SCHEMES}
                  placeholder="Select marking scheme..."
                />
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center px-3 h-9 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors whitespace-nowrap w-full sm:w-auto shrink-0"
              >
                Upload New
              </button>
            </div>
          </Field>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Assignment Title">
          <CustomSelect
            value={assignmentTitle}
            onChange={setAssignmentTitle}
            options={ASSIGNMENT_TITLES}
            placeholder="Select assignment title..."
          />
        </Field>
        <Field label="Total Points">
          <input
            type="number"
            value={totalPoints}
            onChange={(e) => setTotalPoints(e.target.value)}
            placeholder="Enter total points..."
            className="flex h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
          />
        </Field>
      </div>

      <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium">Upload Students' Work (Batch Mode)</h4>
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
            <button
              type="button"
              onClick={handleUploadAll}
              disabled={pendingCount === 0 || isUploading}
              className="
                inline-flex items-center justify-center gap-2
                w-full h-10 rounded-md text-sm font-medium
                bg-linear-to-r from-blue-600 to-green-600
                hover:from-blue-700 hover:to-green-700
                text-white transition-all
                disabled:opacity-50 disabled:pointer-events-none
              "
            >
              {isUploading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Uploading... ({uploadedCount} / {students.length})
                </>
              ) : allDone ? (
                <>
                  <CircleCheck className="w-5 h-5 mr-2" />
                  All Assignments Uploaded
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload All Assignments ({pendingCount})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const SingleUploadForm = () => {
  const [form, setForm] = useState({
    assignmentTitle: "", studentName: "", studentClass: "",
    markingScheme: "", totalPoints: "", file: null,
  });
  const fileInputRef = useRef(null);
  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-gray-200  bg-white shadow-lg p-6">
      <form className="space-y-4">
        <Field label="Assignment Title">
          <CustomSelect value={form.assignmentTitle} onChange={(v) => set("assignmentTitle", v)} options={ASSIGNMENT_TITLES} placeholder="Select assignment title..." />
        </Field>
        <Field label="Student Name">
          <input type="text" placeholder="Enter student name..." value={form.studentName} onChange={(e) => set("studentName", e.target.value)}
            className="flex h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors" />
        </Field>
        <Field label="Student Class">
          <CustomSelect value={form.studentClass} onChange={(v) => set("studentClass", v)} options={CLASSES_DATA.map((c) => c.label)} placeholder="Select class..." />
        </Field>
        <Field label="Marking Scheme">
          <CustomSelect value={form.markingScheme} onChange={(v) => set("markingScheme", v)} options={MARKING_SCHEMES} placeholder="Select marking scheme..." />
        </Field>
        <Field label="Total Points">
          <input type="number" placeholder="Enter total points..." value={form.totalPoints} onChange={(e) => set("totalPoints", e.target.value)}
            className="flex h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors" />
        </Field>
        <Field label="Upload Student Work">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full mt-1 border-2 border-dashed border-gray-200 rounded-md h-24 flex items-center justify-center gap-2 text-sm text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-black" />
            {form.file ? <span className="text-gray-700 font-medium">{form.file.name}</span> : <span className="text-black font-semibold">Click to browse files</span>}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => set("file", e.target.files?.[0] ?? null)} />
        </Field>
        <button type="submit"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-10 w-full px-6 bg-linear-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
          <Upload className="w-5 h-5 mr-2" />
          Upload Assignment
        </button>
      </form>
    </div>
  );
};

const UploadZone = () => {
  const [batchMode, setBatchMode] = useState(false);

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Student Assignments Upload Zone
        </h2>
        {!batchMode && (
          <button
            type="button"
            onClick={() => setBatchMode(true)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-[44px] px-4 py-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white sm:min-h-0"
          >
            <Users className="w-4 h-4 mr-2" />
            Batch Upload
          </button>
        )}
      </div>

      {batchMode ? (
        <BatchUploadPanel onExit={() => setBatchMode(false)} />
      ) : (
        <SingleUploadForm />
      )}
    </section>
  );
};

export default UploadZone;