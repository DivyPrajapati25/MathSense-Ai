import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Printer, User, Eye, Send } from "lucide-react";
import { cardVariants } from "../../utils/animations";

const DELIVERY_METHODS = [
  {
    id: "email",
    icon: Mail,
    label: "Email",
    desc: "Send feedback directly to students and parents",
    recipients: 28,
    defaultOn: true,
  },
  {
    id: "lms",
    icon: MessageSquare,
    label: "Learning Management System",
    desc: "Post to your school's LMS platform",
    recipients: 28,
    defaultOn: false,
  },
  {
    id: "print",
    icon: Printer,
    label: "Print & Distribute",
    desc: "Generate printable feedback sheets",
    recipients: 0,
    defaultOn: true,
  },
  {
    id: "portal",
    icon: User,
    label: "Parent Portal",
    desc: "Notify parents through school portal",
    recipients: 24,
    defaultOn: false,
  },
];

const Toggle = ({ checked, onChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full border-2 border-transparent transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
      ${checked ? "bg-black" : "bg-gray-300"}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
        ${checked ? "translate-x-4" : "translate-x-0"}`}
    />
  </button>
);

const DeliveryOptions = () => {
  const [methods, setMethods] = useState(
    Object.fromEntries(DELIVERY_METHODS.map((m) => [m.id, m.defaultOn]))
  );

  const toggle = (id, val) => setMethods((prev) => ({ ...prev, [id]: val }));
  const selectedCount = Object.values(methods).filter(Boolean).length;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl border border-gray-200 p-6"
    >
      <h3 className="text-xl font-bold mb-6">Delivery Options</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {DELIVERY_METHODS.map((method) => {
          const Icon = method.icon;
          const isOn = methods[method.id];
          return (
            <div
              key={method.id}
              className={`p-4 border rounded-lg transition-colors ${isOn ? "border-blue-300 bg-blue-50" : "border-gray-200"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-sm">{method.label}</span>
                </div>
                <Toggle checked={isOn} onChange={(v) => toggle(method.id, v)} />
              </div>
              <p className="text-sm text-gray-600 mb-2">{method.desc}</p>
              <p className="text-sm font-medium text-blue-600">{method.recipients} recipients</p>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-200 gap-3">
        <div className="text-sm text-gray-600">{selectedCount} delivery methods selected</div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-colors min-h-[44px] w-full sm:w-auto">
            <Eye className="w-4 h-4" />
            Preview All
          </button>
          <button className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium text-white bg-linear-to-r from-blue-600 to-green-600 hover:opacity-90 transition-opacity min-h-[44px] w-full sm:w-auto">
            <Send className="w-4 h-4" />
            Send Feedback
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DeliveryOptions;