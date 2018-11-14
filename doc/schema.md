# 表设计
> 一个接口可以关联多个请求参数和响应数据，通过不同的搭配来模拟各种情况。
> 每一个 Response 可以有自己的生成逻辑

## 通用字段

```
_id: "ObjectId("58b6d7e52fce2157a7fc0c55")"
createdAt: "ISODate("2017-03-01T14:17:09.966Z")"
updatedAt: "ISODate("2017-03-01T14:17:09.966Z")"
```

## User Table
```
workid: '007',
cname: '',
avatar: '',
```

## Collection Table
```
groupId: '',
name: '',
owner: [],
members: [],
envs: [ // 环境的切换
  {
    value: '',
    remark: '',
  }
],
accounts: [ // 系统账号
  {
    username: '',
    password: '',
    remark: '',
  },
]
```

## CollectionAPI Table
```
_id: '',
collectionId: '',
apiId: '',
parentId: ''
```

## Project Table
```
groupId: '',
name: 'kb-sale',
public: true,
auth: 'kbservcenter',
owners: [
  {
      key: '007',
      label: 'admin',
  }
],
members: [
  {
      key: '007',
      label: 'admin',
  }
],
envs: [ // 环境的切换
  {
    value: '',
    name: '', // 环境名称
  }
],
accounts: [ // 系统账号
  {
    username: '',
    password: '',
    remark: '',
  }
]
```

## API Table
```
projectId: '', // 所属系统
method: '', // GET、POST
url: '/books.json',
paramIndex: 0,
params: [
  {
    title: '',
    content: ''
  }
],
headerIndex: 0,
headers: [
  {
    title: '',
    content: '',
  }
],
requestIndex: 0,
requests: [
  {
    title: '',
    content: ''
  }
],
responseIndex: 0,
responses: [
  {
    title: '',
    content: ''
  }
],
creator: [
  {
    key: '',
    label: ''
  }
],
updator: [
  {
    key: '',
    label: ''
  }
]
```