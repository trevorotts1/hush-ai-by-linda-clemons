import { errorMessage } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";
import { createUser, getUser } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, phone, first_name } = await req.json();

    if (!email || !first_name) {
      return NextResponse.json({ error: "Email and first name required" }, { status: 400 });
    }

    // Check if user exists
    const existing = await getUser(email);
    if (existing) {
      return NextResponse.json({ user: existing, new: false });
    }

    // Create new user
    const user = await createUser(email, phone || "", first_name);
    return NextResponse.json({ user, new: true });
  } catch (error: unknown) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
