import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#FF9500",
        secondary: "#5AC8FA",
        background: "#FFF9F0",
        surface: "#FFFFFF",
        "bg-outer": "#E8E4DE",
        "text-main": "#333333",
        "text-sub": "#888888",
        error: "#FF3B30",
        success: "#34C759",
      },
      fontFamily: {
        pretendard: ["Pretendard"],
        "pretendard-bold": ["Pretendard-Bold"],
      },
    },
  },
  plugins: [],
} satisfies Config;
