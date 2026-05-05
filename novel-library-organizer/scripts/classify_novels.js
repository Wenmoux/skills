#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const EXTENSIONS = new Set([".epub", ".txt"]);
const DEFAULT_REPORT = "小说分类整理报告.md";
const DEFAULT_CSV = "小说分类清单.csv";
const REVIEW_CATEGORY = "待分类";

const CATEGORIES = [
  "玄幻", "奇幻", "仙侠", "武侠", "都市", "现实", "历史", "军事", "科幻", "游戏", "体育",
  "无限流", "悬疑推理", "灵异恐怖", "轻小说", "同人", "言情", "耽美纯爱",
  "文学", "传记纪实", "社科", "龙族", "成人", REVIEW_CATEGORY
];

const IGNORED_DIRS = new Set([".git", "node_modules", "novel-library-organizer", "_skill_novel-library-organizer"]);

const ADULT_MARKERS = [
  "h合集", "瑟瑟", "调教", "欲望", "成人", "情色", "朱颜血", "黑蕾丝",
  "红粉佳人", "侯爵嫡男好色", "母亲是俏黄蓉", "代女而嫁"
];

const AMBIGUOUS_MARKERS = [
  "女帝", "皇帝", "帝王", "王妃", "皇后", "公主", "大唐", "大明", "三国",
  "秦", "宋", "清", "重生", "系统", "神豪", "诡", "异闻", "怪谈"
];

const RULES = [
  ["龙族", ["龙族", "路明非", "龙王：世界的重启", "哀悼之翼", "没钱上大学的我只能去屠龙"]],
  ["同人", ["同人", "火影", "柯南", "霍格沃茨", "哈利波特", "美漫", "dc", "奥特", "型月", "综英美", "一人之", "舰娘", "艾泽拉斯", "魔兽", "弗雷尔卓德", "决斗都市", "训练家", "游戏王"]],
  ["悬疑推理", ["悬疑", "推理", "侦探", "探案", "破案", "刑侦", "本格", "罪案", "凶案", "杀人", "名侦探", "贝克街", "福尔摩斯", "谜案", "嫌疑人", "狄公案", "簪中录", "唐案", "狂探", "诡案组", "警探", "盗墓笔记", "兰亭序杀局"]],
  ["灵异恐怖", ["灵异", "恐怖", "惊悚", "怪谈", "鬼差", "女鬼", "鬼屋", "阴间", "殡葬", "赶坟", "乩身", "禁忌", "神秘复苏", "民调局", "冒险屋", "深夜书屋", "明克街", "招魂"]],
  ["无限流", ["无限流", "诸天", "轮回", "副本", "主神", "王牌进化", "最终进化", "末日乐园", "序列玩家", "从姑获鸟开始", "同时穿越", "诸界末日在线"]],
  ["科幻", ["科幻", "赛博", "星际", "未来", "机甲", "机武", "末世", "末日", "废土", "生化", "三体", "球状闪电", "银河", "深空", "宇宙", "机器人", "科技", "黑科技", "时空", "异常生物见闻录", "黎明之剑", "第一序列", "希灵帝国"]],
  ["游戏", ["网游", "游戏", "电竞", "玩家", "全职高手", "亏成首富从游戏开始", "这游戏也太真实", "模拟器", "救世游戏", "神明模拟器", "奥比岛", "六边形打野"]],
  ["体育", ["体育", "足球", "篮球", "网球", "冠军", "教练", "球员", "联赛", "俱乐部", "nba", "世界杯"]],
  ["仙侠", ["仙侠", "修真", "修仙", "现代修真", "神话修真", "仙葫", "赤城", "大道争锋", "凡人", "飞升", "长生", "成仙", "寻仙", "灵剑山", "太浩", "烂柯棋缘", "佛本是道", "仙国", "仙穹", "仙楚", "仙剑", "诛仙", "蜀山", "飘邈", "斩仙", "道祖是克苏鲁"]],
  ["武侠", ["武侠", "综武", "江湖", "侠女", "大侠", "武林", "国术", "杯雪", "楚留香", "七种武器", "天下刀宗", "雪中悍刀行", "那年那蝉那把剑", "风云", "少年歌行", "一瓣河川"]],
  ["历史", ["历史", "架空历史", "穿越历史", "临高启明", "宰执天下", "覆汉", "绍宋", "唐砖", "秦吏", "唐残", "挽明", "新宋", "北宋", "司礼监", "锦衣", "食南之徒"]],
  ["奇幻", ["奇幻", "西幻", "魔法", "骑士", "法师", "巫妖", "猎魔", "精灵", "矮人", "王国", "蒸汽"]],
  ["玄幻", ["玄幻", "东方玄幻", "异界", "异世", "魔王", "神官", "勇者", "王座", "武圣", "武道", "高武", "气血", "完美世界", "斗破苍穹", "武动乾坤", "将夜", "诡秘之主", "宿命之环", "天启预报", "我就是神"]],
  ["军事", ["军事", "军旅", "军官", "特种", "战隼", "重坦", "弹道", "火力", "佣兵"]],
  ["耽美纯爱", ["耽美", "纯爱", "bl", "主攻", "主受", "双男主"]],
  ["言情", ["女频", "古言", "言情", "恋爱", "青春校园", "校园", "青梅", "女友", "男友", "长相思", "长风渡", "有匪", "最好的我们", "北城有雪", "娘子", "女将星"]],
  ["都市", ["都市", "都市异能", "都市生活", "官场", "官路", "权财", "娱乐", "明星", "文娱", "房客", "房东", "医生", "医者", "手术", "御医", "职场", "生活", "美食", "老师", "教授", "学霸", "材料帝国", "首富", "冲浪", "纯真年代", "半岛检察官"]],
  ["现实", ["现实", "现实主义", "行业", "乡村", "家庭", "社会", "创业"]],
  ["轻小说", ["轻小说", "动漫", "日常", "东京", "日本", "re：", "从零开始", "言叶之庭", "柴刀流", "天使变成废柴", "佐佐良镇", "二次元"]],
  ["传记纪实", ["传记", "回忆录", "纪实", "报告文学", "口述史", "人物传"]],
  ["社科", ["社科", "经济", "管理", "心理", "哲学", "社会学", "人类学"]],
  ["文学", ["文学", "名著", "散文", "随笔", "马尔克斯", "余秋雨", "川端康成", "雾都孤儿", "红楼梦", "金瓶梅", "西游记", "文化苦旅", "平原上的摩西"]]
];

function parseArgs(argv) {
  const args = {
    root: process.cwd(),
    execute: false,
    report: DEFAULT_REPORT,
    csv: DEFAULT_CSV,
    overrides: null,
    requireConfirmed: false,
    allowUnconfirmed: false
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--execute") args.execute = true;
    else if (a === "--root") args.root = argv[++i];
    else if (a === "--report") args.report = argv[++i];
    else if (a === "--csv") args.csv = argv[++i];
    else if (a === "--overrides") args.overrides = argv[++i];
    else if (a === "--require-confirmed") args.requireConfirmed = true;
    else if (a === "--allow-unconfirmed") args.allowUnconfirmed = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  args.root = path.resolve(args.root);
  return args;
}

function normalizePunctuation(text) {
  return String(text)
    .replaceAll("［", "[")
    .replaceAll("］", "]")
    .replaceAll("【", "[")
    .replaceAll("】", "]")
    .replaceAll("（", "(")
    .replaceAll("）", ")")
    .replaceAll("：", ":");
}

function norm(text) {
  return normalizePunctuation(text).toLowerCase();
}

function compact(text) {
  return norm(text).replace(/[\s._\-—·《》「」『』()【】\[\]：:，,、|｜]/g, "");
}

function hasMarker(context, compactContext, marker) {
  return context.includes(norm(marker)) || compactContext.includes(compact(marker));
}

function cleanAuthor(author) {
  return String(author || "")
    .replace(/^作者[:：]?/i, "")
    .replace(/^by\s*/i, "")
    .replace(/[著作]\s*$/g, "")
    .trim();
}

function looksLikeAuthor(text) {
  const value = cleanAuthor(text);
  if (!value || value.length > 18) return false;
  if (isNoiseTag(value)) return false;
  if (/[章节卷部篇集本册]/.test(value)) return false;
  if (/^\d+$/.test(value)) return false;
  return /[\p{Script=Han}A-Za-z0-9]/u.test(value);
}

function isNoiseTag(tag) {
  const value = norm(tag).trim();
  return (
    /^v?\d+(?:\.\d+)*$/.test(value) ||
    /多看|精校|校对|完结|全本|重置|插图|目录|epub|txt|by青衫剑客|by楝|by鬼/.test(value)
  );
}

function parseFilename(file) {
  const rawName = path.basename(file);
  const ext = path.extname(rawName);
  const rawBase = rawName.slice(0, rawName.length - ext.length);
  const normalized = normalizePunctuation(rawBase);
  const tags = [];
  normalized.replace(/\[([^\]]+)\]/g, (_, tag) => {
    tags.push(tag.trim());
    return "";
  });

  let author = "";
  const leadingBracket = normalized.match(/^\s*\[([^\]]+)\]\s*[._\-— ]*(.+)$/);
  if (leadingBracket && looksLikeAuthor(leadingBracket[1]) && !CATEGORIES.includes(leadingBracket[1])) {
    author = cleanAuthor(leadingBracket[1]);
  }
  for (const tag of tags) {
    const authorMatch = tag.match(/^(.+?)\s*(?:著|作)$/) || tag.match(/^作者[:：]?\s*(.+)$/);
    if (authorMatch && !author) author = cleanAuthor(authorMatch[1]);
  }

  const explicitAuthor = normalized.match(/作者[:：]\s*([^\s()[\]《》]+)/);
  if (explicitAuthor && !author) author = cleanAuthor(explicitAuthor[1]);

  const trailingParen = normalized.match(/[（(]([^()[\]《》]+)[）)]\s*$/);
  if (trailingParen && !author && looksLikeAuthor(trailingParen[1])) {
    author = cleanAuthor(trailingParen[1]);
  }

  let title = "";
  const titleMatch = normalized.match(/《([^》]+)》/);
  if (titleMatch) title = titleMatch[1].trim();

  let working = normalized
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/《([^》]+)》/g, "$1")
    .replace(/作者[:：]\s*[^\s()[\]《》]+/g, " ")
    .replace(/[（(]([^()[\]《》]+)[）)]\s*$/g, (_, value) => looksLikeAuthor(value) ? " " : ` ${value} `)
    .replace(/\b[vV]\d+(?:\.\d+)*\b/g, " ")
    .replace(/校对|精校|多看|全本|完结|重置版|插图版|目录/g, " ")
    .replace(/^\s*[A-Z]{1,6}[-_]\d+\s*/i, " ")
    .replace(/^\s*\d+[_-][A-Z]{1,6}[_-]?\d*\s*/i, " ")
    .trim();

  if (!title) {
    const parts = working.split(/\s*[-－—]\s*/).filter(Boolean);
    if (parts.length > 1 && looksLikeAuthor(parts[parts.length - 1])) {
      if (!author) author = cleanAuthor(parts[parts.length - 1]);
      working = parts.slice(0, -1).join("-");
    }
    title = working.trim();
  }

  if (!title) title = rawBase.trim();

  const categoryTags = tags
    .map((tag) => tag.trim())
    .filter((tag) => CATEGORIES.includes(tag) && tag !== REVIEW_CATEGORY);

  const usefulTags = tags.filter((tag) => !isNoiseTag(tag) && !/^by/i.test(tag) && !/著|作者/.test(tag));
  const classificationText = [title, ...categoryTags, ...usefulTags].filter(Boolean).join(" ");

  return {
    raw_name: rawName,
    raw_base: rawBase,
    title,
    author,
    tags,
    category_tags: [...new Set(categoryTags)],
    classification_text: classificationText || title || rawBase,
    search_query: [title, author].filter(Boolean).join(" ")
  };
}

function loadOverrides(file) {
  if (!file) return [];
  const data = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
  return Object.entries(data).map(([key, value]) => ({ key, ...value }));
}

function overrideMatches(parsed, override) {
  const key = compact(override.match || override.title || override.key);
  if (!key) return false;
  if (override.match_raw_name) {
    return [parsed.raw_name, parsed.raw_base].map(compact).some((value) => value === key);
  }
  return [parsed.title, parsed.raw_base, parsed.raw_name]
    .map(compact)
    .some((value) => value === key || value.includes(key) || key.includes(value));
}

function collectFiles(root, out = []) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name) && !entry.name.startsWith("_skill_")) collectFiles(full, out);
    } else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      out.push(full);
    }
  }
  return out.sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}

function matchedMarkers(text, markers) {
  const context = norm(text);
  const compactContext = compact(text);
  return markers.filter((marker) => hasMarker(context, compactContext, marker));
}

function classify(file, overrides = []) {
  const parsed = parseFilename(file);

  for (const o of overrides) {
    if (overrideMatches(parsed, o)) {
      return {
        ...parsed,
        category: o.category,
        candidate_category: o.category,
        confidence: o.confidence || "联网确认",
        reason: o.reason || `覆盖表确认：${o.key}`,
        source: o.source || "",
        needs_web: false
      };
    }
  }

  const titleContext = parsed.classification_text;
  const authorHits = parsed.author ? matchedMarkers(parsed.author, [...AMBIGUOUS_MARKERS, ...CATEGORIES]) : [];

  const adultHits = matchedMarkers(titleContext, ADULT_MARKERS);
  if (adultHits.length) {
    return {
      ...parsed,
      category: "成人",
      candidate_category: "成人",
      confidence: "显式线索",
      reason: `标题/标签含成人显式线索：${adultHits.slice(0, 3).join("、")}`,
      source: "",
      needs_web: false
    };
  }

  if (parsed.category_tags.length) {
    return {
      ...parsed,
      category: parsed.category_tags[0],
      candidate_category: parsed.category_tags[0],
      confidence: "待联网确认",
      reason: `候选：显式分类标签 ${parsed.category_tags.join("、")}`,
      source: "",
      needs_web: true
    };
  }

  const ruleMatches = [];
  for (const [category, markers] of RULES) {
    const hits = matchedMarkers(titleContext, markers);
    if (hits.length) ruleMatches.push({ category, hits });
  }

  const ambiguousHits = matchedMarkers(titleContext, AMBIGUOUS_MARKERS);
  if (ruleMatches.length) {
    const first = ruleMatches[0];
    const more = ruleMatches.slice(1).map((m) => `${m.category}:${m.hits[0]}`);
    const notes = [`候选：标题/标签命中 ${first.category} 线索 ${first.hits.slice(0, 3).join("、")}`];
    if (more.length) notes.push(`同时命中 ${more.join("；")}`);
    if (ambiguousHits.length) notes.push(`含多义词 ${ambiguousHits.slice(0, 3).join("、")}，需查来源确认`);
    if (authorHits.length) notes.push(`作者名线索已忽略：${authorHits.slice(0, 3).join("、")}`);
    return {
      ...parsed,
      category: first.category,
      candidate_category: first.category,
      confidence: "待联网确认",
      reason: notes.join("；"),
      source: "",
      needs_web: true
    };
  }

  const notes = ["缺少可靠题材来源，需联网确认"];
  if (ambiguousHits.length) notes.push(`标题含多义词：${ambiguousHits.slice(0, 3).join("、")}`);
  if (authorHits.length) notes.push(`作者名含题材词但已忽略：${authorHits.slice(0, 3).join("、")}`);
  return {
    ...parsed,
    category: REVIEW_CATEGORY,
    candidate_category: "",
    confidence: "待联网确认",
    reason: notes.join("；"),
    source: "",
    needs_web: true
  };
}

function rel(root, file) {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

function samePath(a, b) {
  return path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
}

function uniqueDestination(root, src, category, reserved) {
  const targetDir = path.join(root, category || REVIEW_CATEGORY);
  const parsed = path.parse(src);
  const base = path.join(targetDir, path.basename(src));

  function free(candidate) {
    const key = path.resolve(candidate).toLowerCase();
    return !reserved.has(key) && (!fs.existsSync(candidate) || samePath(candidate, src));
  }

  if (free(base)) {
    reserved.add(path.resolve(base).toLowerCase());
    return base;
  }

  let sameSize = false;
  try {
    sameSize = fs.statSync(base).size === fs.statSync(src).size;
  } catch (_) {}
  const tag = sameSize ? "重复" : "重名";
  for (let i = 1; i < 1000; i++) {
    const candidate = path.join(targetDir, `${parsed.name}__${tag}${i}${parsed.ext}`);
    if (free(candidate)) {
      reserved.add(path.resolve(candidate).toLowerCase());
      return candidate;
    }
  }
  throw new Error(`Cannot make unique destination for ${src}`);
}

function currentFolder(root, file) {
  const parts = rel(root, file).split("/");
  return parts.length > 1 ? parts[0] : "(根目录)";
}

function makePlan(root, files, overrides, options = {}) {
  const reserved = new Set();
  return files.map((src) => {
    const d = classify(src, overrides);
    const destinationCategory = options.requireConfirmed && d.needs_web ? REVIEW_CATEGORY : d.category;
    const dest = uniqueDestination(root, src, destinationCategory, reserved);
    return {
      original_path: rel(root, src),
      current_folder: currentFolder(root, src),
      parsed_title: d.title,
      parsed_author: d.author,
      search_query: d.search_query,
      candidate_category: d.candidate_category,
      category: destinationCategory,
      confidence: d.confidence,
      reason: d.reason,
      source: d.source || "",
      needs_web: d.needs_web ? "是" : "否",
      destination_path: rel(root, dest),
      action: samePath(src, dest) ? "keep" : "move"
    };
  });
}

function csvCell(v) {
  return `"${String(v ?? "").replaceAll('"', '""')}"`;
}

function writeCsv(file, rows) {
  const headers = [
    "original_path", "current_folder", "parsed_title", "parsed_author", "search_query", "candidate_category",
    "category", "confidence", "reason", "source", "needs_web", "destination_path", "action"
  ];
  const lines = [headers.map(csvCell).join(",")];
  for (const row of rows) lines.push(headers.map((h) => csvCell(row[h])).join(","));
  fs.writeFileSync(file, "\uFEFF" + lines.join("\r\n"), "utf8");
}

function groupedCounts(rows, key) {
  const map = new Map();
  for (const row of rows) map.set(row[key], (map.get(row[key]) || 0) + 1);
  return [...map.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]), "zh-Hans-CN"));
}

function writeReport(file, root, rows, executed, options = {}) {
  const moved = rows.filter((r) => r.action === "move").length;
  const pending = rows.filter((r) => r.needs_web === "是");
  const confirmed = rows.filter((r) => r.needs_web === "否" && r.source);
  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.category)) grouped.set(row.category, []);
    grouped.get(row.category).push(row);
  }

  const lines = [
    "# 小说分类整理报告",
    "",
    `- 生成时间：${new Date().toLocaleString("zh-CN", { hour12: false })}`,
    `- 扫描范围：\`${root}\` 下所有 \`.epub\` / \`.txt\` 文件`,
    `- 执行状态：${executed ? "已移动重排" : "dry-run，仅生成计划"}`,
    `- require-confirmed：${options.requireConfirmed ? "是" : "否"}`,
    `- 文件总数：${rows.length}`,
    `- 需要移动：${moved}`,
    `- 待联网确认：${pending.length}`,
    "",
    "## 分类统计",
    "",
    "| 分类 | 数量 |",
    "| --- | ---: |"
  ];
  for (const [k, v] of groupedCounts(rows, "category")) lines.push(`| ${k} | ${v} |`);

  lines.push("", "## 置信度统计", "", "| 置信度 | 数量 |", "| --- | ---: |");
  for (const [k, v] of groupedCounts(rows, "confidence")) lines.push(`| ${k} | ${v} |`);

  if (confirmed.length) {
    lines.push("", "## 来源确认条目", "", "| 文件 | 标题 | 作者 | 分类 | 依据 | 来源 |", "| --- | --- | --- | --- | --- | --- |");
    for (const row of confirmed) lines.push(`| \`${row.destination_path}\` | ${row.parsed_title} | ${row.parsed_author || ""} | ${row.category} | ${row.reason} | ${row.source} |`);
  }

  if (pending.length) {
    lines.push("", "## 待联网确认条目", "", "| 文件 | 标题 | 作者 | 候选分类 | 当前去向 | 依据 |", "| --- | --- | --- | --- | --- | --- |");
    for (const row of pending) lines.push(`| \`${row.original_path}\` | ${row.parsed_title} | ${row.parsed_author || ""} | ${row.candidate_category || ""} | ${row.category} | ${row.reason} |`);
  }

  lines.push("", "## 分类明细", "");
  for (const [category, group] of [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0], "zh-Hans-CN"))) {
    group.sort((a, b) => a.destination_path.localeCompare(b.destination_path, "zh-Hans-CN"));
    lines.push(`### ${category}（${group.length}）`);
    for (const row of group) {
      const action = row.action === "move" ? "移动" : "保留";
      const candidate = row.candidate_category && row.candidate_category !== row.category ? `；候选 ${row.candidate_category}` : "";
      lines.push(`- \`${row.destination_path}\`（${action}；${row.confidence}${candidate}；${row.reason}）`);
    }
    lines.push("");
  }
  fs.writeFileSync(file, lines.join("\n"), "utf8");
}

function executeMoves(root, rows, options = {}) {
  const pending = rows.filter((row) => row.needs_web === "是");
  if (pending.length && !options.allowUnconfirmed) {
    throw new Error(`Refusing to execute: ${pending.length} rows still need web confirmation. Add overrides or pass --allow-unconfirmed.`);
  }

  for (const category of CATEGORIES) fs.mkdirSync(path.join(root, category), { recursive: true });
  for (const row of rows) {
    if (row.action !== "move") continue;
    const src = path.join(root, row.original_path);
    const dest = path.join(root, row.destination_path);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (!fs.existsSync(src)) throw new Error(`Source missing: ${row.original_path}`);
    if (fs.existsSync(dest) && !samePath(src, dest)) throw new Error(`Destination exists: ${row.destination_path}`);
    fs.renameSync(src, dest);
  }
}

function main() {
  const args = parseArgs(process.argv);
  const overrides = loadOverrides(args.overrides);
  let rows = makePlan(args.root, collectFiles(args.root), overrides, args);
  if (args.execute) {
    executeMoves(args.root, rows, args);
    rows = makePlan(args.root, collectFiles(args.root), overrides, args);
  }
  const report = path.join(args.root, args.report);
  const csv = path.join(args.root, args.csv);
  writeCsv(csv, rows);
  writeReport(report, args.root, rows, args.execute, args);
  console.log(`files=${rows.length}`);
  console.log(`remaining_moves=${rows.filter((r) => r.action === "move").length}`);
  console.log(`pending_web_confirmation=${rows.filter((r) => r.needs_web === "是").length}`);
  console.log(`report=${report}`);
  console.log(`csv=${csv}`);
}

if (require.main === module) main();

module.exports = {
  parseFilename,
  classify,
  makePlan,
  collectFiles
};
