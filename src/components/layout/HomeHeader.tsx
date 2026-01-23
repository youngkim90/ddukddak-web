"use client";

import Link from "next/link";

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between bg-white px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="size-8 rounded-full bg-[#FF9500]" />
        <span className="text-lg font-bold text-[#FF9500]">뚝딱동화</span>
      </Link>

      {/* Profile */}
      <Link
        href="/settings"
        className="flex size-10 items-center justify-center"
        aria-label="마이페이지"
      >
        <div className="size-8 rounded-full bg-[#E5E5E5]" />
      </Link>
    </header>
  );
}
