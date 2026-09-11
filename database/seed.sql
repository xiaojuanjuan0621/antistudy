-- ====================================================================
-- 知识冒险岛 (ANti Study) - 演示测试数据种子 (Seed Data)
-- ====================================================================

-- 1. 创建示例用户与儿童账号
INSERT INTO users (id, username, nickname, role, avatar_url) VALUES
('11111111-1111-1111-1111-111111111111', 'parent_demo', '安泽妈妈', 'parent', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120'),
('22222222-2222-2222-2222-222222222222', 'child_demo', '张安泽', 'child', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120');

INSERT INTO parents (id, user_id, phone, email) VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '13800000000', 'parent@antistudy.com');

INSERT INTO children (id, user_id, parent_id, grade_level, xp, level, current_streak_days, max_streak_days, last_study_date) VALUES
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 4, 1850, 3, 18, 25, CURRENT_DATE);

-- 心愿钱包
INSERT INTO wish_wallets (child_id, balance, total_earned, total_spent) VALUES
('44444444-4444-4444-4444-444444444444', 680, 800, 120);

-- 心愿目标
INSERT INTO wish_items (id, child_id, title, target_coins, current_coins, status, parent_note) VALUES
('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', '一套《DK青少年科学大百科》', 1000, 680, 'in_progress', '安泽连续完成30天数学与探索任务奖励！');

-- 2. 课程体系
INSERT INTO courses (id, title, description, subject, grade_level, cover_image_url, is_exploration) VALUES
('a0000000-0000-0000-0000-000000000001', '小学四年级数学·分数的奥秘', '掌握分数的产生、分子分母意义及简单分数应用题。', 'math', 4, 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400', FALSE),
('a0000000-0000-0000-0000-000000000002', '探索世界·人体与细胞微观王国', '探索人体免疫系统，了解细胞如何抵御病毒！', 'biology', 4, 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400', TRUE),
('a0000000-0000-0000-0000-000000000003', '少年读历史·大秦帝国的崛起', '从商鞅变法到统一六国，探索度量衡与车同轨的智慧。', 'history', 4, 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400', TRUE);

-- 单元
INSERT INTO course_units (id, course_id, title, order_index) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '第一单元：认识分数的意义', 1),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', '第一单元：细胞大家族', 1);

-- 知识点
INSERT INTO knowledge_points (id, course_id, code, name, subject, difficulty) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'MATH_G4_FRAC_01', '分数的分子与分母', 'math', 'easy'),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'MATH_G4_FRAC_02', '平均分与单位“1”', 'math', 'medium'),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'BIO_G4_CELL_01', '植物细胞与动物细胞', 'biology', 'easy');

-- 视频
INSERT INTO videos (id, unit_id, title, video_url, duration_seconds, ai_quality_score, is_published, order_index) VALUES
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '分数的初体验：分披萨的秘密', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 360, 96, TRUE, 1),
('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', '微观探秘：细胞核是司令部吗？', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 420, 95, TRUE, 1);

-- 视频互动节点 (AI 插题)
INSERT INTO video_interactions (id, video_id, knowledge_point_id, timestamp_seconds, type, question, options, correct_option_index, explanation, hint_15s, difficulty, reward_xp) VALUES
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 45, 'single_choice', 
 '小拓把一块大披萨平均分成了 4 份，小明吃了其中 1 份，请问小明吃了这个披萨的几分之几？', 
 '[{"id": 0, "text": "1/2"}, {"id": 1, "text": "1/4"}, {"id": 2, "text": "1/3"}, {"id": 3, "text": "4/1"}]'::jsonb, 
 1, '平均分成4份，总份数4作分母；吃了1份，所取份数1作分子，所以是 1/4。', 
 '想一想：分母代表一共切成了多少份，分子代表拿走了多少份？', 'easy', 15),

('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 120, 'single_choice', 
 '如果两块大小完全一样的披萨，A 披萨切成 4 块取 1 块，B 披萨切成 8 块取 1 块，哪一块更大？', 
 '[{"id": 0, "text": "A 披萨的一块 (1/4)"}, {"id": 1, "text": "B 披萨的一块 (1/8)"}, {"id": 2, "text": "两块一样大"}]'::jsonb, 
 0, '单位“1”相同时，平均分的份数越少，每一份反而越大，1/4 > 1/8。', 
 '提示：4个人分一个蛋糕，跟8个人分一个蛋糕，哪种情况分到手里的更多？', 'medium', 20);

-- 3. 卡牌与套装
INSERT INTO card_sets (id, name, subject, description, total_cards) VALUES
('f0000000-0000-0000-0000-000000000001', '🧬 生命单元套装', 'biology', '收集全部细胞元件，解锁微观生命起源特别动画！', 4);

INSERT INTO cards (id, set_id, knowledge_point_id, title, rarity, image_url, summary_text, fun_fact) VALUES
('10000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', '细胞核·指挥官', 'rare', 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=200', '细胞的大脑，储存着所有遗传指令DNA。', '如果把人体细胞里的DNA拉直接起来，可以往返地球和太阳几十次！'),
('10000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', '线粒体·能量站', 'epic', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200', '为细胞一切活动提供能量的动力工厂。', '线粒体拥有自己独立的DNA，科学家推测它曾经是独立的古老细菌！');

-- 孩子已拥有的卡牌
INSERT INTO child_cards (child_id, card_id, quantity, obtained_via) VALUES
('44444444-4444-4444-4444-444444444444', '10000000-0000-0000-0000-000000000001', 1, 'course_complete');

-- 4. 兴趣画像数据 (反映孩子兴趣)
INSERT INTO interest_profiles (child_id, subject, interest_score, active_clicks, repeated_visits, exploration_completed_count) VALUES
('44444444-4444-4444-4444-444444444444', 'biology', 96.00, 18, 5, 8),
('44444444-4444-4444-4444-444444444444', 'history', 88.00, 12, 3, 5),
('44444444-4444-4444-4444-444444444444', 'math', 75.00, 9, 2, 3),
('44444444-4444-4444-4444-444444444444', 'english', 58.00, 4, 1, 2);
