type SkeletonProps = {
    placeholder?: string;
};

export const Skeleton = ({ placeholder = "placeholder" }: SkeletonProps) => {
    return (
        <div className="inline-block animate-pulse bg-gray-200 rounded">
            <span className="invisible">{placeholder}</span>
        </div>
    );
};