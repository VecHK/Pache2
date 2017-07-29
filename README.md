Pache 2
---

[![build status][travis-image]][travis-url]
[![codecov.io][codecov-image]][codecov-url]
[![node version][node-image]][node-url]

[travis-image]: https://api.travis-ci.org/VecHK/Pache2.svg?branch=master
[travis-url]: https://travis-ci.org/VecHK/Pache2
[codecov-image]: https://img.shields.io/codecov/c/github/VecHK/Pache2/master.svg
[codecov-url]: https://codecov.io/github/VecHK/Pache2?branch=master
[node-image]: https://img.shields.io/badge/node.js-%3E=_7.9-green.svg
[node-url]: http://nodejs.org/download/

Pache 2，還是原來的感覺（自家用的本質）：

 * 配置文件採用 suc
 * cluster 負載均衡
 * AVA 測試框架
 * 優秀的功能
 * 分頁


## 安裝

```
npm install node-pache --g
```

## 要求

 - Redis
 - mongoDB

## 運行

```bash
pache create ./config_name.suc
pache run ./config_name.suc
```

## 關於配置文件

因為採用了 suc，故你可能需要查看一下相關教程。目錄中的 config.suc 當中有相關設置項的說明。

## 單元测试

```
ava ./test-ava
```

## License

MIT
