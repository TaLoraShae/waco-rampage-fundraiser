/**
 * Resets the prototype's local JSON "database" back to the original
 * seed data (12+ sample players, sample donations, sample sponsors).
 *
 * Usage:  npm run reset-data
 */
const fs = require("fs");
const path = require("path");

const dbFile = path.join(process.cwd(), "data", "db.json");

if (fs.existsSync(dbFile)) {
  fs.unlinkSync(dbFile);
  console.log("Deleted existing data/db.json.");
} else {
  console.log("No existing data/db.json found.");
}

console.log("Done. The next request to the app will regenerate fresh seed data.");
console.log("(Start the app with `npm run dev` and load any page to regenerate it now.)");
