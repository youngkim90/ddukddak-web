import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "kakao" | "google";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-[#FF9500] text-white hover:bg-[#E68600] focus:ring-[#FF9500]",
      secondary:
        "bg-[#5AC8FA] text-white hover:bg-[#4AB8EA] focus:ring-[#5AC8FA]",
      ghost:
        "bg-transparent text-[#888888] hover:text-[#333333] focus:ring-[#888888]",
      kakao:
        "bg-[#FEE500] text-[#333333] hover:bg-[#E6CF00] focus:ring-[#FEE500]",
      google:
        "bg-white text-[#333333] border border-[#E5E5E5] hover:bg-[#F5F5F5] focus:ring-[#E5E5E5]",
    };

    const sizes = {
      sm: "h-10 px-4 text-sm rounded-lg",
      md: "h-12 px-6 text-base rounded-xl",
      lg: "h-14 px-8 text-lg rounded-xl",
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
