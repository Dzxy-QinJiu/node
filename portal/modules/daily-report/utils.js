import ajax from 'ant-ajax';
import { message } from 'antd';
import { detailPanelEmitter } from 'PUB_DIR/sources/utils/emitters';
const { getLocalWebsiteConfig, setWebsiteConfig } = require('LIB_DIR/utils/websiteConfig');
const SITE_CONGFIG_KEY = 'is_no_longer_show_check_report_notice';

//获取报告列表
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

//获取是否不再显示查看报告的工作通知
export function getIsNoLongerShowCheckReportNotice() {
    return _.get(getLocalWebsiteConfig(), SITE_CONGFIG_KEY);
}

//设置是否显示查看报告的工作通知
export function setIsNoLongerShowCheckReportNotice() {
    setWebsiteConfig(SITE_CONGFIG_KEY, true);
}

//显示报告面板
export function showReportPanel() {
    detailPanelEmitter.emit(detailPanelEmitter.SHOW);
}
