import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md md:ml-64 pb-24 md:pb-0">
      <Sidebar />
      <main className="max-w-4xl mx-auto px-container-margin py-16">
        <p className="font-label-bold text-label-bold text-primary uppercase mb-sm">Hush Library</p>
        <h1 className="font-headline-xl text-headline-xl gradient-text mb-md">Your quiet room is being prepared.</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          This section will hold saved lessons, affirmations, session insights, and Hush book notes. For now, keep coaching with Ms. Linda in the chat room.
        </p>
      </main>
      <BottomNav />
    </div>
  );
}
