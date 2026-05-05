import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md md:ml-64 pb-24 md:pb-0">
      <Sidebar />
      <main className="max-w-4xl mx-auto px-container-margin py-16">
        <p className="font-label-bold text-label-bold text-primary uppercase mb-sm">Progress</p>
        <h1 className="font-headline-xl text-headline-xl gradient-text mb-md">Your presence receipts will live here.</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          After more coaching sessions, this page can show patterns, affirmations, completed tracks, and the nonverbal skills you are practicing.
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
