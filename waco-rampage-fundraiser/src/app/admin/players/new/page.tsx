"use client";

import { useRouter } from "next/navigation";
import PlayerForm from "@/components/admin/PlayerForm";
import { useDataStore } from "@/lib/store";

export default function NewPlayerPage() {
  const { createPlayer } = useDataStore();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-rampage-purple-dark">Add Player</h1>
      <PlayerForm
        submitLabel="Add Player"
        onSubmit={(values) => {
          const result = createPlayer({ ...values, active: true });
          if (result.ok) router.push("/admin/players");
          return result;
        }}
      />
    </div>
  );
}
