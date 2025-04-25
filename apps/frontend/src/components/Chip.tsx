

export const Chip = ({ label, className = '' }: { label: string; className?: string }) => {
    return (
        <div
            className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border-2 ${className}`}
        >
            {label}
        </div>
    );
}