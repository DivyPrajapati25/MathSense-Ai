import { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

const CustomSelect = ({ value, onChange, options, placeholder, disabled }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((p) => !p)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                className={`
          flex w-full items-center justify-between gap-2
          rounded-md border border-gray-200 bg-gray-50
          px-3 py-2 text-sm transition-colors h-9 min-w-0
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
          disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
        `}
            >
                <span className={`truncate ${value ? "text-gray-900" : "text-gray-400"}`}>
                    {value || placeholder}
                </span>
                <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
            </button>
            {open && (
                <div className="absolute z-50 top-10 left-0 w-full bg-white border border-gray-100 rounded-md shadow-md overflow-hidden max-h-48 overflow-y-auto">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            onMouseDown={() => { onChange(opt); setOpen(false); }}
                            className={`flex w-full px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors cursor-pointer whitespace-normal ${value === opt ? "bg-gray-50 font-medium" : ""}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;

