"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  if (paths.length === 0) return null;

  return (
    <nav className="flex items-center text-sm text-slate-400 mb-4">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-slate-200 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {paths.map((path, index) => {
        const href = `/${paths.slice(0, index + 1).join("/")}`;
        const isLast = index === paths.length - 1;
        const formattedPath = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");

        return (
          <div key={path} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-2 text-slate-600" />
            {isLast ? (
              <span className="text-slate-200 font-medium">{formattedPath}</span>
            ) : (
              <Link
                href={href}
                className="hover:text-slate-200 transition-colors"
              >
                {formattedPath}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
