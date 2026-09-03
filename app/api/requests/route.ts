import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const validUrgencies = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const problemStatement =
      typeof body.problemStatement === "string"
        ? body.problemStatement.trim()
        : "";

    const expectedImpact =
      typeof body.expectedImpact === "string"
        ? body.expectedImpact.trim()
        : "";

    const urgency =
      typeof body.urgency === "string" ? body.urgency : "";

    // I validate the request here too so invalid data cannot bypass the form.
    if (!title || !problemStatement || !expectedImpact || !urgency) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (title.length > 120) {
      return NextResponse.json(
        { error: "Title must be 120 characters or less." },
        { status: 400 }
      );
    }

    if (
      !validUrgencies.includes(
        urgency as (typeof validUrgencies)[number]
      )
    ) {
      return NextResponse.json(
        { error: "Invalid urgency value." },
        { status: 400 }
      );
    }

    // I save the validated request to PostgreSQL with Pending as the default status.
    const newRequest = await prisma.request.create({
      data: {
        title,
        problemStatement,
        expectedImpact,
        urgency: urgency as (typeof validUrgencies)[number],
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Failed to create request:", error);

    return NextResponse.json(
      { error: "Unable to create request." },
      { status: 500 }
    );
  }
}