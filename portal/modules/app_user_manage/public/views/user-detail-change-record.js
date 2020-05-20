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
import { Select, Alert } from 'antd';
import StatusWrapper from 'CMP_DIR/status-wrapper';
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';
var Option = Select.Option;
import {CHANGE_RECORD_TYPE} from 'PUB_DIR/sources/utils/consts';
import { recordChangeTimeLineItem } from 'PUB_DIR/sources/utils/common-method-util';
//高度常量
var LAYOUT_CONSTANTS = {
    SELECT_APP_ZONE_HEIGHT: 60 // 筛选区域的高度
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
        var selectedAppId = props.selectedAppId;
        //如果外层有选中的app时，默认为外层选中的app，如果没有，就用app列表中的第一个
        if (selectedAppId) {
            var selectedApp = _.find(this.props.appLists, (item) => {
                return item.app_id === selectedAppId;
            });
            var appName = selectedApp && selectedApp.app_name ? selectedApp.app_name : '';
            if (appName) {
                UserDetailChangeRecordAction.setApp(appName);
            }
        } else {
            if (!_.isEmpty(queryObj)) {
                selectedAppId = queryObj[0].app_id;
                UserDetailChangeRecordAction.setApp(queryObj[0].app_name);
            }
        }
        this.getUserDetailChangeRecord({
            app_id: selectedAppId + ',everyapp',
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

    handleChange = (selectedAppId) => {
        let queryObj = {
            user_id: this.props.userId,
            app_id: selectedAppId + ',' + 'everyapp',
            page_size: this.state.page_size,
        };
        UserDetailChangeRecordAction.getUserDetailChangeRecord(queryObj);
        UserDetailChangeRecordAction.setApp(selectedAppId);
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
        if (this.state.changeRecordLoading && this.state.selectedAppId) {
            //加载中的情况
            return (
                <div>
                    <StatusWrapper loading={true} height={height}/>
                </div>
            );
        } else if (recordLength === 0 && !this.state.changeRecordLoading) {
            //加载完成，没有数据的情况
            return (
                <div>
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
                    <AntcTimeLine
                        className="icon-blue"
                        data={this.state.changeRecord}
                        groupByDay={true}
                        timeField="record_time"
                        contentRender={recordChangeTimeLineItem}
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

    renderConditionZone() {
        return (
            <Select
                showSearch
                value={this.state.selectedAppId}
                onChange={this.handleChange}
                filterOption={(input, option) => ignoreCase(input, option)}>
                {this.getSelectOptions()}
            </Select>
        );
    }

    render() {
        const divHeight = this.props.height - LAYOUT_CONSTANTS.SELECT_APP_ZONE_HEIGHT;
        return (
            <div style={{ height: this.props.height }} className="recordList">
                {this.renderConditionZone()}
                <div style={{height: divHeight}}>
                    <GeminiScrollbar>
                        {this.renderTraceRecord(divHeight)}
                    </GeminiScrollbar>
                </div>
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

