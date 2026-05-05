import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md md:ml-64 pb-24 md:pb-0">
      <Sidebar />
      <main className="max-w-4xl mx-auto px-container-margin py-16">
        <p className="font-label-bold text-label-bold text-primary uppercase mb-sm">Settings</p>
        <h1 className="font-headline-xl text-headline-xl gradient-text mb-md">Session settings are coming next.</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Voice preferences, saved profile details, and session controls will live here. Current sessions stay private and close after the idle timeout.
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
