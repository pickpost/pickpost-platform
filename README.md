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
$ npm install
$ npm run build
$ npm start
$ open http://localhost:7001
```

## 如何加入开发
项目后端使用 [eggjs](https://eggjs.org/) 框架，数据库 ORM 使用 [mongoose](https://mongoosejs.com) ，前端框架使用 [ant-design](https://ant.design)。

### 数据库设计
详见：`/doc/schema.md`


提交示例：`git commit -m 'feat: 接口文档功能'`

### 项目接口概览
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

### 开发规范

项目内置统一的 eslint 规则配置，代码提交使用 commitlint 进行 message 格式校验，提交前会经过 eslint 检查。

## 联系我们

![QQ群二维码](https://gw.alipayobjects.com/mdn/O2O_shopdecorate/afts/img/A*mdGeQIgyMkkAAAAAAAAAAABjBAAAAQ/original)