import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { PastEvent } from "@/models/PastEvent";

export const dynamic = "force-dynamic"; // Ensure this endpoint isn't cached statically

export async function GET() {
  try {
    await connectDB();
    
    // Fetch all past events and sort them by date (ascending)
    // The frontend also sorts, but good to have a default order here
    const events = await PastEvent.find({}).sort({ date: 1 }).lean();

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Error fetching past events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}