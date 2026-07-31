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
    eyebrow: "Ph.D. Candidate · Computational Biology · USC",
    greeting: "Hi, I'm",
    name: "Xinyu Guo",
    ariaName: "Hi, I'm Xinyu Guo",
    currently: "currently",
    roles: [
      "Researcher",
      "Developer",
      "Photographer",
      "Scientist",
      "Entrepreneur",
    ],
    copyLead: "Exploring",
    copyFields: ["computational biology", "AI/ML", "statistical modeling"],
    copyTail: "— decoding genomes by day, debugging code by night.",
    ctaPrimary: "Discover my story",
    ctaSecondary: "Research & publications",
    scroll: "Scroll",
  },

  home: {
    selectedWork: "Selected research and things I have built.",
    publications: "Publications",
    projects: "Projects",
    viewAll: "View all",
  },

  about: {
    title: "About",
    name: "郭昕育 Xinyu Guo",
    role: "Researcher & developer",
    location: "Los Angeles, CA",
    downloadCv: "Download CV",
    background: "Background",
    researchAreas: "Research areas",
    technical: "Technical",
    experience: "Experience",
    education: "Education",
    bio: [
      "My research focuses on the intersection of genomics, statistical learning and deep learning, where I build tools that make sense of complex biological data and uncover patterns driving disease and therapy insights.",
      "I'm especially drawn to new technology — from LLM-powered systems to computer vision pipelines. Every new algorithm is a chance to experiment and build something that bridges science and real-world impact.",
      "Outside research I stay equally curious: usually behind a camera, chasing moments that say something about the people in them.",
    ],
    researchAreaList: [
      "Genomic foundation models",
      "Cancer genomics & precision oncology",
      "Variant-effect prediction (SNV, SV, fusion)",
      "Single-cell & spatial transcriptomics",
      "Self-supervised & contrastive learning",
      "GWAS / TWAS & statistical genetics",
      "Scientific AI agents & tool use",
    ],
    experienceList: [
      {
        when: "Summer 2026",
        what: "AI Research Scientist Intern",
        where: "Abbott Cancer Diagnostics — genomic AI & precision oncology",
      },
      {
        when: "2022 — now",
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
    subtitle: "Research systems, models and tools I have built.",
    empty: "No projects match this filter.",
  },

  contact: {
    title: "Get in touch",
    subtitle:
      "Open to collaborations, research discussions and opportunities in computational biology and AI.",
    channels: "Channels",
    email: "Email",
    github: "GitHub",
    linkedin: "LinkedIn",
    twitter: "Twitter",
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
    eyebrow: "计算生物学博士候选人 · 南加州大学",
    greeting: "你好，我是",
    name: "郭昕育",
    ariaName: "你好，我是郭昕育",
    currently: "当前身份",
    roles: ["研究者", "开发者", "摄影爱好者", "科学家", "创业者"],
    copyLead: "研究方向涵盖",
    copyFields: ["计算生物学", "人工智能与机器学习", "统计建模"],
    copyTail: "——白天解读基因组，夜里调试代码。",
    ctaPrimary: "了解我的经历",
    ctaSecondary: "研究与论文",
    scroll: "向下滚动",
  },

  home: {
    selectedWork: "精选研究与作品。",
    publications: "论文",
    projects: "项目",
    viewAll: "查看全部",
  },

  about: {
    title: "关于",
    name: "郭昕育 Xinyu Guo",
    role: "研究者与开发者",
    location: "美国加州洛杉矶",
    downloadCv: "下载简历",
    background: "个人简介",
    researchAreas: "研究方向",
    technical: "技术栈",
    experience: "工作经历",
    education: "教育背景",
    bio: [
      "我的研究处于基因组学、统计学习与深度学习的交叉点，致力于构建能够解析复杂生物数据的工具，从中发现驱动疾病机制与治疗方案的规律。",
      "我对新技术抱有浓厚兴趣——从基于大语言模型的系统到计算机视觉流程。每一个新算法都是一次实验的机会，也是一次让科学与现实影响力相连接的尝试。",
      "研究之外，我同样保持好奇：多数时候在相机后面，捕捉那些能够讲述人物故事的瞬间。",
    ],
    researchAreaList: [
      "基因组基础模型",
      "癌症基因组学与精准肿瘤学",
      "变异效应预测（SNV、SV、融合基因）",
      "单细胞与空间转录组学",
      "自监督学习与对比学习",
      "GWAS / TWAS 与统计遗传学",
      "科研 AI 智能体与工具调用",
    ],
    experienceList: [
      {
        when: "2026 年夏",
        what: "人工智能研究科学家实习生",
        where:
          "雅培癌症诊断（Abbott Cancer Diagnostics）—— 基因组 AI 与精准肿瘤学",
      },
      {
        when: "2022 — 至今",
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
    subtitle: "我构建的研究系统、模型与工具。",
    empty: "没有符合该筛选条件的项目。",
  },

  contact: {
    title: "联系我",
    subtitle:
      "欢迎就计算生物学与人工智能方向的合作、研究讨论与工作机会与我联系。",
    channels: "联系方式",
    email: "邮箱",
    github: "GitHub",
    linkedin: "领英",
    twitter: "Twitter",
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
