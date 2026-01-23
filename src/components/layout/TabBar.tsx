"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface TabItem {
  href: string;
  label: string;
  icon: (props: { className?: string; active?: boolean }) => ReactNode;
}

const tabs: TabItem[] = [
  {
    href: "/",
    label: "홈",
    icon: HomeIcon,
  },
  {
    href: "/stories",
    label: "동화",
    icon: BookIcon,
  },
  {
    href: "/settings",
    label: "마이",
    icon: UserIcon,
  },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-[#E5E5E5] bg-white pb-safe">
      <div className="flex h-16 items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href ||
            (tab.href !== "/" && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1"
            >
              <tab.icon
                className="size-6"
                active={isActive}
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-[#FF9500]" : "text-[#888888]"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ className, active }: { className?: string; active?: boolean }) {
  return (
    <svg
      className={className}
      fill={active ? "#FF9500" : "none"}
      stroke={active ? "#FF9500" : "#888888"}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function BookIcon({ className, active }: { className?: string; active?: boolean }) {
  return (
    <svg
      className={className}
      fill={active ? "#FF9500" : "none"}
      stroke={active ? "#FF9500" : "#888888"}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}

function UserIcon({ className, active }: { className?: string; active?: boolean }) {
  return (
    <svg
      className={className}
      fill={active ? "#FF9500" : "none"}
      stroke={active ? "#FF9500" : "#888888"}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}
