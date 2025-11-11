import { useState } from 'react';

export default function DownloadForm() {
  const [code, setCode] = useState<string>('');
  // Add state for error messages
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear old errors

    if (code.length !== 4) {
      setError('Code must be 4 characters long.');
      return;
    }

    // CRITICAL FIX: Ensure the API_URL is loaded from the environment variable (Vercel)
    // The fallback is necessary for local testing, but Vercel uses the ENV value.
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    // Update window.location.href to use the dynamic API_URL
    window.location.href = `${API_URL}/api/download/${code}`;

    // Clear the input field after submission
    setCode('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
          4-Character Code
        </label>
        <input
          type="text"
          id="code"
          value={code}
          // Make sure it only accepts 4 chars and is uppercase
          onChange={(e) => setCode(e.target.value.trim())}
          maxLength={4}
          className="block w-full max-w-xs border-gray-300 rounded-md shadow-sm focus:ring-gray-800 focus:border-gray-800 sm:text-sm"
          placeholder="e.g., wK8c"
        />
      </div>

      {/* Show error message if one exists */}
      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}

      <button
        type="submit"
        className="bg-gray-800 text-white px-6 py-2 rounded-md font-medium hover:bg-gray-700"
      >
        Download
      </button>
    </form>
  );
}