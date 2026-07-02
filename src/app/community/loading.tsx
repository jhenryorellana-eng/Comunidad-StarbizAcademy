export default function CommunityLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-cream-200" />
        <div className="h-6 w-40 rounded-md bg-cream-200" />
      </div>
      <div className="mb-6 h-28 rounded-2xl bg-cream-200 sm:h-36" />
      <div className="grid gap-5 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-surface-line bg-paper p-5">
            <div className="h-3.5 w-2/3 rounded bg-cream-200" />
            <div className="mt-3 h-3 w-1/2 rounded bg-cream-200" />
            <div className="mt-4 h-3 w-full rounded bg-cream-200" />
            <div className="mt-2 h-3 w-4/5 rounded bg-cream-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
