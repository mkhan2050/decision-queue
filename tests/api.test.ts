import { beforeEach, describe, expect, it, vi } from "vitest";

// I mock Prisma here so the tests focus on my API validation and workflow.
const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    request: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  default: prismaMock,
}));

import { POST } from "@/app/api/requests/route";
import { PATCH } from "@/app/api/requests/[id]/route";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("request creation API", () => {
  it("creates a valid request", async () => {
    prismaMock.request.create.mockResolvedValue({
      id: 1,
      title: "Improve mobile checkout",
      problemStatement: "Users have trouble checking out on mobile.",
      expectedImpact: "Improve conversion and reduce abandonment.",
      urgency: "HIGH",
      status: "PENDING",
    });

    const request = new Request("http://localhost/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Improve mobile checkout",
        problemStatement: "Users have trouble checking out on mobile.",
        expectedImpact: "Improve conversion and reduce abandonment.",
        urgency: "HIGH",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(prismaMock.request.create).toHaveBeenCalledOnce();
  });

  it("rejects a request with missing required fields", async () => {
    const request = new Request("http://localhost/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "",
        problemStatement: "",
        expectedImpact: "",
        urgency: "HIGH",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(prismaMock.request.create).not.toHaveBeenCalled();
  });

  it("rejects an invalid urgency", async () => {
    const request = new Request("http://localhost/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Add export",
        problemStatement: "Teams need reporting exports.",
        expectedImpact: "Save reporting time.",
        urgency: "SUPER_HIGH",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(prismaMock.request.create).not.toHaveBeenCalled();
  });
});

describe("request decision API", () => {
  it("saves a valid decision with a reason", async () => {
    prismaMock.request.findUnique.mockResolvedValue({
      id: 1,
      status: "PENDING",
    });

    prismaMock.request.update.mockResolvedValue({
      id: 1,
      status: "ACCEPTED",
      decisionReason: "Strong customer impact.",
    });

    const request = new Request("http://localhost/api/requests/1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "ACCEPTED",
        decisionReason: "Strong customer impact.",
      }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "1" }),
    });

    expect(response.status).toBe(200);
    expect(prismaMock.request.update).toHaveBeenCalledOnce();
  });

  it("rejects an invalid decision", async () => {
    const request = new Request("http://localhost/api/requests/1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "MAYBE",
        decisionReason: "Not a real status.",
      }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "1" }),
    });

    expect(response.status).toBe(400);
    expect(prismaMock.request.update).not.toHaveBeenCalled();
  });

  it("requires a decision reason", async () => {
    const request = new Request("http://localhost/api/requests/1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "DEFERRED",
        decisionReason: "",
      }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "1" }),
    });

    expect(response.status).toBe(400);
    expect(prismaMock.request.update).not.toHaveBeenCalled();
  });
});
