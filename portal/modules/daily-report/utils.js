import ajax from 'ant-ajax';
import { message, Button } from 'antd';
import { detailPanelEmitter } from 'PUB_DIR/sources/utils/emitters';
const { getLocalWebsiteConfig, setWebsiteConfig } = require('LIB_DIR/utils/websiteConfig');
const SITE_CONGFIG_KEY = 'is_no_longer_show_check_report_notice';
const DR_URL = '/rest/customer/v3/dailyreport';
const TPL_LIST_URL = DR_URL + '/templates';
const TPL_URL = DR_URL + '/template';
const REPORT_URL = DR_URL + '/report';

//获取是否不再显示查看报告的工作通知
export function getIsNoLongerShowCheckReportNotice() {
    return _.get(getLocalWebsiteConfig(), SITE_CONGFIG_KEY);
}

//设置是否显示查看报告的工作通知
export function setIsNoLongerShowCheckReportNotice() {
    setWebsiteConfig(SITE_CONGFIG_KEY, true);
}

//显示报告面板
export function showReportPanel(props) {
    detailPanelEmitter.emit(detailPanelEmitter.SHOW, props);
}

//隐藏报告面板
export function hideReportPanel() {
    detailPanelEmitter.emit(detailPanelEmitter.HIDE);
}

//渲染按钮区域
export function renderButtonZoneFunc(buttons) {
    return (
        <div className="btn-zone">
            {_.map(buttons, item => {
                if (item.hide) {
                    return null;
                } else {
                    return (
                        <Button
                            onClick={item.func}
                        >
                            {item.name}
                        </Button>
                    );
                }
            })}
        </div>
    );
}

//获取模板列表
export function getTplList(callback) {
    if (!_.isFunction(callback)) return;

    ajax.send({
        url: TPL_LIST_URL
    })
        .done(result => {
            result = _.unionBy(result, 'name');
            result = _.filter(result, item => item.name);
            callback(result);
        })
        .fail(err => {
            message.error(err);
            callback();
        });
}

//保存模板
export function saveTpl(data, callback) {
    if (!_.isFunction(callback)) return;

    ajax.send({
        url: TPL_URL,
        type: 'post',
        data
    })
        .done(result => {
            message.success('保存模板成功');
            callback(result);
        })
        .fail(err => {
            message.error(err);
            callback();
        });
}

//获取模板数值
export function getTplValues(callback) {
    if (!_.isFunction(callback)) return;

    ajax.send({
        url: TPL_URL + '/values'
    })
        .done(result => {
            callback(result);
        })
        .fail(err => {
            message.error(err);
            callback();
        });
}

//获取报告列表
export function getReportList(callback) {
    if (!_.isFunction(callback)) return;

    ajax.send({
        url: REPORT_URL
    })
        .done(result => {
            callback(result);
        })
        .fail(err => {
            message.error(err);
            callback();
        });
}

//保存报告
export function saveReport(data, callback) {
    if (!_.isFunction(callback)) return;

    ajax.send({
        url: REPORT_URL,
        type: 'post',
        data
    })
        .done(result => {
            message.success('保存报告成功');
            callback(result);
        })
        .fail(err => {
            message.error(err);
            callback();
        });
}
