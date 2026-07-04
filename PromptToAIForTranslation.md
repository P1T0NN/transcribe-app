# Prompt for AI — Spanish SRT → English SRT

Use this **every time** you paste a timed `.srt` from TranscribeApp into ChatGPT (or another AI).  
The app already synced cues to the speech. Your job in translation is to **change only the words**, not the timing structure.

---

## Prompt to paste (always use this)

Copy everything inside the block below, then paste your Spanish SRT **under it**.

```
You are translating a subtitle file from Spanish to English.

RULES (must follow all):

1. Output ONLY valid SRT. No introduction, no explanation, no markdown code fences.

2. Do NOT change:
   - cue numbers (1, 2, 3, …)
   - timestamp lines (HH:MM:SS,mmm --> HH:MM:SS,mmm)
   - the number of cues
   - the order of cues

3. Do NOT merge, split, or add subtitle cues. One input cue = one output cue.

4. Translate ONLY the subtitle text lines (the lines after each timestamp). Leave blank lines between cues exactly as in SRT format.

5. English is often longer than Spanish. Keep each cue readable in the SAME time window:
   - Prefer natural, concise English (same meaning, fewer words when needed).
   - Do not pad with extra words.
   - If a literal translation is too long, rephrase shorter — do not move text to another cue.

6. Preserve speaker tone (informal stays informal). Fix grammar in English; do not summarize or omit meaning.

7. Do not translate sound labels if they appear as tags, e.g. keep "(laughter)" or translate consistently as "(laughter)" not a sentence.

8. Before you finish, silently verify:
   - same cue count as input
   - every timestamp line byte-identical to input
   - every cue number unchanged
   - only text lines differ

Spanish SRT to translate:

```

Then paste the full Spanish SRT from the app.

---

## Why these rules exist

| Risk | What the prompt prevents |
|------|---------------------------|
| AI rewrites timestamps | Subtitles drift out of sync with video |
| AI merges/splits cues | Timing no longer matches when words were spoken |
| Longer English text | Same cue window still works if phrasing stays concise |
| Extra commentary | Breaks `.srt` import in editors and players |

TranscribeApp builds cues of **at most 3 Spanish words** with pauses respected. English may need **more words in the same cue** — that is OK for players; the prompt asks the AI to **compress wording**, not **change timestamps**.

---

## Optional follow-up (if output looks wrong)

If the AI changed timestamps or cue count, reply with:

```
Your last output broke the SRT rules. Regenerate from the original Spanish SRT.
Keep every cue number and every timestamp line EXACTLY as in the input.
Change only the subtitle text lines. Same number of cues. SRT only, no commentary.
```

Then paste the **original Spanish SRT** again (not the bad English output).

---

## Quick checklist before you use the English file

- [ ] Same number of blocks as the Spanish file  
- [ ] Timestamps match the Spanish file line-for-line  
- [ ] File ends with a blank line after the last cue (optional but fine)  
- [ ] No `\`\`\`` markdown fences in the file  
- [ ] Save as `.srt` with UTF-8 encoding  

---

## Example (structure only)

**Input cue**

```srt
12
00:01:02,480 --> 00:01:04,120
No me lo creo
```

**Good output**

```srt
12
00:01:02,480 --> 00:01:04,120
I can't believe it
```

**Bad output** (do not accept)

- Changed timestamp: `00:01:02,500 --> ...`
- Split into two cues
- Added explanation above the SRT
- Wrapped in markdown code blocks

---

## Tip

Download the Spanish `.srt` from the app, paste into the AI with the prompt above, copy the English result into a new `.srt` file, and spot-check 3–5 cues against the video before doing the whole file.
