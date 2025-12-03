import { Enum } from "enum-plus";

export const TaskType = Enum({
  INTERDISCIPLINARY_TEACHING_PLAN: "跨学科教案生成",
  PERSONALIZED_KNOWLEDGE_EXPLANATION: "个性化知识讲解",
  GUIDED_TEACHING: "引导式教学",
  CONTEXTUALIZED_QUESTION: "情景化出题",
});

// 1. 跨学科教案生成 [InterdisciplinaryTeachingPlan]

// 只有老师可以在填写profile时选择自己的主教学科
const SubjectEnum = Enum({
  CHINESE: "语文",
  MATH: "数学",
  ENGLISH: "英语",
  PHYSICS: "物理",
  CHEMISTRY: "化学",
  BIOLOGY: "生物学",
  SCIENCE: "科学",
  GEOGRAPHY: "地理",
  HISTORY: "历史",
  MORAL_AND_LAW: "道德与法治",
  INFORMATION_TECHNOLOGY: "信息科技",
  PHYSICAL_EDUCATION_AND_HEALTH: "体育与健康",
  ART: "艺术",
  LABOR_AND_TECHNOLOGY: "劳动与技术",
});

const UserProfileRoleEnum = Enum({
  TEACHER: "老师",
  STUDENT: "学生",
  PARENT: "家长",
});

// 基础层 进阶层 卓越层
const StudentAbilityEnum = Enum({
  BASIC: "基础层",
  INCREASE: "进阶层",
  EXCELLENT: "卓越层",
});

const GradeEnum = Enum({
  GRADE_1: "一年级",
  GRADE_2: "二年级",
  GRADE_3: "三年级",
  GRADE_4: "四年级",
  GRADE_5: "五年级",
  GRADE_6: "六年级",
  JUNIOR_HIGH_SCHOOL_1: "七年级",
  JUNIOR_HIGH_SCHOOL_2: "八年级",
  JUNIOR_HIGH_SCHOOL_3: "九年级",
  SENIOR_HIGH_SCHOOL_1: "高一",
  SENIOR_HIGH_SCHOOL_2: "高二",
  SENIOR_HIGH_SCHOOL_3: "高三",
});

//  2. 个性化知识讲解 [PersonalizedKnowledgeExplanation]

// 零基础/入门级/进阶级/复习巩固
const KnowledgeHandleLevelEnum = Enum({
  SCRATCH: "零基础",
  BEGINNER: "入门级",
  INTERMEDIATE: "进阶级",
  REVIEW: "复习巩固",
});

// 生活案例/公式推导/可视化比喻/步骤拆解/故事化讲解
const TeachingStyleEnum = Enum({
  LIFE_CASE: "生活案例",
  FORMULA_DERIVATION: "公式推导",
  VISUAL_ANALOGY: "可视化比喻",
  STEP_DECOMPOSITION: "步骤拆解",
  STORY_TEACHING: "故事化讲解",
});

// 3. 引导式教学 [GuidedTeaching]

// 对 KnowledgeHandleLevelEnum 进行复用即可

//  引导式教学不能开深度思考 ！

// 4. 情景化出题 [ContextualizedQuestion]

// 用户自定义添加标签，没有固定枚举情况

export const COTEA_ENUM = {
  TaskType,
  SubjectEnum,
  UserProfileRoleEnum,
  StudentAbilityEnum,
  GradeEnum,
  KnowledgeHandleLevelEnum,
  TeachingStyleEnum,
};
