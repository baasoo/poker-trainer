"use client";

import { useState, useEffect } from "react";

interface ProbabilityInputProps {
  playerNumber: number;
  initialValue: number;
  onValueChange: (playerNumber: number, value: number) => void;
  disabled: boolean;
}

export default function ProbabilityInput({
  playerNumber,
  initialValue,
  onValueChange,
  disabled,
}: ProbabilityInputProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
    setValue(newValue);
    onValueChange(playerNumber, newValue);
  };

  return (
    <div className="bg-poker-green bg-opacity-30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="font-bold">
          {`P${playerNumber}`}
        </label>
        <span className="text-poker-gold text-lg font-bold">{value.toFixed(1)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="0.1"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-poker-gold"
      />
    </div>
  );
}
