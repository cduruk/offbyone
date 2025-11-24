import React, { useEffect, useState, useRef } from "react";
import { Label, Mono } from "./Typography";
import { Slider } from "@/components/ui/slider";

interface ControlSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export const ControlSlider: React.FC<ControlSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  disabled,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    // Skip animation if user is currently dragging
    if (isDraggingRef.current) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayValue((prevDisplayValue) => {
      if (prevDisplayValue === value) {
        return prevDisplayValue;
      }

      const diff = Math.abs(value - prevDisplayValue);
      const threshold = step * 2; // Only animate if change is larger than 2 steps

      // Small change - update immediately
      if (diff <= threshold) {
        return value;
      }

      // Large change (persona switch) - animate
      setIsAnimating(true);

      const startValue = prevDisplayValue;
      const endValue = value;
      const duration = 600; // ms
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out cubic)
        const eased = 1 - Math.pow(1 - progress, 3);

        const currentValue = startValue + (endValue - startValue) * eased;
        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);

      return prevDisplayValue; // Return current value until animation starts
    });
  }, [value, step]);

  const handleInteractionStart = () => {
    isDraggingRef.current = true;
    setIsAnimating(false);
  };

  const handleInteractionEnd = () => {
    isDraggingRef.current = false;
  };

  const handleChange = (newValue: number) => {
    // Immediately update display value when dragging
    if (isDraggingRef.current) {
      setDisplayValue(newValue);
    }
    onChange(newValue);
  };

  const formatValue = (val: number) => {
    return step >= 1 ? Math.round(val) : val.toFixed(1);
  };

  return (
    <div
      className={`flex flex-col space-y-2 transition-all duration-200 ${disabled ? "opacity-50 pointer-events-none" : "hover:scale-[1.01]"}`}
    >
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        <span
          className={`text-xs px-2 py-0.5 rounded-sm flex items-center transition-all duration-300 ${
            isAnimating
              ? "bg-gray-300 text-gray-900"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          <Mono className="text-xs">
            {formatValue(displayValue)} {unit}
          </Mono>
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[displayValue]}
        onValueChange={(values) => handleChange(values[0])}
        onPointerDown={handleInteractionStart}
        onPointerUp={handleInteractionEnd}
        disabled={disabled}
        className="w-full"
      />
    </div>
  );
};
