"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function NewRequestPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [expectedImpact, setExpectedImpact] = useState("");
  const [urgency, setUrgency] = useState("MEDIUM");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    // I send the form data to my API so it can be validated before saving.
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        problemStatement,
        expectedImpact,
        urgency,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }

    // After the request is created, I send the user back to the queue.
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-flex text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          ← Back to queue
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-7 py-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
              DQ
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              New Request
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Add a product request to the decision queue for review.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-7">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Request title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={120}
                placeholder="Example: Improve mobile checkout"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                {title.length}/120 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="problem"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Problem statement
              </label>

              <textarea
                id="problem"
                value={problemStatement}
                onChange={(event) =>
                  setProblemStatement(event.target.value)
                }
                required
                rows={4}
                placeholder="What problem needs to be solved?"
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="impact"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Expected impact
              </label>

              <textarea
                id="impact"
                value={expectedImpact}
                onChange={(event) =>
                  setExpectedImpact(event.target.value)
                }
                required
                rows={3}
                placeholder="What improvement should this request create?"
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="urgency"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Urgency
              </label>

              <select
                id="urgency"
                value={urgency}
                onChange={(event) => setUrgency(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
              <Link
                href="/"
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}