import { requireAdmin } from "@/lib/adminAuth";
import * as data from "@/lib/data";
import PlayerForm from "@/components/admin/PlayerForm";
import { createPlayer } from "@/app/admin/data-actions";

export default async function NewPlayerPage() {
  await requireAdmin(["owner", "manager"]);
  const fundraiser = await data.getFundraiser();
  if (!fundraiser) return <p className="text-rampage-gray">No fundraiser found.</p>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-rampage-purple-dark">Add Player</h1>
      <PlayerForm action={createPlayer} fundraiserId={fundraiser.id} submitLabel="Add Player" />
    </div>
  );
}
