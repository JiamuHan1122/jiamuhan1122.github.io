------

# 🧠 Motivation（动机总结）

## ![motivation](/contents/posts/images/project_log/motivation.png)

1. **现有方法（baseline）的问题**
   - 时间边界不准（boundary error）
   - 动作和背景容易混淆
   - 对关键动作阶段不敏感
2. **关键难点**
   - 动作是连续的，但预测是离散的
   - 边界附近最容易出错
   - 不同时间帧的重要性不一样
3. **核心想法**
   - 引入**语义信息（semantic）**来区分 action / background
   - 引入**时间可靠性（temporal reliability）**来强调关键帧
   - 从而得到更精准的时间边界

👉 一句话总结：

> 利用语义信息和时间可靠性来提升动作边界定位精度

------

## English

1. **Limitations of existing methods (baseline)**
   - Inaccurate temporal boundaries
   - Confusion between action and background
   - Lack of sensitivity to critical moments
2. **Key challenges**
   - Actions are continuous, but predictions are discrete
   - Boundary regions are inherently ambiguous
   - Different frames contribute unequally
3. **Core idea**
   - Introduce **semantic guidance** to separate action/background
   - Introduce **temporal reliability** to weight important frames
   - Improve boundary precision

👉 One-line summary:

> We leverage semantic guidance and temporal reliability to improve temporal boundary localization.

------

# 🧩 Framework（方法总结）

## ![framework](/contents/posts/images/project_log/framework.png)

### Stage 1：语义蒸馏（Semantic Distillation）

- 输入视频 → 多帧采样
- 用 CLIP 提取：
  - 视觉特征（video features）
  - 文本语义（text semantics）
- 做：
  - 多视角一致性（multi-view consistency）
  - 语义对齐（visual-text alignment）
- 得到：
  - 教师模型输出（teacher logits）
  - 时间可靠性权重 ( q_t )

👉 核心作用：
**学习“哪些时间更重要 + 动作语义是什么”**

------

### Stage 2：可靠性感知定位（Reliability-aware Localization）

- 输入：增强后的特征
- 三个关键分支：

1. **Classification Branch**
   - 预测每一帧属于哪个动作
2. **Regression Branch**
   - 预测时间边界偏移
3. **Boundary Prior Head（关键创新🔥）**
   - 利用可靠性 ( q_t )
   - 提供起点/终点的先验信息

------

### 最终输出

- 精确时间边界：
  ![image-20260412183305763](C:\Users\lenovo\AppData\Roaming\Typora\typora-user-images\image-20260412183305763.png)

👉 比 baseline：

- 边界更准
- 动作区间更干净

## 

### Stage 1: Semantic Distillation

- Input video → multi-view temporal sampling
- Extract:
  - Visual features via CLIP
  - Text semantics via CLIP text encoder
- Apply:
  - Multi-view consistency learning
  - Visual-text alignment
- Outputs:
  - Teacher logits
  - Temporal reliability weights ( q_t )

👉 Goal:
**Learn semantic-aware and reliability-aware temporal representations**

------

### Stage 2: Reliability-aware Localization

- Input: enhanced features from Stage 1
- Three branches:

1. **Classification Branch**
   - Frame-level action prediction
2. **Regression Branch**
   - Temporal boundary offsets
3. **Boundary Prior Head (key contribution)**
   - Guided by reliability ( q_t )
   - Provides start/end priors

------

### Final Output

👉 Compared to baseline:

- More precise boundaries
- Better action-background separation

------

# ⭐ 总结

## 中文

> 本文通过语义蒸馏学习时间可靠性，并在定位阶段引入边界先验，从而显著提升了动作时间边界的精度。

## English

> We propose a reliability-aware framework that leverages semantic distillation and boundary priors to achieve more precise temporal action localization.

------

