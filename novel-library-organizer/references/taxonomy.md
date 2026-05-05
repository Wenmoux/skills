# Chinese Novel Classification Taxonomy

Use this as a pragmatic shelf system. It is a decision aid, not a substitute for source-backed lookup. For library cleanup, prefer a correct `待分类` row over a confident but unsupported move.

## Platform Baseline

- 起点中文网当前公开分类包括 `玄幻`、`奇幻`、`武侠`、`仙侠`、`都市`、`现实`、`军事`、`历史`、`游戏`、`体育`、`科幻`、`诸天无限`、`悬疑`、`轻小说`.
- 纵横中文网移动端首页保留 `玄幻奇幻`、`武侠仙侠`、`都市`、`历史` 等推荐大类，并在具体作品行展示作者、连载状态、分类和字数。
- 晋江移动端频道展示 `衍生纯爱`、`二次元言情`、`衍生言情`、`衍生无CP`、`原创轻小说` 等频道；分类页也出现 `古言`、`现言`、`纯爱`、`衍生`、`无CP`、`百合` 等入口。

Reference URLs for future lookups:

- `https://www.qidian.com/`
- `https://www.qidian.com/rank/hotsales/`
- `https://m.zongheng.com/`
- `https://m.jjwxc.net/channel/channel/trdm`
- `https://m.jjwxc.net/assort/团宠`

## Evidence Policy

Use evidence in this order:

1. User-provided category or folder requirement.
2. Official work page, publisher/retailer page, author page, encyclopedia/catalog page, or stable book database.
3. EPUB metadata title/creator/subject/description.
4. Explicit filename category tag, such as `[玄幻]` or `[科幻]`.
5. Title and synopsis keywords as search hints only.
6. Existing folder as weak context.
7. `待分类` when evidence is incomplete.

Do not classify from author names. Category-like tokens inside author names are ignored. `女帝666` as an author is not evidence for 历史、玄幻、言情, or any other shelf.

`龙族` is an optional special shelf, not a generic dragon keyword. Keep it only when the user wants a dedicated Dragon Raja shelf or the library already uses one.

## Folder Sets

### Compact Set

Use this when the user wants the existing folder style preserved:

- `玄幻`
- `仙侠`
- `武侠`
- `历史`
- `科幻`
- `无限流`
- `游戏`
- `悬疑推理`
- `灵异恐怖`
- `都市`
- `言情`
- `轻小说`
- `同人`
- `军事`
- `文学`
- `龙族`
- `成人`
- `待分类`

### Expanded Set

Use or recommend this when the collection is large and the user wants finer shelves:

- `玄幻`
- `奇幻`
- `仙侠`
- `武侠`
- `都市`
- `现实`
- `历史`
- `军事`
- `科幻`
- `游戏`
- `体育`
- `悬疑推理`
- `灵异恐怖`
- `无限流`
- `轻小说`
- `同人`
- `言情`
- `耽美纯爱`
- `文学`
- `传记纪实`
- `社科`
- `龙族`
- `成人`
- `待分类`

## Ambiguous Markers

These words are common across genres. Use them as search hints, not category proof:

- `女帝`、`皇帝`、`帝王`、`王妃`、`皇后`、`公主`：may be 玄幻、仙侠、历史、言情、轻小说, or merely an author name.
- `大唐`、`大明`、`三国`、`秦`、`宋`、`清`：may be 历史, but also title flavor, fan fiction, game worlds, or author tags.
- `重生`、`系统`、`神豪`：often 都市, but may be 历史、玄幻、言情、科幻 or 游戏.
- `诡`、`怪谈`、`异闻`：may be 灵异恐怖, 悬疑推理, or 玄幻奇幻.
- `龙族`：use the special `龙族` shelf only for 江南《龙族》正传/外传 and clearly Dragon Raja-centered works; otherwise evaluate as 同人、玄幻, or 奇幻. Treat it as an optional collection shelf, not a generic genre.

## Category Guidance

### 玄幻

Use for Eastern fantasy, high-magic worlds, bloodline/realm progression, fantasy dynasties, and cultivation-like power systems that are not primarily Daoist/immortal.

Search hints: 玄幻、东方玄幻、异世、异界、血脉、斗气、武魂、神魔、天命、王座、完美世界、斗破苍穹、武动乾坤、将夜.

### 奇幻

Use for Western fantasy, steam fantasy, magic academies, knights, mages, gods in non-Eastern settings, and translated fantasy when not better shelved as 玄幻.

Search hints: 奇幻、西幻、魔法、骑士、法师、巫妖、猎魔、精灵、矮人、王国、蒸汽、克苏鲁奇幻.

### 仙侠

Use for 修真、修仙、道法、飞升、长生、宗门、洪荒 and works where cultivation/ascension is the main promise.

Search hints: 仙侠、修真、修仙、仙、道、飞升、长生、宗门、灵根、金丹、元婴、凡人、诛仙、蜀山、飘邈、斩仙、大道争锋、烂柯棋缘.

### 武侠

Use for 江湖、侠义、门派、武林、国术, and martial stories where human martial conflict matters more than realm cultivation.

Search hints: 武侠、江湖、侠、武林、国术、刀宗、雪中悍刀行、楚留香、七种武器、杯雪、风云、少年歌行.

### 都市

Use for modern city life, officialdom, business, entertainment, medicine, systems in modern society, urban superpowers, and rebirth into recent decades.

Search hints: 都市、都市异能、重生、官场、官路、娱乐、明星、文娱、神豪、房客、医生、职场、美食、学霸、材料帝国、首富、纯真年代.

### 现实

Use for contemporary realism, workplace/social issue fiction, industry fiction without fantasy systems, and serious modern narratives.

Search hints: 现实、现实主义、职场、行业、年代、乡村、家庭、社会、创业, when the synopsis is not system/爽文 driven.

### 历史

Use for historical fiction, alternate history, dynasty politics, ancient officialdom, historical traversal, and industrial nation-building in historical frames.

Search hints: 历史、架空历史、穿越历史、大明、大唐、宋、汉、三国、秦、清、民国、临高启明、宰执天下、覆汉、绍宋、唐砖、锦衣卫.

### 军事

Use for military, mercenary, special forces, battlefield, weapons, and modern military industry when military action is primary.

Search hints: 军事、军旅、军官、特种、战隼、重坦、弹道、火力、佣兵、麒麟.

### 科幻

Use for science fiction, cyberpunk, space opera, future worlds, post-apocalyptic tech, mecha, biotech, AI, and hard/soft science speculation.

Search hints: 科幻、赛博、星际、未来、机甲、末世、废土、生化、三体、球状闪电、银河、深空、宇宙、机器人、黑科技、时空、异常生物见闻录、黎明之剑.

### 游戏

Use for online games, esports, game production, game systems, simulation games, and game-world realism.

Search hints: 网游、游戏、电竞、玩家、全职高手、亏成首富从游戏开始、这游戏也太真实、模拟器、奥比岛.

### 体育

Use for sports competition, athletes, coaching, clubs, leagues, and sports-management stories.

Search hints: 体育、足球、篮球、网球、冠军、教练、球员、联赛、俱乐部、NBA、世界杯.

### 无限流

Use for 无限、诸天、轮回、副本, main-space travel, cross-world missions, and multi-world progression.

Search hints: 无限流、诸天、轮回、副本、主神、王牌进化、最终进化、末日乐园、序列玩家、从姑获鸟开始、同时穿越.

### 悬疑推理

Use for detective, crime, mystery, logical puzzle, police procedural, legal investigation, and historical cases when solving cases is the main appeal.

Search hints: 悬疑、推理、侦探、探案、破案、刑侦、本格、罪案、凶案、杀人、名侦探、福尔摩斯、狄公案、簪中录、唐案、狂探、诡案组.

### 灵异恐怖

Use for ghosts, horror, supernatural incidents, weird tales, folk taboos, and fear-centered stories. If puzzle solving dominates, choose `悬疑推理`.

Search hints: 灵异、恐怖、惊悚、怪谈、鬼差、鬼屋、异闻、阴间、殡葬、禁忌、神秘复苏、民调局、冒险屋、深夜书屋、明克街13号.

### 轻小说

Use for Japanese light novels, ACG-style youth stories, 日常, 二次元, and Japanese media tie-ins when not clearly fan fiction.

Search hints: 轻小说、动漫、日常、东京、日本、Re：从零开始、言叶之庭、柴刀流、佐佐良镇、二次元.

### 同人

Use for derivative works based on established IP, including anime/game/movie/comic/novel universes.

Search hints: 同人、火影、柯南、霍格沃茨、哈利波特、美漫、DC、奥特、型月、综英美、一人之、舰娘、艾泽拉斯、魔兽、游戏王、训练家.

### 言情

Use for romance-first works, female-frequency romance, 古言, campus love, relationship-driven stories, and romantic fantasy where romance is primary.

Search hints: 女频、古言、言情、恋爱、青春校园、青梅、女友、男友、长相思、长风渡、有匪、最好的我们、北城有雪、娘子、女将星.

### 耽美纯爱

Use for BL/纯爱/耽美 works when the user wants a separate shelf. If using the compact set, merge into `言情` unless the user prefers otherwise.

Search hints: 耽美、纯爱、BL、主攻、主受、双男主, but confirm through source tags because these terms are inconsistently used in filenames.

### 文学

Use for classics, literary fiction, essays, memoirs, non-genre fiction, and books that are not web novels.

Search hints: 文学、名著、散文、随笔、马尔克斯、余秋雨、川端康成、雾都孤儿、红楼梦、金瓶梅、西游记、文化苦旅.

### 传记纪实

Use for biography, memoir, reportage, history nonfiction, and documentary narratives.

Search hints: 传记、回忆录、纪实、报告文学、口述史、人物传.

### 社科

Use for social science, humanities, economics, psychology, management, philosophy, and general nonfiction.

Search hints: 社科、经济、管理、心理、哲学、历史研究、社会学、人类学.

### 龙族

Use as an optional special collection shelf when the user wants a dedicated `龙族` folder or the library already has one. Put 江南《龙族》正传、前传、外传, and clearly Dragon Raja-centered fan fiction here. Otherwise classify by content into `同人` or the primary genre shelf.

### 成人

Use only for explicit erotic/adult works or titles/tags that are plainly adult. Do not inspect private explicit content beyond what is necessary to classify filenames/metadata.

Search hints: H合集、瑟瑟、调教、欲望、成人、情色 and known adult-only title markers.
