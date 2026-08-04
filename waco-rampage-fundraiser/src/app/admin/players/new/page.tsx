import PlayerForm from "@/components/admin/PlayerForm";
import { createPlayer } from "@/app/actions";

export default function NewPlayerPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-rampage-purple-dark">Add Player</h1>
      <PlayerForm action={createPlayer} submitLabel="Add Player" />
    </div>
  );
}
