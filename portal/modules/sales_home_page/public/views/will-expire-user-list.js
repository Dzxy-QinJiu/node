/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/30.
 */
let SalesHomeAction = require("../action/sales-home-actions");
let Alert = require("antd").Alert;
let Spinner = require("CMP_DIR/spinner");
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
let constantUtil = require("../util/constant");
var delayConstant = constantUtil.DELAY.TIMERANG;
let history = require("../../../../public/sources/history");
import Trace from "LIB_DIR/trace";
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
        Trace.traceEvent(e, "重新获取过期用户");
        SalesHomeAction.getExpireUser();
    }

    gotoUserList (item, e){
        Trace.traceEvent(e, "跳转到用户列表");
        //跳转到用户列表
        history.pushState({
            app_id: item.app_id,
            user_type: item.user_type,
            start_date: item.start_date,
            end_date: item.end_date,
            page_size: item.total
        }, "/user/list", {});
    }

    showExpireUserItem(items) {
        return items.map((item) => {
            let num = item.user_type == Intl.get("common.trial.official", "正式用户") ? item.formalNum : item.trialNum;
            return (<div>
                <ReactIntl.FormattedMessage
                    id="sales.home.expired.tip"
                    defaultMessage={`{appName}有{num}名{userType}过期!`}
                    values={{
                        "appName": item.app_name,
                        "num": <i onClick={this.gotoUserList.bind(this, item)}>{num}</i>,
                        "userType": item.user_type == '正式用户' ? '签约用户' : item.user_type
                    }}
                />
            </div>);
        });
    }

    showExpireUsers() {
        var _this = this;
        var expireUserLists = this.props.expireUserLists;
        var errMsg = <span>{_this.props.errMsg}<a onClick={_this.retry}                                                  
                                                  style={{
                                                      marginLeft: "20px",
                                                      marginTop: "20px"
                                                  }}>{Intl.get("user.info.retry", "请重试")} </a></span>;
        //获取用户列表错误提示
        if (_this.props.isLoadingExpireUserList) {
            return <div>
                <Spinner />
            </div>;
        } else if (_this.props.errMsg != '') {
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
                    {Intl.get("sales.home.no.expired.alert", "没有过期用户提醒!")}
                </div>;
            } else {
                //有到期用户提醒
                return (
                    <div>
                        {!expireUserLists['day'] ? null :
                            <div className="tipitem">
                                <div className="tiptitle">{Intl.get("user.time.today1", "今日")}:</div>
                                <div className="tipcontent">
                                    {_this.showExpireUserItem(expireUserLists['day'])}
                                </div>
                            </div>
                        }
                        {!expireUserLists['week'] ? null :
                            <div className="tipitem">
                                <div className="tiptitle">{Intl.get("user.time.this.week", "本周")}:</div>
                                <div className="tipcontent">
                                    {_this.showExpireUserItem(expireUserLists['week'])}
                                </div>
                            </div>
                        }
                        {!expireUserLists['month'] ? null :
                            <div className="tipitem">
                                <div className="tiptitle">{Intl.get("user.time.this.month", "本月")}:</div>
                                <div className="tipcontent">
                                    {_this.showExpireUserItem(expireUserLists['month'])}
                                </div>
                            </div>
                        }
                        {!expireUserLists['half_year'] ? null :
                            <div className="tipitem">
                                <div className="tiptitle">{Intl.get("user.time.half.year", "半年内")}:</div>
                                <div className="tipcontent">
                                    {_this.showExpireUserItem(expireUserLists['half_year'])}
                                </div>
                            </div>
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
        let salesTitle = Intl.get("sales.homepage.will.expire.user", "即将到期账号");
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