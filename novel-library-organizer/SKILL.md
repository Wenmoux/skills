---
name: novel-library-organizer
description: Organize, verify, deeply archive, and present Chinese novel libraries containing EPUB/TXT files with genre folders, rich Markdown/CSV database fields, and a static pixel-style web library. Use when Codex is asked to classify, confirm, rearrange, move, audit, document, tag, analyze, build a bookshelf UI for, or create a database from Chinese web novels, light novels, fan fiction, mixed book collections, or book folders where filenames may contain author names, packager tags, misleading keywords, or unclear genres. Prefer web verification and source-backed override manifests over keyword-only classification.
---

# Novel Library Organizer

## Workflow

1. Inventory the target folder recursively for `.epub` and `.txt`; ignore non-novel artifacts unless the user asks otherwise.
2. Read [references/taxonomy.md](references/taxonomy.md) before finalizing category decisions.
3. Run the helper script in dry-run mode. Treat the output as a candidate manifest, not a final decision list. The script also creates a static pixel-style web library HTML:

```powershell
node "<skill>/scripts/classify_novels.js" --root "<target-folder>" --require-confirmed
```

Optional output controls:

```powershell
node "<skill>/scripts/classify_novels.js" --root "<target-folder>" --html "我的书库.html"
node "<skill>/scripts/classify_novels.js" --root "<target-folder>" --no-html
```

4. Review every row with `needs_web=是` in `小说分类清单.csv`. Search exact title first, then exact title + author when an author was parsed. Prefer official platform pages, publisher/retailer pages, encyclopedia/catalog pages, author pages, and stable book databases.
5. For each confirmed row, fill the deep archive fields: `category`, `subtags` (at least three when evidence allows), `audience`, `perspective`, `appeal`, `completion_status`, `reason`, and `source`. Use content/summary only as evidence; do not force a field when it is not knowable.
6. Put confirmed results in an overrides JSON file. Use the real work title as the key; do not key overrides only by author name.

```json
{
  "鹤唳玉京": {
    "category": "悬疑推理",
    "subtags": ["古风探案", "验尸", "权谋"],
    "audience": "女频",
    "perspective": "第三人称",
    "appeal": "古风案件推进和人物关系张力",
    "completion_status": "已完结",
    "confidence": "联网确认",
    "reason": "简介含验尸、古风案件线，核心卖点是探案",
    "source": "https://example.com/book-page"
  },
  "某本书名": {
    "category": "玄幻",
    "subtags": ["东方玄幻", "女帝", "升级流"],
    "audience": "男频",
    "perspective": "待确认",
    "appeal": "身份压迫后的逆袭升级",
    "completion_status": "连载中",
    "confidence": "联网确认",
    "reason": "平台标注为东方玄幻；文件中的“女帝666”为作者名，不作为历史题材依据",
    "source": "https://example.com/book-page"
  }
}
```

7. Rerun dry-run with overrides. Keep using `--require-confirmed` so unconfirmed rows stay in `待分类` instead of being moved into guessed shelves.

```powershell
node "<skill>/scripts/classify_novels.js" --root "<target-folder>" --overrides ".\分类覆盖.json" --require-confirmed
```

8. Execute moves only when all rows are confirmed, or when the user explicitly accepts unresolved rows. The script blocks `--execute` while unconfirmed rows remain unless `--allow-unconfirmed` is provided.

```powershell
node "<skill>/scripts/classify_novels.js" --root "<target-folder>" --overrides ".\分类覆盖.json" --require-confirmed --execute
```

9. Audit completion against real files:
   - Root folder has zero remaining `.epub/.txt` unless intentionally excluded.
   - Every CSV `destination_path` exists after execution.
   - Category counts in the report match actual files in category folders.
   - Report includes source-backed confirmed rows, unresolved review rows, deep archive field coverage, and the generated web library path.

## Classification Rules

- Never treat filename keywords as final classification. Keywords are only search hints unless they appear in an explicit category tag such as `[玄幻]`, and even explicit tags should be source-checked when accuracy matters.
- Parse title and author before matching keywords. Ignore category-like words inside author names, packager tags, and release tags. Example: `书名-女帝666.epub` or `作者：女帝666` must not be classified as 历史 because of `女帝`.
- Treat multi-genre words as ambiguous: `女帝`、`皇帝`、`王妃`、`重生`、`系统`、`大唐`、`大明`、`诡`、`龙族` can point to multiple shelves. Confirm the work page or synopsis before moving.
- Use only categories listed in `references/taxonomy.md`; do not create one-off IP/title shelves such as `龙族`. Override JSON categories must also use the allowed shelf names.
- Keep the online prompt's useful dimensions, but operationalize them as database fields: core category, subtags, audience, narrative perspective, appeal/pain point, completion status, and suggested folder name.
- For subtags, prefer platform tags and synopsis traits. If fewer than three tags are source-supported, keep candidate tags visibly provisional instead of inventing certainty.
- Infer `audience` from platform channel and content positioning, not from the author's gender or a single relationship keyword. Use `男频`, `女频`, or `无性别偏向`.
- Infer `perspective` only from content/summary evidence. A title beginning with `我` is not enough to confirm first-person narration.
- Use one primary shelf per file. Choose the shelf a reader would most likely browse first; record secondary traits only in the reason.
- Do not overwrite duplicates. Keep duplicate editions/versions unless the user explicitly asks for deduplication.
- For explicit adult material, classify from filename/metadata only; do not inspect private explicit content beyond what is needed.
- Generate both a Markdown report and CSV manifest for every run.
- If moving files outside the writable workspace requires permission, request escalation before executing moves.

## Helper Output

By default the script creates:

- `小说分类整理报告.md`
- `小说分类清单.csv`
- `小说像素书库.html`

Important CSV fields:

- `parsed_title`: title inferred from filename.
- `parsed_author`: author inferred from `作者：`、`著`、or trailing `-作者` patterns.
- `candidate_category`: offline candidate from tags/metadata/keywords.
- `category`: destination shelf for this run. With `--require-confirmed`, unconfirmed rows become `待分类`.
- `subtags`: fine-grained tags such as `系统流`、`无限流`、`破镜重圆`、`马甲文`; confirmed rows should normally have at least three.
- `audience`: `男频`、`女频`, or `无性别偏向`.
- `perspective`: `第一人称`、`第三人称`, or `待确认`.
- `appeal`: short editor-style note for the main hook,爽点, or虐点.
- `completion_status`: `连载中`、`已完结`、`大纲阶段`, or `待确认`.
- `suggested_folder_name`: `[频道]-[类型]-[主标签]-作品名`, sanitized for Windows filenames.
- `needs_web`: `是` means source-backed confirmation is still required.

The report should include scan scope, execution status, category counts, confidence counts, audience counts, status counts, source-backed confirmed rows, unresolved rows, per-category file details, and a link/path to the static pixel-style web library. The HTML should be self-contained, attractive, searchable/filterable, and use a wireframe + pixel-art visual language.
