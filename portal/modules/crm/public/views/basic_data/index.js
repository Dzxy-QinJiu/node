require('../../css/crm-basic.less');
require("../../css/basic-edit-field.less");
var CRMStore = require("../../store/basic-store");
var CRMAction = require("../../action/basic-actions");
var SalesTeamStore = require("../../../../sales_team/public/store/sales-team-store");
var PrivilegeChecker = require("../../../../../components/privilege/checker").PrivilegeChecker;
let hasPrivilege = require("../../../../../components/privilege/checker").hasPrivilege;
var GeminiScrollbar = require('../../../../../components/react-gemini-scrollbar');
import {Tag, Spin} from "antd";
var history = require("../../../../../public/sources/history");
var FilterAction = require("../../action/filter-actions");
let NameTextareaField = require("./name-textarea-field");
let CommentTextareaField = require("./comment-textarea-field");
let TagEditField = require("./tag-edit-field");
let IndustrySelectField = require("./industry-select-field");
let LocationSelectField = require("./location-select-field");
let SalesSelectField = require("./sales-select-field");
let CrmAction = require("../../action/crm-actions");
let CrmRepeatAction = require("../../action/customer-repeat-action");
import {defineMessages, injectIntl} from 'react-intl';
import BasicEditInputField from "CMP_DIR/basic-edit-field/input";
import BasicEditSelectField from "CMP_DIR/basic-edit-field/select";
import crmUtil from "../../utils/crm-util";
import CrmBasicAjax from "../../ajax/index";
import classNames from "classnames";

function getStateFromStore(isMerge) {
    return {
        basicIsLoading: CRMStore.getBasicState(),
        basicData: _.extend({}, CRMStore.getBasicInfo()),
        editShowFlag: false,
        salesObj: {salesTeam: SalesTeamStore.getState().salesTeamList},
        basicPanelH: getBasicPanelH(isMerge)
    };
}
function getBasicPanelH(isMerge) {
    if (isMerge) {
        //合并面板，去掉客户选择框和合并按钮所占高度
        return $(window).height() - 103;//103:顶部导航 + 顶部间距高度 53 + 50
    } else {
        return $(window).height() - 73;//73:顶部导航 + 顶部间距高度 53 + 20
    }
}

const LABEL_TYPES = {
    INFO_TAG: "信息",
    INTENT_TAG: "意向",
    TRIAL_TAG: "试用",
    SIGN_TAG: "签约"
};

var BasicData = React.createClass({
    getInitialState: function () {
        return getStateFromStore(this.props.isMerge);
    },
    onChange: function () {
        var datas = getStateFromStore(this.props.isMerge);
        this.setState(datas);
    },
    componentDidMount: function () {
        this.autoLayout();
        CRMStore.listen(this.onChange);
        CRMAction.getBasicData(this.props.curCustomer);
    },
    autoLayout: function () {
        var _this = this;
        $(window).resize(function () {
            _this.setState({
                basicPanelH: getBasicPanelH(_this.props.isMerge)
            });
        });
    },
    componentWillReceiveProps: function (nextProps) {
        CRMAction.getBasicData(nextProps.curCustomer);
    },
    componentWillUnmount: function () {
        CRMStore.unlisten(this.onChange);
    },

    //展示编辑基本资料页面
    showEditForm: function () {
        this.setState({editShowFlag: true});
    },

    //返回基本资料展示页面
    returnInfoPanel: function () {
        this.setState({editShowFlag: false});
    },

    //提交修改
    submitBaiscForm: function (newBasicData, changedData) {
        if (this.props.isMerge) {
            //合并面板的修改保存
            this.props.updateMergeCustomer(newBasicData);
        } else {
            CRMAction.submitBaiscForm(newBasicData, changedData, () => {
                this.props.refreshCustomerList(newBasicData.id);
                FilterAction.getTagList();
            });
        }
    },
    //展示按客户搜索到的用户列表
    triggerUserList: function () {
        //获取客户基本信息
        var basicData = this.state.basicData || {};
        this.props.ShowCustomerUserListPanel({customerObj: basicData || {}});
    },
    //修改客户基本资料成功后的处理
    editBasicSuccess: function (newBasic) {
        if (this.props.isMerge) {
            //合并面板的修改保存
            this.props.updateMergeCustomer(newBasic);
        } else if (this.props.isRepeat) {
            //重客户的修改
            CrmRepeatAction.editBasicSuccess(newBasic);
        } else {
            CrmAction.editBasicSuccess(newBasic);
            //如果修改的是标签，则刷新标签列表
            if (newBasic.labels) {
                FilterAction.getTagList();
            }
            if (_.isFunction(this.props.editCustomerBasic)) {
                this.props.editCustomerBasic(newBasic);
            }
        }
    },
    getAdministrativeLevelOptions: function () {
        let options = crmUtil.administrativeLevels.map(obj => {
            return (<Option key={obj.id} value={obj.id}>{obj.level}</Option>)
        });
        options.unshift(<Option key="" value="">&nbsp;</Option>);
        return options;
    },
    onSelectAdministrativeLevel: function (administrative_level) {
        administrative_level = parseInt(administrative_level);
        if (!_.isNaN(administrative_level)) {
            this.state.basicData.administrative_level = parseInt(administrative_level);
            this.setState({basicData: this.state.basicData});
        }
    },
    cancelAdministrativeLevel: function () {
        this.state.basicData.administrative_level = CRMStore.getBasicInfo().administrative_level;
        this.setState({basicData: this.state.basicData});
    },
    getAdministrativeLevel: function (levelId) {
        let levelObj = _.find(crmUtil.administrativeLevels, level => level.id == levelId);
        return levelObj ? levelObj.level : "";
    },
    render: function () {
        var basicData = this.state.basicData ? this.state.basicData : {};
        //是否显示用户统计内容
        var showUserStatistic = basicData.app_user_ids && (basicData.app_user_ids[0] ? true : false);
        var userNum = basicData.app_user_ids && basicData.app_user_ids.length || 0;
        let customerLabelCls = "customer-label";
        if (basicData.customer_label) {
            customerLabelCls = classNames("customer-label", {
                "info-tag-style": basicData.customer_label === LABEL_TYPES.INFO_TAG,
                "intent-tag-style": basicData.customer_label === LABEL_TYPES.INTENT_TAG,
                "trial-tag-style": basicData.customer_label === LABEL_TYPES.TRIAL_TAG,
                "sign-tag-style": basicData.customer_label === LABEL_TYPES.SIGN_TAG,
            });
        }
        return (
            <div className="crm-basic-container" style={{height: this.state.basicPanelH}} data-tracename="基本资料页面">
                {this.state.basicIsLoading ? <Spin /> : (
                    <GeminiScrollbar className="geminiScrollbar-vertical">
                        <div className="crm-basic-content">
                            <div className="crm-content-block">
                                <div className="client-info-content">
                                    <dl className="dl-horizontal  crm-basic-item detail_item crm-basic-name">
                                        <dt>{Intl.get("crm.41", "客户名")}</dt>
                                        <dd>
                                            <NameTextareaField
                                                isMerge={this.props.isMerge}
                                                updateMergeCustomer={this.props.updateMergeCustomer}
                                                customerId={basicData.id}
                                                name={basicData.name}
                                                modifySuccess={this.editBasicSuccess}
                                                disabled={hasPrivilege("CUSTOMER_UPDATE_NAME") ? false : true}
                                            />
                                            {basicData.customer_label ? (
                                                <Tag
                                                    className={customerLabelCls}>{basicData.customer_label}</Tag>) : null
                                            }
                                        </dd>
                                    </dl>
                                    { _.isArray(basicData.competing_products) && basicData.competing_products.length ? (
                                        <dl className="dl-horizontal  crm-basic-item detail_item crm-basic-competing-products">
                                            <dt>{Intl.get("crm.competing.products", "竞品")}</dt>
                                            <dd>
                                                {basicData.competing_products.map((products, index) => {
                                                    return (<Tag key={index}
                                                                 className="customer-label">{products}</Tag>);
                                                })}
                                            </dd>
                                        </dl>
                                    ) : null}
                                    <dl className="dl-horizontal crm-basic-item detail_item crm-basic-tags">
                                        <dt>{Intl.get("common.tag", "标签")}</dt>
                                        <dd>
                                            <TagEditField
                                                isMerge={this.props.isMerge}
                                                updateMergeCustomer={this.props.updateMergeCustomer}
                                                customerId={basicData.id}
                                                labels={basicData.labels}
                                                modifySuccess={this.editBasicSuccess}
                                                disabled={hasPrivilege("CUSTOMER_UPDATE_LABEL") ? false : true}
                                            />
                                        </dd>
                                    </dl>
                                    <dl className="dl-horizontal crm-basic-item detail_item crm-basic-industry">
                                        <dt>{Intl.get("realm.industry", "行业")}</dt>
                                        <dd>
                                            <IndustrySelectField
                                                isMerge={this.props.isMerge}
                                                updateMergeCustomer={this.props.updateMergeCustomer}
                                                customerId={basicData.id}
                                                industry={basicData.industry}
                                                modifySuccess={this.editBasicSuccess}
                                                disabled={hasPrivilege("CUSTOMER_UPDATE_INDUSTRY") ? false : true}
                                            />
                                        </dd>
                                    </dl>
                                    <dl className="dl-horizontal crm-basic-item detail_item crm-basic-administrative-level">
                                        <dt>{Intl.get("crm.administrative.level", "行政级别")}</dt>
                                        <dd>
                                            <BasicEditSelectField
                                                isMerge={this.props.isMerge}
                                                updateMergeCustomer={this.props.updateMergeCustomer}
                                                id={basicData.id}
                                                displayText={this.getAdministrativeLevel(basicData.administrative_level)}
                                                value={basicData.administrative_level ? basicData.administrative_level + '' : ''}
                                                field="administrative_level"
                                                selectOptions={this.getAdministrativeLevelOptions()}
                                                disabled={hasPrivilege("CUSTOMER_UPDATE_INDUSTRY") ? false : true}
                                                placeholder={Intl.get("crm.administrative.level.placeholder", "请选择行政级别")}
                                                onSelectChange={this.onSelectAdministrativeLevel}
                                                cancelEditField={this.cancelAdministrativeLevel}
                                                saveEditSelect={CrmBasicAjax.updateCustomer}
                                                modifySuccess={this.editBasicSuccess}
                                            />
                                        </dd>
                                    </dl>
                                    <dl className="dl-horizontal crm-basic-item detail_item crm-basic-loaction">
                                        <dt>{Intl.get("crm.96", "地域")}</dt>
                                        <dd>
                                            <LocationSelectField
                                                isMerge={this.props.isMerge}
                                                updateMergeCustomer={this.props.updateMergeCustomer}
                                                customerId={basicData.id}
                                                province={basicData.province}
                                                city={basicData.city}
                                                county={basicData.county}
                                                modifySuccess={this.editBasicSuccess}
                                                disabled={hasPrivilege("CUSTOMER_UPDATE_ADDRESS") ? false : true}
                                            />
                                        </dd>
                                    </dl>
                                    <dl className="dl-horizontal crm-basic-item detail_item crm-basic-address"
                                        style={{whiteSpace: "normal", wordBreak: "break-all"}}>
                                        <dt>{Intl.get("realm.address", "地址")}</dt>
                                        <dd>
                                            <BasicEditInputField
                                                isMerge={this.props.isMerge}
                                                updateMergeCustomer={this.props.updateMergeCustomer}
                                                user_id={basicData.id}
                                                value={basicData.address}
                                                field="address"
                                                type="text"
                                                placeholder={Intl.get("crm.detail.address.placeholder", "请输入详细地址")}
                                                disabled={hasPrivilege("CUSTOMER_UPDATE_ADDRESS") ? false : true}
                                                saveEditInput={CrmBasicAjax.updateCustomer}
                                                modifySuccess={this.editBasicSuccess}
                                            />
                                        </dd>
                                    </dl>
                                    <dl className="dl-horizontal crm-basic-item detail_item crm-basic-remarks"
                                        style={{whiteSpace: "normal", wordBreak: "break-all"}}>
                                        <dt><ReactIntl.FormattedMessage id="common.remark" defaultMessage="备注"/></dt>
                                        <dd>
                                            <CommentTextareaField
                                                isMerge={this.props.isMerge}
                                                updateMergeCustomer={this.props.updateMergeCustomer}
                                                customerId={basicData.id}
                                                remarks={basicData.remarks}
                                                modifySuccess={this.editBasicSuccess}
                                                disabled={hasPrivilege("CUSTOMER_UPDATE_REMARK") ? false : true}
                                            />
                                        </dd>
                                    </dl>

                                </div>
                                <SalesSelectField
                                    disabled={hasPrivilege("CUSTOMER_UPDATE_SALES") ? false : true}
                                    isMerge={this.props.isMerge}
                                    updateMergeCustomer={this.props.updateMergeCustomer}
                                    customerId={basicData.id}
                                    userName={basicData.user_name}
                                    userId={basicData.user_id}
                                    salesTeam={basicData.sales_team}
                                    salesTeamId={basicData.sales_team_id}
                                    modifySuccess={this.editBasicSuccess}
                                />
                            </div>

                            {showUserStatistic ?
                                <div className="user-statistic-content">
                                    <div className=" crm-basic-item detail_item">
                                        <label>
                                            <ReactIntl.FormattedMessage
                                                id="crm.198"
                                                defaultMessage={`有{number}个用户`}
                                                values={{
                                                    "number": <span className=" statistic-num"> {userNum} </span>
                                                }}
                                            />
                                        </label>
                                    </div>
                                    {this.props.isMerge || this.props.userViewShowCustomerUserListPanel ? null : (<PrivilegeChecker
                                        check="GET_CUSTOMER_USERS"
                                    >
                                        <div className=" iconfont icon-turn-user-list"
                                             onClick={this.triggerUserList}></div>
                                    </PrivilegeChecker>)}
                                </div>
                                : null}
                        </div>
                    </GeminiScrollbar>
                )}

            </div>
        );
    }
});

module.exports = injectIntl(BasicData);

