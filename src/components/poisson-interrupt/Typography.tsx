import React from "react";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export const H1: React.FC<TypographyProps> = ({ children, className = "" }) => (
  <h1
    className={`text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl ${className}`}
  >
    {children}
  </h1>
);

export const H2: React.FC<TypographyProps> = ({ children, className = "" }) => (
  <h2 className={`text-xl font-bold text-gray-900 ${className}`}>{children}</h2>
);

export const H3: React.FC<TypographyProps> = ({ children, className = "" }) => (
  <h3 className={`text-lg font-bold text-gray-900 ${className}`}>{children}</h3>
);

export const H4: React.FC<TypographyProps> = ({ children, className = "" }) => (
  <h4
    className={`text-xs font-bold text-gray-900 uppercase tracking-wide ${className}`}
  >
    {children}
  </h4>
);

export const Body: React.FC<TypographyProps> = ({
  children,
  className = "",
}) => <p className={`text-lg text-gray-600 ${className}`}>{children}</p>;

export const BodySmall: React.FC<TypographyProps> = ({
  children,
  className = "",
}) => <div className={`text-xs text-gray-600 ${className}`}>{children}</div>;

export const BodyMicro: React.FC<TypographyProps> = ({
  children,
  className = "",
}) => (
  <div className={`text-[10px] text-gray-500 ${className}`}>{children}</div>
);

// Label is often used as a <label> tag, but sometimes just as a visual label.
// We'll default to a div, but allow 'as' polymorphism if we wanted to be fancy.
// For now, simple wrappers.
export const Label: React.FC<TypographyProps & { htmlFor?: string }> = ({
  children,
  className = "",
  htmlFor,
}) => {
  if (htmlFor) {
    return (
      <label
        htmlFor={htmlFor}
        className={`text-xs font-bold text-gray-600 uppercase tracking-wider ${className}`}
      >
        {children}
      </label>
    );
  }
  return (
    <span
      className={`text-xs font-bold text-gray-600 uppercase tracking-wider ${className}`}
    >
      {children}
    </span>
  );
};

export const LabelSmall: React.FC<TypographyProps> = ({
  children,
  className = "",
}) => (
  <span
    className={`text-[10px] font-medium text-gray-500 uppercase tracking-wide ${className}`}
  >
    {children}
  </span>
);

export const Mono: React.FC<TypographyProps> = ({
  children,
  className = "",
}) => (
  <span className={`font-mono text-gray-600 ${className}`}>{children}</span>
);

export const MonoHighlight: React.FC<TypographyProps> = ({
  children,
  className = "",
}) => (
  <span
    className={`font-mono bg-gray-200 text-gray-900 px-1 rounded-sm ${className}`}
  >
    {children}
  </span>
);

// SVG Text wrappers
interface SvgTextProps {
  x?: number | string;
  y?: number | string;
  children: React.ReactNode;
  className?: string;
  textAnchor?: "start" | "middle" | "end";
  dy?: number | string;
}

export const AxisLabel: React.FC<SvgTextProps> = ({
  children,
  className = "",
  ...props
}) => (
  <text className={`text-xs fill-gray-500 font-mono ${className}`} {...props}>
    {children}
  </text>
);

export const AxisLabelSmall: React.FC<SvgTextProps> = ({
  children,
  className = "",
  ...props
}) => (
  <text
    className={`text-[10px] fill-gray-500 font-mono ${className}`}
    {...props}
  >
    {children}
  </text>
);
