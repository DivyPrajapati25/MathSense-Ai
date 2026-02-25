import { useState, useRef } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";

const ASSIGNMENT_OPTIONS = [
  "All Assignments",
  "Algebra Worksheet - Chapter 5",
  "Geometry Problems Set A",
  "Fractions Quiz",
  "Linear Equations Test",
  "Trigonometry Assignment",
];

const DIFFICULTY_OPTIONS = ["All Levels", "Low", "Medium", "High"];

const ERROR_TYPE_OPTIONS = [
  "All Types",
  "Calculation Error",
  "Conceptual Error",
  "Logical Error",
];

const ERRORS_DATA = [
  {
    id: 1,
    type: "Calculation Error",
    difficulty: "Low",
    description: "Arithmetic mistakes in final steps",
    assignment: "Algebra Worksheet - Chapter 5",
  },
  {
    id: 2,
    type: "Conceptual Error",
    difficulty: "High",
    description: "Misunderstanding of slope formula",
    assignment: "Geometry Problems Set A",
  },
  {
    id: 3,
    type: "Logical Error",
    difficulty: "Medium",
    description: "Incorrect order of operations",
    assignment: "Fractions Quiz",
  },
  {
    id: 4,
    type: "Calculation Error",
    difficulty: "Low",
    description: "Sign errors in negative numbers",
    assignment: "Linear Equations Test",
  },
  {
    id: 5,
    type: "Conceptual Error",
    difficulty: "Medium",
    description: "Confusion between area and perimeter",
    assignment: "Geometry Problems Set A",
  },
  {
    id: 6,
    type: "Logical Error",
    difficulty: "Medium",
    description: "Skipped steps in multi-step problems",
    assignment: "Algebra Worksheet - Chapter 5",
  },
];

const difficultyStyles = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
};

const DifficultyBadge = ({ level }) => (
  <span className={`
    inline-flex items-center justify-center rounded-md border border-transparent
    px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0
    ${difficultyStyles[level] ?? "bg-gray-100 text-gray-700"}
  `}>
    {level}
  </span>
);

const ErrorCard = ({ type, difficulty, description, assignment }) => (
  <div className="bg-white flex flex-col gap-6 rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
        <h4 className="font-medium">{type}</h4>
      </div>
      <DifficultyBadge level={difficulty} />
    </div>

    <p className="text-sm text-gray-600 mb-2">{description}</p>

    <p className="text-xs text-gray-500">{assignment}</p>
  </div>
);

const FilterSelect = ({ label, value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="
            flex w-full items-center justify-between gap-2
            rounded-md border border-gray-200 bg-white
            px-3 py-2 text-sm whitespace-nowrap transition-colors h-9
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
          "
        >
          <span className="text-gray-900">{value}</span>
          <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
        </button>

        {open && (
          <div className="absolute z-50 top-10 left-0 w-full min-w-[160px] bg-white border border-gray-100 rounded-md shadow-md overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onMouseDown={() => { onChange(opt); setOpen(false); }}
                className={`
                  flex w-full px-3 py-2 text-sm text-left
                  hover:bg-gray-100 transition-colors
                  ${value === opt ? "bg-gray-50 font-medium" : ""}
                `}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CommonErrors = () => {
  const [assignmentFilter, setAssignmentFilter] = useState("All Assignments");
  const [difficultyFilter, setDifficultyFilter] = useState("All Levels");
  const [errorTypeFilter, setErrorTypeFilter] = useState("All Types");

  const handleClearFilters = () => {
    setAssignmentFilter("All Assignments");
    setDifficultyFilter("All Levels");
    setErrorTypeFilter("All Types");
  };

  const filtered = ERRORS_DATA.filter((err) => {
    const matchAssignment =
      assignmentFilter === "All Assignments" || err.assignment === assignmentFilter;
    const matchDifficulty =
      difficultyFilter === "All Levels" || err.difficulty === difficultyFilter;
    const matchType =
      errorTypeFilter === "All Types" || err.type === errorTypeFilter;
    return matchAssignment && matchDifficulty && matchType;
  });

  return (
    <section>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Common Errors</h2>

      <div className="rounded-xl border border-gray-200 p-4 md:p-6 mb-6 bg-gray-50">
        <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <FilterSelect
            label="Assignment Title"
            value={assignmentFilter}
            onChange={setAssignmentFilter}
            options={ASSIGNMENT_OPTIONS}
          />
          <FilterSelect
            label="Difficulty Level"
            value={difficultyFilter}
            onChange={setDifficultyFilter}
            options={DIFFICULTY_OPTIONS}
          />
          <FilterSelect
            label="Error Type"
            value={errorTypeFilter}
            onChange={setErrorTypeFilter}
            options={ERROR_TYPE_OPTIONS}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-transparent select-none">
              &nbsp;
            </label>
            <button
              type="button"
              onClick={handleClearFilters}
              className="
                inline-flex items-center justify-center
                h-9 px-4 w-full rounded-md text-sm font-medium
                border border-gray-200 bg-white
                hover:bg-gray-50 transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((err) => (
            <ErrorCard
              key={err.id}
              type={err.type}
              difficulty={err.difficulty}
              description={err.description}
              assignment={err.assignment}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">No errors match the selected filters.</p>
        </div>
      )}
    </section>
  );
};

export default CommonErrors;