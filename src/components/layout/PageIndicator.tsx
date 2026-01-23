export interface PageIndicatorProps {
  total: number;
  current: number;
}

export function PageIndicator({ total, current }: PageIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, index) => (
        <div
          key={index}
          className={`size-2 rounded-full transition-colors ${
            index === current ? "bg-[#FF9500]" : "bg-[#E5E5E5]"
          }`}
        />
      ))}
    </div>
  );
}
