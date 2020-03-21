import ajax from 'ant-ajax';
import { message, Button } from 'antd';
import { detailPanelEmitter, dailyReportEmitter } from 'PUB_DIR/sources/utils/emitters';
import { VIEW_TYPE } from './consts';

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

//设置是否不再显示查看报告的工作通知
export function setIsNoLongerShowCheckReportNotice(cb) {
    let configData = {};
    configData[SITE_CONGFIG_KEY] = true;

    setWebsiteConfig(configData, result => {
        if (_.isFunction(cb)) cb();
    }, err => {
        message.error(err);
    });
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
                            type={item.type || 'default'}
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
export function getTplList(paramObj) {
    const { callback, query = {} } = paramObj;

    if (!_.isFunction(callback)) return;

    ajax.send({
        url: TPL_LIST_URL,
        query
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
export function saveTpl(data, paramObj = {}) {
    const { callback, isChangeStatus } = paramObj;

    ajax.send({
        url: TPL_URL,
        type: 'post',
        data
    })
        .done(result => {
            const msg = isChangeStatus ? '修改报告启停状态成功' : '保存报告规则设置成功';
            message.success(msg);
            if (_.isFunction(callback)) callback(result);
            if (isChangeStatus) dailyReportEmitter.emit(dailyReportEmitter.CHANGE_STATUS);
        })
        .fail(err => {
            message.error(err);
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
export function getReportList(callback, query) {
    if (!_.isFunction(callback)) return;

    if (!query) {
        query = {
            start_time: moment().startOf('day').valueOf(),
            end_time: moment().valueOf(),
        };
    }

    ajax.send({
        url: REPORT_URL,
        query
    })
        .done(result => {
            const list = _.get(result, 'daily_reports', []);
            callback(list);
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

//显示数字详情
export function showNumberDetail(record, name, e) {
    if (true) return; //因数字详情面板样式还没调好，暂时不让打开详情模板
    //只有单个销售的数据允许点击查看详情
    if (!record.nickname) return;

    if (e && _.isFunction(e.stopPropagation)) e.stopPropagation();

    const itemValues = _.get(record, 'item_values');
    const itemValue = _.find(itemValues, item => item.name === name);
    const numberDetail = _.get(itemValue, 'detail');

    showReportPanel({
        currentView: VIEW_TYPE.NUMBER_DETAIL,
        currentReport: record,
        numberDetail,
    });
}
