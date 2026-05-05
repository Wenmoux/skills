---
name: novel-library-organizer
description: Organize and verify Chinese EPUB/TXT novel libraries into genre folders with Markdown/CSV audit reports, including optional special `龙族` shelf handling. Use when Codex is asked to classify, confirm, rearrange, move, audit, or document Chinese web novels, light novels, fan fiction, mixed book collections, or book folders where filenames may contain author names, packager tags, misleading keywords, or unclear genres. Prefer web verification and source-backed override manifests over keyword-only classification.
---

# Novel Library Organizer

## Workflow

1. Inventory the target folder recursively for `.epub` and `.txt`; ignore non-novel artifacts unless the user asks otherwise.
2. Read [references/taxonomy.md](references/taxonomy.md) before finalizing category decisions, and decide whether to preserve a dedicated `龙族` shelf or fold Dragon Raja titles back into content-based shelves.
3. Run the helper script in dry-run mode. Treat the output as a candidate manifest, not a final decision list:

```powershell
node "<skill>/scripts/classify_novels.js" --root "<target-folder>" --require-confirmed
```

4. Review every row with `needs_web=是` in `小说分类清单.csv`. Search exact title first, then exact title + author when an author was parsed. Prefer official platform pages, publisher/retailer pages, encyclopedia/catalog pages, author pages, and stable book databases.
5. Put confirmed results in an overrides JSON file. Use the real work title as the key; do not key overrides only by author name. For filenames that are easy to mis-match by substring, add `"match_raw_name": true` so the override only applies to the original file name.

```json
{
  "鹤唳玉京": {
    "category": "悬疑推理",
    "match_raw_name": true,
    "confidence": "联网确认",
    "reason": "简介含验尸、古风案件线，核心卖点是探案",
    "source": "https://example.com/book-page"
  },
  "某本书名": {
    "category": "玄幻",
    "confidence": "联网确认",
    "reason": "平台标注为东方玄幻；文件中的“女帝666”为作者名，不作为历史题材依据",
    "source": "https://example.com/book-page"
  }
}
```

6. Rerun dry-run with overrides. Keep using `--require-confirmed` so unconfirmed rows stay in `待分类` instead of being moved into guessed shelves.

```powershell
node "<skill>/scripts/classify_novels.js" --root "<target-folder>" --overrides ".\分类覆盖.json" --require-confirmed
```

7. Execute moves only when all rows are confirmed, or when the user explicitly accepts unresolved rows. The script blocks `--execute` while unconfirmed rows remain unless `--allow-unconfirmed` is provided.

```powershell
node "<skill>/scripts/classify_novels.js" --root "<target-folder>" --overrides ".\分类覆盖.json" --require-confirmed --execute
```

8. Audit completion against real files:
  - Root folder has zero remaining `.epub/.txt` unless intentionally excluded.
  - Every CSV `destination_path` exists after execution.
  - Category counts in the report match actual files in category folders.
   - Report includes source-backed confirmed rows, unresolved review rows, deep archive field coverage, and the generated web library path.

## Classification Rules

- Never treat filename keywords as final classification. Keywords are only search hints unless they appear in an explicit category tag such as `[玄幻]`, and even explicit tags should be source-checked when accuracy matters.
- Parse title and author before matching keywords. Ignore category-like words inside author names, packager tags, and release tags. Example: `书名-女帝666.epub` or `作者：女帝666` must not be classified as 历史 because of `女帝`.
- Treat multi-genre words as ambiguous: `女帝`、`皇帝`、`王妃`、`重生`、`系统`、`大唐`、`大明`、`诡` can point to multiple shelves. Confirm the work page or synopsis before moving.
- Treat `龙族` as a special collection shelf for Jiangnan's Dragon Raja universe, not a generic dragon keyword. Keep it only when the user wants a dedicated `龙族` folder or the existing library already uses one; otherwise classify Dragon Raja-related titles by content into `同人` or the primary genre shelf.
- Use one primary shelf per file. Choose the shelf a reader would most likely browse first; record secondary traits only in the reason.
- Do not overwrite duplicates. Keep duplicate editions/versions unless the user explicitly asks for deduplication.
- For explicit adult material, classify from filename/metadata only; do not inspect private explicit content beyond what is needed.
- Generate both a Markdown report and CSV manifest for every run.
- If moving files outside the writable workspace requires permission, request escalation before executing moves.

## Helper Output

By default the script creates:

- `小说分类整理报告.md`
- `小说分类清单.csv`

Important CSV fields:

- `parsed_title`: title inferred from filename.
- `parsed_author`: author inferred from `作者：`、`著`、or trailing `-作者` patterns.
- `candidate_category`: offline candidate from tags/metadata/keywords.
- `category`: destination shelf for this run. With `--require-confirmed`, unconfirmed rows become `待分类`.
- `needs_web`: `是` means source-backed confirmation is still required.

The report should include scan scope, execution status, category counts, confidence counts, source-backed confirmed rows, unresolved rows, and per-category file details.
