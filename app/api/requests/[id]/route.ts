import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const validDecisions = ["ACCEPTED", "DEFERRED", "DECLINED"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestId = Number(id);
    const body = await request.json();

    if (!Number.isInteger(requestId) || requestId <= 0) {
      return NextResponse.json(
        { error: "Invalid request ID." },
        { status: 400 }
      );
    }

    const status =
      typeof body.status === "string" ? body.status : "";

    const decisionReason =
      typeof body.decisionReason === "string"
        ? body.decisionReason.trim()
        : "";

    // I only allow the three final decision options here.
    if (
      !validDecisions.includes(
        status as (typeof validDecisions)[number]
      )
    ) {
      return NextResponse.json(
        { error: "Choose a valid decision." },
        { status: 400 }
      );
    }

    // I require a reason so every decision has useful context.
    if (!decisionReason) {
      return NextResponse.json(
        { error: "A decision reason is required." },
        { status: 400 }
      );
    }

    const existingRequest = await prisma.request.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: "Request not found." },
        { status: 404 }
      );
    }

    // I update only the review fields so the original request stays unchanged.
    const updatedRequest = await prisma.request.update({
      where: {
        id: requestId,
      },
      data: {
        status: status as (typeof validDecisions)[number],
        decisionReason,
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Failed to update request:", error);

    return NextResponse.json(
      { error: "Unable to update request." },
      { status: 500 }
    );
  }
}