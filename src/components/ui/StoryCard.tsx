export interface StoryCardProps {
  title: string;
  thumbnailColor?: string;
  thumbnailUrl?: string;
  isLocked?: boolean;
  onClick?: () => void;
}

export function StoryCard({
  title,
  thumbnailColor = "#FFE5CC",
  thumbnailUrl,
  isLocked = false,
  onClick,
}: StoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col overflow-hidden rounded-2xl bg-white text-left transition-transform active:scale-[0.98]"
    >
      {/* Thumbnail */}
      <div
        className="aspect-[4/5] w-full rounded-2xl"
        style={{
          backgroundColor: thumbnailColor,
          backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Title */}
      <div className="flex items-center gap-1 px-1 py-2">
        <span className="line-clamp-1 text-sm font-medium text-[#333333]">
          {title}
        </span>
        {isLocked && <LockIcon className="size-4 shrink-0 text-[#888888]" />}
      </div>
    </button>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
