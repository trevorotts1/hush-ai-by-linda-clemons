// Branded avatar for Ms. Linda.
//
// NOTE (P2-1): a real approved photo of Linda Clemons is a client-provided
// asset. Until it is supplied, this renders a premium monogram mark. Drop a
// file at /public/images/linda.jpg and set `usePhoto` and it will show the
// photo automatically. The `speaking` prop drives the gold speaking-ring.
import Image from "next/image";

const HAS_PHOTO = false; // flip to true once /public/images/linda.jpg is provided

export default function LindaAvatar({
  size = "md",
  speaking = false,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  speaking?: boolean;
}) {
  const dim =
    size === "sm" ? "w-9 h-9 text-[12px]" :
    size === "lg" ? "w-16 h-16 text-lg" :
    size === "xl" ? "w-24 h-24 text-2xl" :
    "w-11 h-11 text-sm";

  return (
    <div
      className={`${dim} relative rounded-full shrink-0 overflow-hidden ${speaking ? "speaking-ring ring-2 ring-gold" : "ring-1 ring-outline-variant"}`}
      aria-label="Ms. Linda"
    >
      {HAS_PHOTO ? (
        <Image src="/images/linda.jpg" alt="Ms. Linda Clemons" fill sizes="96px" className="object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#3d1a63] via-[#6f00d2] to-[#a259ff] flex items-center justify-center">
          <span className="font-serif font-semibold text-on-primary tracking-tight">LC</span>
        </div>
      )}
    </div>
  );
}
