/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/8/18.
 */
const packager = require('electron-packager');
const path = require('path');
const options = {
    dir: "./",
    name: "ketao",
    icon: "./electron/logo.ico",
    platform: "win32",
    arch: "x64",
    out: "./release",
    electronVersion: "1.7.5",
    buildVersion:"1.0.0",
    overwrite: true,
    ignore: [/.gitignore/,
        /.idea/,
        /webpack.config.*/,
        /.happypack/
    ]
};
packager(options, function done_callback(err, appPaths) {
});