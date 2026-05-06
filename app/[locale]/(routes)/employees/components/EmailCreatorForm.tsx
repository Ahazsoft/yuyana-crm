"use client";

import { useState } from "react";

export default function EmailCreatorForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    email: string;
    password: string;
    mailServerHost: string;
    webmailUrl: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/createemail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create email");
      }

      setResult(data);
      setName(""); // Clear input on success
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="emailName" className="block text-sm font-medium text-gray-700">
            Username (prefix)
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              id="emailName"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
              placeholder="e.g., john.doe"
              required
              disabled={loading}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              @contacts.travelwithyuyana.com
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !name}
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {loading ? "Creating email..." : "Create Email"}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Success / Result View */}
      {result && (
        <div className="p-4 bg-green-50 text-green-800 border border-green-200 rounded-md text-sm space-y-2">
          <p className="font-bold text-base mb-2">🎉 Email Account Created Successfully!</p>
          <p><strong>Email Address:</strong> <code className="bg-white px-1 py-0.5 rounded border">{result.email}</code></p>
          <p><strong>Initial Password:</strong> <code className="bg-white px-1 py-0.5 rounded border">{result.password}</code></p>
          <hr className="my-2 border-green-200" />
          <p><strong>Incoming/Outgoing Host:</strong> <code>{result.mailServerHost}</code></p>
          <p><strong>Access Webmail:</strong> <a href={result.webmailUrl} target="_blank" rel="noopener noreferrer" className="underline text-indigo-600 hover:text-indigo-800">Go to Webmail</a></p>
          <p className="text-xs text-gray-600 mt-2">Make sure to copy the password above now. It will not be shown again.</p>
        </div>
      )}
    </div>
  );
}
