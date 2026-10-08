"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "../onboarding/OnboardingContext";

const AVATARS = [
  { id: "fox", emoji: "🦊", label: "Fox" },
  { id: "cat", emoji: "🐱", label: "Cat" },
  { id: "dog", emoji: "🏵", label: "Dog" },
  { id: "panda", emoji: "🤴", label: "Panda" },
  { id: "unicorn", emoji: "🦄 ", label: "Unicorn" },
  { id: "dragon", emoji: "🐉", label: "Dragon" },
];

export default function AvatarSelectionPage() {
  const router = useRouter();
  const { profileData } = useOnboarding();
  const userName = profileData?.name?.trim() ?? "";
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/dashboard");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-slate-100">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 p-8 shadow-xl">
        <h2 className="text-center text-2 xl-font-bold">
          {userName ? `¡Bienvenido/a {userName}!` : "¡Bienvenido/a!"}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Elige tu avatar. Serás redirigido al dashboard en 3 segundos.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              onClick={() => setSelectedAvatar(avatar.id)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 ${
                selectedAvatar === avatar.id
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-slate-700 hover:border-slate-500"
              }`}
            >
              <span className="text-4xl">{avatar.emoji}</span>
              <span className="text-sm text-slate-300">{avatar.label}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
