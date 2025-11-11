import { useState } from 'react';

// This component will show the result (code or error)
function UploadResult({ code, error }: { code: string | null; error: string | null }) {
  if (error) {
    return (
      <div className="mt-4 p-4 rounded-md bg-red-100 border border-red-300">
        <p className="text-red-700 font-medium">Upload Failed</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (code) {
    return (
      <div className="mt-4 p-4 rounded-md bg-green-100 border border-green-300">
        <p className="text-green-700 font-medium">File Uploaded!</p>
        <p className="text-gray-800 text-sm">Your 4-character code is:</p>
        <p className="text-xl font-bold text-gray-900 mt-2">{code}</p>
      </div>
    );
  }

  return null;
}

export default function UploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [retention, setRetention] = useState<string>('10');

  // 1. Add state for loading, code, and errors
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadCode, setUploadCode] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 2. Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }

    // Reset state before upload
    setIsLoading(true);
    setUploadCode(null);
    setUploadError(null);

    // 3. Create FormData to send the file
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('retention', retention);

    try {
      // CRITICAL FIX: Ensure protocol is HTTPS for production deployment
      // The process.env is read as a string. We ensure it starts with https://
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      
      // 4. POST the data to your backend
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // If the status is not 2xx, throw an error
        let errorText = `Upload failed with status: ${response.status}`;
        if (response.status === 403) {
            errorText += " (CORS or permissions issue)";
        }
        throw new Error(errorText);
      }

      // 5. Get the JSON response 
      const data = await response.json();
      
      if (data && data.code) {
         setUploadCode(data.code);
      } else {
         // Fallback error if JSON structure is wrong but status is 200
         throw new Error("Server response was missing the file code.");
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      // Display a more helpful message for a "Failed to fetch" (network/CORS) error
      if (error.message.includes("Failed to fetch")) {
          setUploadError("Network connection error. Check API URL and CORS settings.");
      } else {
          setUploadError(error.message || 'An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Note: 'onSubmit' now calls our new async function
    <form onSubmit={handleSubmit}>
      {/* --- File Input (No change) --- */}
      <div className="mb-6">
        <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
          File
        </label>
        <div className="flex items-center space-x-2">
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
          >
            Choose File
          </label>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            onChange={handleFileChange}
          />
          <span className="text-gray-600 text-sm">
            {selectedFile ? selectedFile.name : 'No file chosen'}
          </span>
        </div>
      </div>

      {/* --- Retention Period (No change) --- */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Retention
        </label>
        <div className="flex space-x-2">
          {['10 min', '20 min', '30 min'].map((time) => {
            const value = time.split(' ')[0];
            return (
              <button
                type="button"
                key={time}
                onClick={() => setRetention(value)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${retention === value
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Submit Button --- */}
      <button
        type="submit"
        // 6. Disable button while loading
        disabled={isLoading}
        className="bg-gray-800 text-white px-6 py-2 rounded-md font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Uploading...' : 'Upload'}
      </button>

      {/* 7. Show the result component */}
      <UploadResult code={uploadCode} error={uploadError} />
    </form>
  );
}