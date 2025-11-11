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

    // This is the simplest way to trigger a file download.
    // The browser will make a GET request to this URL.
    // If the file exists, the backend will send it.
    // If not, the browser will likely show a "Not Found" page.
    window.location.href = `http://localhost:8080/api/download/${code}`;

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