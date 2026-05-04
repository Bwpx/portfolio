interface Props {
  eyebrow?: string;
  title: string;
}

export default function SectionHeading({ eyebrow, title }: Props) {
  return (
    <div className="mb-12 sm:mb-14">
      {eyebrow && (
        <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-[0.2em] mb-3 font-mono">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold text-[#e4e4e7] tracking-tight">
        {title}
      </h2>
      <div className="mt-4 h-[3px] w-12 bg-amber-500 rounded-full" />
    </div>
  );
}
