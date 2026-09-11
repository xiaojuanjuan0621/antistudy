-- ====================================================================
-- 青少年 AI 主动学习成长工作台 (iPad 版) - 核心数据库建表脚本 (PostgreSQL)
-- 包含：用户体系、课程与知识图谱、互动视频、学习进度与防作弊、
--       AI PK对战引擎、四维奖励系统(XP/心愿币/卡牌/徽章)、兴趣画像与家长洞察
-- ====================================================================

-- 开启扩展 (如 UUID)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 枚举类型定义
CREATE TYPE role_enum AS ENUM ('child', 'parent', 'admin', 'teacher');
CREATE TYPE subject_enum AS ENUM ('chinese', 'math', 'english', 'biology', 'history', 'physics', 'chemistry', 'geography', 'science');
CREATE TYPE difficulty_enum AS ENUM ('easy', 'medium', 'hard', 'master');
CREATE TYPE card_rarity_enum AS ENUM ('common', 'rare', 'epic', 'legendary');
CREATE TYPE interaction_type_enum AS ENUM ('single_choice', 'multiple_choice', 'quick_judgment', 'concept_sort');
CREATE TYPE pk_status_enum AS ENUM ('in_progress', 'won', 'lost', 'draw', 'abandoned');
CREATE TYPE wish_status_enum AS ENUM ('in_progress', 'completed', 'claimed', 'approved');
CREATE TYPE ai_task_status_enum AS ENUM ('pending', 'transcribing', 'generating', 'reviewing', 'published', 'rejected');

-- 2. 用户与家庭关系
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(64) UNIQUE NOT NULL,
    nickname VARCHAR(64) NOT NULL,
    avatar_url VARCHAR(512),
    role role_enum NOT NULL DEFAULT 'child',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(32) UNIQUE,
    email VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES parents(id) ON DELETE SET NULL,
    grade_level INT NOT NULL DEFAULT 4, -- 1~9 年级
    xp INT NOT NULL DEFAULT 0,
    level INT NOT NULL DEFAULT 1,
    current_streak_days INT NOT NULL DEFAULT 0,
    max_streak_days INT NOT NULL DEFAULT 0,
    last_study_date DATE,
    streak_frozen_count INT NOT NULL DEFAULT 1, -- 补签/火焰变暗恢复机会
    selected_pet_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 课程体系与知识图谱
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject subject_enum NOT NULL,
    grade_level INT NOT NULL,
    cover_image_url VARCHAR(512),
    is_exploration BOOLEAN DEFAULT FALSE, -- 是否为综合探索课 (如火山、人体)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE knowledge_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    code VARCHAR(64) UNIQUE, -- 知识点编码, e.g. MATH_G4_FRAC_01
    name VARCHAR(128) NOT NULL,
    subject subject_enum NOT NULL,
    description TEXT,
    difficulty difficulty_enum DEFAULT 'medium',
    importance_weight NUMERIC(3,2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID NOT NULL REFERENCES course_units(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    video_url VARCHAR(1024) NOT NULL,
    duration_seconds INT NOT NULL DEFAULT 0,
    cover_url VARCHAR(512),
    transcript_json JSONB, -- ASR转写带时间戳字幕
    ai_quality_score INT DEFAULT 90, -- AI质量评分 0~100
    is_published BOOLEAN DEFAULT FALSE,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 视频互动节点 (AI插题)
CREATE TABLE video_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    knowledge_point_id UUID REFERENCES knowledge_points(id) ON DELETE SET NULL,
    timestamp_seconds INT NOT NULL, -- 视频暂停触发时间戳
    type interaction_type_enum NOT NULL DEFAULT 'single_choice',
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- 格式: [{"id": 0, "text": "1/4"}, {"id": 1, "text": "1/2"}]
    correct_option_index INT NOT NULL,
    explanation TEXT NOT NULL,
    hint_15s TEXT, -- 15秒轻提示内容
    difficulty difficulty_enum DEFAULT 'medium',
    reward_xp INT DEFAULT 10,
    is_ai_generated BOOLEAN DEFAULT TRUE,
    reviewed_by UUID REFERENCES users(id),
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. 学习进度、记录与防作弊
CREATE TABLE learning_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    actual_watch_seconds INT NOT NULL DEFAULT 0, -- 实际播放时长(防快进作弊)
    video_progress_percent INT NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    total_interactions_count INT NOT NULL DEFAULT 0,
    correct_interactions_count INT NOT NULL DEFAULT 0,
    retry_count INT NOT NULL DEFAULT 0,
    heartbeat_count INT NOT NULL DEFAULT 0, -- 客户端心跳上报校验
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE interaction_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    learning_record_id UUID NOT NULL REFERENCES learning_records(id) ON DELETE CASCADE,
    interaction_id UUID NOT NULL REFERENCES video_interactions(id) ON DELETE CASCADE,
    selected_option_index INT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time_ms INT NOT NULL,
    attempt_number INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE knowledge_mastery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    knowledge_point_id UUID NOT NULL REFERENCES knowledge_points(id) ON DELETE CASCADE,
    mastery_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00, -- 0.00 ~ 100.00
    practice_count INT NOT NULL DEFAULT 0,
    correct_count INT NOT NULL DEFAULT 0,
    last_practiced_at TIMESTAMP WITH TIME ZONE,
    needs_review BOOLEAN DEFAULT FALSE,
    UNIQUE (child_id, knowledge_point_id)
);

-- 6. AI PK 对战系统
CREATE TABLE ai_pk_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    subject subject_enum NOT NULL,
    ai_opponent_name VARCHAR(64) NOT NULL, -- e.g. "学霸AI", "小助手", "挑战者"
    ai_difficulty difficulty_enum NOT NULL,
    child_initial_hp INT NOT NULL DEFAULT 100,
    ai_initial_hp INT NOT NULL DEFAULT 100,
    child_final_hp INT DEFAULT 100,
    ai_final_hp INT DEFAULT 100,
    status pk_status_enum NOT NULL DEFAULT 'in_progress',
    total_rounds INT NOT NULL DEFAULT 5,
    reward_xp INT DEFAULT 0,
    reward_card_fragment_id UUID,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE ai_pk_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES ai_pk_sessions(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option_index INT NOT NULL,
    knowledge_point_id UUID REFERENCES knowledge_points(id),
    child_selected_index INT,
    child_is_correct BOOLEAN,
    child_response_ms INT,
    ai_selected_index INT,
    ai_is_correct BOOLEAN,
    ai_response_ms INT,
    damage_dealt_to_child INT DEFAULT 0,
    damage_dealt_to_ai INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. 四维激励经济体系：卡牌、合成、心愿币与宠物
CREATE TABLE card_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(128) NOT NULL, -- e.g. "🧬 生命单元", "🏛️ 古代文明"
    subject subject_enum NOT NULL,
    description TEXT,
    total_cards INT NOT NULL DEFAULT 4,
    reward_animation_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    set_id UUID REFERENCES card_sets(id) ON DELETE SET NULL,
    knowledge_point_id UUID REFERENCES knowledge_points(id) ON DELETE SET NULL,
    title VARCHAR(128) NOT NULL,
    rarity card_rarity_enum NOT NULL DEFAULT 'common',
    image_url VARCHAR(512) NOT NULL,
    summary_text TEXT NOT NULL,
    fun_fact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE child_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    obtained_via VARCHAR(64) DEFAULT 'course_complete', -- pk_win, exploration, daily_task
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (child_id, card_id)
);

CREATE TABLE child_card_sets_unlocked (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    set_id UUID NOT NULL REFERENCES card_sets(id) ON DELETE CASCADE,
    synthesized_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (child_id, set_id)
);

CREATE TABLE wish_wallets (
    child_id UUID PRIMARY KEY REFERENCES children(id) ON DELETE CASCADE,
    balance INT NOT NULL DEFAULT 0,
    total_earned INT NOT NULL DEFAULT 0,
    total_spent INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wish_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL, -- e.g. "一本《十万个为什么》", "周末科技馆门票"
    target_coins INT NOT NULL DEFAULT 1000,
    current_coins INT NOT NULL DEFAULT 0,
    status wish_status_enum NOT NULL DEFAULT 'in_progress',
    parent_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE wish_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    amount INT NOT NULL, -- 正数为赚取，负数为消耗/注入心愿
    source VARCHAR(64) NOT NULL, -- 'daily_task', 'perfect_lesson', 'parent_reward', 'wish_deduct'
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(64) NOT NULL, -- e.g. "小拓探索机器人", "智慧小熊猫", "星际小狐"
    code VARCHAR(64) UNIQUE NOT NULL,
    avatar_url VARCHAR(512),
    default_dialogue JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. 兴趣画像与家长 AI 洞察报告
CREATE TABLE interest_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    subject subject_enum NOT NULL,
    interest_score NUMERIC(5,2) NOT NULL DEFAULT 50.00, -- 0~100
    active_clicks INT DEFAULT 0,
    repeated_visits INT DEFAULT 0,
    exploration_completed_count INT DEFAULT 0,
    last_active_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (child_id, subject)
);

CREATE TABLE parent_insight_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    total_effective_duration_minutes INT NOT NULL DEFAULT 0,
    completed_courses_count INT NOT NULL DEFAULT 0,
    avg_accuracy_percent NUMERIC(5,2) DEFAULT 0.00,
    top_interest_subject subject_enum,
    weak_knowledge_point_ids JSONB, -- 需要复习的知识点
    ai_analysis_summary TEXT NOT NULL, -- AI 给家长的自然语言洞察
    ai_guidance_for_parent TEXT NOT NULL, -- AI 给家长的具体辅导建议
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. AI 课程流水线生产任务
CREATE TABLE ai_generation_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_file_url VARCHAR(1024) NOT NULL,
    subject subject_enum NOT NULL,
    grade_level INT NOT NULL,
    status ai_task_status_enum NOT NULL DEFAULT 'pending',
    transcript_text TEXT,
    raw_ai_output JSONB,
    generated_questions_count INT DEFAULT 0,
    quality_score INT DEFAULT 0,
    audit_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP WITH TIME ZONE
);

-- 10. 索引优化 (提高高频查询效率)
CREATE INDEX idx_videos_unit_id ON videos(unit_id);
CREATE INDEX idx_interactions_video_id ON video_interactions(video_id);
CREATE INDEX idx_learning_records_child_video ON learning_records(child_id, video_id);
CREATE INDEX idx_knowledge_mastery_child ON knowledge_mastery(child_id);
CREATE INDEX idx_child_cards_child_id ON child_cards(child_id);
CREATE INDEX idx_ai_pk_child_id ON ai_pk_sessions(child_id);
CREATE INDEX idx_interest_child ON interest_profiles(child_id);
