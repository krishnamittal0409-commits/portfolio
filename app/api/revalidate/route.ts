import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Called by the admin panel right after a save so the public homepage's
// cached HTML refreshes immediately instead of waiting for the next
// scheduled ISR revalidation.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ revalidated: false, message: "Invalid secret" }, { status: 401 });
  }

  revalidatePath("/");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}