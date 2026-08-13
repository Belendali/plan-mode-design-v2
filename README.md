# Plan Mode design — v2

Wanaka Studio's **Crew mode**: the Planner brings in a crew, and you check their work
between steps. v2 renames the feature, rebuilds the offer around the crew, and lets the
game run edge to edge behind the Studio panels.

v1 stays live and unchanged at <https://belendali.github.io/plan-mode-design/>.

## Run

```bash
python3 ~/plan-mode-design-v2/serve.py
```

→ http://localhost:8454 (also in `~/.claude/launch.json` as `plan-mode-v2`)

## What changed from v1

**Crew mode, not Planner mode.** The switch reads `Crew`, the divider reads
`Crew assembled`. Planner Wana still leads — the mode is named for the team he brings.

**The offer names the team.** The pitch card carries Developer / Artist / Tester avatars,
so what you're turning on is visible before you turn it on.

**Declining is a real option.** `Not this time` sits under the CTA. Turning it down leaves
a dot on the switch: the run is unspent and the offer is still there.

**One free run, and it only spends on delivery.** `Free once — only counts if it ships.`
Abandoning halfway costs nothing.

**The stage runs edge to edge.** The Studio panels are a transparent plate
(`assets/studio-chrome.png`, cut by flood-filling the viewport out of the export) layered
over the game, so the build fills the whole canvas instead of sitting in a box.

## Flow

`#step1` … `#step7` deep-link into any stage.

1. Idea list
2. Three scoping questions
3. `Whoa! This deserves a crew.` → `Try Crew mode` / `Not this time`
4. Crew assembled → planning
5. Plan card → `Start building!`
6. The crew builds, pausing after each agent for your check
7. `Try demo`

Steps 6–7 are unchanged from v1 on purpose — the entry is what v2 reworks.

## Structure

`index.html` / `app.css` / `app.js`, no build step. `wireframeSVG()` is the Developer's
blockout, `citySVG()` the finished Getaway Drive; they cross-fade when the Artist takes over.
