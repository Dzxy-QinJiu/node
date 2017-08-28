/**
 * Created by wangliping on 2016/1/8.
 */
/**
 * Created by wangliping on 2016/1/8.
 */
var language = require("../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require('./cardInfo-es_VE.scss');
}else if (language.lan() == "zh"){
    require("./cardInfo-zh_CN.scss");
}
import {Spin,Icon,Pagination,Form,Input,Tag,Alert} from "antd";
var FormItem = Form.Item;
var rightPanelUtil = require("../rightPanel");
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RightPanelEdit = rightPanelUtil.RightPanelEdit;
var RightPanelForbid = rightPanelUtil.RightPanelForbid;
var RightPanelDelete = rightPanelUtil.RightPanelDelete;
var RightPanelVersionUpgrade = rightPanelUtil.RightPanelVersionUpgrade;
var RightPanelAppAuth = rightPanelUtil.RightPanelAppAuth;
var RightPanelAppNotice = rightPanelUtil.RightPanelAppNotice;
var RightPanelUserTypeConfig = rightPanelUtil.RightPanelUserTypeConfig;
var PrivilegeChecker = require("../privilege/checker").PrivilegeChecker;
var hasPrivilege = require("../privilege/checker").hasPrivilege;
var HeadIcon = require("../headIcon");
var InfoItem = require("../card/cardItem");
var LogItem = require("./logItem");
var GeminiScrollbar = require('../react-gemini-scrollbar');
var userData = require('../../public/sources/user-data');
var ModalDialog = require("../ModalDialog");
var saveTimer = null;
import {defineMessages,injectIntl} from 'react-intl';
import reactIntlMixin from '../react-intl-mixin';

const messages = defineMessages({
    member_is_or_not:{id:'member.is.or.not'},//"是否{modalStr}{modalType}"
});


var CardInfo = React.createClass({
        mixins: [reactIntlMixin],
        getInitialState: function () {
            return {
                cardInfo: $.extend(true, {}, this.props.cardInfo),
                logList: this.props.logList,
                appTagList: this.props.appTagList,
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
                cardInfo: $.extend(true, {}, nextProps.cardInfo),
                appTagList: nextProps.appTagList,
                logList: nextProps.logList
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
            var modalStr = Intl.get("member.start.this", "启用此");
            if (this.state.cardInfo.status == 1) {
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
                this.props.deleteCard(this.props.cardInfo.id);
            } else {
                var status = 1;
                if (this.props.cardInfo.status == 1) {
                    status = 0
                }
                this.props.updateStatus(this.props.cardInfo.id, status);
            }
        },
        //按enter键添加标签
        addTag: function (e) {
            if (this.state.isSaving) return;
            if (e.keyCode !== 13) return;
            const tag = e.target.value.trim();
            if (!tag) return;
            this.toggleTag(tag, true);
            //清空输入框
            this.refs.newTag.refs.input.value = "";
        },
        //标签的选中与取消处理
        toggleTag: function (tag, isAdd) {
            if (this.state.isSaving) return;
            let tags = this.state.cardInfo.tags || [];
            if (tags.indexOf(tag) > -1) {
                if (isAdd) return;
                tags = tags.filter(theTag => theTag != tag);
            } else {
                tags.push(tag);
                if (this.state.appTagList.indexOf(tag) === -1) {
                    this.state.appTagList.push(tag);
                }
            }
            this.state.cardInfo.tags = tags;
            var _this = this;
            this.setState({isSaving: true});
            //保存修改后的标签
            this.props.editAppTag({
                id: this.state.cardInfo.id,
                tags: JSON.stringify(tags)
            }, function (result) {
                //保存后提示信息的处理
                _this.setState({
                    isSaving: false,
                    saveResult: result.saveResult,
                    saveMsg: result.saveMsg
                });
                //保存成功后再修改
                if (result.saveResult == "success") {
                    _this.setState({cardInfo: _this.state.cardInfo});
                }
                //3s后清空提示信息
                if (result.saveMsg || result.saveResult) {
                    if (saveTimer) {
                        clearTimeout(saveTimer);
                        saveTimer = null;
                    }
                    saveTimer = setTimeout(function () {
                        _this.setState({
                            saveMsg: "",//保存组名的提示信息
                            saveResult: ""//修改组名时的保存结果
                        })
                    }, 3000);
                }
            });
        },
        cancelEnter: function (e) {
            e.preventDefault();
        },
        //渲染标签列表
        renderAppTagList: function () {
            var selectedTagsArray = this.state.cardInfo.tags || [];
            var appTagList = _.isArray(this.state.appTagList) ? this.state.appTagList : [];
            var unionTagsArray = _.union(appTagList, selectedTagsArray);
            var tagsJsx = "";
            if ( _.isArray(unionTagsArray) && unionTagsArray.length > 0) {
                var _this = this;
                tagsJsx = unionTagsArray.map(function (tag, index) {
                    let className = "app-tag";
                    className += selectedTagsArray.indexOf(tag) > -1 ? " tag-selected" : "";
                    return (
                        <span key={index} onClick={() => _this.toggleTag(tag)} className={className}>{tag}</span>
                    );
                });
            }
            return tagsJsx;
        },

        renderAddTagsInput(){
            return (
                <div>
                    <Input placeholder={Intl.get("app.tag.placeholder", "按Enter键添加新标签")} ref="newTag"
                           onKeyUp={this.addTag}
                    />
                    {this.state.isSaving ? (
                        <div className="app-tag-saving">{Intl.get("app.add.tag", "正在添加标签...")} </div>) : ""}
                    {(!this.state.isSaving && this.state.saveResult) ? (
                        <div className={"app-tag-save-"+this.state.saveResult}>
                            {this.state.saveMsg}
                        </div>) : ""}
                </div>
            );

        },

        render: function () {
            //当前要展示的信息
            var cardInfo = this.state.cardInfo;
            //要展示的信息列表
            var infoItems = [];
            var hasOperation = userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
            for (var key in cardInfo) {
                if (_.isObject(cardInfo[key]) && !_.isArray(cardInfo[key])) {
                    var className = "";
                    if (key === "detailAddress") {
                        className = "detail-address-style";
                    } else if (key.indexOf("ipCaptcha") >= 0 || key.indexOf("sessionCaptcha") >= 0) {
                        className = "left-label-null-style";
                    }
                    //我的应用的密钥刷新按钮是否展示
                    var hasRefreshBtn = this.props.type == "myApp" && key == "appSecret" && hasPrivilege("REFRESH_SECRET");
                    infoItems.push(<InfoItem className={className} key={key}
                                             refreshAppSecret={this.props.refreshAppSecret}
                                             appSecretRefreshing={this.props.appSecretRefreshing}
                                             hasRefreshBtn={hasRefreshBtn}
                                             cardItem={cardInfo[key]}/>);
                } else if (key === "tags") {
                    //我的应用的标签只展示不可修改
                    if (this.props.type == "myApp" || hasOperation ) {
                        var tags = cardInfo[key].map(function (tag, index) {
                            return (<Tag key={index}>{tag}</Tag>);
                        });
                        //应用标签的展示
                        infoItems.push(<div className="tag-container" key="tag">
                            <div className="tag-label"><ReactIntl.FormattedMessage id="common.tag" defaultMessage="标签" />:</div>
                            <div className="block-tag"> {tags} </div>
                        </div>);
                    }
                }
            }
            //个人日志
            var logItems = [];
            var logList = this.state.logList;
            if (_.isArray(logList) && logList.length > 0) {
                for (var i = 0, iLen = logList.length; i < iLen; i++) {
                    logItems.push(<LogItem key={i} log={logList[i]}/>);
                }
            } else {
                logItems = Intl.get("common.no.data", "暂无数据");
            }

            var modalContent = this.props.intl['formatMessage'](messages.member_is_or_not,{modalStr:this.state.modalStr,modalType:this.props.modalType});
            var className = "right-panel-content";

            if (!this.props.cardInfoShow) {
                if (this.props.cardFormShow ||
                    this.props.versionUpgradeShow ||
                    this.props.isAppAuthPanelShow ||
                    this.props.isAppNoticePanelShow ||
                    this.props.userTypeConfigShow
                ) {
                    //展示form面板时，整体左移
                    className += " right-panel-content-slide";
                }
            }

            var userName = this.state.cardInfo.userName ? this.state.cardInfo.userName.value : "";
            let labelCol = (language.lan() == 'zh' ? 3 : 4);
            return (
                <div className={className}>
                    <RightPanelClose onClick={this.props.closeRightPanel}/>
                    <div className="edit-buttons">
                        {!this.props.showAddMemberButton ? (
                            <PrivilegeChecker check={this.props.editRoleStr}>
                                <RightPanelEdit onClick={this.showEditForm}/>
                                {this.props.type == "myApp" ? (
                                    <RightPanelAppAuth onClick={this.props.showAppAuthPanel}/>
                                ) : (<RightPanelForbid onClick={this.showForbidModalDialog}
                                                       isActive={this.state.cardInfo.status==0}/>)}
                            </PrivilegeChecker>
                        ) : null}
                        <PrivilegeChecker check={"GET_APPLICATION_RECORD" || "ADD_APPLICATION_RECORD"}>
                            {this.props.type == "myApp" || this.props.type == "appManage" ? (
                                <RightPanelVersionUpgrade onClick={this.showVersionUpgradePanel}/>
                            ) : null}
                        </PrivilegeChecker>
                        <PrivilegeChecker check={"GET_APPLICATION_NOTICE" || "ADD_APPLICATION_NOTICE"}>
                            {this.props.type == "myApp" || this.props.type == "appManage" ? (
                                <RightPanelAppNotice onClick={this.showAppNoticePanel}/>
                            ) : null}
                        </PrivilegeChecker>
                        <PrivilegeChecker check={"GET_APP_EXTRA_GRANTS"}>
                            {this.props.type == "myApp" || this.props.type == "appManage" ? (
                                <RightPanelUserTypeConfig  onClick={this.showUserTypeConfigPanel}/>
                            ) : null}
                            

                        </PrivilegeChecker>
                        <PrivilegeChecker check={this.props.deleteRoleStr}>
                            <RightPanelDelete onClick={this.showDelModalDialog}/>
                        </PrivilegeChecker>
                    </div>
                    <HeadIcon headIcon={this.state.cardInfo.image} iconDescr={this.state.cardInfo.name}
                              userName={userName}
                              isUserHeadIcon={true}
                    />
                    <div className="log-infor-scroll">
                        <GeminiScrollbar className="geminiScrollbar-vertical">
                            <div className="card-infor-list">
                                {this.props.getAppDetailError ? (<div className="card-detail-error">
                                    <Alert message={this.props.getAppDetailError}
                                           type="error" showIcon/>
                                </div>) : null}
                                {this.props.infoIsloading ? (
                                    <Spin size="small"/>) : infoItems
                                }
                            </div>
                            {this.props.appTagList && hasPrivilege("APP_MANAGE_EDIT_APP")? (
                                <Form horizontal className="card-info-tag-form" autoComplete="off"
                                      onSubmit={this.cancelEnter}>
                                    <FormItem
                                        label={Intl.get("common.tag", "标签") + ": "}
                                        labelCol={{span: labelCol}}
                                        wrapperCol={{span: 21}}
                                    >
                                        <div className="block-tag-edit">
                                            {this.renderAppTagList()}
                                        </div>
                                        <div>
                                            {this.renderAddTagsInput()}
                                        </div>
                                    </FormItem></Form>) : ""
                            }
                            {this.props.realmOwner ? (
                                <div className="card-infor-list">
                                    <div className="card-item">
                                        <span className="card-item-left"><ReactIntl.FormattedMessage id="common.owner" defaultMessage="所有者" />:</span>
                                        <span className="card-item-right"> {this.props.realmOwner} </span>
                                        <span className="card-item-add-owner"
                                              onClick={this.props.showOwnerForm}><ReactIntl.FormattedMessage id="realm.change.owner" defaultMessage="更换所有者" /> </span>
                                    </div>
                                </div>
                            ) : null}
                            <div className="log-infor-list" style={{display:this.props.hasLog ? 'block' : 'none'}}>
                                <div className="log-infor-title"><ReactIntl.FormattedMessage id="member.operation.log" defaultMessage="操作日志" /></div>
                                <div className="log-list-content">{
                                    this.props.logIsLoading ? (
                                        <Spin size="small"/>) : logItems
                                }
                                </div>
                                {this.props.logTotal / this.props.pageSize > 1 ? (
                                    <Pagination current={this.props.logNum} total={this.props.logTotal}
                                                pageSize={this.props.pageSize} size="small"
                                                onChange={this.props.changeLogNum}/>) : ""}
                            </div>
                        </GeminiScrollbar>
                    </div>
                    {this.props.showAddMemberButton ? (
                        <div className="btn-add-member" onClick={this.props.showEditForm.bind(null, "add")}>
                            <Icon type="plus"/><span>
                            <ReactIntl.FormattedMessage id="common.add.member" defaultMessage="添加成员" /></span>
                        </div>
                    ) : null}
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

module.exports = injectIntl(CardInfo);
