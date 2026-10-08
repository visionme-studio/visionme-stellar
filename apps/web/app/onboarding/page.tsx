"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export type ProfileData = {
  name: string;
  email: string;
  goal: string;
};

type OnboardingContextValue = {
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    goal: "",
  });

  const value = useMemo(() => ({ profileData, setProfileData }), [profileData]);

  return (
    <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return ctx;
}

function Step3Profile() {
  const { profileData, setProfileData } = useOnboarding();

  return (
    <div className="space-4">
      <label className="block text-sm font-medium text-slate-300" htmlFor="name">
        Nombre
      </label>
      <input
        id="name"
        name="name"
        type="text"
        value={profileData.name}
        onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
        placeholder="Tu nombre"
      />
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { profileData } = useOnboarding();

  const handleContinue = () => {
    router.push("/avatar-selection");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-xl">
        <h1 className="text-2xl font-bold">Crea tu perfil</h1>
        <p className="mt-2 text-sm text-slate-400">
          Cuentanos un poco sobre ti para personalizar tu experiencia.
        </p>

        <div className="mt-6">
          <Step3Profile />
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!profileData.name.trim()}
          className="mt-8 w-full rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white disabled:opacity-50 hover:bg-indigo-400"
        >
          Continuar
        </button>
      </div>
    </main>
  );
}
