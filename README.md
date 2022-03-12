

## 腾讯云云函数

- 快速入门文档：https://cloud.tencent.com/document/product/583/37509

- 云函数控制台地址：https://console.cloud.tencent.com/scf/list

  

### 1、leetcode.js

在 `云函数` 平台中创建 `package.json` ，录入如下依赖：

```js
{
      "dependencies": {
      "request" : "2.81.0",
      "turndown": "7.1.1"
    }
}
```

选择 `在线依赖安装` ，然后点击 `部署测试` ，部署完成会在 `云函数` 目录生成一个 `node_modules` 的依赖目录，这时，只需要将 leetcode.js 的代码直接拷贝进 `index.js` 中，然后替换 webhook 的地址为你自己的 `企业微信机器人` 即可：

```js
const request = require('request');
const TurndownService = require('turndown')
// 配置自己企微的 webhook 地址
const wechatWeebhook = "webhook 地址"
```

