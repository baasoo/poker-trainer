interface CardPlaceholderProps {
  size?: "sm" | "md" | "lg";
}

export default function CardPlaceholder({ size = "sm" }: CardPlaceholderProps) {
  const sizeClasses = {
    sm: "w-12 h-16",
    md: "w-16 h-24",
    lg: "w-20 h-32",
  };

  return (
    <div
      className={`${sizeClasses[size]} poker-card bg-gray-700 border-2 border-gray-600 rounded flex items-center justify-center opacity-25`}
    >
      <span className="text-gray-500 text-xs">-</span>
    </div>
  );
}
