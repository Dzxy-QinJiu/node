/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/27.
 */
import {Button, Menu, Dropdown, Popover} from 'antd';
import {Link} from 'react-router-dom';
var hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
require('./index.less');
var classNames = require('classnames');
import {getUnreadReplyTitle} from 'PUB_DIR/sources/utils/common-method-util';
let userData = require('PUB_DIR/sources/user-data');
import UserInfoStore from '../../../modules/user_info/public/store/user-info-store';
import UserInfoAction from '../../../modules/user_info/public/action/user-info-actions';
import {CC_INFO} from 'PUB_DIR/sources/utils/consts';
class ApplyDropdownAndAddBtn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            applyErrorMsg: null,
            userApplyType: this.props.userApplyType,
            ccInfo: this.getCCInfo(),
            popoverErrorVisible: false
        };
    }
    onStoreChange = () => {
        this.setState(UserInfoStore.getState());
    };

    componentWillMount = () => {

    }
    componentDidMount = () => {
        UserInfoStore.listen(this.onStoreChange);
        UserInfoAction.getUserInfo();
    };
    componentWillReceiveProps = (nextProps) => {

    };
    componentWillUnmount = () => {
        UserInfoStore.unlisten(this.onStoreChange);
    };
    //获取用户发送邮件权限
    getCCInfo = () => {
        let workFlowConfigs = userData.getUserData().workFlowConfigs;
        let type = _.filter(workFlowConfigs, item => {
            let type = _.get(item, 'type');
            if(_.isEqual(type, this.props.userApplyType)) {
                return true;
            } else {
                return false;
            }
        });
        return _.get(type[0], 'applyRulesAndSetting.ccInformation');
    }
    renderApplyMessage = () => {
        var showUnreadTip = this.props.showUnreadTip;
        var isCheckUnreadApplyList = this.props.isCheckUnreadApplyList;
        return (
            <div className={classNames('check-uread-reply-bg', {
                'active': isCheckUnreadApplyList
            })}><span onClick={this.props.toggleUnreadApplyList.bind(this, showUnreadTip)}
                    className={classNames('iconfont icon-apply-message-tip', {'has-unread-reply': showUnreadTip})}
                    title={getUnreadReplyTitle(isCheckUnreadApplyList, showUnreadTip)}/>
            </div>
        );
    };
    checkPrivilege = () => {
        let email = _.get(this.state, 'userInfo.email');
        let emailEnable = _.get(this.state, 'userInfo.emailEnable');
        if(_.isEmpty(email)) {
            this.setState({
                popoverErrorVisible: true,
                applyErrorMsg: {
                    needBind: true
                }
            });
            return false;
        } else if(!emailEnable) {
            this.setState({
                popoverErrorVisible: true,
                applyErrorMsg: {
                    needActive: true
                }
            });
            return false;
        } else {
            this.setState({
                popoverErrorVisible: false,
            });
            this.props.showAddApplyPanel();
        }
    }

    handleVisibleChange = popoverErrorVisible => {
        this.setState({ popoverErrorVisible });
    };
    //根据是否绑定激活渲染带Popover的button和不带Popover的button
    renderApplyButton = () => {
        let applyErrorMsg = _.get(this.state, 'applyErrorMsg');
        return (
            _.isNull(applyErrorMsg) ? (
                <Button className='pull-right add-leave-btn' onClick={this.checkPrivilege}
                >{this.props.addApplyMessage}</Button>) : (
                <Popover
                    placement="bottomRight"
                    content={this.renderPopoverContent()}
                    visible={this.state.popoverErrorVisible}
                    onVisibleChange={this.handleVisibleChange}
                    trigger="click"
                >
                    <Button className='pull-right add-leave-btn' onClick={this.checkPrivilege}
                    >{this.props.addApplyMessage}</Button>
                </Popover>)
        );
    }
    //渲染popover内的错误信息
    renderPopoverContent = () => {
        let applyErrorMsg = _.get(this.state, 'applyErrorMsg');
        //先判断是否绑定邮箱，再判断是否激活邮箱
        let ifActiveEmail = (_.get(applyErrorMsg, 'needActive') ?
            <ReactIntl.FormattedMessage
                id="apply.error.active"
                defaultMessage={'您还没有激活邮箱，请先{activeEmail}'}
                values={{
                    'activeEmail': <Link to="/user_info_manage/user_info"><ReactIntl.FormattedMessage id="apply.active.email.tips" defaultMessage="激活邮箱"/></Link>
                }}/> : null);
        return (
            <span className="apply-error-tip">
                <span className="iconfont icon-warn-icon"></span>
                <span className="apply-error-text">
                    {_.get(applyErrorMsg, 'needBind') ?
                        (<ReactIntl.FormattedMessage
                            className="apply-error-text"
                            id="apply.error.bind"
                            defaultMessage={'您还没有绑定邮箱，请先{bindEmail}'}
                            values={{
                                'bindEmail': <Link to="/user_info_manage/user_info"><ReactIntl.FormattedMessage id="apply.bind.email.tips" defaultMessage="绑定邮箱"/></Link>
                            }}/>) : ifActiveEmail}
                </span>
            </span>
        );
    }

    render(){
        // 筛选菜单
        var menuList = (
            <Menu onClick={this.props.menuClick} className="apply-filter-menu-list">
                {this.props.menuList.map((menuItem) => {
                    return (
                        <Menu.Item key={menuItem.key}>
                            <a href="javascript:void(0)">{menuItem.value}</a>
                        </Menu.Item>
                    );
                })}
            </Menu>
        );
        //判断是否有发邮件权限
        let hasEmailPrivilege = _.indexOf(_.values(CC_INFO), this.state.ccInfo) !== -1;
        return (
            <div className="apply-searchbar clearfix">
                <div className="apply-type-filter btn-item" id="apply-type-container">
                    {
                        <Dropdown overlay={menuList} placement="bottomLeft"
                            getPopupContainer={() => document.getElementById('apply-type-container')}>
                            <span className="apply-type-filter-btn">
                                {this.props.getApplyListType()}
                                <span className="iconfont icon-arrow-down"/>
                            </span>
                        </Dropdown>
                    }
                </div>
                {hasPrivilege(this.props.addPrivilege) && hasEmailPrivilege ?
                    this.renderApplyButton()
                    : null}
                <div className="pull-right search-btns">
                    {this.props.showApplyMessageIcon ? this.renderApplyMessage() : null}
                    {this.props.showRefreshIcon ? <span onClick={this.props.refreshPage}
                        className={classNames('iconfont pull-right icon-refresh', {'has-new-apply': this.props.showUpdateTip})}
                        title={this.props.showUpdateTip ? Intl.get('user.apply.new.refresh.tip', '有新申请，点此刷新') : Intl.get('user.apply.no.new.refresh.tip', '无新申请')}/> : null}
                </div>
            </div>
        );
    }
}
ApplyDropdownAndAddBtn.defaultProps = {
    menuClick: function() {

    },
    menuList: [],
    getApplyListType: function() {

    },
    addPrivilege: '',
    showAddApplyPanel: function() {

    },
    refreshPage: function() {

    },
    showUpdateTip: false,
    addApplyMessage: '',
    showRefreshIcon: false,



    showApplyMessageIcon: false, //是否展示回复消息按钮
    toggleUnreadApplyList: function() {

    },
    showUnreadTip: false,
    isCheckUnreadApplyList: false
};
ApplyDropdownAndAddBtn.propTypes = {
    menuClick: PropTypes.func,
    menuList: PropTypes.object,
    getApplyListType: PropTypes.func,
    addPrivilege: PropTypes.string,
    showAddApplyPanel: PropTypes.func,
    addApplyMessage: PropTypes.string,
    showRefreshIcon: PropTypes.bool,
    refreshPage: PropTypes.func,
    showUpdateTip: PropTypes.bool,
    showApplyMessageIcon: PropTypes.bool,
    toggleUnreadApplyList: PropTypes.func,
    showUnreadTip: PropTypes.bool,
    isCheckUnreadApplyList: PropTypes.bool,
    userApplyType: PropTypes.string
};

export default ApplyDropdownAndAddBtn;