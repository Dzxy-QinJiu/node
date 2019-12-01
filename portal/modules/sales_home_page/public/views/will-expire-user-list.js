/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/30.
 */
let SalesHomeAction = require('../action/sales-home-actions');
let Alert = require('antd').Alert;
let Spinner = require('CMP_DIR/spinner');
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
let constantUtil = require('../util/constant');
var delayConstant = constantUtil.DELAY.TIMERANG;
let history = require('../../../../public/sources/history');
import Trace from 'LIB_DIR/trace';
var classNames = require('classnames');
class WillExpireUserList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...this.getInitialState(),
        };
    }

    getInitialState() {
        return {
            updateScrollBar: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.updateScrollBar) {
            this.setState({
                updateScrollBar: true
            }, () => {
                setTimeout(() => {
                    this.setState({
                        updateScrollBar: false
                    });
                }, delayConstant);
            });
        }
    }

    //重新获取过期用户
    retry(e) {
        Trace.traceEvent(e, '重新获取过期用户');
        SalesHomeAction.getExpireUser();
    }

    gotoUserList(item,num, e){
        Trace.traceEvent(e, '跳转到用户列表');
        var jumpUserObj = {
            app_id: item.app_id,
            user_type: item.user_type,
            start_date: item.start_date,
            end_date: item.end_date,
            page_size: num
        };
        if (this.props.member_id){
            jumpUserObj.sales_id = this.props.member_id;
        }else if (this.props.team_id){
            jumpUserObj.team_ids = this.props.team_id;
        }
        //跳转到用户列表
        history.push('/users', jumpUserObj);
    }

    showExpireUserItem(items) {
        return items.map((item) => {
            let num = item.user_type === Intl.get('common.trial.official', '正式用户') ? item.formalNum : item.trialNum;
            return (<div className="app-container">
                <span className="app-name">
                    {item.app_name}
                </span>
                <span className="app-num">
                    <i onClick={this.gotoUserList.bind(this, item, num)}>{num}</i>
                    {Intl.get('contract.22', '个')}
                </span>
            </div>);
        });
    }

    showExpireUsers() {
        var _this = this;
        var expireUserLists = this.props.expireUserLists;
        var errMsg = <span>{_this.props.errMsg}<a onClick={_this.retry}                                                  
            style={{
                marginLeft: '20px',
                marginTop: '20px'
            }}>{Intl.get('user.info.retry', '请重试')} </a></span>;
        //获取用户列表错误提示
        if (_this.props.isLoadingExpireUserList) {
            return <div>
                <Spinner />
            </div>;
        } else if (_this.props.errMsg !== '') {
            return <div>
                <Alert
                    message={errMsg}
                    type="error"
                    showIcon
                />
            </div>;
        } else {
            //不是错误或者加载中状态的显示
            //没有到期用户提醒
            if (_.isEmpty(expireUserLists)) {
                return <div>
                    {Intl.get('sales.home.no.expired.alert', '没有过期用户提醒!')}
                </div>;
            } else {
                //有到期用户提醒
                return (
                    <div>
                        {_.isArray(expireUserLists['day']) && expireUserLists['day'].length ?
                            <div className="tipitem">
                                <div className="tiptitle">{Intl.get('user.time.today1', '今日即将到期的试用用户')}</div>
                                <div className="tipcontent">
                                    {_this.showExpireUserItem(expireUserLists['day'])}
                                </div>
                            </div> : null
                        }
                        {_.isArray(expireUserLists['week']) && expireUserLists['week'].length ?
                            <div className="tipitem">
                                <div className="tiptitle">{Intl.get('user.time.this.week', '本周即将到期的试用用户')}</div>
                                <div className="tipcontent">
                                    {_this.showExpireUserItem(expireUserLists['week'])}
                                </div>
                            </div> : null
                        }
                        {_.isArray(expireUserLists['half_year']) && expireUserLists['half_year'].length ?
                            <div className="tipitem">
                                <div className="tiptitle">{Intl.get('user.time.half.year', '半年内即将到期的签约用户')}</div>
                                <div className="tipcontent">
                                    {_this.showExpireUserItem(expireUserLists['half_year'])}
                                </div>
                            </div> : null
                        }
                    </div>
                );
            }
        }
    }

    renderContent(salesListLi) {
        if (this.state.updateScrollBar) {
            return (
                <div>
                    {salesListLi}
                </div>
            );
        } else {
            return (
                <GeminiScrollbar enabled={this.props.scrollbarEnabled} ref="scrollbar">
                    {salesListLi}
                </GeminiScrollbar>
            );
        }
    }

    renderExpireUserContent() {
        let salesListHeight = this.props.getWillExpireUserListHeight();
        let salesListLi = this.showExpireUsers();
        let salesTitle = Intl.get('sales.homepage.will.expire.user', '即将到期用户');
        return (
            <div>
                <div className="user-list-top">
                    <span className="user-list-title"> {salesTitle}</span>
                </div>
                <ul className="user-list-container" style={{height: salesListHeight,}}>
                    {this.renderContent(salesListLi)}
                </ul>
            </div>
        );
    }

    render() {
        return (
            <div className="will-expire-user-list-container">
                <div className="will-expire-user-content">
                    {this.renderExpireUserContent()}
                </div>
            </div>

        );
    }
}
export default WillExpireUserList;