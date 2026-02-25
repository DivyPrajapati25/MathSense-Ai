const Field = ({ label, children, className = "" }) => (
    <div className={className}>
        <label className="flex items-center gap-2 text-sm font-medium leading-none mb-1 select-none">
            {label}
        </label>
        {children}
    </div>
);

export default Field;
