import { Card } from "@/lib/poker-evaluator";

interface CardDisplayProps {
  card: Card;
  size?: "sm" | "md" | "lg";
}

export default function CardDisplay({ card, size = "md" }: CardDisplayProps) {
  const sizeClasses = {
    sm: "w-12 h-16",
    md: "w-16 h-24",
    lg: "w-20 h-32",
  };

  const textSizes = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-5xl",
  };

  const suitTextSizes = {
    sm: "text-4xl",
    md: "text-6xl",
    lg: "text-7xl",
  };

  const suitSymbol = {
    C: "♣",
    D: "♦",
    H: "♥",
    S: "♠",
  }[card.suit];

  const isRed = card.suit === "H" || card.suit === "D";

  return (
    <div
      data-face="true"
      className={`${sizeClasses[size]} poker-card ${
        isRed ? "text-red-600" : "text-black"
      }`}
    >
      <div className="flex flex-col items-center justify-center h-full gap-0">
        <div className={`font-bold ${textSizes[size]} leading-none`}>{card.value}</div>
        <div className={`${suitTextSizes[size]} leading-none -mt-2`}>{suitSymbol}</div>
      </div>
    </div>
  );
}
