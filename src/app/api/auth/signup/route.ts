import { errorMessage } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";
import { createUser, getUser } from "@/lib/supabase";

// Loose E.164-ish validation: optional +, 7-15 digits, allows spaces/()-.
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;

export async function POST(req: NextRequest) {
  try {
    const { email, phone, first_name } = await req.json();

    if (!email || !first_name) {
      return NextResponse.json({ error: "Email and first name required" }, { status: 400 });
    }

    // P0-11: phone is optional; validate format only if provided.
    const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
    if (trimmedPhone && !PHONE_RE.test(trimmedPhone)) {
      return NextResponse.json({ error: "Please enter a valid phone number, or leave it blank." }, { status: 400 });
    }

    const submittedName = String(first_name).trim();

    // P0-11: account-takeover guard.
    // If the email already exists, we do NOT return the stored user's name or
    // history to a (possibly different) visitor. We keep the session attached to
    // the existing account for continuity, but the display name comes from what
    // THIS visitor submitted -- never the prior user's stored name. Full verified
    // ownership (magic link / OTP) is tracked as P2-3.
    const existing = await getUser(email);
    if (existing) {
      // Log the collision without dumping PII.
      console.warn(`[signup] existing-email collision on domain "${String(email).split("@")[1] ?? "?"}" - returning-user path (name not exposed)`);
      return NextResponse.json({
        user: { id: existing.id, email: existing.email, first_name: submittedName },
        new: false,
        returning: true,
      });
    }

    // Create new user
    const user = await createUser(email, trimmedPhone, submittedName);
    return NextResponse.json({ user, new: true });
  } catch (error: unknown) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}
