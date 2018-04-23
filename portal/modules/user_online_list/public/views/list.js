import OnlineUserListStore from "../store/list";
import OnlineUserListAction from "../action/list";
import OnlineUserFilterAction from "../action/filter";
import OnlineUserFilterStore from "../store/filter";
import OnlineUserIndexAction from "../action";
import { Button } from "antd";
import { AntcTable } from "antc";
import Utils from '../utils';
import insertStyle from "../../../../components/insert-style";
import Spinner from '../../../../components/spinner';
import AppUserUtil from '../../../app_user_manage/public/util/app-user-util';
import { storageUtil } from "ant-utils";
var hasPrivilege = require('../../../../components/privilege/checker').hasPrivilege;
var BootstrapButton = require('react-bootstrap').Button;
var Modal = require('react-bootstrap').Modal;
import Trace from "LIB_DIR/trace";
var dynamicStyle;

const OnlineUserList = React.createClass({
    getInitialState: function () {
        return {
            currentUserId: '',
            clientId: '',
            showKickConfirm: false,
            ...OnlineUserListStore.getState()
        };
    },
    onStoreChange: function () {
        this.setState(OnlineUserListStore.getState());
    },
    componentDidMount: function () {
        $('body').css("overflow", "hidden");
        OnlineUserListStore.listen(this.onStoreChange);
        Utils.emitter.on(Utils.EMITTER_CONSTANTS.APP_LIST_LOADED, this.appListLoaded);
    },   
    componentWillUnmount: function () {
        $('body').css("overflow", "auto");
        if (dynamicStyle) {
            dynamicStyle.destroy();
            dynamicStyle = null;
        }
        OnlineUserListStore.unlisten(this.onStoreChange);
        Utils.emitter.removeListener(Utils.EMITTER_CONSTANTS.APP_LIST_LOADED, this.appListLoaded);
    },
    appListLoaded: function (list) {
        var storageValue = JSON.parse(storageUtil.local.get(AppUserUtil.saveSelectAppKeyUserId));
        var lastSelectAppId = storageValue && storageValue.onlineAppId ? storageValue.onlineAppId : '';
        if (lastSelectAppId) {
            OnlineUserFilterAction.setCondition({ client_id: lastSelectAppId });
            OnlineUserIndexAction.setSelectedAppId({ client_id: lastSelectAppId });
            setTimeout(() => {
                this.search();
            });
        } else if (_.isArray(list) && list[0] && list[0].app_id) {
            OnlineUserFilterAction.setCondition({ client_id: list[0].app_id });
            OnlineUserIndexAction.setSelectedAppId({ client_id: list[0].app_id });
            setTimeout(() => {
                this.search();
            });
        } else {
            this.search();
        }
    },
    search: function () {
        const condition = OnlineUserFilterStore.getState().condition;

        OnlineUserListAction.getOnlineUserList(this.state.pageSize, this.state.pageNum, condition);
    },
    getRowKey: function (record, index) {
        return index;
    },
    changePage: function (page) {
        OnlineUserListAction.setPageNum(page);

        const _this = this;
        setTimeout(function () {
            _this.search();
        });
    },
    //用户状态列的渲染处理，将true或false转换成过期或未过期
    renderStatusColumn(text, record) {
        text = text + '';
        let statusName = text;
        let statusList = this.props.statusList;

        if (statusList && statusList.length > 0) {
            for (var i = 0, len = statusList.length; i < len; i++) {
                var status = statusList[i];
                if (status.value === text.toString()) {
                    statusName = status.name;
                    break;
                }
            }
        }

        return <span>{statusName}</span>;
    },
    //登录时间列的渲染处理，将unix时间戳转换成常用时间格式
    renderLoginTimeColumn(text, record) {
        let formatedTime = moment(text).format(oplateConsts.DATE_TIME_FORMAT);
        return <span>{formatedTime}</span>;
    },
    // 确认踢出用户
    confirmKick: function (userId, clientId) {
        Trace.traceEvent($(this.getDOMNode()).find(".kick-btn-class"), "点击踢出某用户");
        this.state.currentUserId = userId;
        this.state.clientId = clientId;
        this.state.showKickConfirm = true;
        this.setState(this.state);
    },

    // 隐藏踢出的模态框
    hideKickModal: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".modal-footer .btn-ok"), "取消确认踢出某用户");
        this.state.showKickConfirm = false;
        this.setState(this.state);
    },
    // 踢出用户
    kickUser: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".modal-footer .btn-ok"), "确认踢出某用户");
        this.hideKickModal();
        const ids = {
            "user_ids": [
                this.state.currentUserId
            ],
            "application_id": this.state.clientId
        };
        OnlineUserListAction.kickUser(ids);

    },

    render: function () {

        const _this = this;

        if (this.state.isFirstTimeLoading) {
            return <Spinner />;
        }
        //用户类型
        const typeList = this.props.typeList;

        let columns = [
            {
                title: Intl.get("common.username", "用户名"), dataIndex: "user_name", className: 'show-user-detail', key: "user_name",
                width: 120, render: function ($1, row) {
                    return <div>{row.user_name}<input type="hidden" value={row.user_id} className="user_id_hidden" /></div>;
                }
            },
            {
                title: Intl.get("common.nickname", "昵称"), dataIndex: "nick_name", className: 'show-user-detail', key: "nick_name",
                width: 80
            },
            {
                title: "IP", dataIndex: "ip", className: 'show-user-detail', key: "ip",
                width: 120
            },
            {
                title: Intl.get("common.ip.location", "IP归属地"), dataIndex: "ip_address", className: 'show-user-detail', key: "ip_address",
                width: 80
            },
            {
                title: Intl.get("user.user.type", "用户类型"), dataIndex: "tags", className: 'show-user-detail', key: "tags",
                width: 80, render: function ($1, row) {
                    var targetItem = _.find(typeList, (obj) => {
                        return obj.value === row.tags;
                    });
                    var displayText = targetItem ? (targetItem.name == Intl.get("user.online.all.type", "全部类型") ? "" : targetItem.name) : row.tags;
                    return <div>{displayText}</div>;
                }
            },
            {
                title: Intl.get("user.overdue.whether", "是否过期"), dataIndex: "is_expired", className: 'show-user-detail', key: "is_expired", render: this.renderStatusColumn,
                width: Oplate.hideSomeItem ? 150 : 80
            },
            {
                title: Intl.get("user.online.login.time", "登录时间"), dataIndex: "login_at", className: 'show-user-detail', key: "login_at", render: this.renderLoginTimeColumn,
                width: Oplate.hideSomeItem ? 220 : 160
            },
            {
                title: Intl.get("common.client", "客户端"), dataIndex: "user_agent", className: 'show-user-detail', key: "user_agent",
                width: 200
            },
            {
                title: Intl.get("common.operate", "操作"), dataIndex: 'operate', key: 'operate',
                width: 50, render: function (text, record, index) {
                    return (
                        <span className="cus-op">
                            {hasPrivilege("USER_KICKOUT") ? (
                                <Button className="kick-btn-class icon-kick-user iconfont"
                                    onClick={_this.confirmKick.bind(null, record.user_id, record.client_id)} title={Intl.get("user.online.kick", "踢出")} />
                            ) : null}
                        </span>
                    );
                }
            }
        ];

        const pagination = {
            total: _this.state.total,
            pageSize: _this.state.pageSize,
            current: _this.state.pageNum,
            onChange: _this.changePage
        };

        const tableHeight = $(window).height() -
            Utils.LAYOUT_CONSTANTS.TOP_NAV_HEIGHT -
            Utils.LAYOUT_CONSTANTS.TABLE_MARGIN_TOP -
            Utils.LAYOUT_CONSTANTS.THEAD_HEIGHT -
            Utils.LAYOUT_CONSTANTS.TABLE_MARGIN_BOTTOM -
            Utils.LAYOUT_CONSTANTS.PAGINATION_HEIGHT;

        dynamicStyle = insertStyle('.online-user-list-wrap .ant-table-body {height:' + tableHeight + 'px;overflow:auto}');
        const total = Intl.get("user.online.total", "共{number}个用户在线", { number: _this.state.total });
        // 委内维拉项目，显示的列表项（不包括用户类型、IP、IP归属地）
        if (Oplate.hideSomeItem) {
            columns = _.filter(columns, (item) => {
                return item.key != 'ip' && item.key != 'ip_address' && item.dataIndex != 'tags';
            });
        }
        return (
            <div className="list-content" ref="table" id="new-table" data-tracename="在线用户列表">
                {
                    this.state.isLoading && !this.state.isFirstTimeLoading ? (
                        <Spinner />
                    ) : null
                }
                <AntcTable columns={columns}
                    dataSource={this.state.onlineUserList}
                    rowKey={this.getRowKey}
                    pagination={pagination}
                    useFixedHeader
                    locale={{ emptyText: Intl.get("common.no.data", "暂无数据") }}
                    scroll={{ x: 1000, y: tableHeight }}
                />
                <Modal
                    show={this.state.showKickConfirm}
                    onHide={this.hideKickModal}
                    container={this}
                    aria-labelledby="contained-modal-title"
                >
                    <Modal.Header closeButton>
                        <Modal.Title />
                    </Modal.Header>
                    <Modal.Body>
                        <p><ReactIntl.FormattedMessage id="user.online.modal.tip" defaultMessage="是否踢此用户下线" />？</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <BootstrapButton className="btn-ok" onClick={this.kickUser}><ReactIntl.FormattedMessage id="user.online.kick" defaultMessage="踢出" /></BootstrapButton>
                        <BootstrapButton className="btn-cancel" onClick={this.hideKickModal}><ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" /></BootstrapButton>
                    </Modal.Footer>
                </Modal>
                { _this.state.total ?
                    <div className="summary-info">
                        {total}
                    </div> : null
                }

            </div>
        );
    }
});
module.exports = OnlineUserList;
