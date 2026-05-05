#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const EXTENSIONS = new Set([".epub", ".txt"]);
const DEFAULT_REPORT = "小说分类整理报告.md";
const DEFAULT_CSV = "小说分类清单.csv";
const DEFAULT_HTML = "小说像素书库.html";
const REVIEW_CATEGORY = "待分类";

const CATEGORIES = [
  "玄幻", "奇幻", "仙侠", "武侠", "都市", "现实", "历史", "军事", "科幻", "游戏", "体育",
  "无限流", "悬疑推理", "灵异恐怖", "轻小说", "同人", "言情", "耽美纯爱",
  "文学", "传记纪实", "社科", "成人", REVIEW_CATEGORY
];

function assertAllowedCategory(category, context) {
  if (!CATEGORIES.includes(category)) {
    throw new Error(`Unsupported category for ${context}: ${category}. Use one of: ${CATEGORIES.join("、")}`);
  }
}

const IGNORED_DIRS = new Set([".git", "node_modules", "novel-library-organizer", "_skill_novel-library-organizer"]);

const ADULT_MARKERS = [
  "h合集", "瑟瑟", "调教", "欲望", "成人", "情色", "朱颜血", "黑蕾丝",
  "红粉佳人", "侯爵嫡男好色", "母亲是俏黄蓉", "代女而嫁"
];

const AMBIGUOUS_MARKERS = [
  "女帝", "皇帝", "帝王", "王妃", "皇后", "公主", "大唐", "大明", "三国",
  "秦", "宋", "清", "重生", "系统", "神豪", "诡", "异闻", "怪谈",
  "龙族", "路明非", "卡塞尔"
];

const RULES = [
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
  ["玄幻", ["玄幻", "东方玄幻", "异界", "异世", "魔王", "神官", "勇者", "王座", "完美世界", "斗破苍穹", "武动乾坤", "将夜", "诡秘之主", "宿命之环", "天启预报", "我就是神"]],
  ["军事", ["军事", "军旅", "军官", "特种", "战隼", "重坦", "弹道", "火力", "佣兵"]],
  ["耽美纯爱", ["耽美", "纯爱", "bl", "主攻", "主受", "双男主"]],
  ["言情", ["女频", "古言", "言情", "恋爱", "青春校园", "校园", "青梅", "女友", "男友", "长相思", "长风渡", "有匪", "最好的我们", "北城有雪", "娘子", "女将星"]],
  ["都市", ["都市", "都市异能", "都市生活", "官场", "官路", "权财", "娱乐", "明星", "文娱", "神豪", "房客", "房东", "医生", "医者", "手术", "御医", "职场", "生活", "美食", "老师", "教授", "学霸", "材料帝国", "首富", "冲浪", "纯真年代", "半岛检察官"]],
  ["现实", ["现实", "现实主义", "行业", "乡村", "家庭", "社会", "创业"]],
  ["轻小说", ["轻小说", "动漫", "日常", "东京", "日本", "re：", "从零开始", "言叶之庭", "柴刀流", "天使变成废柴", "佐佐良镇", "二次元"]],
  ["传记纪实", ["传记", "回忆录", "纪实", "报告文学", "口述史", "人物传"]],
  ["社科", ["社科", "经济", "管理", "心理", "哲学", "社会学", "人类学"]],
  ["文学", ["文学", "名著", "散文", "随笔", "马尔克斯", "余秋雨", "川端康成", "雾都孤儿", "红楼梦", "金瓶梅", "西游记", "文化苦旅", "平原上的摩西"]]
];

const TAG_RULES = [
  ["系统流", ["系统", "签到", "面板", "外挂", "金手指"]],
  ["升级流", ["升级", "修炼", "境界", "进阶", "练级", "变强"]],
  ["废柴逆袭", ["废柴", "逆袭", "退婚", "被逐", "赘婿"]],
  ["无敌流", ["无敌", "横推", "碾压"]],
  ["诸天流", ["诸天", "万界", "穿越诸天"]],
  ["无限流", ["无限流", "轮回", "副本", "主神"]],
  ["种田流", ["种田", "农家", "田园", "经营"]],
  ["经营建设", ["经营", "建设", "基建", "领主", "模拟经营"]],
  ["幕后流", ["幕后", "黑手", "马甲", "分身"]],
  ["第四天灾", ["第四天灾", "玩家", "沙盒"]],
  ["权谋", ["权谋", "朝堂", "宫斗", "宅斗", "争霸"]],
  ["争霸", ["争霸", "逐鹿", "开国", "帝国"]],
  ["赛博朋克", ["赛博", "义体", "霓虹"]],
  ["末世废土", ["末世", "末日", "废土"]],
  ["克苏鲁", ["克苏鲁", "不可名状", "旧日"]],
  ["黑科技", ["黑科技", "科技", "科研"]],
  ["电竞", ["电竞", "职业联赛", "全职高手"]],
  ["官场", ["官场", "官路", "仕途"]],
  ["文娱", ["文娱", "娱乐圈", "明星", "导演"]],
  ["神豪", ["神豪", "首富", "富豪"]],
  ["美食", ["美食", "厨", "食堂"]],
  ["医生", ["医生", "医者", "手术", "医院"]],
  ["古言", ["古言", "王妃", "皇后", "公主", "娘子"]],
  ["现言", ["现言", "都市言情", "现代言情"]],
  ["穿书", ["穿书", "穿成", "书中"]],
  ["重生", ["重生", "再来一世"]],
  ["破镜重圆", ["破镜重圆", "久别重逢", "旧爱"]],
  ["先婚后爱", ["先婚后爱", "契约婚姻", "闪婚"]],
  ["青梅竹马", ["青梅竹马", "竹马", "青梅"]],
  ["追妻火葬场", ["追妻", "火葬场"]],
  ["马甲文", ["马甲", "掉马"]],
  ["团宠", ["团宠", "全家宠"]],
  ["甜宠", ["甜宠", "甜文", "宠妻", "宠文"]],
  ["虐恋", ["虐恋", "虐文", "虐心"]],
  ["女强", ["女强", "女帝", "女将", "女尊"]],
  ["校园", ["校园", "青春", "同桌"]],
  ["纯爱", ["纯爱", "耽美", "BL", "双男主"]],
  ["百合", ["百合", "GL", "双女主"]],
  ["无CP", ["无CP", "无cp"]],
  ["同人", ["同人", "综漫", "综英美", "火影", "柯南", "霍格沃茨"]],
  ["二次元", ["二次元", "动漫", "东京", "轻小说"]],
  ["悬疑探案", ["悬疑", "推理", "探案", "刑侦", "破案"]],
  ["灵异怪谈", ["灵异", "怪谈", "鬼", "禁忌"]],
  ["民俗恐怖", ["民俗", "禁忌", "阴间", "殡葬"]],
  ["本格推理", ["本格", "密室", "诡计"]],
  ["刑侦", ["刑侦", "警探", "警察"]],
  ["成长流", ["成长", "少年", "学院"]],
  ["群像", ["群像", "众生", "多主角"]],
  ["治愈", ["治愈", "日常", "温馨"]]
];

const CATEGORY_DEFAULT_TAGS = {
  "玄幻": ["东方玄幻", "升级流", "成长流"],
  "奇幻": ["西幻", "冒险", "成长流"],
  "仙侠": ["修仙", "升级流", "宗门"],
  "武侠": ["江湖", "武道", "侠义"],
  "都市": ["都市生活", "事业线", "爽文"],
  "现实": ["现实主义", "行业", "社会议题"],
  "历史": ["历史架空", "权谋", "经营建设"],
  "军事": ["军事", "战场", "硬核"],
  "科幻": ["科幻", "技术想象", "未来世界"],
  "游戏": ["游戏", "玩家", "竞技"],
  "体育": ["体育竞技", "职业赛场", "成长流"],
  "无限流": ["无限流", "副本", "团队博弈"],
  "悬疑推理": ["悬疑探案", "线索推理", "案件"],
  "灵异恐怖": ["灵异怪谈", "惊悚", "民俗恐怖"],
  "轻小说": ["轻小说", "二次元", "日常"],
  "同人": ["同人", "IP衍生", "角色再创作"],
  "言情": ["情感关系", "人物成长", "情节张力"],
  "耽美纯爱": ["纯爱", "情感关系", "人物成长"],
  "文学": ["文学", "人物命运", "文本审美"],
  "传记纪实": ["纪实", "人物传", "时代切片"],
  "社科": ["社科", "知识阅读", "观点分析"],
  "成人": ["成人", "显式内容", "限制级"],
  [REVIEW_CATEGORY]: ["待确认", "待补全", "来源缺失"]
};

const APPEAL_BY_TAG = {
  "系统流": "系统机制带来的持续正反馈",
  "无限流": "副本闯关和生死博弈",
  "破镜重圆": "旧情复燃和情感拉扯",
  "马甲文": "身份隐藏与掉马反转",
  "权谋": "局势博弈和权力翻盘",
  "悬疑探案": "线索拼图和案件反转",
  "灵异怪谈": "禁忌氛围和未知恐惧",
  "经营建设": "从零建设带来的成长满足",
  "电竞": "赛场对抗和团队配合",
  "女强": "女性主角的主动破局",
  "甜宠": "稳定亲密关系和情绪治愈",
  "虐恋": "高压情感冲突和虐点释放"
};

const APPEAL_BY_CATEGORY = {
  "玄幻": "低起点成长和力量体系升级",
  "奇幻": "异世界冒险和世界观探索",
  "仙侠": "修行破境和长生求道",
  "武侠": "江湖恩怨和侠义抉择",
  "都市": "现实场景中的逆袭与事业爽点",
  "现实": "行业细节和社会处境共鸣",
  "历史": "历史框架下的权谋和建设",
  "军事": "硬核战斗、装备和任务推进",
  "科幻": "技术想象与未来危机",
  "游戏": "规则博弈、成长和竞技反馈",
  "体育": "训练成长和赛场胜负",
  "无限流": "副本挑战和团队生存博弈",
  "悬疑推理": "案件线索和真相揭示",
  "灵异恐怖": "未知恐惧和禁忌探索",
  "轻小说": "ACG风格角色互动和轻快节奏",
  "同人": "熟悉IP中的角色再创作",
  "言情": "亲密关系推进和情感张力",
  "耽美纯爱": "关系推进和人物情感成长",
  "文学": "人物命运、语言质感和主题表达",
  "传记纪实": "真实人物或时代切片的记录价值",
  "社科": "知识框架和观点启发",
  "成人": "显式成人内容",
  [REVIEW_CATEGORY]: "缺少可靠来源，等待补全归档信息"
};

function parseArgs(argv) {
  const args = {
    root: process.cwd(),
    execute: false,
    report: DEFAULT_REPORT,
    csv: DEFAULT_CSV,
    html: DEFAULT_HTML,
    overrides: null,
    requireConfirmed: false,
    allowUnconfirmed: false,
    writeHtml: true
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--execute") args.execute = true;
    else if (a === "--root") args.root = argv[++i];
    else if (a === "--report") args.report = argv[++i];
    else if (a === "--csv") args.csv = argv[++i];
    else if (a === "--html") args.html = argv[++i];
    else if (a === "--no-html") args.writeHtml = false;
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
  return Object.entries(data).map(([key, value]) => {
    assertAllowedCategory(value.category, `override ${key}`);
    return { key, ...value };
  });
}

function overrideMatches(parsed, override) {
  const key = compact(override.match || override.title || override.key);
  if (!key) return false;
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

function unique(values) {
  return [...new Set(values.filter(Boolean).map((v) => String(v).trim()).filter(Boolean))];
}

function normalizeTags(value) {
  if (Array.isArray(value)) return unique(value);
  if (!value) return [];
  return unique(String(value).split(/[、,，;；/|｜\s]+/));
}

function firstAllowed(value, allowed, fallback = "待确认") {
  return allowed.includes(value) ? value : fallback;
}

function inferSubtags(parsed, category, context) {
  const tags = [];
  for (const [tag, markers] of TAG_RULES) {
    if (matchedMarkers(context, markers).length) tags.push(tag);
  }
  for (const tag of CATEGORY_DEFAULT_TAGS[category] || CATEGORY_DEFAULT_TAGS[REVIEW_CATEGORY]) {
    if (tags.length >= 6) break;
    tags.push(tag);
  }
  return unique(tags).slice(0, 6);
}

function inferAudience(category, context) {
  const femaleHits = matchedMarkers(context, [
    "女频", "古言", "现言", "言情", "纯爱", "百合", "王妃", "皇后", "公主", "娘子",
    "破镜重圆", "先婚后爱", "追妻", "团宠", "甜宠", "虐恋", "女强"
  ]);
  const maleHits = matchedMarkers(context, [
    "男频", "玄幻", "仙侠", "修真", "争霸", "神豪", "官场", "军事", "网游", "电竞",
    "黑科技", "升级", "无敌", "种田流", "第四天灾"
  ]);
  if (category === "言情" || category === "耽美纯爱") return "女频";
  if (femaleHits.length && femaleHits.length >= maleHits.length) return "女频";
  if (["玄幻", "仙侠", "游戏", "体育", "军事"].includes(category)) return "男频";
  if (maleHits.length) return "男频";
  return "无性别偏向";
}

function inferPerspective(context) {
  if (matchedMarkers(context, ["第一人称", "一人称", "主观视角"]).length) return "第一人称";
  if (matchedMarkers(context, ["第三人称", "三人称", "上帝视角"]).length) return "第三人称";
  return "待确认";
}

function inferCompletionStatus(context) {
  if (matchedMarkers(context, ["大纲", "设定稿", "脑洞"]).length) return "大纲阶段";
  if (matchedMarkers(context, ["完结", "已完结", "全本", "完本"]).length) return "已完结";
  if (matchedMarkers(context, ["连载", "连载中", "更新至", "未完"]).length) return "连载中";
  return "待确认";
}

function inferAppeal(category, subtags) {
  for (const tag of subtags) {
    if (APPEAL_BY_TAG[tag]) return APPEAL_BY_TAG[tag];
  }
  return APPEAL_BY_CATEGORY[category] || APPEAL_BY_CATEGORY[REVIEW_CATEGORY];
}

function sanitizeSegment(text) {
  return String(text || "未命名")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60) || "未命名";
}

function channelFromAudience(audience) {
  if (audience === "男频") return "男频";
  if (audience === "女频") return "女频";
  return "综合";
}

function suggestedFolderName(title, category, subtags, audience) {
  const mainTag = (subtags && subtags[0]) || "待确认";
  return `[${channelFromAudience(audience)}]-[${sanitizeSegment(category)}]-[${sanitizeSegment(mainTag)}]-${sanitizeSegment(title)}`;
}

function enrichDecision(parsed, decision) {
  const category = decision.category || REVIEW_CATEGORY;
  const context = [
    parsed.classification_text,
    parsed.raw_base,
    parsed.tags.join(" "),
    decision.reason,
    decision.source
  ].filter(Boolean).join(" ");
  const subtags = normalizeTags(decision.subtags || decision.tags);
  const archiveSubtags = subtags.length ? subtags : inferSubtags(parsed, category, context);
  const audience = firstAllowed(decision.audience || decision.core_audience || inferAudience(category, context), ["男频", "女频", "无性别偏向"], "无性别偏向");
  const perspective = firstAllowed(decision.perspective || decision.narrative_perspective || inferPerspective(context), ["第一人称", "第三人称", "待确认"], "待确认");
  const completionStatus = firstAllowed(decision.completion_status || decision.status || inferCompletionStatus(context), ["连载中", "已完结", "大纲阶段", "待确认"], "待确认");
  const appeal = decision.appeal || decision.core_appeal || inferAppeal(category, archiveSubtags);
  const folderName = decision.suggested_folder_name || decision.suggested_folder || suggestedFolderName(parsed.title, category, archiveSubtags, audience);
  return {
    ...parsed,
    ...decision,
    subtags: archiveSubtags.join("、"),
    audience,
    perspective,
    appeal,
    completion_status: completionStatus,
    suggested_folder_name: folderName
  };
}

function classify(file, overrides = []) {
  const parsed = parseFilename(file);

  for (const o of overrides) {
    if (overrideMatches(parsed, o)) {
      assertAllowedCategory(o.category, `override ${o.key || o.title || o.match || parsed.title}`);
      return enrichDecision(parsed, {
        category: o.category,
        candidate_category: o.category,
        confidence: o.confidence || "联网确认",
        reason: o.reason || `覆盖表确认：${o.key}`,
        source: o.source || "",
        subtags: o.subtags || o.tags,
        audience: o.audience || o.core_audience,
        perspective: o.perspective || o.narrative_perspective,
        appeal: o.appeal || o.core_appeal,
        completion_status: o.completion_status || o.status,
        suggested_folder_name: o.suggested_folder_name || o.suggested_folder,
        needs_web: false
      });
    }
  }

  const titleContext = parsed.classification_text;
  const authorHits = parsed.author ? matchedMarkers(parsed.author, [...AMBIGUOUS_MARKERS, ...CATEGORIES]) : [];

  const adultHits = matchedMarkers(titleContext, ADULT_MARKERS);
  if (adultHits.length) {
    return enrichDecision(parsed, {
      category: "成人",
      candidate_category: "成人",
      confidence: "显式线索",
      reason: `标题/标签含成人显式线索：${adultHits.slice(0, 3).join("、")}`,
      source: "",
      needs_web: false
    });
  }

  if (parsed.category_tags.length) {
    return enrichDecision(parsed, {
      category: parsed.category_tags[0],
      candidate_category: parsed.category_tags[0],
      confidence: "待联网确认",
      reason: `候选：显式分类标签 ${parsed.category_tags.join("、")}`,
      source: "",
      needs_web: true
    });
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
    return enrichDecision(parsed, {
      category: first.category,
      candidate_category: first.category,
      confidence: "待联网确认",
      reason: notes.join("；"),
      source: "",
      needs_web: true
    });
  }

  const notes = ["缺少可靠题材来源，需联网确认"];
  if (ambiguousHits.length) notes.push(`标题含多义词：${ambiguousHits.slice(0, 3).join("、")}`);
  if (authorHits.length) notes.push(`作者名含题材词但已忽略：${authorHits.slice(0, 3).join("、")}`);
  return enrichDecision(parsed, {
    category: REVIEW_CATEGORY,
    candidate_category: "",
    confidence: "待联网确认",
    reason: notes.join("；"),
    source: "",
    needs_web: true
  });
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
    const subtags = destinationCategory === REVIEW_CATEGORY && d.needs_web ? CATEGORY_DEFAULT_TAGS[REVIEW_CATEGORY].join("、") : d.subtags;
    const suggestedName = suggestedFolderName(d.title, destinationCategory, normalizeTags(subtags), d.audience);
    return {
      original_path: rel(root, src),
      current_folder: currentFolder(root, src),
      parsed_title: d.title,
      parsed_author: d.author,
      search_query: d.search_query,
      candidate_category: d.candidate_category,
      category: destinationCategory,
      subtags,
      audience: d.audience,
      perspective: d.perspective,
      appeal: d.appeal,
      completion_status: d.completion_status,
      suggested_folder_name: suggestedName,
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
    "category", "subtags", "audience", "perspective", "appeal", "completion_status", "suggested_folder_name",
    "confidence", "reason", "source", "needs_web", "destination_path", "action"
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
    options.htmlFile ? `- 网页书库：\`${options.htmlFile}\`` : "",
    "",
    "## 分类统计",
    "",
    "| 分类 | 数量 |",
    "| --- | ---: |"
  ];
  for (const [k, v] of groupedCounts(rows, "category")) lines.push(`| ${k} | ${v} |`);

  lines.push("", "## 置信度统计", "", "| 置信度 | 数量 |", "| --- | ---: |");
  for (const [k, v] of groupedCounts(rows, "confidence")) lines.push(`| ${k} | ${v} |`);

  lines.push("", "## 受众统计", "", "| 受众 | 数量 |", "| --- | ---: |");
  for (const [k, v] of groupedCounts(rows, "audience")) lines.push(`| ${k} | ${v} |`);

  lines.push("", "## 完结状态统计", "", "| 状态 | 数量 |", "| --- | ---: |");
  for (const [k, v] of groupedCounts(rows, "completion_status")) lines.push(`| ${k} | ${v} |`);

  if (confirmed.length) {
    lines.push("", "## 来源确认条目", "", "| 文件 | 标题 | 作者 | 分类 | 标签 | 受众 | 状态 | 依据 | 来源 |", "| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
    for (const row of confirmed) lines.push(`| \`${row.destination_path}\` | ${row.parsed_title} | ${row.parsed_author || ""} | ${row.category} | ${row.subtags} | ${row.audience} | ${row.completion_status} | ${row.reason} | ${row.source} |`);
  }

  if (pending.length) {
    lines.push("", "## 待联网确认条目", "", "| 文件 | 标题 | 作者 | 候选分类 | 当前去向 | 候选标签 | 依据 |", "| --- | --- | --- | --- | --- | --- | --- |");
    for (const row of pending) lines.push(`| \`${row.original_path}\` | ${row.parsed_title} | ${row.parsed_author || ""} | ${row.candidate_category || ""} | ${row.category} | ${row.subtags} | ${row.reason} |`);
  }

  lines.push("", "## 分类明细", "");
  for (const [category, group] of [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0], "zh-Hans-CN"))) {
    group.sort((a, b) => a.destination_path.localeCompare(b.destination_path, "zh-Hans-CN"));
    lines.push(`### ${category}（${group.length}）`);
    for (const row of group) {
      const action = row.action === "move" ? "移动" : "保留";
      const candidate = row.candidate_category && row.candidate_category !== row.category ? `；候选 ${row.candidate_category}` : "";
      lines.push(`- \`${row.destination_path}\`（${action}；${row.confidence}${candidate}；${row.audience}；${row.completion_status}；${row.subtags}；${row.appeal}；${row.reason}）`);
    }
    lines.push("");
  }
  fs.writeFileSync(file, lines.join("\n"), "utf8");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function jsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

function writeHtml(file, root, rows, executed, options = {}) {
  const categories = unique(rows.map((r) => r.category)).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  const audiences = unique(rows.map((r) => r.audience)).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  const statuses = unique(rows.map((r) => r.completion_status)).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
  const total = rows.length;
  const pending = rows.filter((r) => r.needs_web === "是").length;
  const confirmed = rows.filter((r) => r.needs_web === "否").length;
  const generated = new Date().toLocaleString("zh-CN", { hour12: false });
  const data = jsonForHtml(rows);
  const optionTags = (items) => items.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("");

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>小说像素书库</title>
  <style>
    :root {
      --ink: #20151f;
      --paper: #fbf4de;
      --paper-2: #f2e5bd;
      --line: #20151f;
      --mint: #7bdca8;
      --sky: #83c5ff;
      --rose: #ff8ba7;
      --gold: #ffd166;
      --violet: #b9a0ff;
      --shadow: 5px 5px 0 var(--line);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: var(--ink);
      background:
        linear-gradient(90deg, rgba(32,21,31,.08) 1px, transparent 1px),
        linear-gradient(rgba(32,21,31,.08) 1px, transparent 1px),
        var(--paper);
      background-size: 18px 18px;
      font-family: "Microsoft YaHei UI", "Microsoft YaHei", "Segoe UI", system-ui, sans-serif;
    }
    .shell { width: min(1420px, calc(100vw - 28px)); margin: 0 auto; padding: 24px 0 36px; }
    header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 18px;
      align-items: end;
      border: 4px solid var(--line);
      background: var(--paper-2);
      box-shadow: var(--shadow);
      padding: 18px;
    }
    h1 { margin: 0; font-size: clamp(26px, 4vw, 52px); line-height: .95; letter-spacing: 0; }
    .subline { margin-top: 10px; font-family: Consolas, monospace; font-size: 13px; }
    .status {
      display: grid;
      grid-template-columns: repeat(3, 94px);
      gap: 8px;
    }
    .stat {
      border: 3px solid var(--line);
      background: #fff9e8;
      padding: 10px;
      min-height: 72px;
      box-shadow: 3px 3px 0 var(--line);
    }
    .stat b { display: block; font-size: 24px; line-height: 1; }
    .stat span { display: block; margin-top: 6px; font-size: 12px; }
    .toolbar {
      margin: 22px 0 16px;
      display: grid;
      grid-template-columns: minmax(220px, 1.4fr) repeat(3, minmax(140px, .6fr));
      gap: 10px;
    }
    input, select {
      width: 100%;
      border: 3px solid var(--line);
      background: #fffdf2;
      color: var(--ink);
      box-shadow: 3px 3px 0 var(--line);
      min-height: 44px;
      padding: 0 12px;
      font: 15px "Microsoft YaHei UI", "Microsoft YaHei", sans-serif;
      border-radius: 0;
    }
    .layout {
      display: grid;
      grid-template-columns: 220px minmax(0, 1fr);
      gap: 18px;
      align-items: start;
    }
    aside {
      position: sticky;
      top: 14px;
      border: 4px solid var(--line);
      background: #e8fff1;
      box-shadow: var(--shadow);
      padding: 14px;
    }
    aside h2, .section-title {
      margin: 0 0 10px;
      font-size: 16px;
      font-family: Consolas, monospace;
    }
    .bar { margin: 12px 0; }
    .bar-name { display: flex; justify-content: space-between; font-size: 13px; gap: 8px; }
    .track { height: 14px; border: 2px solid var(--line); background: #fff; margin-top: 4px; }
    .fill { height: 100%; background: repeating-linear-gradient(90deg, var(--sky) 0 8px, var(--mint) 8px 16px); }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 14px;
    }
    .card {
      border: 4px solid var(--line);
      background: #fffdf2;
      box-shadow: var(--shadow);
      min-height: 284px;
      display: grid;
      grid-template-rows: auto 1fr;
    }
    .cover {
      height: 76px;
      border-bottom: 4px solid var(--line);
      background:
        linear-gradient(90deg, rgba(255,255,255,.35) 0 12px, transparent 12px 24px),
        var(--accent, var(--sky));
      position: relative;
    }
    .cover:before, .cover:after {
      content: "";
      position: absolute;
      border: 3px solid var(--line);
      background: #fffdf2;
    }
    .cover:before { width: 32px; height: 42px; left: 16px; top: 16px; box-shadow: 10px 7px 0 rgba(32,21,31,.18); }
    .cover:after { width: 68px; height: 10px; right: 18px; top: 20px; box-shadow: 0 18px 0 #fffdf2, 0 36px 0 #fffdf2; }
    .card-body { padding: 12px; display: flex; flex-direction: column; gap: 9px; }
    .title { font-size: 18px; font-weight: 800; line-height: 1.25; word-break: break-word; }
    .meta { display: flex; flex-wrap: wrap; gap: 6px; }
    .chip {
      border: 2px solid var(--line);
      background: #fff;
      padding: 3px 6px;
      font-size: 12px;
      line-height: 1.2;
      box-shadow: 2px 2px 0 rgba(32,21,31,.22);
    }
    .chip.main { background: var(--gold); font-weight: 700; }
    .chip.warn { background: var(--rose); }
    .detail { margin: 0; font-size: 13px; line-height: 1.55; }
    .path {
      margin-top: auto;
      border-top: 2px dashed var(--line);
      padding-top: 8px;
      font-family: Consolas, monospace;
      font-size: 11px;
      word-break: break-all;
    }
    .empty {
      border: 4px solid var(--line);
      background: #fffdf2;
      box-shadow: var(--shadow);
      padding: 28px;
      text-align: center;
      font-weight: 700;
    }
    @media (max-width: 860px) {
      header, .layout, .toolbar { grid-template-columns: 1fr; }
      aside { position: static; }
      .status { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 520px) {
      .shell { width: min(100vw - 16px, 1420px); padding-top: 12px; }
      header, aside, .card { box-shadow: 3px 3px 0 var(--line); }
      .status { grid-template-columns: 1fr; }
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header>
      <div>
        <h1>小说像素书库</h1>
        <div class="subline">root=${escapeHtml(root)} · generated=${escapeHtml(generated)} · mode=${executed ? "execute" : "dry-run"}</div>
      </div>
      <div class="status">
        <div class="stat"><b>${total}</b><span>总书目</span></div>
        <div class="stat"><b>${confirmed}</b><span>已确认</span></div>
        <div class="stat"><b>${pending}</b><span>待确认</span></div>
      </div>
    </header>
    <div class="toolbar">
      <input id="q" type="search" placeholder="搜索标题、作者、标签、路径">
      <select id="category"><option value="">全部分类</option>${optionTags(categories)}</select>
      <select id="audience"><option value="">全部受众</option>${optionTags(audiences)}</select>
      <select id="status"><option value="">全部状态</option>${optionTags(statuses)}</select>
    </div>
    <div class="layout">
      <aside>
        <h2>分类线框</h2>
        <div id="bars"></div>
      </aside>
      <main>
        <div class="section-title"><span id="count">${total}</span> / ${total}</div>
        <div id="grid" class="grid"></div>
      </main>
    </div>
  </div>
  <script>
    const rows = ${data};
    const colors = ["#83c5ff", "#7bdca8", "#ffd166", "#ff8ba7", "#b9a0ff", "#93e1d8", "#f6bd60"];
    const els = {
      q: document.getElementById("q"),
      category: document.getElementById("category"),
      audience: document.getElementById("audience"),
      status: document.getElementById("status"),
      grid: document.getElementById("grid"),
      bars: document.getElementById("bars"),
      count: document.getElementById("count")
    };
    function esc(v) {
      return String(v ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
    }
    function tags(row) {
      return String(row.subtags || "").split("、").filter(Boolean).slice(0, 6);
    }
    function searchable(row) {
      return [row.parsed_title, row.parsed_author, row.category, row.subtags, row.audience, row.completion_status, row.destination_path, row.reason].join(" ").toLowerCase();
    }
    function filteredRows() {
      const q = els.q.value.trim().toLowerCase();
      return rows.filter(row =>
        (!q || searchable(row).includes(q)) &&
        (!els.category.value || row.category === els.category.value) &&
        (!els.audience.value || row.audience === els.audience.value) &&
        (!els.status.value || row.completion_status === els.status.value)
      );
    }
    function renderBars(list) {
      const counts = new Map();
      for (const row of list) counts.set(row.category, (counts.get(row.category) || 0) + 1);
      const max = Math.max(1, ...counts.values());
      els.bars.innerHTML = [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-Hans-CN"))
        .map(([name, count], i) => '<div class="bar"><div class="bar-name"><span>' + esc(name) + '</span><b>' + count + '</b></div><div class="track"><div class="fill" style="width:' + Math.round(count / max * 100) + '%;background:' + colors[i % colors.length] + '"></div></div></div>')
        .join("");
    }
    function renderCards(list) {
      if (!list.length) {
        els.grid.innerHTML = '<div class="empty">没有匹配书目</div>';
        return;
      }
      els.grid.innerHTML = list.map((row, i) => {
        const chipTags = tags(row).map(t => '<span class="chip">' + esc(t) + '</span>').join("");
        const warn = row.needs_web === "是" ? '<span class="chip warn">待确认</span>' : '<span class="chip">已确认</span>';
        return '<article class="card" style="--accent:' + colors[i % colors.length] + '">' +
          '<div class="cover"></div>' +
          '<div class="card-body">' +
          '<div class="title">' + esc(row.parsed_title) + '</div>' +
          '<div class="meta"><span class="chip main">' + esc(row.category) + '</span><span class="chip">' + esc(row.audience) + '</span><span class="chip">' + esc(row.completion_status) + '</span>' + warn + '</div>' +
          '<div class="meta">' + chipTags + '</div>' +
          '<p class="detail"><b>作者</b> ' + esc(row.parsed_author || "待确认") + '</p>' +
          '<p class="detail"><b>爽点/虐点</b> ' + esc(row.appeal || "待确认") + '</p>' +
          '<p class="detail"><b>建议</b> ' + esc(row.suggested_folder_name || "") + '</p>' +
          '<div class="path">' + esc(row.destination_path || row.original_path) + '</div>' +
          '</div></article>';
      }).join("");
    }
    function render() {
      const list = filteredRows();
      els.count.textContent = list.length;
      renderBars(list);
      renderCards(list);
    }
    [els.q, els.category, els.audience, els.status].forEach(el => el.addEventListener("input", render));
    render();
  </script>
</body>
</html>`;
  fs.writeFileSync(file, html, "utf8");
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
  const html = path.join(args.root, args.html);
  writeCsv(csv, rows);
  if (args.writeHtml) writeHtml(html, args.root, rows, args.execute, args);
  writeReport(report, args.root, rows, args.execute, { ...args, htmlFile: args.writeHtml ? html : "" });
  console.log(`files=${rows.length}`);
  console.log(`remaining_moves=${rows.filter((r) => r.action === "move").length}`);
  console.log(`pending_web_confirmation=${rows.filter((r) => r.needs_web === "是").length}`);
  console.log(`report=${report}`);
  console.log(`csv=${csv}`);
  if (args.writeHtml) console.log(`html=${html}`);
}

if (require.main === module) main();

module.exports = {
  parseFilename,
  classify,
  makePlan,
  collectFiles,
  writeHtml
};
