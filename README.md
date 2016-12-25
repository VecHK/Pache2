Pache 2
---

[![build status][travis-image]][travis-url]
[![codecov.io][codecov-image]][codecov-url]
[![node version][node-image]][node-url]

[travis-image]: https://img.shields.io/travis/VecHK/Pache2/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/VecHK/Pache2
[codecov-image]: https://img.shields.io/codecov/c/github/VecHK/Pache2/master.svg?style=flat-square
[codecov-url]: https://codecov.io/github/VecHK/Pache2?branch=master

[node-image]: https://img.shields.io/badge/node.js-%3E=_6.x-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/

干脆开个新的仓库吧，几乎完全重写的 Pache。不过自家用的本质不变：

 * 静态单页
 * 配置文件采用 suc
 * cluster 负载均衡
 * 比之前的版本多了个测试环节（istanbul + mocha + should）

## 安装

```
npm install node-pache
```

## 运行

```bash
node .
```

## 配置文件

打开项目目录中的 `config.suc` 你应该就知道如何操作了。。。
