# Innospark

华东师范大学和上海创智学院的innospark大模型的官网

## 技术选型

### Building

- vite，由于目前只有我一人维护，并且更新打包频繁，比较激进地选择了vite-rolldown版
- react-compiler，提升潜在性能的同时，也可以学习和发现一些react-compiler的问题

### UI

- react 19.2

### Routing

类型安全的tanstack-router，很好地支持typescript，并在频繁的更新和调整中及早发现问题
支持细粒度的路由策略，比如preload时机、view-trnasition、beforeLoad

并未采用file routing，而是各个模块导出独立的route，最后集中在rootRoute文件，分离模块路由之间的代码耦合性

### lint、format

- biome，规则较少，但是能快速格式化、发现一些问题
- eslintv9，提供更完整的问题发现，并且支持react-compiler-eslint的规则

### style

主要通过tailwindcssv4，实现快速开发、统一主题

对于复杂效果，通过vite内置的css预处理能力，使用scss编写样式表

### components lib

样式需要高度定制和风格统一

- schadcn/ui，基于radix和tailwind
- ai-element，vercel开源AI组件库，基于schadcn/ui

### 环境变量

- t3env，良好类型支持和数据校验

### 动画方案

- gsap
- motion

### 数据获取

基于axios+zod二次封装的request工具

通过tanstack-query实现异步数据状态管理

### state manage

zustand，足够轻量，目前没发现需要较多衍生型状态和性能问题，比较适合。

## 项目规范

### 目录

统一在src下

src子目录下的各个模块为全局级别，全局可用
例如：
api集中存放，以便于接口之间的queryKey触发和接口数据模型导出
components存放公共组件，全局可用

app目录下存放页面应用模块，每个页面应用间存放模块内部共享或私有子模块

虽然不是文件路由，但是页面应用模块应尽可能按照路由模式划分，以快速定位

### 命名

react导出组件，统一CamelCase
目录、工具、外部组件库文件统一采用`-`命名
不推荐采用camelCase，这玩意混在CamelCase中也不容易看出来
对于模块中的store、util、hook，应该以复数目录目录形式存放，例如stores

### 拆分时机

- 尽可能文件中内联，比如一个文件内拆分了一个组件，并且只有这个文件用，则应该将拆分的组件放在文件内
- 代码量过大，700-800行以上，考虑将UI展示层和业务逻辑层解耦，可用过自定也业务hook将业务逻辑处理后的数据提供给UI层

### 状态管理

尽可能少地使用全局状态，尽可能内部state、reducer、context维护(局部性)，或者通过searchParam维护状态（通过刷新页面或者链接分享时可保持状态）
