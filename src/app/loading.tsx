export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-navy/20 border-t-teal rounded-full animate-spin mx-auto mb-4" />
        <p className="font-montserrat font-semibold text-navy/40 text-sm">
          Loading...
        </p>
      </div>
    </div>
  );
}
