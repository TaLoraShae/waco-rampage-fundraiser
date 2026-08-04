# Replacing Your GitHub Repo Files (Browser Only — No Installs)

This walks through updating your existing GitHub repository with the
redesigned project, one screen at a time. You will not install
anything on your computer — everything happens in your web browser.
Once your GitHub repo is updated, Vercel will automatically rebuild
and redeploy your live site within a minute or two.

---

## Before you start

You should have:

- The new ZIP file: `waco-rampage-fundraiser.zip`
- Your existing GitHub repository already connected to Vercel (from
  your first deployment)

Unzip the file first. On most computers, double-clicking a `.zip` file
extracts it into a regular folder automatically — you don't need any
extra software for this. You should end up with a folder named
something like `waco-rampage` containing files like `package.json`,
`README.md`, a `src` folder, and so on.

---

## Step 1 — Open your repository on GitHub

1. Go to **github.com** and log in.
2. Click your profile picture (top right) → **Your repositories**.
3. Click the repository you created for this project (e.g.
   `waco-rampage-fundraiser`).

You'll land on the repo's main page, showing a file/folder list.

---

## Step 2 — Delete the old files

We're replacing everything, so it's cleanest to clear the repo first.

1. Click on each top-level item in the file list (folders like `src`,
   `public`, `docs`, and files like `package.json`, `README.md`, etc.)
2. For each one: click into it, then click the trash-can icon (or the
   **"..."** menu → **Delete file**) in the top right of the file view,
   then scroll down and click the green **Commit changes** button.

   *Faster alternative:* GitHub also lets you delete multiple files in
   one commit using its web editor. Click the pencil/edit icon on the
   repo's code tab, select all files, delete them, and commit once.
   If you don't see this option, deleting folder-by-folder as above
   works fine too — it just takes a few more clicks.

Don't worry about getting every single file — anything left over that
isn't in the new version simply won't be used, but for a completely
clean swap it's best to remove everything first.

---

## Step 3 — Upload the new files

1. On your (now empty, or nearly empty) repository's main page, click
   **Add file** → **Upload files**.
2. Open the unzipped `waco-rampage` folder on your computer in a
   second window (Finder on Mac, File Explorer on Windows).
3. Select **everything inside** that folder (not the folder itself —
   go inside it first, then select all: `Cmd+A` on Mac or `Ctrl+A` on
   Windows).
4. **Drag all of that selected content** onto the GitHub upload page
   in your browser. GitHub will show a list of files being staged for
   upload, including nested folders like `src/app/...`.
5. Scroll down to the **Commit changes** section. You can leave the
   default message or type something like "Redesign: Waco Rampage
   branding".
6. Click the green **Commit changes** button.

GitHub will take a moment to upload everything (there are quite a few
files). Wait until the page finishes and shows your repo's updated
file list.

> **Tip:** If your browser has trouble uploading everything in one
> drag (some browsers limit how many files at once), do it in two or
> three batches — for example, drag the `src` folder first and commit,
> then drag `public`, `docs`, and the remaining root files and commit
> again. Multiple commits are completely fine.

---

## Step 4 — Watch Vercel redeploy automatically

1. Go to **vercel.com** and open your project (the one connected to
   this GitHub repo).
2. Click the **Deployments** tab.
3. You should see a new deployment appear within a minute, triggered
   automatically by your GitHub commit, with a status of "Building."
4. Wait for it to turn green ("Ready"). This usually takes 1–3
   minutes.
5. Click the deployment to open your live site and confirm the new
   design and logo are showing.

That's it — no local installs, no command line, no software setup.

---

## If something looks wrong

- **Build failed on Vercel:** Click the failed deployment and read the
  build log. The most common cause of a failed upload is a missing or
  incomplete folder (e.g., only part of `src` got uploaded). Re-upload
  the missing folder and commit again — Vercel will automatically
  retry.
- **Old design still showing:** Do a hard refresh in your browser
  (`Cmd+Shift+R` on Mac, `Ctrl+Shift+R` on Windows) — your browser may
  be showing a cached version of the old page.
- **Logo looks wrong:** Confirm `public/images/team-logo.png` was
  included in your upload — check for it directly on the GitHub file
  list.
