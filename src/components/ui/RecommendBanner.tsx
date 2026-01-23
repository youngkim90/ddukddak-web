export interface RecommendBannerProps {
  title: string;
  subtitle: string;
  onClick?: () => void;
}

export function RecommendBanner({ title, subtitle, onClick }: RecommendBannerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF9500] to-[#FFBB5C] p-5 text-left transition-transform active:scale-[0.98]"
    >
      <p className="text-sm font-medium text-white/90">{title}</p>
      <h3 className="mt-1 text-xl font-bold text-white">{subtitle}</h3>
    </button>
  );
}
