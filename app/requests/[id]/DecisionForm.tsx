"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

type DecisionFormProps = {
  requestId: number;
  currentStatus: string;
  currentReason: string | null;
};

export default function DecisionForm({
  requestId,
  currentStatus,
  currentReason,
}: DecisionFormProps) {
  const router = useRouter();

  const [status, setStatus] = useState(
    currentStatus === "PENDING" ? "" : currentStatus
  );
  const [decisionReason, setDecisionReason] = useState(
    currentReason ?? ""
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    // I only update the decision fields so the original request details stay unchanged.
    const response = await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        decisionReason,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }

    // I return to the queue after the decision is saved.
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-3 block text-sm font-semibold text-slate-700">
          Decision
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              value: "ACCEPTED",
              label: "Accept",
              description: "Move forward",
            },
            {
              value: "DEFERRED",
              label: "Defer",
              description: "Review later",
            },
            {
              value: "DECLINED",
              label: "Decline",
              description: "Do not pursue",
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={`rounded-xl border p-4 text-left transition ${
                status === option.value
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <p className="font-semibold">{option.label}</p>

              <p
                className={`mt-1 text-xs ${
                  status === option.value
                    ? "text-slate-300"
                    : "text-slate-400"
                }`}
              >
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="reason"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Decision reason
        </label>

        <textarea
          id="reason"
          value={decisionReason}
          onChange={(event) => setDecisionReason(event.target.value)}
          rows={4}
          required
          placeholder="Explain why this request should be accepted, deferred, or declined."
          className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !status}
        className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Saving decision..." : "Save Decision"}
      </button>
    </form>
  );
}