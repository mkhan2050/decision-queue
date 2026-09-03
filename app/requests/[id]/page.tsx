import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import DecisionForm from "./DecisionForm";

type ReviewPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReviewPage({
  params,
}: ReviewPageProps) {
  const { id } = await params;
  const requestId = Number(id);

  if (!Number.isInteger(requestId) || requestId <= 0) {
    notFound();
  }

  // I load the full request here so the reviewer can see all the context before deciding.
  const request = await prisma.request.findUnique({
    where: {
      id: requestId,
    },
  });

  if (!request) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-6 inline-flex text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          ← Back to queue
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-7 py-6">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                DQ
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                Request #{String(request.id).padStart(3, "0")}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              {request.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge status={request.status} />
              <UrgencyBadge urgency={request.urgency} />
            </div>
          </div>

          <div className="grid gap-8 p-7 lg:grid-cols-[1fr_360px]">
            <div className="space-y-7">
              <section>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Problem statement
                </p>

                <p className="leading-7 text-slate-700">
                  {request.problemStatement}
                </p>
              </section>

              <section>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Expected impact
                </p>

                <p className="leading-7 text-slate-700">
                  {request.expectedImpact}
                </p>
              </section>

              {request.decisionReason && (
                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Current decision reason
                  </p>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="leading-7 text-slate-700">
                      {request.decisionReason}
                    </p>
                  </div>
                </section>
              )}

              <section className="border-t border-slate-100 pt-6">
                <p className="text-sm text-slate-400">
                  Submitted{" "}
                  {request.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </section>
            </div>

            <aside className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Record Decision
              </h2>

              <p className="mb-5 mt-1 text-sm leading-6 text-slate-500">
                Choose an outcome and explain the reasoning behind it.
              </p>

              {/* I keep the interactive decision controls in a separate client component. */}
              <DecisionForm
                requestId={request.id}
                currentStatus={request.status}
                currentReason={request.decisionReason}
              />
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING:
      "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    ACCEPTED:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    DEFERRED:
      "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    DECLINED:
      "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {formatLabel(status)}
    </span>
  );
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const styles: Record<string, string> = {
    CRITICAL:
      "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    HIGH:
      "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
    MEDIUM:
      "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200",
    LOW:
      "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[urgency] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {formatLabel(urgency)}
    </span>
  );
}

function formatLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}