/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/6/22.
 */
var language = require("../../../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require('../../../../components/cardInfo/cardInfo-es_VE.scss');
}else if (language.lan() == "zh"){
    require("../../../../components/cardInfo/cardInfo-zh_CN.scss");
}
import {Spin,Icon,Pagination,Form,Input,Tag,Alert} from "antd";
var rightPanelUtil = require("../../../../components/rightPanel");
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RightPanelEdit = rightPanelUtil.RightPanelEdit;
var RightPanelForbid = rightPanelUtil.RightPanelForbid;
var RightPanelDelete = rightPanelUtil.RightPanelDelete;
var PrivilegeChecker = require("../../../../components/privilege/checker").PrivilegeChecker;
var HeadIcon = require("../../../../components/headIcon");
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var ModalDialog = require("../../../../components/ModalDialog");
import {defineMessages,injectIntl} from 'react-intl';
import reactIntlMixin from '../../../../components/react-intl-mixin';
import Trace from "LIB_DIR/trace";
const messages = defineMessages({
    member_is_or_not:{id:'member.is.or.not'},//"是否{modalStr}{modalType}"
});


var RealmInfo = React.createClass({
        mixins: [reactIntlMixin],
        getInitialState: function () {
            return {
                realmInfo: $.extend(true, {}, this.props.realmInfo),
                modalStr: "",//模态框提示内容
                isDel: false,//是否删除
                isSaving: false,//正在保存标签
                //是否保存成功,error:失败，success:成功
                saveResult: "",
                //保存后的提示信息
                saveMsg: ""
            };
        },
        componentWillReceiveProps: function (nextProps) {
            this.setState({
                realmInfo: $.extend(true, {}, nextProps.realmInfo),
            });
            this.layout();
        },
        componentDidMount: function () {
            var _this = this;
            _this.layout();
            $(window).resize(function (e) {
                e.stopPropagation();
                _this.layout();
            });
        },
        layout: function () {
            var bHeight = $("body").height();
            var formHeight = bHeight - $(".head-image-container").outerHeight(true);
            if (this.props.showAddMemberButton) {
                formHeight -= 80;
            }
            $(".log-infor-scroll").height(formHeight);
        },
        showEditForm: function () {
            Trace.traceEvent($(this.getDOMNode()).find(".edit-buttons"),"点击编辑安全域按钮");
            this.props.showEditForm("edit");
        },
        showVersionUpgradePanel: function () {
            this.props.showVersionUpgradePanel();
        },
        showAppNoticePanel: function () {
            this.props.showAppNoticePanel();
        },
        //展示用户类型设置页面
        showUserTypeConfigPanel:function () {
            this.props.showUserTypeConfigPanel();
        },
        //展示是否禁用、启用的模态框
        showForbidModalDialog: function () {
            Trace.traceEvent($(this.getDOMNode()).find(".edit-buttons"),"点击启用/禁用安全域按钮");
            var modalStr = Intl.get("member.start.this", "启用此");
            if (this.state.realmInfo.status == 1) {
                modalStr = Intl.get("member.stop.this", "禁用此");
            }
            this.setState({modalStr: modalStr, isDel: false});
            this.props.showModalDialog();
        },
        //展示是否删除的模态框
        showDelModalDialog: function () {
            this.setState({modalStr: Intl.get("common.delete", "删除"), isDel: true});
            this.props.showModalDialog();
        },

        forbidCard: function () {
            if (this.state.isDel) {
                this.props.deleteCard(this.props.realmInfo.id);
            } else {
                var status = 1;
                if (this.props.realmInfo.status == 1) {
                    status = 0
                }
                this.props.updateStatus(this.props.realmInfo.id, status);
                Trace.traceEvent($(this.getDOMNode()).find(".edit-buttons"),"点击确认按钮");
            }
        },
        renderRealmItems:function () {
            let realmInfo = this.state.realmInfo;
            return (
                <div data-tracename="查看安全域详情">
                    <div className="card-item">
                        <span className="card-item-left">
                            <ReactIntl.FormattedMessage id="realm.name" defaultMessage="域名"/>:</span>
                        <span className="card-item-right" title={realmInfo.realmName}>
                            {realmInfo.realmName}
                        </span>
                    </div>
                    <div className="card-item">
                        <span className="card-item-left">
                            <ReactIntl.FormattedMessage id="common.phone" defaultMessage="电话"/>:</span>
                        <span className="card-item-right" title={realmInfo.phone}>
                            {realmInfo.phone}
                        </span>
                    </div>
                    <div className="card-item">
                        <span className="card-item-left">
                            <ReactIntl.FormattedMessage id="common.email" defaultMessage="邮箱"/>:</span>
                        <span className="card-item-right" title={realmInfo.email}>
                            {realmInfo.email}
                        </span>
                    </div>
                    <div className="card-item">
                        <span className="card-item-left">
                            <ReactIntl.FormattedMessage id="realm.industry" defaultMessage="行业"/>:</span>
                        <span className="card-item-right" title={realmInfo.profession}>
                            {realmInfo.profession}
                        </span>
                    </div>
                    <div className="card-item">
                        <span className="card-item-left">
                            <ReactIntl.FormattedMessage id="realm.address" defaultMessage="地址"/>:</span>
                        <span className="card-item-right" title={realmInfo.location}>
                            {realmInfo.location}
                        </span>
                    </div>
                    <div className="card-item detail-address-style">
                        <span className="card-item-left"></span>
                        <span className="card-item-right" title={realmInfo.detailAddress}>
                            {realmInfo.detailAddress}
                        </span>
                    </div>
                    <div className="card-item">
                        <span className="card-item-left">
                            <ReactIntl.FormattedMessage id="common.remark" defaultMessage="备注"/>:</span>
                        <span className="card-item-right" title={realmInfo.comment}>
                            {realmInfo.comment}
                        </span>
                    </div>
                </div>
            )
        },
        closeRightPanel(e) {
            Trace.traceEvent(e,"关闭安全域详情");
            this.props.closeRightPanel(e);
        },
        render: function () {
            //当前要展示的信息
            var modalContent = this.props.intl['formatMessage'](messages.member_is_or_not,{modalStr:this.state.modalStr,modalType:this.props.modalType});
            var className = "right-panel-content";

            if (!this.props.realmInfoShow) {
                if (this.props.realmFormShow ||
                    this.props.versionUpgradeShow ||
                    this.props.isAppAuthPanelShow ||
                    this.props.isAppNoticePanelShow ||
                    this.props.userTypeConfigShow
                ) {
                    //展示form面板时，整体左移
                    className += " right-panel-content-slide";
                }
            }

            var userName = this.state.realmInfo.userName ? this.state.realmInfo.userName : "";
            return (
                <div className={className}>
                    <RightPanelClose onClick={this.closeRightPanel}/>
                    <div className="edit-buttons">
                        {!this.props.showAddMemberButton ? (
                            <PrivilegeChecker check={"REALM_MANAGE_EDIT_REALM"}>
                                <RightPanelEdit onClick={this.showEditForm}/>
                                <RightPanelForbid onClick={this.showForbidModalDialog}
                                                  isActive={this.state.realmInfo.status==0}/>
                            </PrivilegeChecker>
                        ) : null}
                        <PrivilegeChecker check={"REALM_MANAGE_DELETE_REALM"}>
                            <RightPanelDelete onClick={this.showDelModalDialog}/>
                        </PrivilegeChecker>
                    </div>
                    <HeadIcon headIcon={this.state.realmInfo.image} iconDescr={this.state.realmInfo.company}
                              userName={userName}
                              isUserHeadIcon={true}
                    />
                    <div className="log-infor-scroll">
                        <GeminiScrollbar className="geminiScrollbar-vertical">
                            <div className="card-infor-list">
                                {this.props.infoIsloading ? (
                                    <Spin size="small"/>) : this.renderRealmItems()
                                }
                            </div>
                            {this.props.realmOwner ? (
                                <div className="card-infor-list">
                                    <div className="card-item">
                                        <span className="card-item-left"><ReactIntl.FormattedMessage id="common.owner" defaultMessage="所有者" />:</span>
                                        <span className="card-item-right"> {this.props.realmOwner} </span>
                                        <span className="card-item-add-owner"
                                              onClick={this.props.showOwnerForm} data-tracename="更换所有者"><ReactIntl.FormattedMessage id="realm.change.owner" defaultMessage="更换所有者" /> </span>
                                    </div>
                                </div>
                            ) : null}
                        </GeminiScrollbar>
                    </div>
                    <ModalDialog modalContent={modalContent}
                                 modalShow={this.props.modalDialogShow}
                                 container={this}
                                 hideModalDialog={this.props.hideModalDialog}
                                 delete={this.forbidCard}
                    />
                </div>
            );
        }
    })
    ;

module.exports = injectIntl(RealmInfo);
