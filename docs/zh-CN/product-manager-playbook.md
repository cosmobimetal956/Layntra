# 产品经理使用手册

从 **Plugins → Development** 运行并保持 **Layntra for Figma** 窗口打开。需要
重新导入时选择 `apps/figma-plugin/manifest.json`。每个流程先输入：

```text
$layntra status
```

## 从 PRD 到可编辑线框图

```text
$layntra plan
范围：new-frame
制作 390 × 844 的账号找回线框图。
包含：输入邮箱、已发送验证码、验证码错误、验证码过期、加载、成功和离线状态。
保留：当前页面的全部现有图层。
```

检查拟创建的 Frame 和文案，确认后输入：

```text
$layntra apply
```

## 审查当前选区

```text
$layntra review selection
检查信息层级、操作优先级、无障碍标签，以及是否缺少加载、空状态、权限、错误、
成功和离线状态。
不要修改 Figma。
```

返回结果必须明确写“尚未修改 Figma”。

## 优化但不改文案

```text
$layntra plan selection
目标：让登录卡片的信息层级更清楚。
保留：全部文案、品牌颜色和命名图层。
允许：间距、位置和尺寸。
禁止：删除、隐藏或增加插画图层。
```

只有计划显示正确文件、页面和选区后才输入 `$layntra apply`。如果计划后手动改变
选区，Layntra 必须停止并要求重新生成计划。

## 验证与恢复

对照计划、Layntra 写入后的节点数量和 Figma Layers 面板。如果结果错误或不完整，
先输入 `$layntra undo`，再制定新计划；如果目标已改变，Layntra 会停止而不是猜测。
