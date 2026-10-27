import Link from "next/link";

export function LogoMark({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#logo-grad)" />
      {/* speech bubble */}
      <path
        d="M16 20a6 6 0 016-6h20a6 6 0 016 6v14a6 6 0 01-6 6H31l-9 8v-8h0a6 6 0 01-6-6V20z"
        fill="white"
      />
      {/* sparkle */}
      <path d="M32 21l2.2 5.8L40 29l-5.8 2.2L32 37l-2.2-5.8L24 29l5.8-2.2L32 21z" fill="url(#logo-grad)" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <LogoMark className="w-8 h-8 shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform" />
      <span className="font-black text-gray-900 dark:text-zinc-100 text-base tracking-tight">
        AI Interview <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">Coach</span>
      </span>
    </Link>
  );
}
