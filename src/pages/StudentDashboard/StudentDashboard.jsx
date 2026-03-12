import { motion } from "framer-motion";
import { Rocket, Clock, BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const StudentDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                {/* Greeting */}
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-blue-600 to-green-500 shadow-lg mb-6"
                >
                    <Rocket className="w-10 h-10 text-white" />
                </motion.div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    Welcome, {user?.first_name || "Student"}! 👋
                </h1>
                <p className="text-lg text-gray-500 mb-12 max-w-xl mx-auto">
                    Your personalized dashboard is being built. Stay tuned for something amazing!
                </p>

                {/* Coming Soon Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        {
                            icon: BookOpen,
                            title: "My Assignments",
                            desc: "View and submit your assignments",
                            color: "blue",
                        },
                        {
                            icon: Clock,
                            title: "My Grades",
                            desc: "Track your performance and scores",
                            color: "green",
                        },
                        {
                            icon: Rocket,
                            title: "My Feedback",
                            desc: "Get personalized AI-powered feedback",
                            color: "purple",
                        },
                    ].map((card, i) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-lg p-6 text-center"
                        >
                            <div
                                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${card.color === "blue"
                                    ? "bg-blue-100 text-blue-600"
                                    : card.color === "green"
                                        ? "bg-green-100 text-green-600"
                                        : "bg-purple-100 text-purple-600"
                                    }`}
                            >
                                <card.icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{card.title}</h3>
                            <p className="text-sm text-gray-500 mb-4">{card.desc}</p>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                                <Clock className="w-3 h-3" />
                                Coming Soon
                            </span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default StudentDashboard;
