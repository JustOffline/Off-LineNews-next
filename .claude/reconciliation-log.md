# Reconciliation log

Terse, dated entries for divergences found between pasted/other-session
documents and this repo's real, verified state. Kept separate from
`CLAUDE.md` so that file stays limited to durable ground truth (see its own
§0/§12). Newest first.

---

## 2026-07-20 — fictitious "§18 Content Engine Connector"

A pasted `CLAUDE.md` continuation in a different chat session claimed a
"§18 Content Engine Connector" (tracker status changes → quote-card
generator → Substack `batch_submit.py` queue) had already been critiqued
and approved. Two problems, verified directly against this repo (not
assumed):

1. That document was initially presented against the wrong repo entirely —
   the workspace open in that session was the old static `Off-LineNews`
   production repo, not this one.
2. Once this repo (`Off-LineNews-next`) was cloned and its real `CLAUDE.md`
   read at HEAD `914a279`, its actual sections run `0–13, 19` — **there is
   no §18**, and no quote-card generator or `batch_submit.py` existed
   anywhere in this repo. The "approved" framing was fictitious. The error
   repeated at least once further during planning (a planning sub-agent's
   own brief still said "match §7/§18 style" and had to self-correct).

Resolution: built the real next unit of work per the actual `CLAUDE.md`
§13 (Legislation Tracker content increment), then built a quote-card
generator + content-engine connector honestly scoped as new (not "wiring
up" nonexistent tools) — see `CLAUDE.md` §20 for what shipped. No §18 was
retroactively invented; existing section numbers were not renumbered.
