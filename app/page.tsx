"use client";

import { useState } from "react";
import { User, Send, Loader2 } from "lucide-react";

export default function Home() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [currentNationality, setCurrentNationality] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportExpiryDate, setPassportExpiryDate] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [autoClick, setAutoClick] = useState(true);
  const [autoFill, setAutoFill] = useState(true);
  const [targetForm, setTargetForm] = useState("vfs-global-form");
  const [submitForm, setSubmitForm] = useState(false);
  const [delayMs, setDelayMs] = useState("1000");
  const [scrollToElement, setScrollToElement] = useState(true);
  const [fetchUserId, setFetchUserId] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.wenepal.com/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch(`${API_URL}/save-form-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formFields: { firstName, lastName, gender, dateOfBirth, currentNationality, passportNumber, passportExpiryDate, contactNumber },
          commands: { autoClick, autoFill, targetForm, submitForm, delayMs: Number(delayMs), scrollToElement },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || "Failed to save data");
      }
    } catch {
      setError("Network error: Unable to save data");
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch(`${API_URL}/get-form-data/${fetchUserId}`);
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || "Failed to fetch data");
      }
    } catch {
      setError("Network error: Unable to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-indigo-900">VFS Bot UI</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-indigo-800">First Name</label>
            <div className="mt-1 flex items-center border border-indigo-300 rounded-md">
              <User className="ml-2 h-5 w-5 text-indigo-500" />
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="flex-1 p-2 border-none focus:ring-2 focus:ring-indigo-500 text-indigo-900"
                placeholder="Enter First Name"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-800">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
              placeholder="Enter Last Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-800">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-800">Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-800">Current Nationality</label>
            <input
              type="text"
              value={currentNationality}
              onChange={(e) => setCurrentNationality(e.target.value)}
              className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
              placeholder="Enter Nationality"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-800">Passport Number</label>
            <input
              type="text"
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
              className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
              placeholder="Enter Passport Number"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-800">Passport Expiry Date</label>
            <input
              type="date"
              value={passportExpiryDate}
              onChange={(e) => setPassportExpiryDate(e.target.value)}
              className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-800">Contact Number</label>
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
              placeholder="Enter Contact Number"
              required
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-indigo-800">
              <input
                type="checkbox"
                checked={autoClick}
                onChange={(e) => setAutoClick(e.target.checked)}
                className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded"
              />
              Auto Click
            </label>
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-indigo-800">
              <input
                type="checkbox"
                checked={autoFill}
                onChange={(e) => setAutoFill(e.target.checked)}
                className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded"
              />
              Auto Fill
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-800">Target Form (CSS Selector/ID)</label>
            <input
              type="text"
              value={targetForm}
              onChange={(e) => setTargetForm(e.target.value)}
              className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
              placeholder="Enter Target Form"
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-indigo-800">
              <input
                type="checkbox"
                checked={submitForm}
                onChange={(e) => setSubmitForm(e.target.checked)}
                className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded"
              />
              Submit Form
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-800">Delay (ms)</label>
            <input
              type="number"
              value={delayMs}
              onChange={(e) => setDelayMs(e.target.value)}
              className="mt-1 w-full p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900"
              placeholder="Enter Delay in ms"
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-indigo-800">
              <input
                type="checkbox"
                checked={scrollToElement}
                onChange={(e) => setScrollToElement(e.target.checked)}
                className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded"
              />
              Scroll to Element
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-2 rounded-md flex items-center justify-center hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Send className="h-5 w-5 mr-2" />}
            {loading ? "Submitting..." : "Submit Data"}
          </button>
        </form>

        <div className="mt-6">
          <label className="block text-sm font-medium text-indigo-800">Fetch Data by User ID</label>
          <div className="mt-1 flex items-center">
            <input
              type="text"
              value={fetchUserId}
              onChange={(e) => setFetchUserId(e.target.value)}
              className="flex-1 p-2 border border-indigo-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-indigo-900 bg-indigo-50"
              placeholder="Enter User ID to fetch"
            />
            <button
              onClick={handleFetch}
              disabled={loading || !fetchUserId}
              className="ml-2 bg-teal-600 text-white p-2 rounded-md hover:bg-teal-700 disabled:bg-teal-400 transition-colors"
            >
              Fetch
            </button>
          </div>
        </div>

        {error && <p className="mt-4 text-red-600">{error}</p>}
        {response && (
          <div className="mt-4 p-4 bg-indigo-100 rounded-md">
            <pre className="text-sm text-indigo-900">{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}