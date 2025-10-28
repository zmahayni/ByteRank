"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TeamTabs({ teamId }: { teamId: string }) {
  const pathname = usePathname();
  const base = `/teams/${teamId}`;

  const item = (href: string, label: string) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={
          "px-3 py-2 rounded-md text-sm font-medium " +
          (isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100")
        }
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="flex gap-2">
      {item(base, "Overview")}
      {item(`${base}/activity`, "Activity")}
      {/* add more tabs later (members, settings, etc.) */}
    </div>
  );
}
