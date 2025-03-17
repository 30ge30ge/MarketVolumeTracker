# MarketVolumeTracker

# 沪深两市成交额监控系统

这是一个用于监控沪深两市成交额的Web应用，可以实时展示市场数据和历史趋势，帮助投资者了解市场交易活跃度。

## 功能特点

- 实时显示沪深两市总成交额
- 展示上证指数和深证成指的最新数据及涨跌情况
- 提供今日成交额的小时走势图，与昨日数据对比
- 提供近30日成交额的趋势图
- 数据每小时自动更新
- 响应式设计，支持移动端和桌面端

## 预览效果

![系统预览](https://example.com/preview.png)

## 安装与使用

### 前提条件

- Python 3.7+
- pip 包管理工具

### 安装步骤

1. 克隆仓库到本地
2. 安装依赖
3. 运行应用
4. 在浏览器中访问 `http://localhost:5000` 查看应用

## 项目结构
MarketVolumeTracker/
├── app.py # Flask应用主文件
├── market_volume_tracker.py # 数据获取和处理模块
├── requirements.txt # 项目依赖
├── static/ # 静态资源
│ ├── css/
│ │ └── style.css # 样式文件
│ ├── js/
│ │ └── main.js # JavaScript脚本
│ └── data/ # 数据存储目录
└── templates/
└── index.html # HTML模板


## 技术栈

- 后端：Flask, AKShare
- 前端：HTML5, CSS3, JavaScript, ECharts
- 数据源：新浪财经API

## 数据来源

本项目使用AKShare获取新浪财经的实时行情数据，包括上证指数和深证成指的价格、涨跌幅和成交额等信息。

## 自定义配置

如需修改更新频率或其他配置，可以编辑`app.py`文件中的相关参数：

## 部署到生产环境

对于生产环境，建议使用Gunicorn或uWSGI作为WSGI服务器，并配合Nginx作为反向代理：
使用Gunicorn运行
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

## 许可证

MIT License
