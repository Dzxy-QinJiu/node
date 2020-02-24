import ajax from 'ant-ajax';
import { message } from 'antd';

export function getReportList(callback) {
    if (!_.isFunction(callback)) return;

    ajax.send({
        url: '/user/data.js'
    })
        .done(result => {
            result = _.get(localStorage, 'daily-report.report-list');
            callback(result);
        })
        .fail(err => {
            message.error(err);
            callback();
        });
}

