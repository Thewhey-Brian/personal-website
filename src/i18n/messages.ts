import type { Locale } from "./config";

/**
 * UI copy, in one place per locale.
 *
 * `en` is the source of truth: `Messages` is typed from it, so a key added in
 * English and forgotten in Chinese is a build error rather than an English
 * string leaking into a Chinese page at runtime.
 *
 * Proper nouns stay in their original form on purpose. Journal names, tool
 * names, degrees awarded by named institutions and the honour societies are
 * how the reader will recognise them and how they appear on the CV; a
 * translated journal title is harder to verify, not easier to read.
 */
const en = {
  nav: {
    home: "Home",
    about: "About",
    publications: "Publications",
    projects: "Projects",
    contact: "Contact",
    search: "Search",
    openMenu: "Open menu",
    toggleLanguage: "Switch language",
  },

  hero: {
    eyebrow: "AI for Biology · Yale · Builder of AI products",
    greeting: "Hi, I'm",
    name: "Xinyu Guo",
    ariaName: "Hi, I'm Xinyu Guo",
    currently: "currently",
    roles: [
      "AI Researcher",
      "Builder",
      "Founder",
      "Scientist",
      "Photographer",
    ],
    copyLead: "Building",
    copyFields: ["biological foundation models", "scientific AI agents", "AI products people use"],
    copyTail: "— from genomes to the App Store.",
    ctaPrimary: "Discover my story",
    ctaSecondary: "Research & projects",
    scroll: "Scroll",
  },

  home: {
    selectedWork: "Selected research, and things I have shipped.",
    products: "Shipped products",
    publications: "Publications",
    projects: "Projects",
    viewAll: "View all",
  },

  about: {
    title: "About",
    name: "郭昕育 Xinyu Guo",
    role: "AI researcher · builder · founder",
    location: "New Haven, CT",
    downloadCv: "Download CV",
    background: "Background",
    glance: "At a glance",
    glanceList: [
      ["Now", "Postdoctoral Associate, Yale University · AI for biology"],
      ["Focus", "Biological & genomic foundation models · scientific AI agents"],
      ["Training", "Ph.D. USC 2026 · M.S. Johns Hopkins · B.A. WashU"],
      ["Industry", "Abbott Cancer Diagnostics, genomic AI (2026)"],
      ["Shipped", "RallyAI and Doover, solo-built iOS apps on the App Store"],
      ["Open to", "AI labs · biotech · founders and investors in AI × bio"],
    ],
    researchAreas: "Research areas",
    technical: "Technical",
    experience: "Experience",
    education: "Education",
    bio: [
      "I work on AI for biology: foundation models that read DNA, RNA and single-cell data, and the agents that let scientists use them responsibly. I am a Postdoctoral Associate at Yale with Dr. Lucila Ohno-Machado, after a Ph.D. in Computational Biology & Bioinformatics at USC and a summer at Abbott Cancer Diagnostics evaluating genomic foundation models on real tumor cohorts.",
      "I also like shipping. I have taken two AI products from idea to the App Store, RallyAI for tennis and Doover for photo editing, doing the modeling, the app, and the launch myself. Research taught me to be careful with claims; building taught me to be fast with everything else. I try to bring both to every team I work with.",
      "Outside work I am usually behind a camera, chasing moments that say something about the people in them.",
    ],
    researchAreaList: [
      "Biological & genomic foundation models",
      "LLM agents for science & tool use",
      "Cancer genomics & precision oncology",
      "Variant-effect prediction (SNV, SV, fusion)",
      "Single-cell & spatial transcriptomics",
      "Self-supervised & contrastive learning",
      "Computer vision & on-device ML",
      "Benchmark design & model evaluation",
    ],
    experienceList: [
      {
        when: "2026 — now",
        what: "Postdoctoral Associate",
        where: "Yale University — AI for biology & biological foundation models",
      },
      {
        when: "Summer 2026",
        what: "AI Research Scientist Intern",
        where: "Abbott Cancer Diagnostics — genomic AI & precision oncology",
      },
      {
        when: "2022 — 2026",
        what: "Graduate Researcher",
        where: "University of Southern California — biological pathology AI/ML",
      },
      {
        when: "2020 — 2022",
        what: "Graduate Researcher",
        where: "Johns Hopkins University — statistical genetics, multi-omics",
      },
      {
        when: "2020",
        what: "Research Assistant",
        where: "Washington University in St. Louis — clinical informatics",
      },
    ],
    educationList: [
      {
        when: "2022 — 2026",
        what: "Ph.D., Computational Biology & Bioinformatics",
        where: "University of Southern California · Viterbi Fellow",
      },
      {
        when: "2020 — 2022",
        what: "M.S., Biostatistics",
        where: "Johns Hopkins University · Delta Omega Honor Society",
      },
      {
        when: "2018 — 2020",
        what: "B.A., Mathematics & Computer Science",
        where: "Washington University in St. Louis · Cum Laude",
      },
    ],
  },

  publications: {
    title: "Publications",
    subtitle:
      "Peer-reviewed research in genomics, statistics and cancer biology.",
    empty: "No publications match this filter.",
  },

  projects: {
    title: "Projects",
    subtitle: "Research systems, foundation-model evaluations, and AI products I have shipped.",
    empty: "No projects match this filter.",
  },

  contact: {
    title: "Get in touch",
    subtitle:
      "Open to research collaborations, and to conversations with AI labs, biotech teams and investors building at the intersection of AI and biology.",
    channels: "Channels",
    email: "Email",
    github: "GitHub",
    linkedin: "LinkedIn",
    twitter: "Twitter",
    scholar: "Google Scholar",
    scholarNote: "Papers and citations",
    emailNote: "Best for anything substantive",
    githubNote: "Code and open source",
    linkedinNote: "Professional network",
    twitterNote: "Occasional thoughts",
  },

  filters: {
    type: "Type",
    all: "All",
    tag: "Topic",
  },

  common: {
    year: "Year",
    venue: "Venue",
    status: "Status",
    readMore: "Read more",
    /**
     * Shown wherever a Chinese page links into an English-only detail page.
     * Saying so up front is the honest version of a partial translation —
     * the alternative is a reader clicking through and finding out.
     */
    englishBody: "Full text in English",
    englishBodyNote:
      "Publication and project write-ups are in English. Titles and summaries here are translated.",
  },

  assistant: {
    tagline: "Ask about the research",
    cta: "Ask Locus",
  },

  footer: {
    rights: "All rights reserved.",
    sourceOn: "Source on GitHub",
  },
};
// Deliberately not `as const`: that would make every value a string *literal*
// type, so `Messages` would demand the exact English words and every Chinese
// translation would be a type error.

/** Every locale must supply exactly the keys English does. */
export type Messages = typeof en;

const zh: Messages = {
  nav: {
    home: "首页",
    about: "关于",
    publications: "论文",
    projects: "项目",
    contact: "联系",
    search: "搜索",
    openMenu: "打开菜单",
    toggleLanguage: "切换语言",
  },

  hero: {
    eyebrow: "AI for Biology · 耶鲁大学 · AI 产品构建者",
    greeting: "你好，我是",
    name: "郭昕育",
    ariaName: "你好，我是郭昕育",
    currently: "当前身份",
    roles: ["AI 研究者", "构建者", "创业者", "科学家", "摄影爱好者"],
    copyLead: "正在构建",
    copyFields: ["生物基础模型", "科研 AI 智能体", "真正被使用的 AI 产品"],
    copyTail: "——从基因组到 App Store。",
    ctaPrimary: "了解我的经历",
    ctaSecondary: "研究与项目",
    scroll: "向下滚动",
  },

  home: {
    selectedWork: "精选研究，以及已经上线的作品。",
    products: "已上线产品",
    publications: "论文",
    projects: "项目",
    viewAll: "查看全部",
  },

  about: {
    title: "关于",
    name: "郭昕育 Xinyu Guo",
    role: "AI 研究者 · 构建者 · 创业者",
    location: "美国康涅狄格州纽黑文",
    downloadCv: "下载简历",
    background: "个人简介",
    glance: "一览",
    glanceList: [
      ["现在", "耶鲁大学博士后研究员 · AI for Biology"],
      ["方向", "生物与基因组基础模型 · 科研 AI 智能体"],
      ["学历", "南加州大学博士（2026）· 约翰斯·霍普金斯硕士 · 圣路易斯华盛顿大学学士"],
      ["产业", "雅培癌症诊断，基因组 AI（2026）"],
      ["已上线", "RallyAI 与 Doover，独立开发并上架 App Store 的 iOS 应用"],
      ["开放", "AI 实验室 · 生物科技 · AI × 生物方向的创业者与投资人"],
    ],
    researchAreas: "研究方向",
    technical: "技术栈",
    experience: "工作经历",
    education: "教育背景",
    bio: [
      "我的研究方向是 AI for Biology：能够读懂 DNA、RNA 与单细胞数据的基础模型，以及让科学家负责任地使用这些模型的智能体。我目前在耶鲁大学担任博士后研究员（导师：Lucila Ohno-Machado 教授），此前在南加州大学获得计算生物学与生物信息学博士学位，并曾在雅培癌症诊断（Abbott Cancer Diagnostics）在真实肿瘤队列上评估基因组基础模型。",
      "我也喜欢把东西做出来。我独立完成了两款 AI 产品从想法到 App Store 上线的全过程：面向网球的 RallyAI 与面向照片编辑的 Doover，模型、应用与发布都由我一人完成。科研让我对结论保持谨慎，做产品让我在其他一切上保持快速。我希望把这两点都带给每一个与我共事的团队。",
      "工作之外，我多数时候在相机后面，捕捉那些能够讲述人物故事的瞬间。",
    ],
    researchAreaList: [
      "生物与基因组基础模型",
      "面向科研的 LLM 智能体与工具调用",
      "癌症基因组学与精准肿瘤学",
      "变异效应预测（SNV、SV、融合基因）",
      "单细胞与空间转录组",
      "自监督与对比学习",
      "计算机视觉与端侧机器学习",
      "基准设计与模型评估",
    ],
    experienceList: [
      {
        when: "2026 — 至今",
        what: "博士后研究员",
        where: "耶鲁大学 —— AI for Biology 与生物基础模型",
      },
      {
        when: "2026 年夏",
        what: "人工智能研究科学家实习生",
        where:
          "雅培癌症诊断（Abbott Cancer Diagnostics）—— 基因组 AI 与精准肿瘤学",
      },
      {
        when: "2022 — 2026",
        what: "研究生研究员",
        where: "南加州大学 —— 病理生物学方向 AI/ML",
      },
      {
        when: "2020 — 2022",
        what: "研究生研究员",
        where: "约翰斯·霍普金斯大学 —— 统计遗传学、多组学",
      },
      {
        when: "2020",
        what: "科研助理",
        where: "圣路易斯华盛顿大学 —— 临床信息学",
      },
    ],
    educationList: [
      {
        when: "2022 — 2026",
        what: "博士，计算生物学与生物信息学",
        where: "南加州大学 · Viterbi Fellow",
      },
      {
        when: "2020 — 2022",
        what: "硕士，生物统计学",
        where: "约翰斯·霍普金斯大学 · Delta Omega Honor Society",
      },
      {
        when: "2018 — 2020",
        what: "学士，数学与计算机科学",
        where: "圣路易斯华盛顿大学 · Cum Laude（优等成绩毕业）",
      },
    ],
  },

  publications: {
    title: "论文",
    subtitle: "基因组学、统计学与癌症生物学方向的同行评审研究。",
    empty: "没有符合该筛选条件的论文。",
  },

  projects: {
    title: "项目",
    subtitle: "我构建的研究系统、基础模型评估，以及已上线的 AI 产品。",
    empty: "没有符合该筛选条件的项目。",
  },

  contact: {
    title: "联系我",
    subtitle:
      "欢迎科研合作，也欢迎正在 AI 与生物交叉领域探索的 AI 实验室、生物科技团队与投资人与我交流。",
    channels: "联系方式",
    email: "邮箱",
    github: "GitHub",
    linkedin: "领英",
    twitter: "Twitter",
    scholar: "Google Scholar",
    scholarNote: "论文与引用",
    emailNote: "正式事宜请优先使用邮箱",
    githubNote: "代码与开源项目",
    linkedinNote: "职业社交网络",
    twitterNote: "偶尔发些想法",
  },

  filters: {
    type: "类型",
    all: "全部",
    tag: "主题",
  },

  common: {
    year: "年份",
    venue: "发表期刊",
    status: "状态",
    readMore: "阅读更多",
    englishBody: "正文为英文",
    englishBodyNote: "论文与项目正文为英文，此处的标题与摘要为中文翻译。",
  },

  assistant: {
    tagline: "咨询研究内容",
    cta: "问问 Locus",
  },

  footer: {
    rights: "保留所有权利。",
    sourceOn: "源码在 GitHub",
  },
};

const DICTIONARIES: Record<Locale, Messages> = { en, zh };

export function getMessages(locale: Locale): Messages {
  return DICTIONARIES[locale];
}
