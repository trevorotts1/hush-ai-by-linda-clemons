"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: firstName, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Store user in session storage for the session
      sessionStorage.setItem("hush_user", JSON.stringify(data.user));
      router.push("/mode-select");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* MOBILE LAYOUT */}
      <main className="md:hidden min-h-screen bg-background text-on-surface font-body-md flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center px-container-margin py-lg w-full max-w-[480px] mx-auto relative z-10">
          <header className="w-full text-center mb-lg">
            <h1 className="font-headline-xl text-headline-xl text-primary mb-md tracking-tighter">
              Hush
            </h1>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">
              Welcome into the room.
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-[320px] mx-auto">
              Your presence is requested. Begin your journey with Ms. Linda.
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="w-full bg-surface-container-lowest rounded-2xl shadow-card border border-surface-variant p-md flex flex-col gap-md"
          >
            <div className="flex flex-col gap-xs">
              <label className="font-label-bold text-label-bold text-on-surface uppercase" htmlFor="name">
                First Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-surface rounded-xl border border-outline-variant py-sm px-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                placeholder="Your first name"
              />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-bold text-label-bold text-on-surface uppercase" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface rounded-xl border border-outline-variant py-sm pl-[40px] pr-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-bold text-label-bold text-on-surface uppercase" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-surface rounded-xl border border-outline-variant py-sm px-sm font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                placeholder="(555) 123-4567"
              />
            </div>

            {error && (
              <p className="text-error font-label-sm text-label-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-secondary text-on-primary font-label-bold text-label-bold py-sm px-md rounded-xl flex items-center justify-center gap-xs shadow-floating hover:shadow-floating-hover transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                arrow_forward
              </span>
              {loading ? "Starting..." : "Begin Your Session"}
            </button>
          </form>
        </div>
      </main>

      {/* DESKTOP LAYOUT */}
      <main className="hidden md:flex bg-background text-on-surface font-body-md min-h-screen items-center justify-center p-4 antialiased">
        <div className="w-full max-w-[420px] mx-auto bg-surface-container-lowest rounded-[32px] card-shadow overflow-hidden relative flex flex-col min-h-[800px] md:min-h-[700px]">
          <div className="h-64 relative w-full overflow-hidden shrink-0">
            <img src="/images/hush-hero.jpg" alt="Hush" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-container-lowest" />
          </div>

          <div className="flex-1 flex flex-col px-md pb-xl pt-sm relative z-10 -mt-12 bg-surface-container-lowest rounded-t-[32px]">
            <div className="text-center mb-xl">
              <h1 className="font-headline-xl text-headline-xl gradient-text mb-sm tracking-tighter">
                Hush
              </h1>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">
                Welcome into the room
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Your presence is requested.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-md flex-1">
              <div className="flex flex-col gap-sm">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-bold text-label-bold text-on-surface ml-xs" htmlFor="name-desk">
                    First Name
                  </label>
                  <input
                    id="name-desk"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-variant rounded-xl py-4 px-4 font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent transition-all input-shadow outline-none"
                    placeholder="Your first name"
                  />
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="font-label-bold text-label-bold text-on-surface ml-xs" htmlFor="email-desk">
                    Email
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                      mail
                    </span>
                    <input
                      id="email-desk"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-container-low border border-surface-variant rounded-xl py-4 pl-12 pr-4 font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent transition-all input-shadow outline-none"
                      placeholder="hello@example.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="font-label-bold text-label-bold text-on-surface ml-xs" htmlFor="phone-desk">
                    Phone
                  </label>
                  <input
                    id="phone-desk"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-variant rounded-xl py-4 px-4 font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent transition-all input-shadow outline-none"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {error && (
                <p className="text-error font-label-sm text-label-sm">{error}</p>
              )}

              <div className="mt-auto pt-lg">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {loading ? "Starting..." : "Begin Your Session"}
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
