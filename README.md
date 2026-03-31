# cuteFC-web

`cuteFC-web` 是 `cuteFC-gui` 项目面向终端用户裁剪出的运行时发布包。

需要特别说明的是，`cuteFC` 既可以作为命令行软件使用，也可以作为本地 Web 应用部署使用；而当前这个部署包提供的是 **本地 Web 应用的启动方式**，用于启动后端服务、前端界面以及内置运行时资源。

该发布包仅保留了运行本地 Web 应用所需的文件，用于：

- 启动 FastAPI 后端
- 启动 React 前端
- 运行随包提供的 `cuteFC`
- 预加载内置演示数据集

## 包含内容

- `backend/app/`
- `frontend/src/` 与 `frontend/public/`
- `cuteFC/` 运行时包
- `local_vendor/cigar.py`
- `data/demo/` 最小演示资源
- `start.sh`

## 快速开始

系统要求：

- Python 3.11+
- Node.js 20+
- npm

运行方式：

```bash
chmod +x start.sh
./start.sh
```

可选参数：

```bash
SKIP_INSTALL=1 ./start.sh
BOOTSTRAP_DEMO=0 ./start.sh
BACKEND_PORT=18000 FRONTEND_PORT=15173 ./start.sh
```

该脚本会创建或复用 `.venv`，安装后端运行依赖和随包提供的 `cuteFC`，安装前端依赖，启动前后端服务，并默认导入演示数据。
