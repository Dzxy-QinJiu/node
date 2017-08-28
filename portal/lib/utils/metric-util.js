/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/7/7.
 */
"use strict";
const Influx = require("influxdb-nodejs");
class Metric {
    constructor(metricAddress) {
        this.metricAddress = metricAddress;
    }

    /**
     * 发送度量数据
     * @param metric
     */
    sendMetrics(metric) {
        if (!metric) return;
        //如果没设置root，同时path是全路径时，提取path域名后的路径
        if (!metric.root && metric.path) {
            var pat = /(^https?:\/\/[^\/|^/?]+)([\/|\?].*)/ig;
            var result = pat.exec(metric.path);
            var root;
            if (result) {
                root = result[1];
                var path = result[2];
                if (path != undefined) {
                    metric.path = path;
                }
            }
            metric.root = root || "/";
        }
        const client = new Influx(this.metricAddress || "http://127.0.0.1:8086/mydb");
        const fieldSchema = {
            value: 'f'
        };
        const tagSchema = {
            root: '*',
            path: '*',
            sessionID: '*',
            method: '*'
        };
        client.schema('response_time', fieldSchema, tagSchema, {
            stripUnknown: true,
        });
        client.write('response_time', 'ms')
            .tag({
                root: metric.root,
                path: metric.path,
                sessionID: metric.sessionID,
                method: metric.method
            })
            .field({
                value: metric.spendTime || 0
            })
            .time(Date.now(), 'ms')
            .then(() => restLogger && restLogger.info("write point success"))
            .catch(err => restLogger && restLogger.error(`write point fail, ${err.message}`));
    }
}
module.exports = Metric;