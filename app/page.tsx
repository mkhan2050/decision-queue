import Link from "next/link";
import prisma from "@/lib/prisma";

type HomePageProps = {
  searchParams: Promise<{
    status?: string;
    urgency?: string;
    sort?: string;
    q?: string;
  }>;
};

const validStatuses = ["PENDING", "ACCEPTED", "DEFERRED", "DECLINED"];
const validUrgencies = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const urgencyRank: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export default async function Home({ searchParams }: HomePageProps) {
  const filters = await searchParams;

  const status =
    filters.status && validStatuses.includes(filters.status)
      ? filters.status
      : undefined;

  const urgency =
    filters.urgency && validUrgencies.includes(filters.urgency)
      ? filters.urgency
      : undefined;

  const sort = filters.sort ?? "urgency";
  const search = filters.q?.trim() ?? "";

  // I build the filters from the URL so the current queue view can survive refreshes.
  let requests = await prisma.request.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(urgency ? { urgency: urgency as never } : {}),
      ...(search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                problemStatement: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                expectedImpact: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },
    orderBy:
      sort === "newest"
        ? { createdAt: "desc" }
        : sort === "oldest"
          ? { createdAt: "asc" }
          : { createdAt: "desc" },
  });

  // I sort urgency myself so Critical > High > Medium > Low.
  if (sort === "urgency") {
    requests = requests.sort(
      (a, b) =>
        (urgencyRank[b.urgency] ?? 0) -
        (urgencyRank[a.urgency] ?? 0)
    );
  }

  const [
    totalRequests,
    pendingRequests,
    acceptedRequests,
    deferredRequests,
  ] = await Promise.all([
    prisma.request.count(),
    prisma.request.count({ where: { status: "PENDING" } }),
    prisma.request.count({ where: { status: "ACCEPTED" } }),
    prisma.request.count({ where: { status: "DEFERRED" } }),
  ]);

  const reviewedRequests = totalRequests - pendingRequests;
  const completionPercent =
    totalRequests === 0
      ? 0
      : Math.round((reviewedRequests / totalRequests) * 100);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-[calc(100%-40px)] max-w-none px-0 py-8 sm:w-[calc(100%-56px)] lg:w-[calc(100%-72px)]">
        <header className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500" />

          <div className="flex flex-col gap-8 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-100">
                  DQ
                </div>

                <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  Product request review
                </span>

                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Live queue
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-5xl font-bold tracking-[-0.025em] text-slate-950">
                  Decision Queue
                </h1>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                  {totalRequests} {totalRequests === 1 ? "request" : "requests"}
                </span>
              </div>

              <p className="mt-3 max-w-3xl text-[17px] leading-7 text-slate-500">
                Prioritize incoming product requests, review the expected impact,
                and record clear decisions for the team.
              </p>

              <div className="mt-4 flex max-w-md items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>

                <span className="whitespace-nowrap text-xs font-semibold text-slate-400">
                  {reviewedRequests}/{totalRequests} reviewed · {completionPercent}%
                </span>
              </div>
            </div>

            <Link
              href="/requests/new"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-md"
            >
              <span className="text-lg leading-none">+</span>
              New Request
            </Link>
          </div>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total requests"
            value={totalRequests}
            description="All submitted requests"
            accent="slate"
            icon="01"
            href="/"
          />

          <SummaryCard
            label="Pending"
            value={pendingRequests}
            description="Awaiting a decision"
            accent="amber"
            icon="02"
            href="/?status=PENDING"
          />

          <SummaryCard
            label="Accepted"
            value={acceptedRequests}
            description="Approved to move forward"
            accent="emerald"
            icon="03"
            href="/?status=ACCEPTED"
          />

          <SummaryCard
            label="Deferred"
            value={deferredRequests}
            description="Saved for later review"
            accent="indigo"
            icon="04"
            href="/?status=DEFERRED"
          />
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight text-slate-950">
                      Request Queue
                    </h2>

                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                      {pendingRequests} awaiting decision
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Search, filter, prioritize, and review incoming requests.
                  </p>
                </div>
              </div>

              {/* I use one GET form so search, filters, and sorting work together. */}
              <form
                method="GET"
                className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_auto_auto_auto_auto_auto]"
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    ⌕
                  </span>

                  <input
                    type="search"
                    name="q"
                    defaultValue={search}
                    placeholder="Search requests..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                <select
                  name="status"
                  defaultValue={status ?? ""}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-300"
                >
                  <option value="">All statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="DEFERRED">Deferred</option>
                  <option value="DECLINED">Declined</option>
                </select>

                <select
                  name="urgency"
                  defaultValue={urgency ?? ""}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-300"
                >
                  <option value="">All urgencies</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>

                <select
                  name="sort"
                  defaultValue={sort}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-300"
                >
                  <option value="urgency">Highest urgency</option>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>

                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Apply
                </button>

                <Link
                  href="/"
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-center text-[15px] font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                >
                  Reset
                </Link>
              </form>
            </div>
          </div>

          <div className="bg-slate-50/70 p-4 sm:p-5">
            {requests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl text-indigo-600">
                  ⌕
                </div>

                <h3 className="text-lg font-semibold text-slate-900">
                  No requests found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing the current filters or create a new request.
                </p>

                <Link
                  href="/requests/new"
                  className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
                >
                  + New Request
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <article
                    key={request.id}
                    className={`group overflow-hidden rounded-2xl border border-slate-200 border-l-4 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${getUrgencyStripe(
                      request.urgency
                    )}`}
                  >
                    <div className="flex flex-col gap-5 px-6 py-6 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-slate-400">
                            Request #{String(request.id).padStart(3, "0")}
                          </span>

                          <span className="text-slate-300">•</span>

                          <span className="text-xs text-slate-400">
                            {request.createdAt.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>

                          <StatusBadge status={request.status} />
                          <UrgencyBadge urgency={request.urgency} />
                        </div>

                        <h3 className="text-xl font-bold tracking-tight text-slate-950">
                          {request.title}
                        </h3>

                        <p className="mt-2 max-w-3xl text-[15px] leading-7 text-slate-500">
                          {request.problemStatement}
                        </p>

                        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                          <p className="text-[15px] leading-7 text-slate-600">
                            <span className="font-semibold text-slate-800">
                              Expected impact:
                            </span>{" "}
                            {request.expectedImpact}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/requests/${request.id}`}
                        className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-600 hover:text-white lg:self-center"
                      >
                        Review request
                        <span className="transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">
          <p>Decision Queue</p>
          <p>Built by Muneeb Khan</p>
        </footer>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  description,
  accent,
  icon,
  href,
}: {
  label: string;
  value: number;
  description: string;
  accent: "slate" | "amber" | "emerald" | "indigo";
  icon: string;
  href: string;
}) {
  const accentStyles = {
    slate: {
      dot: "bg-slate-900",
      icon: "bg-slate-100 text-slate-600",
      bar: "bg-slate-900",
    },
    amber: {
      dot: "bg-amber-500",
      icon: "bg-amber-50 text-amber-700",
      bar: "bg-amber-500",
    },
    emerald: {
      dot: "bg-emerald-500",
      icon: "bg-emerald-50 text-emerald-700",
      bar: "bg-emerald-500",
    },
    indigo: {
      dot: "bg-indigo-500",
      icon: "bg-indigo-50 text-indigo-700",
      bar: "bg-indigo-500",
    },
  };

  const styles = accentStyles[accent];

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
    >
      <div className={`h-1 ${styles.bar}`} />

      <div className="p-6">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-[15px] font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-[13px] text-slate-400">{description}</p>
          </div>

          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${styles.icon}`}
          >
            {icon}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <p className="text-4xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <span className={`mb-2 h-2.5 w-2.5 rounded-full ${styles.dot}`} />
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING:
      "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    ACCEPTED:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    DEFERRED:
      "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
    DECLINED:
      "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
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
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[urgency] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {formatLabel(urgency)}
    </span>
  );
}

function getUrgencyStripe(urgency: string) {
  const styles: Record<string, string> = {
    CRITICAL: "border-l-red-500",
    HIGH: "border-l-orange-400",
    MEDIUM: "border-l-amber-400",
    LOW: "border-l-slate-300",
  };

  return styles[urgency] ?? "border-l-slate-300";
}

function formatLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
