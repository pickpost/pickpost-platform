# PickPost 前后端协作平台

## 启动本地服务

> 依赖 MongoDB 数据库服务，开发前，请先启动数据库

```bash
$ npm install
$ npm run dev
$ open http://localhost:7001

```
## 生产环境启动
```bash
$ npm run stop
$ npm install
$ npm run build
$ npm start
$ open http://localhost:7001
```

## 如何加入开发
项目基于 eggjs + mongoogse 开发，
数据库设计详见：`/doc/schema.md`

```
.
├── README.md
├── app
│   ├── assets      // 前端代码
│   ├── common
│   ├── controller
│   ├── io
│   ├── middleware
│   ├── model
│   ├── public      // 静态资源
│   ├── router.js   // 前后端路由
│   ├── service
│   └── view
├── config
│   ├── config.default.js
│   ├── config.prod.js
│   └── plugin.js
├── doc
│   └── schema.md
└── ppackage.json
```

## Todo:

- 接口类型支持自定义
- 接口支持树形管理