/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/11.
 */
var language = require('../../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('../css/user-detail-change-record-es_VE.less');
} else if (language.lan() === 'zh') {
    require('../css/user-detail-change-record-zh_CN.less');
}
var UserDetailChangeRecordStore = require('../store/user-detail-change-record-store');
var UserDetailChangeRecordAction = require('../action/user-detail-change-record-actions');
import {AntcTimeLine} from 'antc';
//滚动条
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var Spinner = require('../../../../components/spinner');
import { Select, Alert } from 'antd';
import StatusWrapper from 'CMP_DIR/status-wrapper';
import ShearContent from '../../../../components/shear-content';
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';
var Option = Select.Option;
import {CHANGE_RECORD_TYPE} from 'PUB_DIR/sources/utils/consts';
//高度常量
var LAYOUT_CONSTANTS = {
    RIGHT_PANEL_PADDING_TOP: 20,//右侧面板顶部padding
    RIGHT_PANEL_PADDING_BOTTOM: 20,//右侧面板底部padding
    DYNAMIC_LIST_MARGIN_BOTTOM: 20,//列表距离底部margin
    RIGHT_PANEL_TAB_HEIGHT: 36,//右侧面板tab高度
    RIGHT_PANEL_TAB_MARGIN_BOTTOM: 17,//右侧面板tab的margin
    TOP_PADDING: 100,//选择框留白
};

class UserDetailChangeRecord extends React.Component {
    static defaultProps = {
        userId: '1'
    };

    onStateChange = () => {
        this.setState(this.getStateData());
    };

    getStateData = () => {
        return UserDetailChangeRecordStore.getState();
    };

    componentDidMount() {
        UserDetailChangeRecordStore.listen(this.onStateChange);
        let appLists = this.props.appLists;
        this.showSelectedApp(this.props, appLists);
    }

    //如果外层有选中的app时，默认为外层选中的app，如果没有，就用app列表中的第一个
    showSelectedApp = (props, queryObj) => {
        var appId = props.selectedAppId;
        //如果外层有选中的app时，默认为外层选中的app，如果没有，就用app列表中的第一个
        if (appId) {
            var selectedApp = _.find(this.props.appLists, (item) => {
                return item.app_id === appId;
            });
            var appName = selectedApp && selectedApp.app_name ? selectedApp.app_name : '';
            if (appName) {
                UserDetailChangeRecordAction.setApp(appName);
            }
        } else {
            if (!_.isEmpty(queryObj)) {
                appId = queryObj[0].app_id;
                UserDetailChangeRecordAction.setApp(queryObj[0].app_name);
            }
        }
        this.getUserDetailChangeRecord({
            app_id: appId + ',everyapp',
            user_id: props.userId,
            page_size: this.state.page_size,
        });

    };

    getUserDetailChangeRecord = (queryObj) => {
        UserDetailChangeRecordAction.getUserDetailChangeRecord(queryObj);
    };

    componentWillReceiveProps(nextProps) {
        const userId = nextProps.userId;
        if (userId !== this.props.userId) {
            //dispatch过程中不能再dispatch，加延时，两个dispatch发送错开时间
            setTimeout(() => {
                this.showSelectedApp(nextProps, nextProps.appLists);
            });
        }
    }

    componentWillUnmount() {
        UserDetailChangeRecordStore.unlisten(this.onStateChange);
    }

    renderTimeLineItem = (item) => {
        let operateTime = _.get(item, 'record_time'); // 具体变的时间
        return (
            <dl>
                <dd>
                    <p>
                        <ShearContent>
                            {_.get(item, 'content')}
                        </ShearContent>
                    </p>
                </dd>
                <dt>{moment(operateTime).format(oplateConsts.TIME_FORMAT)}</dt>
            </dl>
        );
    };

    handleChange = (value) => {
        const app = _.find(this.props.appLists, item => item.app_id === value);
        const appName = app ? app.app_name : '';
        let queryObj = {
            user_id: this.props.userId,
            app_id: value + ',' + 'everyapp',
            page_size: this.state.page_size,
        };
        UserDetailChangeRecordAction.getUserDetailChangeRecord(queryObj);
        UserDetailChangeRecordAction.setApp(appName);
    };

    retryChangeRecord = () => {
        let queryObj = {
            user_id: this.props.userId,
        };
        UserDetailChangeRecordAction.getUserDetailChangeRecord(queryObj);
    };

    getSelectOptions = () => {
        var appLists = this.props.appLists;
        var list = appLists.map((item) => {
            return (<Option value={item['app_id']} key={item['app_id']}>{item['app_name']}</Option>);
        });
        return list;
    };

    renderTraceRecord = (height) => {
        return this.renderRecordBlock(height);
    };

    renderRecordBlock = (height) => {
        var recordLength = this.state.changeRecord.length;
        var width = 120;
        if (this.state.changeRecordLoading && this.state.app) {
            //加载中的情况
            return (
                <div>
                    <Select value={this.state.app} style={{ width: width }}
                        onChange={this.handleChange}>
                        {this.getSelectOptions()}
                    </Select>
                    <StatusWrapper loading={true} height={height - LAYOUT_CONSTANTS.TOP_PADDING} />
                </div>
            );
        } else if (recordLength === 0 && !this.state.changeRecordLoading) {
            //加载完成，没有数据的情况
            return (
                <div>
                    <Select showSearch value={this.state.app} style={{ width: width }}
                        onChange={this.handleChange}
                        filterOption={(input, option) => ignoreCase(input, option)}>
                        {this.getSelectOptions()}
                    </Select>
                    <Alert
                        message={Intl.get('common.no.data', '暂无数据')}
                        type="info"
                        showIcon={true}
                    />
                </div>
            );
        } else if (recordLength !== 0 && !this.state.changeRecordLoading) {
            //加载完成，有数据的情况
            return (
                <div id="change-record-area">
                    <Select showSearch value={this.state.app} style={{ width: width }}
                        onChange={this.handleChange}
                        getPopupContainer={() => document.getElementById('change-record-area')}
                        filterOption={(input, option) => ignoreCase(input, option)}>
                        {this.getSelectOptions()}
                    </Select>
                    <AntcTimeLine
                        className="icon-blue"
                        data={this.state.changeRecord}
                        groupByDay={true}
                        timeField="record_time"
                        contentRender={this.renderTimeLineItem}
                        dot={<span className="iconfont icon-change"></span>}
                    />
                </div>
            );
        } else if (this.state.changeRecordErrMsg && !this.state.changeRecordLoading) {
            //加载完成，出错的情况
            var errMsg = <span>{this.state.changeRecordErrMsg}
                <a onClick={this.retryChangeRecord} style={{ marginLeft: '20px', marginTop: '20px' }}>
                    <ReactIntl.FormattedMessage id="user.info.retry" defaultMessage="请重试" />
                </a>
            </span>;
            return (
                <div className="alert-wrap">
                    <Alert
                        message={errMsg}
                        type="error"
                        showIcon={true}
                    />
                </div>
            );
        }

    };

    state = this.getStateData();

    render() {
        var divHeight = $(window).height()
            - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_TOP //右侧面板顶部padding
            - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_BOTTOM //右侧面板底部padding
            - LAYOUT_CONSTANTS.DYNAMIC_LIST_MARGIN_BOTTOM //列表距离底部margin
            - LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_HEIGHT //右侧面板tab高度
            - LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_MARGIN_BOTTOM //右侧面板tab的margin
            ;
        return (
            <div style={{ height: this.props.height }} className="recordList">
                <GeminiScrollbar>
                    {this.renderTraceRecord(divHeight)}
                </GeminiScrollbar>
            </div>
        );

    }
}
UserDetailChangeRecord.propTypes = {
    height: PropTypes.number,
    userId: PropTypes.string,
    appLists: PropTypes.array
};

module.exports = UserDetailChangeRecord;

