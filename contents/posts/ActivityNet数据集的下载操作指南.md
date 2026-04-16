

------

# ActivityNet 下载踩坑实录： yt-dlp + cookies + Node

最近为了下载 ActivityNet 数据集，我照着一个老帖子操作（https://github.com/UCASUSTC/ActivityNet_Dataset_Download），结果一路踩坑。当然这个帖子也时间很久了，目前看来存在各种版本和环境受限也不能怪人家。
原帖的大意是：

1. 创建 Python 3.6 环境
2. 安装 `youtube-dl`
3. 安装 `pafy`
4. 跑 `ActivityNet_Dataset_Download.py`

看起来很简单，但实际操作下来会发现：

**这套方案现在基本已经失效了。**

我最后真正跑通的方案，不再是原帖里的 `pafy + youtube-dl + py36`，而是：

> **Python 3.10 + yt-dlp + cookies.txt + Node.js**

这篇文章把整个过程整理一下，给后来者避雷。

------

## 一、原始帖子的做法

原帖大概是这样：

### 1. 创建 py36 环境

```bash
conda create -n py36 pip python=3.6
```

### 2. 安装 youtube-dl

```bash
pip install youtube-dl
```

### 3. 安装 pafy

```bash
pip install pafy
```

### 4. 准备文件

```bash
git clone https://github.com/UCASUSTC/ActivityNet_Dataset_Download.git
```

然后下载：

- `ActivityNet_Dataset_Download.py`
- `activity_net.v1-3.min.json`

放到同一个目录下。

### 5. 修改路径

把脚本里的：

```python
directory = '/path/to/your/directory/'
```

改成你自己的目录，比如：

```python
directory = r'D:\activitynet\'
```

### 6. 运行

```bash
python ActivityNet_Dataset_Download.py
```

------

## 二、为什么原帖方法现在基本跑不通

因为它依赖的东西都太老了：

- Python 3.6 过时
- `youtube-dl` 过时
- `pafy` 依赖 `youtube-dl`
- YouTube 现在的反爬机制比以前严格很多

所以老方案经常会出现下面这些问题：

### 1. `pip install youtube-dl` 就报错

我遇到过这种错误：

```text
ValueError: check_hostname requires server_hostname
```

这通常不是 `youtube-dl` 本身坏了，而是：

- 代理配置有问题
- pip 走了错误的代理
- 老环境下 SSL/requests/urllib3 组合异常

### 2. `pafy` 解析失败

典型报错：

```text
Unable to extract uploader id
```

这个基本可以理解成：

> `youtube-dl` 太老，已经跟不上 YouTube 页面变化了。

### 3. 访问 YouTube 直接网络错误

比如：

```text
WinError 10051
向一个无法连接的网络尝试了一个套接字操作
```

这说明根本连不上 YouTube。

### 4. 就算连上了，也会 403

比如：

```text
HTTP Error 403: Forbidden
```

这不是代码写错，而是 YouTube 的限制。

### 5. 就算加了 cookies，也可能继续失败

后来继续排查，发现还有 JS challenge 的问题。
典型报错：

```text
n challenge solving failed
Only images are available for download
```

这个坑更隐蔽：你以为已经装好了 `yt-dlp`，其实还差一个 **JavaScript runtime**。

------

## 三、结论：别再用 pafy + youtube-dl 了

我最后的结论很明确：

### 已经过时的方案

- `python=3.6`
- `youtube-dl`
- `pafy`

### 当前可用方案

- `python=3.10`
- `yt-dlp`
- `cookies.txt`
- `Node.js`

如果你现在刚开始，建议直接跳过老方案，不要重复踩坑。

------

## 四、最终可用的完整下载方案

下面是我最后实际跑通的版本。

------

## 五、环境准备

### 1. 创建新 conda 环境

建议直接用 Python 3.10：

```bash
conda create -n activitynet310 python=3.10 -y
conda activate activitynet310
```

不要再纠结 py36 了。

------

### 2. 安装 yt-dlp

```bash
pip install -U "yt-dlp[default]"
```

我这里最后安装的是带默认依赖的版本，这样会把一些必要依赖也补上。

------

### 3. 安装 Node.js

这是关键中的关键。

去官网安装 Node.js，安装完成后确认：

```bash
node -v
```

只要能输出版本号就说明装好了。
我这里是：

```text
v24.14.1
```

如果你后面碰到 `n challenge solving failed`，大概率就是没有正确启用 Node。

------

## 六、准备 ActivityNet 文件

### 1. 下载原始项目

```bash
git clone https://github.com/UCASUSTC/ActivityNet_Dataset_Download.git
```

### 2. 下载标注 JSON

去 ActivityNet 官网下载：

- `activity_net.v1-3.min.json`

### 3. 准备目录

我最后的目录结构是：

```text
D:\activitynet\
├── ActivityNet_Dataset_Download.py
├── activity_net.v1-3.min.json
├── cookies.txt
```

------

## 七、准备 cookies.txt

这一步是为了通过 YouTube 的限制。

### 做法

1. 浏览器安装扩展：`Get cookies.txt LOCALLY`
2. 打开 YouTube
3. 必须开代理，并且最好登录账号
4. 用插件导出 `cookies.txt`
5. 保存到：

```text
D:\activitynet\cookies.txt
```

### 一个重要提醒

`cookies.txt` 很敏感，相当于登录态。
不要把它发到群里，不要贴到论坛，不要传给别人。

------

## 八、最终可用脚本

这是我最后整理出来的版本，已经能正常跑。

```python
import os
import json
import subprocess
import time

# 下载根目录
directory = r'D:\activitynet\\'

# 统计
success_count = 0
fail_count = 0
skip_count = 0

# 日志文件
success_log = 'success_videos.txt'
failed_log = 'failed_videos.txt'

# 打开 json
with open('activity_net.v1-3.min.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

videos = data['database']

for idx, key in enumerate(videos):
    video = videos[key]

    # 数据集划分：training / validation / testing
    subset = video['subset']

    # 标签名
    annotations = video['annotations']
    label = ''
    if len(annotations) != 0:
        label = '/' + annotations[0]['label'].replace(' ', '_')

    # 输出目录
    label_dir = directory + subset + label
    if not os.path.exists(label_dir):
        os.makedirs(label_dir)

    # 视频 URL
    url = video['url']

    # 输出模板
    output_template = os.path.join(label_dir, key + '.%(ext)s')

    # 如果 mp4 / webm / mkv 已存在，就跳过
    existing_files = [
        os.path.join(label_dir, key + '.mp4'),
        os.path.join(label_dir, key + '.webm'),
        os.path.join(label_dir, key + '.mkv'),
    ]

    if any(os.path.exists(f) for f in existing_files):
        print(f'[SKIP] {key}')
        skip_count += 1
        continue

    print(f'\n[{idx}] Downloading: {url}')

    success = False

    # 重试 3 次
    for attempt in range(3):
        try:
            subprocess.run([
                'yt-dlp',
                '--js-runtimes', 'node',
                '--cookies', 'cookies.txt',
                '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                '--referer', 'https://www.youtube.com/',
                '--sleep-interval', '3',
                '--max-sleep-interval', '6',

                # 优先下载 mp4 视频 + m4a 音频；没有就退回单文件 mp4
                '-f', 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]',

                # 合并输出为 mp4
                '--merge-output-format', 'mp4',

                '-o', output_template,
                url
            ], check=True)

            success = True
            success_count += 1

            with open(success_log, 'a', encoding='utf-8') as sf:
                sf.write(f'{key}\t{subset}\t{url}\n')

            print(f'[OK] {key}')
            break

        except subprocess.CalledProcessError as e:
            print(f'Attempt {attempt + 1} failed: {e}')
            time.sleep(5)

    if not success:
        fail_count += 1
        print(f'[FAILED] {url}')

        with open(failed_log, 'a', encoding='utf-8') as ff:
            ff.write(f'{key}\t{subset}\t{url}\n')

# 最终统计
print('\n===== SUMMARY =====')
print(f'Success: {success_count}')
print(f'Failed:  {fail_count}')
print(f'Skipped: {skip_count}')
```

------

## 九、运行方法

```bash
cd /d D:\activitynet
conda activate activitynet310
python ActivityNet_Dataset_Download.py
```

------

## 十、如何判断你已经真的跑通了

如果你看到类似下面的输出，说明流程已经打通：

```text
[youtube] [jsc:node] Solving JS challenges using node
[download] 100%
[Merger] Merging formats into "xxx.mp4"
[OK] xxxxx
```

其中最关键的是这句：

```text
[jsc:node] Solving JS challenges using node
```

它说明 `yt-dlp` 已经成功调用 Node 去解 YouTube 的 JS challenge。

------

## 十一、我实际踩过的坑和解决办法

这一部分是整篇最有用的地方。

------

### 坑 1：路径切换失败

比如你输入了：

```bash
cd D：\activitynet
```

注意这里的冒号如果是中文全角，就会报错。

正确写法：

```bash
cd /d D:\activitynet
```

------

### 坑 2：pip 安装失败

报错类似：

```text
check_hostname requires server_hostname
```

大概率是代理配置问题。

可以先清掉：

```bash
set http_proxy=
set https_proxy=
```

或者把代理写规范。

------

### 坑 3：`youtube-dl` 和 `pafy` 失效

报错类似：

```text
Unable to extract uploader id
```

结论很直接：

> 别修了，换 `yt-dlp`。

------

### 坑 4：网络连不上 YouTube

报错类似：

```text
WinError 10051
```

这就是网络不通，需要代理。

------

### 坑 5：403 Forbidden

报错类似：

```text
HTTP Error 403: Forbidden
```

说明 YouTube 拒绝了你的请求。
这时候需要：

- cookies
- 合理的 user-agent
- referer
- 最重要的是后面那个 Node 方案

------

### 坑 6：android client 和 cookies 冲突

我一开始试过：

```text
youtube:player_client=android
```

结果会出现：

```text
Skipping client "android" since it does not support cookies
```

所以后面直接不用这套，改成 `cookies + node` 方案。

------

### 坑 7：最难发现的坑：JS challenge

典型报错：

```text
n challenge solving failed
Only images are available for download
```

这个是很多人最后卡住的地方。

原因是：

> 你虽然装了 `yt-dlp`，但没有让它真正跑 JavaScript 解密。

最终解决方案是：

```bash
yt-dlp --js-runtimes node ...
```

也就是脚本里必须有：

```python
'--js-runtimes', 'node'
```

没有这句，很多视频还是会失败。

------

### 坑 8：视频本身已经失效

典型报错：

```text
Video unavailable
```

或者你直接在 YouTube 上搜不到这个视频。

这种情况不是你的错，也不是脚本错。
是因为 ActivityNet 很老，很多原始视频已经：

- 删除
- 私有
- 下架
- 区域限制

这种直接跳过就行。

------

## 十二、关于存储空间：不是内存扛不住，是硬盘扛不住

我后来发现，真正该担心的不是内存，而是硬盘。

ActivityNet 里大约有：

```text
19994
```

个视频。

如果你全量下，70GB 大概率不够。

### 为什么

因为脚本是逐条下载、逐条写盘的，所以：

- 内存占用不会特别夸张
- 但视频文件会不断累积到硬盘

所以瓶颈往往是：

- 磁盘空间
- 下载时间
- 失效链接比例

### 建议

不要一开始就全量下。
可以先：

- 只下载某个 subset
- 或者先下载前 500 个做测试
- 估算平均空间占用再决定

------

## 十三、已下载的视频会不会重复下载

不会。
我最终脚本里已经做了判断：

- 如果这个视频 ID 对应的 `mp4/webm/mkv` 已经存在
- 就会自动跳过

所以脚本可以反复续跑，不需要担心每次从头重复下载。

------

## 十四、推荐的实际使用策略

如果你也准备下载 ActivityNet，我建议：

### 方案 A：先测试能不能跑通

先单独测一个视频：

```bash
yt-dlp --js-runtimes node --cookies cookies.txt "https://www.youtube.com/watch?v=sJFgo9H6zNo"
```

如果这一条能下成功，再跑整个脚本。

### 方案 B：先小规模下载

先跑一部分，比如 500 个。
看看：

- 占了多少空间
- 成功率多少
- 失败率多少

### 方案 C：接受一部分视频会永远失败

这是老数据集的现实情况。
不要追求 100% 成功。

------

## 十五、给后来者的最终结论

如果你是从老帖子来的，我建议你直接记住下面这句：

> **ActivityNet 原帖里的 py36 + youtube-dl + pafy 方法已经过时，不要再折腾。**

现在真正能跑通的方案是：

> **Python 3.10 + yt-dlp + cookies.txt + Node.js**

而且要注意：

- 要能访问 YouTube
- 要有 cookies
- 要让 yt-dlp 用 Node 解 JS challenge
- 要接受一部分视频已经失效

------

## 十六、最后总结

这次下载 ActivityNet，真正解决问题的关键节点有四个：

1. **放弃 pafy / youtube-dl**
2. **改用 Python 3.10 + yt-dlp**
3. **加入 cookies.txt**
4. **用 Node.js 解 YouTube 的 JS challenge**

把这四件事做好，流程就能打通。

------

如果你也在折腾 ActivityNet，希望这篇能帮你少踩一点坑。
至少别再在 `pafy` 和 `youtube-dl` 上浪费时间了。