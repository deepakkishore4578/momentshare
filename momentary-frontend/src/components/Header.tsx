export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left Side: Title (I've added a 'T' to mimic the logo) */}
          <div className="flex items-center">
            <span className="font-bold text-2xl text-gray-900">
               MomentShare
            </span>
          </div>

          {/* Right Side: Info Text (as seen in your screenshot) */}
          <div className="flex items-center">
            <span className="text-sm text-gray-500">
              No login. Temporary file share.
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
}