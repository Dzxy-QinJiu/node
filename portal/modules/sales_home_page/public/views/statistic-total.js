/**
 * 客户、用户、电话、合同统计总数
 * Created by wangliping on 2016/11/14.
 */
var React = require('react');
let Icon = require('antd').Icon;
let classNames = require('classnames');
let SalesHomeAction = require('../action/sales-home-actions');
var SalesHomeStore = require('../store/sales-home-store');
let viewConstant = require('../util/constant').VIEW_CONSTANT;//视图常量
let TimeUtil = require('../../../../public/sources/utils/time-format-util');
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import {listPanelEmitter} from 'PUB_DIR/sources/utils/emitters';
import shpPrivilegeConst from '../privilege-const';

class StatisticTotal extends React.Component {
    static propTypes = {
        customerTotalObj: PropTypes.object,
        userTotalObj: PropTypes.object,
        phoneTotalObj: PropTypes.object,
        callBackRecord: PropTypes.object,
        activeView: PropTypes.string,
    };

    //渲染等待效果、暂无数据的提示
    renderTooltip = (totalObj) => {
        if (totalObj.resultType === 'loading') {
            return (<Icon type="loading"/>);
        } else if (totalObj.resultType === 'error') {
            return (<div className="no-total-data">{Intl.get('sales.home.get.data.failed', '获取数据失败')}</div>);
        }
    };

    renderCustomerContent = () => {
        const customerTotalObj = this.props.customerTotalObj;
        const customerData = customerTotalObj.data;
        if (customerTotalObj.resultType) {
            //渲染等待效果或暂无数据的提示
            return this.renderTooltip(customerTotalObj);
        }
        return (<div className="statistic-total-content">
            <span className="crm-add-data add-data-style" onClick={this.showListPanel.bind(this, 'customer')}>
                <span className="total-data-desc">{Intl.get('sales.home.new.add', '新增')}&nbsp;</span>
                <span className='num'>{customerData.added || 0}</span>
            </span>
            <span className="crm-total-data total-data-style">
                <ReactIntl.FormattedMessage
                    id="sales.home.total.count"
                    defaultMessage={'共{count}个'}
                    values={{'count': customerData.total || 0}}
                />
            </span>
        </div>);

    };

    renderUserContent = () => {
        var userTotalObj = this.props.userTotalObj;
        const userData = userTotalObj.data;
        if (userTotalObj.resultType) {
            //渲染等待效果或暂无数据的提示
            return this.renderTooltip(userTotalObj);
        }
        return (<div className="statistic-total-content">
            <span className="user-add-data add-data-style" onClick={this.showListPanel.bind(this, 'user')}>
                <span className="total-data-desc">{Intl.get('sales.home.new.add', '新增')}&nbsp;</span>
                <span className='num'>{userData.added || 0}</span>
            </span>
            <span className="user-total-data total-data-style">
                <ReactIntl.FormattedMessage
                    id="sales.home.total.count"
                    defaultMessage={'共{count}个'}
                    values={{'count': userData.total || 0}}
                />
            </span>
        </div>);
    };

    renderPhoneContent = () => {
        var phoneTotalObj = this.props.phoneTotalObj;
        const phoneData = phoneTotalObj.data;
        if (phoneTotalObj.resultType) {
            //渲染等待效果或暂无数据的提示
            return this.renderTooltip(phoneTotalObj);
        }
        let time = TimeUtil.secondsToHourMinuteSecond(phoneData.totalTime || 0);
        return (<div className="statistic-total-content">
            {time.timeDescr !== '0' ? (
                <span className="add-data-style phone-total-time phone-total-data">
                    {time.hours > 0 ? <span className='num'>{time.hours}<span
                        className="total-data-desc">{Intl.get('user.time.hour', '小时')} </span></span> : null}
                    {time.minutes > 0 ?
                        <span className='num'>{time.minutes}<span
                            className="total-data-desc">{Intl.get('user.time.minute', '分')} </span></span> : null}
                    {time.second > 0 ? <span className='num'>{time.second}<span
                        className="total-data-desc">{Intl.get('user.time.second', '秒')} </span></span> : null}
                    {time.timeDescr === 0 ? time.timeDescr : null}
                </span>
            ) : null}

            <span className="phone-total-count total-data-style">
                <ReactIntl.FormattedMessage
                    id='sales.home.total.count'
                    defaultMessage={'共{template}个'}
                    values={{'template': <span className='num'>{phoneData.totalCount || '0'}</span>}}
                />
            </span>
        </div>);
    };

    renderContractContent = () => {
        return (<div className="statistic-total-content">
            <span className="contract-add-data add-data-style">新增8个</span>
            <span className="contract-total-data total-data-style">共6909个</span>
        </div>);
    };

    renderCallBackContent = () => {
        let callBackRecord = this.props.callBackRecord;
        if (callBackRecord.isLoading) {
            return <Icon type='loading' />;
        }
        if (callBackRecord.errorMsg) {
            return <div className='no-total-data'>{Intl.get('sales.home.get.data.failed', '获取数据失败')}</div>;
        }
        return (
            <div className='statistic-total-content'>
                <span className='add-data-style'>
                    <ReactIntl.FormattedMessage
                        id='sales.home.total.count'
                        defaultMessage={'共{template}个'}
                        values={{'template': <span className='num'>{callBackRecord.total || '0'}</span>}}
                    />
                </span>
            </div>
        );
    };

    //设置当前要展示的视图
    setActiveView = (view, e) => {
        if(view === 'customer'){
            Trace.traceEvent(e, '查看客户统计');
        }else if(view === 'user'){
            Trace.traceEvent(e, '查看用户统计');
        }else if(view === 'phone'){
            Trace.traceEvent(e, '查看电话统计');
        }else if(view === 'call_back'){
            Trace.traceEvent(e, '查看回访统计');
        }
        SalesHomeAction.setActiveView(view);
    };

    //显示客户或用户列表面板
    showListPanel(listType, e) {
        let typeName = '';

        if (listType === 'customer') {
            typeName = '客户';
        } else if (listType === 'user') {
            typeName = '用户';
        }

        Trace.traceEvent(e, '点击新增' + typeName + '数查看详细列表');

        const storeData = SalesHomeStore.getState();
        const startTime = storeData.start_time;
        const endTime = storeData.end_time;

        let paramObj = {listType};

        if (listType === 'customer') {
            _.extend(paramObj, {
                rangParams: JSON.stringify([{
                    from: startTime,
                    to: endTime,
                    name: 'start_time',
                    type: 'time'
                }]),
                data: JSON.stringify({}),
            });
        } else if (listType === 'user') {
            _.extend(paramObj, {
                create_begin: startTime,
                create_end: endTime
            });
        }

        listPanelEmitter.emit(listPanelEmitter.SHOW, paramObj);
    }

    render() {
        //响应式样式 col-xs-12 col-sm-6 col-md-6 col-lg-3（四个框时的样式）
        const autoResizeCls = 'total-data-item col-xs-12 col-sm-6 col-md-6 col-lg-3';
        let activeView = this.props.activeView;
        return (
            <div className="statistic-total-data" data-tracename="销售首页">
                <div className={autoResizeCls}>
                    <div onClick={this.setActiveView.bind(this,viewConstant.CUSTOMER)}
                        className={classNames('total-data-container', {'total-data-item-active': activeView === viewConstant.CUSTOMER})}>
                        <p>{Intl.get('sales.home.customer', '客户')}</p>
                        {this.renderCustomerContent()}
                    </div>
                </div>
                {hasPrivilege(shpPrivilegeConst.USER_ANALYSIS_MANAGER) || hasPrivilege(shpPrivilegeConst.USER_ANALYSIS_COMMON) ? (
                    <div className={autoResizeCls}>
                        <div onClick={this.setActiveView.bind(this,viewConstant.USER)}
                            className={classNames('total-data-container', {'total-data-item-active': activeView === viewConstant.USER})}>
                            <p>{Intl.get('sales.home.user', '用户')}</p>
                            {this.renderUserContent()}
                        </div>
                    </div>
                ) : null}
                <div className={autoResizeCls}>
                    <div onClick={this.setActiveView.bind(this,viewConstant.PHONE)}
                        className={classNames('total-data-container', {'total-data-item-active': activeView === viewConstant.PHONE})}>
                        <p>{Intl.get('common.phone', '电话')}</p>
                        {this.renderPhoneContent()}
                    </div>
                </div>  
                <div className={autoResizeCls}>
                    <div onClick={this.setActiveView.bind(this,viewConstant.CALL_BACK)}
                        className={classNames('total-data-container', {'total-data-item-active': activeView === viewConstant.CALL_BACK})}>
                        <p>{Intl.get('common.callback', '回访')}</p>
                        {this.renderCallBackContent()}
                    </div>
                </div>
            </div>);
    }
}

module.exports = StatisticTotal;

