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

开发规范：代码提交使用 commitlint 进行 message 格式校验，提交前会经过 eslint 检查。

提交示例：`git commit -m 'feat: 接口文档功能'`

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

- 配置项集中管理
- 接口类型支持自定义
- 接口支持树形管理 [done]
- xhr-plus 替换成 axios
- 接口版本管理方案和对应的界面


- 接口文档快速导入
比如在语雀使用这样一个格式：

```
{
  name: 'hhk', // 名称
  sex: 'F', // F=男;M=女
  peoples: [

  ]
}
```

分组删除:只允许删除空分组
分组下面的接口，只允许移出。

需求和后端系统如何做区分，是否有必要同时做两个维度？
两个维度如何让不同角色用户理解？

向需求新增接口的时候，先填接口名，再填所属项目。
如果是 SPI 的话，是不应该要选所属项目的。


Todo: schema editor 如果改变了字段名，之前的备注信息丢失。
优化方法：path 匹配 || 行号匹配。
