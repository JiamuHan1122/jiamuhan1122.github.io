# 文献精读第一篇：Two-Stream CNN

## 基本思路

| 项目                                   | 内容                                                         |
| -------------------------------------- | ------------------------------------------------------------ |
| 标题                                   | **Two-Stream Convolutional Networks for Action Recognition in Videos**  <br>用于视频动作识别的双流卷积神经网络 |
| 期刊/年份                              | arXiv：2014  <br>CVPR 2014（会议版本）                       |
| 作者                                   | Karen Simonyan, Andrew Zisserman（Oxford / VGG）             |
| 研究领域/关键词                        | Video Action Recognition  <br>Deep Learning for Video Understanding  <br>Two-stream architecture（双流架构）  <br>Optical Flow（光流） |
| 本研究解决了什么问题？                 | 如何用深度学习方法有效同时建模视频中的**外观信息（appearance）**和**运动信息（motion）**，从而提升视频动作识别性能。  <br><br>**原文**：*“The challenge is to capture the complementary information on appearance from still frames and motion between frames.”*  <br>**译文**：挑战在于捕捉静态画面和帧间运动中外观的互补信息。 |
| 研究背景（已有研究/应用中的问题）      | **1. 传统方法的局限（Hand-crafted features）**  <br>HOG / HOF / MBH  <br>特征设计复杂、依赖大量人工经验、难以端到端学习。  <br><br>**2. 早期深度学习方法的问题**  <br>直接输入 stacked RGB frames，希望网络隐式学到时序信息，但效果不理想，网络并没有真正学到 motion。 |
| 作者提出的核心问题                     | 是否可以显式地将“外观”和“运动”分开建模，并用深度网络分别学习，再进行融合？  <br><br>**原文**：*“We investigate a different architecture based on two separate recognition streams (spatial and temporal), which are then combined by late fusion.”*  <br>**译文**：我们研究一种基于两个独立识别流（空间流和时间流）的不同架构，然后通过晚期融合结合它们。 |
| 研究动机（现实意义/技术痛点/认知空白） | **1. 现实动机（Practical Motivation）**  <br>视频数据爆炸式增长（监控、短视频、自动驾驶）；动作识别是视频理解的核心问题；需要比人工特征更具泛化能力的方法。  <br><br>**2. 技术痛点（Technical Pain Points）**  <br>- Motion 很难从 raw frames 中学到  <br>- 视频数据集太小，容易过拟合  <br>  - UCF-101：9.5K videos  <br>  - HMDB-51：3.7K videos  <br>- 深度模型尚未超过传统方法，论文目标之一就是 *“exceeds by a large margin previous attempts”*。  <br><br>**3. 明确的研究空白**  <br>- 传统方法：motion 很强，但不可学习  <br>- 深度方法：可学习，但 motion 表达不足  <br>- Two-Stream ConvNet 的目标：在一个可学习、端到端的框架中，统一并泛化传统 motion 特征（HOF, MBH, trajectories）。 |

---

## 研究目标与创新点

### 作者的研究目标（目的 / 假设 / 任务）

设计一种能够同时有效建模视频中**外观（appearance）**与**运动（motion）**的深度学习架构，用于视频动作识别。

**原文**：*“We investigate architectures of discriminatively trained deep Convolutional Networks (ConvNets) for action recognition in video.”*  
**译文**：我们研究判别训练深度卷积网络（ConvNet）用于视频动作识别的架构。

### 具体研究目标

1. 显式建模外观与运动信息  
2. 将优秀的传统手工特征纳入可学习框架  
3. 在小规模视频数据集上训练深度模型  

### 创新点（提出的新方法 / 新视角）

#### 创新点一：Two-Stream ConvNet 架构

作者提出双流卷积网络：

- **Spatial Stream（空间流）**：基于 RGB 单帧，建模外观
- **Temporal Stream（时间流）**：基于多帧 Optical Flow，建模运动
- **Late Fusion（晚期融合）**：在 softmax 层进行融合

#### 创新点二：基于 Dense Optical Flow 的 Temporal ConvNet 新输入表示

Temporal stream 不使用 raw RGB frames，而是：

**原文**：*“the input to our model is formed by stacking optical flow displacement fields between several consecutive frames.”*  
**译文**：我们模型的输入是通过在几个连续帧之间叠加光流位移场形成的。

#### 创新点三：Multi-task Learning 用于视频动作识别的新训练策略

作者将 **UCF-101** 和 **HMDB-51** 作为两个任务联合训练。

---

## 与已有工作的差异与创新

### 1. vs 传统手工特征方法（IDT / MBH）

| 方面 | 传统方法                | Two-Stream ConvNet |
| ---- | ----------------------- | ------------------ |
| 特征 | 手工设计（HOG / MBH）   | 数据驱动自己学习   |
| 训练 | 分阶段（特征 + 分类器） | 端到端             |
| 泛化 | 依赖经验                | 可扩展             |

### 2. vs 早期视频 ConvNet（Karpathy et al. 2014）

| 方面   | 早期 ConvNet     | 本文              |
| ------ | ---------------- | ----------------- |
| Motion | 隐式学习         | 显式 optical flow |
| 输入   | RGB frame stacks | Flow stacks       |
| 效果   | 明显弱于手工特征 | 显著更有效        |

### 3. vs 生物启发模型（HMAX）

- **HMAX**：手工、浅层  
- **Two-Stream ConvNet**：深层、可训练  

---

## 实验设计思路

### 输入对象（数据 / 样本 / 系统）

#### 数据集（Datasets）

- **UCF-101**：101 类动作，约 13K videos（平均约 180 帧/视频）
- **HMDB-51**：51 类动作，约 6.8K videos

#### 评测协议

两者都使用官方提供的 **3 个 train/test splits**，指标是：

- 三折平均分类准确率（mean classification accuracy across splits）

#### 训练数据规模（每个 split）

- **UCF-101**：每个 split 约 9.5K 训练视频
- **HMDB-51**：每个 split 约 3.7K 训练视频

#### 样本形式

作者把“视频样本”在不同流里变成两种输入：

- **Spatial stream 输入（appearance）**：单帧 RGB 图像（single frame input）
- **Temporal stream 输入（motion）**：多帧 dense optical flow 堆叠，形成 **2L 通道输入体**

#### 光流来源（System / preprocessing）

采用 **Brox 光流方法** 的 OpenCV GPU 实现，并且**预先离线计算**，避免训练瓶颈。

---

## 实验流程（使用方法与技术）

### 1. 模型与训练设置（Model + Training）

#### 整体结构

- Two-stream + late fusion
- 两个 ConvNet（Spatial / Temporal）
- 最后用 late fusion 融合 softmax 分数

#### 融合方式

两种：

1. **Averaging（平均）**
2. **Linear SVM on stacked L2-normalized softmax scores**  
   （对拼接的 softmax 分数训练线性 SVM）

#### 网络架构

两个流基本都用类似的 **CNN-M-2048** 结构（图 1 示意），Temporal 为省内存去掉第二个 norm 层。

#### 训练采样策略（非常关键）

- SGD mini-batch = 256
- 每次迭代：随机抽 256 个训练视频（类别均匀）
- 每个视频随机取 1 帧作为样本

#### 数据增广

- **Spatial**：224×224 随机裁剪 + 水平翻转 + RGB jittering  
  （并把视频帧先缩放到短边 256）
- **Temporal**：从 optical flow 体里裁剪 224×224×2L，并翻转

---

### 2. 测试流程（Testing / Inference）

对每个视频：

1. 均匀采样 25 帧
2. 每帧做 10 个 crops（四角 + 中心 × 翻转）
3. 对帧与 crop 的预测分数做平均，得到视频级分数
4. Spatial / Temporal 两路分数再做 fusion（avg 或 SVM）

---

## 验证路径（如何证明有效）

作者的验证设计是“层层递进”的，逻辑非常清晰：**先单流，再时间流输入消融，再多任务，再融合，再对标 SOTA。**

### 路径 A：先证明 Spatial stream 合理（外观能做多少）

对 Spatial stream 做三种训练策略对比：

1. 从头训练
2. ImageNet 预训练后 fine-tune
3. ImageNet 预训练后只训最后一层

并比较 dropout 设置，展示**预训练的重要性**（Table 1a）。

---

### 路径 B：证明 Temporal stream 的关键设计有效

对 Temporal stream 做输入配置消融（Table 1b）：

- 单帧光流 L=1 vs 堆叠光流 L=5/10  
  → 证明“长时运动信息”很关键
- mean subtraction  
  → 弱化全局相机运动，有帮助
- trajectory stacking、bi-directional flow  
  → 也比较，但增益较小

并且专门复现对比 “slow fusion RGB frames” 架构，证明：

- 多帧重要
- 但用 raw frames 让网络学 motion 太难
- 用 optical flow 更有效

---

### 路径 C：证明 multi-task learning 能缓解小数据问题

在 HMDB-51 上比较：

- 直接训 HMDB
- 用 UCF 预训练再 fine-tune
- 手工挑不重叠类别加入训练
- **multi-task learning（同时训 UCF + HMDB）最好**（Table 2）

---

### 路径 D：证明 two-stream 融合带来互补增益

比较：

- averaging vs SVM fusion（SVM 更好）
- 是否 bi-directional flow
- temporal 是否 multi-task（Table 3）

核心结论：**两路互补，融合显著提升。**

---

### 路径 E：对标 state-of-the-art

最终用 3-split 平均精度，在 UCF-101 / HMDB-51 上对比：

- 传统 IDT 系列
- 早期 deep video nets（slow fusion / HMAX）
- Spatial alone / Temporal alone / Two-stream（Table 4）

---

## 图表与核心结果

### 最核心的图表及其想回答的问题

#### Figure 1：Two-stream 总体架构图（最核心）

![figure_01](contents\posts\images\TAD_paper_1\figure_01)

**想回答的问题：**  
动作识别是否可以拆成外观（spatial）+ 运动（temporal）两条网络分别学，然后再融合得到更好结果？

**图在表达什么：**

- 左：Spatial stream ConvNet（输入 single frame）
- 右：Temporal stream ConvNet（输入 multi-frame optical flow）
- 输出 class score，最后做 fusion（late fusion）

---

#### Table 1：单流网络的关键消融

**想回答的问题：**

- Spatial stream：预训练 / 微调 / 只训最后层，哪种更好？
- Temporal stream：为什么要用多帧光流堆叠？L=1 vs L=5/10？mean subtraction 有用吗？trajectory / bi-dir 有用吗？

---

#### Table 2：Multi-task learning 是否能缓解 HMDB-51 小数据问题？

**想回答的问题：**  
在 HMDB-51 训练数据很少时，multi-task（HMDB + UCF 两头 softmax）是不是比其它“借数据”方式更有效？

---

#### Table 3：Two-stream 融合是否真的带来互补增益？怎么融合最好？

**想回答的问题：**

- spatial 与 temporal 是否互补？
- 融合后提升多少？
- avg vs SVM 哪个更好？
- bi-dir / multi-task 对融合结果影响如何？

---

#### Table 4：与当时 SOTA 的最终对标（最关键结果表）

**想回答的问题：**  
最终方法是否达到 / 超过当时最强的传统方法（IDT 系列），并显著优于早期 deep video nets？

---

#### Figure 4：Temporal ConvNet 第一层卷积核可视化（解释性证据）

**想回答的问题：**  
Temporal stream 学到的是什么？它是否在泛化传统手工特征（如 MBH 的 flow gradient）？

论文图注与正文指出：一些 filters 对光流做 spatial derivatives，一些做 temporal derivatives，对应 MBH 等思想。

---

#### Figure 5 / Figure 6：混淆矩阵 + 每类召回（错误分析）

**想回答的问题：**

- 模型错在哪些类？
- 混淆的原因是 spatial 还是 temporal？

论文举例分析 **Hammering** 的混淆来源分别来自两条流的偏差。

---

## 支撑主要结论的数据

### 结论 A：Temporal（光流）比 Spatial（单帧外观）更强，且多帧光流关键

- Temporal 单帧光流（L=1）约 **73.9%**
- 堆叠（L=10）提升到 **81.0%**（UCF-101 split1）

这直接支持论文主张：**显式 motion 表达（optical flow stacking）很有效。**

---

### 结论 B：Two-stream 融合显著提升（互补性成立），SVM 融合更好

- UCF-101 split1：融合后到 **87.0%**
- 设定：uni-directional, multi-task + SVM fusion

论文明确说两条流互补、融合明显提升。

---

### 结论 C：Multi-task learning 能有效缓解视频小数据，尤其 HMDB-51

- HMDB-51 split1：从 **46.6%（不加数据）**
- 提升到 **55.4%（multi-task）**

---

### 结论 D：最终对标结果接近 / 达到当时最强传统方法

3 splits 平均：

- Two-stream（SVM）UCF-101：**88.0%**
- HMDB-51：**59.4%**

与 IDT 系列对比表明其“competitive with state of the art”这一主张有数据支撑。

---

## 图表呈现方式（颜色 / 比例 / 对比方式）

### Figure 2：光流可视化的编码方式

将光流的水平 / 垂直分量当作图像通道展示：

- higher intensity corresponds to positive values
- lower intensity to negative values

即：**高亮 = 正值，低亮 = 负值**

---

### Figure 3：用颜色对应“帧与位移向量”的关系

图注明确：frames 与 displacement vectors 用相同颜色标记对应关系。  
重点是强调两种输入构造：

1. fixed location stacking
2. trajectory stacking

---

### Figure 4：卷积核矩阵式可视化

以“列 = filter、行 = input channel”的网格展示 96 个 filters，每个 spans 20 channels（dx/dy of 10 flows）。

这是用**排列布局**来表达跨通道结构，而不是颜色本身。

---

### Tables 1–4：全部采用“对比表”呈现

统一用 **Accuracy (%)** 作为指标，通过分块对照：

- Spatial / Temporal
- 不同配置
- 不同训练策略
- 不同融合方式

例如：

- Table 1b：固定网络，只改输入配置
- Table 3：固定两流，只改融合策略

---

### Figure 5 / 6：错误分析的经典组合

- **Figure 5**：Confusion Matrix（类间混淆结构）
- **Figure 6**：Per-class Recall（逐类难度分布）

这套组合用于：

- 先看整体混淆
- 再定位具体弱类
- 并用案例解释错因（Hammering 案例）

---

# 思路总结

## 作者是如何一步步说服读者这项研究有价值的？

### 1. 先立真实痛点

早期深度模型在视频动作识别上明显不如传统方法，根因不是“深度不行”，而是 **motion 没学好**。

### 2. 提出直觉上合理、工程上可行的假设

外观（appearance）和运动（motion）本来就是两类信息，不强行混在一起学，而是显式拆开。

### 3. 用结构设计回应问题，而不是靠技巧

- Two-stream 架构
- Optical flow 作为 temporal stream 的输入

### 4. 用“循序渐进的实验”而不是一个结果说服人

- 先证明单流有效
- 再做输入 / 训练策略消融
- 再证明融合互补
- 最后对标 SOTA

---

## 我从这篇文章的结构和逻辑中学到了什么？

### 1. 好论文不是“结果驱动”，而是“问题驱动”

每一个实验都在回答一个明确的问题。  
表格不是为了多，而是为了排除其它解释。

### 2. 架构设计本身就是创新

创新不一定是新 loss、新算子，**重新组织问题（problem formulation）**就是重大创新。

### 3. 实验顺序本身是一种“论证逻辑”

Ablation → Regularization → Fusion → SOTA

---

## 我能借这个思路做什么？

- 当一个任务很难：**先拆信息维度**（而不是堆模型）
- 当数据不够：用 **multi-task / auxiliary task** 当正则
- 写论文时：不要急着给最强结果，而是先让读者“同意你的问题拆解方式”

> **先把问题拆对，再用实验一步步证明你拆得对。**

---

# 备注

## 想复用的句式 / 写作策略

### 1. 问题定义

**原文**：  
*“The challenge is to capture the complementary information on appearance from still frames and motion between frames.”*

**译文**：  
挑战在于如何捕获来自静态帧的外观信息与帧间运动信息这两种互补的信息。

**可复用模板：**

> The key challenge is to capture the complementary information of A and B.

A / B 可以是：

- appearance / motion
- local / global
- spatial / temporal
- modality 1 / modality 2

---

### 2. 批判已有方法（Limitations of Prior Work）

**原文**：  
*“The model is expected to implicitly learn spatio-temporal motion-dependent features, which can be a difficult task.”*

**译文**：  
该模型被期望去隐式地学习时空相关的运动特征，而这本身是一个困难的任务。

**可复用模板：**

> Existing methods rely on implicitly learning X, which can be a difficult task.

X 可以是：

- motion
- alignment
- long-range dependency
- cross-modal interaction

这里不说“方法不好”，而是说“学习目标设定得不合理”。

---

### 3. 方法动机（Design Motivation）

**原文**：  
*“Rather than forcing the network to estimate motion implicitly, we explicitly represent motion using optical flow.”*

**译文**：  
与其强迫网络隐式地估计运动信息，我们选择使用光流来显式地表示运动。

**可复用模板：**

> Rather than forcing the model to learn X implicitly, we explicitly model X using Y.

非常适合写 Method 的第一段。

---

### 4. 结构设计合理性（Why This Architecture）

**原文**：  
*“Decoupling the spatial and temporal nets also allows us to exploit the availability of large amounts of annotated image data.”*

**译文**：  
将空间网络与时间网络解耦，还使我们能够充分利用大量已有的标注图像数据。

**可复用模板：**

> Decoupling A and B allows us to better exploit C.

A / B：

- 子任务
- 模态
- 尺度
- 分支

C：

- 数据
- 先验
- 预训练模型
- 计算资源

---

### 5. 实验逻辑引导（Experimental Narrative）

**原文**：  
*“We begin by comparing different architectures on the first split of the UCF-101 dataset.”*

**译文**：  
我们首先在 UCF-101 数据集的第一个划分上比较不同的网络结构。

**可复用模板：**

> We begin by evaluating X to understand Y.

X：

- 不同模块
- 不同设置

Y：

- 某一设计是否合理

用于引出 ablation study，让实验显得“有目的性”。

---

### 6. 用实验支撑结论（Evidence → Claim）

**原文**：  
*“Temporal ConvNets significantly outperform the spatial ConvNets, which confirms the importance of motion information for action recognition.”*

**译文**：  
时间流卷积网络显著优于空间流卷积网络，这验证了运动信息在动作识别中的重要性。

**可复用模板：**

> These results confirm that X is crucial for Y.

X：想强调的关键因素  
Y：任务

非常适合写在 Results / Discussion。

---

### 7. 贡献升维（Beyond Performance）

**原文**：  
*“Our representation generalises hand-crafted features.”*

**译文**：  
我们的表示方法泛化了传统的手工特征。

**可复用模板：**

> Our method can be viewed as a learnable generalisation of X.

X：

- 传统方法
- 经典特征
- 既有 pipeline

用于把你的方法放进学术发展脉络中。

---

# 推荐文献

## 1. TSN – Temporal Segment Networks (ECCV 2016)

- Wang et al.
- 把 Two-Stream 扩展到**长时建模（long-term temporal structure）**

## 2. I3D – Inflated 3D ConvNets (CVPR 2017)

- Carreira & Zisserman
- 把 2D ConvNet “膨胀”成 3D