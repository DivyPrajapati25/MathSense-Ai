import { useState, useEffect } from "react";
import { Award, Users, Calendar, Eye, ArrowRight, X, CircleCheck, Clock } from "lucide-react";

const ASSIGNMENTS_DATA = [
  {
    id: 1,
    title: "Algebra Worksheet - Chapter 5",
    status: "Uploaded",
    points: 50,
    submissions: 28,
    date: "Sep 28, 2025",
    students: [
      { name: "Sarah Martinez", submitted: "Sep 28, 2025", graded: true },
      { name: "Liam Chen",      submitted: "Sep 28, 2025", graded: true },
      { name: "Ava Johnson",    submitted: "Sep 28, 2025", graded: false },
      { name: "Noah Patel",     submitted: "Sep 28, 2025", graded: false },
      { name: "Emma Davis",     submitted: "Sep 28, 2025", graded: false },
      { name: "Oliver Brown",   submitted: "Sep 28, 2025", graded: true },
      { name: "Sophia Wilson",  submitted: "Sep 28, 2025", graded: true },
      { name: "James Miller",   submitted: "Sep 28, 2025", graded: false },
    ],
  },
  {
    id: 2,
    title: "Geometry Problems Set A",
    status: "Uploaded",
    points: 40,
    submissions: 28,
    date: "Sep 25, 2025",
    students: [
      { name: "Emma Johnson",   submitted: "Sep 25, 2025", graded: true },
      { name: "Marcus Williams",submitted: "Sep 25, 2025", graded: false },
      { name: "Liam Anderson",  submitted: "Sep 25, 2025", graded: true },
      { name: "Sophia Martinez",submitted: "Sep 25, 2025", graded: false },
      { name: "Noah Brown",     submitted: "Sep 25, 2025", graded: true },
      { name: "Olivia Davis",   submitted: "Sep 25, 2025", graded: false },
    ],
  },
  {
    id: 3,
    title: "Fractions Quiz",
    status: "Uploaded",
    points: 30,
    submissions: 28,
    date: "Sep 23, 2025",
    students: [
      { name: "Charlotte Lee",  submitted: "Sep 23, 2025", graded: true },
      { name: "Ethan Moore",    submitted: "Sep 23, 2025", graded: true },
      { name: "Isabella Taylor",submitted: "Sep 23, 2025", graded: false },
    ],
  },
  {
    id: 4,
    title: "Linear Equations Test",
    status: "Uploaded",
    points: 45,
    submissions: 28,
    date: "Sep 20, 2025",
    students: [
      { name: "Benjamin Harris",submitted: "Sep 20, 2025", graded: false },
      { name: "Amelia Clark",   submitted: "Sep 20, 2025", graded: true },
    ],
  },
  {
    id: 5,
    title: "Trigonometry Assignment",
    status: "Uploaded",
    points: 35,
    submissions: 28,
    date: "Sep 18, 2025",
    students: [
      { name: "Lucas Walker",   submitted: "Sep 18, 2025", graded: true },
      { name: "Mia Thompson",   submitted: "Sep 18, 2025", graded: false },
    ],
  },
];

const useScrollLock = (active) => {
  useEffect(() => {
    if (active) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [active]);
};

const GradedBadge = ({ graded }) =>
  graded ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border border-green-200 bg-green-100 text-green-700 whitespace-nowrap">
      <CircleCheck className="w-3 h-3 mr-1" /> Graded
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border border-amber-200 bg-amber-50 text-amber-700 whitespace-nowrap">
      <Clock className="w-3 h-3 mr-1" /> Not Graded
    </span>
  );

const StudentRow = ({ name, submitted, graded }) => (
  <div className="flex items-center justify-between py-3 px-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
    <div className="flex-1">
      <h4 className="font-medium text-sm">{name}</h4>
      <p className="text-sm text-gray-500">Submitted: {submitted}</p>
    </div>
    <GradedBadge graded={graded} />
  </div>
);
const ViewDetailsModal = ({ assignment, onClose }) => {
  useScrollLock(true);
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="
        fixed z-50 top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]
        bg-white rounded-lg border border-gray-200 shadow-lg
        w-full max-w-[calc(100%-2rem)] sm:max-w-lg
        max-h-[85vh] flex flex-col
        p-0
      ">
        <div className="px-6 pt-6 pb-0">
          <div className="flex flex-col gap-2 text-center sm:text-left mb-4">
            <h2 className="text-lg leading-none font-semibold">Assignment Details</h2>
            <p className="text-sm text-gray-500">View student submission details</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            {assignment.students.map((s) => (
              <StudentRow key={s.name} {...s} />
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-gray-200 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors focus:outline-none"
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
      </div>
    </>
  );
};

const ViewAllModal = ({ onClose }) => {
  useScrollLock(true);
  const [detailAssignment, setDetailAssignment] = useState(null);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="
        fixed z-50 top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]
        bg-white rounded-lg border border-gray-200 shadow-lg
        w-full max-w-[calc(100%-2rem)] sm:max-w-xl
        max-h-[85vh] flex flex-col
        p-0
      ">
        <div className="px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-lg leading-none font-semibold">All Assignments</h2>
          <p className="text-sm text-gray-500 mt-1">View and manage all your assignments</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2 pb-4">
          <div className="space-y-4">
            {ASSIGNMENTS_DATA.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-6 rounded-xl border border-gray-200 p-6 bg-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-medium mb-2">{a.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="inline-flex items-center justify-center rounded-md border border-green-200 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                        {a.status}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4 mr-1 text-orange-500" />{a.points} points
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4 mr-1 text-gray-500" />{a.submissions} submissions
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <Calendar className="w-4 h-4 mr-1" />{a.date}
                    </div>
                  </div>
                  {/* Buttons */}
                  <div className="flex gap-3 lg:shrink-0">
                    <button className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors w-full sm:w-auto">
                      Grade
                    </button>
                    <button
                      onClick={() => setDetailAssignment(a)}
                      className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-blue-600 border border-blue-300 hover:bg-blue-50 transition-colors w-full sm:w-auto"
                    >
                      <Eye className="w-4 h-4 mr-1" /> View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-gray-200 bg-white shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors focus:outline-none"
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
      </div>

      {detailAssignment && (
        <ViewDetailsModal
          assignment={detailAssignment}
          onClose={() => setDetailAssignment(null)}
        />
      )}
    </>
  );
};

const AssignmentCard = ({ assignment, onViewDetails }) => {
  const { title, status, points, submissions, date } = assignment;
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-gray-200 p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-medium mb-2">{title}</h3>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
            <span className="inline-flex items-center justify-center rounded-md border border-green-200 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
              {status}
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-4 h-4 mr-1 text-orange-500" />{points} points
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4 mr-1 text-gray-500" />{submissions} submissions
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <Calendar className="w-4 h-4 mr-1" />{date}
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button className="flex-1 inline-flex items-center justify-center h-9 px-4 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors focus:outline-none">
          Grade
        </button>
        <button
          onClick={() => onViewDetails(assignment)}
          className="flex-1 inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-blue-600 border border-blue-300 hover:bg-blue-50 transition-colors focus:outline-none"
        >
          <Eye className="w-4 h-4 mr-2" /> View Details
        </button>
      </div>
    </div>
  );
};

const YourAssignments = () => {
  const [viewAllOpen, setViewAllOpen]       = useState(false);
  const [detailAssignment, setDetailAssignment] = useState(null);

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Your Assignments</h2>
        <button
          onClick={() => setViewAllOpen(true)}
          className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-blue-600 border border-blue-300 hover:bg-blue-50 transition-colors focus:outline-none"
        >
          View All <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>

      <div className="grid gap-6">
        {ASSIGNMENTS_DATA.map((a) => (
          <AssignmentCard
            key={a.id}
            assignment={a}
            onViewDetails={setDetailAssignment}
          />
        ))}
      </div>

      {detailAssignment && (
        <ViewDetailsModal
          assignment={detailAssignment}
          onClose={() => setDetailAssignment(null)}
        />
      )}

      {viewAllOpen && (
        <ViewAllModal onClose={() => setViewAllOpen(false)} />
      )}
    </section>
  );
};

export default YourAssignments;