function SkeletonCard() {
  return (
    <div className="border border-[#243B27] p-2 rounded-xl bg-[#0E1510] animate-pulse">
      <div className="w-full rounded-lg bg-[#1A2E1D]" style={{ aspectRatio: "2/3" }} />
      <div className="mt-2 h-3 bg-[#1A2E1D] rounded w-3/4" />
      <div className="mt-1 h-2 bg-[#1A2E1D] rounded w-1/2" />
      <div className="mt-1 h-2 bg-[#1A2E1D] rounded w-1/3" />
    </div>
  );
}

export default SkeletonCard;