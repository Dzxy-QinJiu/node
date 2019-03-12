/** Created by 2019-01-31 11:11 */
/**
 * 采购合同基本信息展示及编辑页面
 */
var React = require('react');
import { message, Select, Radio, Icon, Form } from 'antd';

let Option = Select.Option;
import Trace from 'LIB_DIR/trace';
import 'MOD_DIR/user_manage/public/css/user-info.less';
import DetailCard from 'CMP_DIR/detail-card';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import BasicEditDateField from 'CMP_DIR/basic-edit-field-new/date-picker';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import ajax from 'MOD_DIR/contract/common/ajax';
import { CONTRACT_STAGE, PURCHASE_TYPE, VIEW_TYPE, PURCHASE, PRIVILEGE_MAP } from 'MOD_DIR/contract/consts';
import { getNumberValidateRule } from 'PUB_DIR/sources/utils/validate-util';
import routeList from 'MOD_DIR/contract/common/route';
import oplateConsts from 'LIB_DIR/consts';
import {getPurchaseContractTypeName} from 'MOD_DIR/contract/public/utils';

const EDIT_FEILD_WIDTH = 380, EDIT_FEILD_LESS_WIDTH = 330;


class DetailBuyBasic extends React.Component {
    state = {
        ...this.getInitStateData(this.props),
    };

    getInitStateData(props) {
        let hasEditPrivilege = hasPrivilege(PRIVILEGE_MAP.CONTRACT_UPATE_PRIVILEGE);
        let formData = props.contract;

        return {
            formData: _.cloneDeep(formData),
            loading: false,
            submitErrorMsg: '',
            hasEditPrivilege,
        };
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps.contract, 'id') && this.props.contract.id !== nextProps.contract.id || !_.isEqual(this.props.contract,nextProps.contract)) {
            this.setState({
                formData: JSON.parse(JSON.stringify(nextProps.contract)),
            });
        }
    }

    saveContractBasicInfo = (saveObj, successFunc, errorFunc) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this),'修改采购合同');
        const handler = 'editContract';
        const route = _.find(routeList, route => route.handler === handler);
        const arg = {
            url: route.path,
            type: route.method,
            data: saveObj || {},
            params: {type: VIEW_TYPE.BUY}
        };
        ajax(arg).then(result => {
            if (result.code === 0) {
                message.success(Intl.get('user.edit.success', '修改成功'));
                if (_.isFunction(successFunc)) successFunc();
                const hasResult = _.isObject(result.result) && !_.isEmpty(result.result);
                let contract = _.extend({},this.props.contract,result.result);
                if (hasResult) {
                    this.props.refreshCurrentContract(this.props.contract.id, true, contract);
                }
            } else {
                if (_.isFunction(errorFunc)) errorFunc(Intl.get('common.edit.failed', '修改失败'));
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg || Intl.get('common.edit.failed', '修改失败'));
        });
    };
    handleSubmitEditUser = (saveObj, successFunc, errorCallback) => {
        const selectedUser = _.find(this.props.userList, item => item.user_id === saveObj.user_id);
        saveObj.user_name = selectedUser ? selectedUser.nick_name : '';
        saveObj.sales_team_id = selectedUser.group_id;
        saveObj.sales_team = selectedUser.group_name;

        this.saveContractBasicInfo(saveObj, successFunc, errorCallback);
    };

    // 渲染基础信息
    renderBasicInfo() {
        const contract = this.state.formData;

        const userOptions = this.props.userList.map(user => {
            return <Option key={user.user_id} value={user.user_id}>{user.nick_name + ' - ' + user.group_name}</Option>;
        });
        let purchaseOptions = _.map(PURCHASE_TYPE, (purchase, index) => {
            return (<Option value={purchase.dataIndex} key={index}>{purchase.name}</Option>);
        });
        const stageOptions = CONTRACT_STAGE.map(stage => {
            return <Option key={stage} value={stage}>{stage}</Option>;
        });

        let hasEditPrivilege = this.state.hasEditPrivilege;

        const content = (
            <div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.24', '合同号')}:
                    </span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={contract.id}
                        field="num"
                        value={contract.num}
                        placeholder={Intl.get('contract.57', '请填写合同号')}
                        validators={[{required: true, message: Intl.get('contract.57', '请填写合同号')}]}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditInput={this.saveContractBasicInfo}
                        addDataTip={Intl.get('contract.211', '设置合同号')}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('crm.6', '负责人')}:
                    </span>
                    <BasicEditSelectField
                        id={contract.id}
                        displayText={contract.user_name + ' - ' + contract.sales_team}
                        value={contract.user_id}
                        field="user_id"
                        selectOptions={userOptions}
                        width={EDIT_FEILD_LESS_WIDTH}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditSelect={this.handleSubmitEditUser}
                        editBtnTip={Intl.get('contract.207', '修改负责人')}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.purchase.contract.type', '分类')}:
                    </span>
                    <BasicEditSelectField
                        id={contract.id}
                        displayText={getPurchaseContractTypeName(_.get(contract,'purchase_contract_type',''))}
                        value={_.isNil(contract.purchase_contract_type) ? '' : contract.purchase_contract_type.toString()}
                        field="purchase_contract_type"
                        selectOptions={purchaseOptions}
                        width={EDIT_FEILD_LESS_WIDTH}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditSelect={this.saveContractBasicInfo}
                        editBtnTip={Intl.get('contract.212', '修改分类')}
                        addDataTip={Intl.get('contract.213', '设置分类')}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.25', '合同额')}:
                    </span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={contract.id}
                        displayText={_.get(contract,'contract_amount',0)}
                        field="contract_amount"
                        type='number'
                        validators={[{
                            required: true,
                            message: Intl.get('contract.69', '请填写合同金额')
                        }, getNumberValidateRule()]}
                        value={contract.contract_amount}
                        afterValTip={Intl.get('contract.82', '元')}
                        placeholder={Intl.get('crm.contract.enter.contract.money', '请输入合同额')}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditInput={this.saveContractBasicInfo}
                        noDataTip={Intl.get('crm.contract.no.contract.money', '暂无合同额')}
                        addDataTip={Intl.get('contract.214', '设置合同额')}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.34', '签订时间')}:
                    </span>
                    <BasicEditDateField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={contract.id}
                        field="date"
                        format={oplateConsts.DATE_FORMAT}
                        value={contract.date}
                        saveEditDateInput={this.saveContractBasicInfo}
                        hasEditPrivilege={hasEditPrivilege}
                        editBtnTip={Intl.get('contract.202', '修改签订时间')}
                        addDataTip={Intl.get('contract.203', '设置签订时间')}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.36', '合同阶段')}:
                    </span>
                    <BasicEditSelectField
                        id={contract.id}
                        displayText={contract.stage}
                        value={contract.stage}
                        field="stage"
                        selectOptions={stageOptions}
                        width={EDIT_FEILD_LESS_WIDTH}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditSelect={this.saveContractBasicInfo}
                        addDataTip={Intl.get('contract.215', '设置合同阶段')}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.37', '合同类型')}:
                    </span>
                    <BasicEditSelectField
                        id={contract.id}
                        displayText={contract.category || PURCHASE}
                        value={contract.category}
                        field="category"
                        width={EDIT_FEILD_LESS_WIDTH}
                        hasEditPrivilege={false}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('common.remark', '备注')}:
                    </span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={contract.id}
                        type="textarea"
                        field='remarks'
                        value={contract.remarks}
                        placeholder={Intl.get('user.input.remark', '请输入备注')}
                        hasEditPrivilege={this.state.hasEditPrivilege}
                        saveEditInput={this.saveContractBasicInfo}
                        noDataTip={Intl.get('crm.basic.no.remark', '暂无备注')}
                        addDataTip={Intl.get('user.remark.set.tip', '设置备注')}
                    />
                </div>
            </div>);

        return (
            <DetailCard
                content={content}
                className="member-detail-container"
            />
        );
    }

    render() {
        const DetailBlock = (
            <div className='clearfix contract-tab-container'>
                {this.renderBasicInfo()}
            </div>
        );

        return (
            <div style={{height: this.props.height}} data-tracename="采购合同详情页面">
                <GeminiScrollBar>
                    {DetailBlock}
                </GeminiScrollBar>
            </div>
        );
    }
}

DetailBuyBasic.propTypes = {
    height: PropTypes.string,
    contract: PropTypes.object,
    teamList: PropTypes.array,
    userList: PropTypes.array,
    getUserList: PropTypes.func,
    isGetUserSuccess: PropTypes.func,
    handleSubmit: PropTypes.func,
    showLoading: PropTypes.func,
    hideLoading: PropTypes.func,
    refreshCurrentContract: PropTypes.func,
    refreshCurrentContractRepayment: PropTypes.func,
};
module.exports = DetailBuyBasic;

