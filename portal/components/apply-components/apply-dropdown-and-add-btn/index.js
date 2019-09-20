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
import {getApplyState} from 'PUB_DIR/sources/utils/apply-estimate';
import {isSalesRole} from 'PUB_DIR/sources/utils/common-method-util';

class ApplyDropdownAndAddBtn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            applyType: this.props.applyType,
            applyState: {}
        };
    }

    componentWillMount = () => {
        getApplyState(this.props.applyType).then(applyState => {
            this.setState({
                applyState
            });
        });
    }

    componentDidMount = () => {

    };
    componentWillReceiveProps = (nextProps) => {

    };
    componentWillUnmount = () => {

    };

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

    showAddApplyPanel = () => {
        this.props.showAddApplyPanel();
    };

    //根据返回的状态信息渲染带Popover的button和不带Popover的button
    renderApplyButton = () => {
        let applyPrivileged = _.get(this.state, 'applyState.applyPrivileged');
        return (
            applyPrivileged ? (
                <Button className='pull-right add-leave-btn' onClick={this.showAddApplyPanel}>{this.props.addApplyMessage}</Button>) :
                (<Popover
                    overlayClassName="apply-invalid-popover"
                    placement="bottomRight"
                    content={_.get(this.state, 'applyState.applyMessage')}
                    trigger="click"
                >
                    <Button className='pull-right add-leave-btn'>{this.props.addApplyMessage}</Button>
                </Popover>)
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
                {/* 只有销售需要申请 */}
                {hasPrivilege(this.props.addPrivilege) && isSalesRole() ?
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
    applyType: PropTypes.string
};

export default ApplyDropdownAndAddBtn;