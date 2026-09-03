const sampleRequests = [
  {
    id: 1,
    title: "Improve mobile checkout",
    problem:
      "Customers have difficulty completing checkout on smaller screens.",
    impact: "Reduce checkout abandonment and improve mobile conversion.",
    urgency: "HIGH",
    status: "PENDING",
  },
  {
    id: 2,
    title: "Add CSV export",
    problem:
      "Partner teams currently copy reporting data into spreadsheets manually.",
    impact: "Save time when preparing weekly partner reports.",
    urgency: "MEDIUM",
    status: "PENDING",
  },
  {
    id: 3,
    title: "Improve account search",
    problem:
      "Support staff have trouble locating accounts with partial customer information.",
    impact: "Reduce the time needed to resolve support requests.",
    urgency: "CRITICAL",
    status: "ACCEPTED",
  },
];

// I’m using fictional sample data here while I build the interface.
// Later I’ll replace this with requests stored in PostgreSQL.

export default function Home() {
  const totalRequests = sampleRequests.length;
  const pendingRequests = sampleRequests.filter(
    (request) => request.status === "PENDING"
  ).length;
  const acceptedRequests = sampleRequests.filter(
    (request) => request.status === "ACCEPTED"
  ).length;
  const deferredRequests = sampleRequests.filter(
    (request) => request.status === "DEFERRED"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* I keep the header simple so the main action is easy to find. */}
        <header className="mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">
                  DQ
                </div>

                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                  Product request review
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight text-slate-950">
                  Decision Queue
                </h1>

                <span className="rounded-full bg-slate-200/70 px-3 py-1 text-sm font-medium text-slate-600">
                  {totalRequests} requests
                </span>
              </div>

              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                Review incoming product requests, prioritize what matters, and
                record clear decisions for the team.
              </p>
            </div>

            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
              <span className="text-lg leading-none">+</span>
              New Request
            </button>
          </div>
        </header>

        {/* I calculate these values from the request data instead of hardcoding the totals. */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total requests"
            value={totalRequests}
            description="All submitted requests"
            accent="slate"
          />

          <SummaryCard
            label="Pending"
            value={pendingRequests}
            description="Awaiting a decision"
            accent="amber"
          />

          <SummaryCard
            label="Accepted"
            value={acceptedRequests}
            description="Approved to move forward"
            accent="emerald"
          />

          <SummaryCard
            label="Deferred"
            value={deferredRequests}
            description="Saved for later review"
            accent="blue"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-slate-950">
                    Request Queue
                  </h2>

                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                    {pendingRequests} awaiting decision
                  </span>
                </div>

                <p className="mt-1.5 text-sm text-slate-500">
                  Filter, prioritize, and review incoming requests.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-slate-400"
                  defaultValue="all-statuses"
                >
                  <option value="all-statuses">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="deferred">Deferred</option>
                  <option value="declined">Declined</option>
                </select>

                <select
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-slate-400"
                  defaultValue="all-urgencies"
                >
                  <option value="all-urgencies">All urgencies</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-slate-400"
                  defaultValue="highest"
                >
                  <option value="highest">Highest urgency</option>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/60 p-3 sm:p-4">
            <div className="space-y-3">
              {/* I reuse the same layout for each request so the queue stays easy to scan. */}
              {sampleRequests.map((request) => (
                <article
                  key={request.id}
                  className="group rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:px-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-slate-400">
                          Request #{String(request.id).padStart(3, "0")}
                        </span>

                        <span className="text-slate-300">•</span>

                        <StatusBadge status={request.status} />
                        <UrgencyBadge urgency={request.urgency} />
                      </div>

                      <h3 className="text-lg font-semibold text-slate-950">
                        {request.title}
                      </h3>

                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {request.problem}
                      </p>

                      <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3">
                        <p className="text-sm leading-6 text-slate-600">
                          <span className="font-semibold text-slate-700">
                            Expected impact:
                          </span>{" "}
                          {request.impact}
                        </p>
                      </div>
                    </div>

                    <button className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition group-hover:border-slate-300 hover:bg-slate-950 hover:text-white lg:self-center">
                      Review
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>Decision Queue</p>
          <p>Built by Muneeb Khan</p>
        </footer>
      </div>
    </main>
  );
}

// I made this reusable so each summary card follows the same structure.
function SummaryCard({
  label,
  value,
  description,
  accent,
}: {
  label: string;
  value: number;
  description: string;
  accent: "slate" | "amber" | "emerald" | "blue";
}) {
  const accentStyles = {
    slate: "bg-slate-900",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        <span
          className={`h-2.5 w-2.5 rounded-full ${accentStyles[accent]}`}
        />
      </div>

      <p className="text-3xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}

// I give each status its own color so the current decision is easy to identify.
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING:
      "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    ACCEPTED:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    DEFERRED:
      "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    DECLINED: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {formatLabel(status)}
    </span>
  );
}

// Urgency has separate colors because it is different from the decision status.
function UrgencyBadge({ urgency }: { urgency: string }) {
  const styles: Record<string, string> = {
    CRITICAL: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    HIGH: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
    MEDIUM:
      "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-200",
    LOW: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
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