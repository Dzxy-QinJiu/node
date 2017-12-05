# oplate webapp

## 安装
```
npm i
```
## 生成功能模块
```
gulp create --module 模块名
```

## 在已有模块下生成子功能
```
gulp create --module 已有的模块名 --sub 子功能名
```

## 开发模式启动
提前编译文件
```
npm run dll &&npm run server
```
一个窗口
```
npm run dev
```

另一个窗口
```
node app.js
```

## 开发模式启动同时启用测试
```
npm run start-with-test
```

## 开发模式启动同时启用示例
```
npm run start-with-example
```
## 产品模式启动
```
npm run production
```
