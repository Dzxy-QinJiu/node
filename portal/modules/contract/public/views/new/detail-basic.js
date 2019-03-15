/** Created by 2019-01-31 11:11 */
/**
 * 销售合同基本信息展示及编辑页面
 */
var React = require('react');
import { message, Select, Icon, Form } from 'antd';

let Option = Select.Option;
let FormItem = Form.Item;
import Trace from 'LIB_DIR/trace';
import 'MOD_DIR/user_manage/public/css/user-info.less';
import DetailCard from 'CMP_DIR/detail-card';
import { DetailEditBtn } from 'CMP_DIR/rightPanel';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import BasicEditDateField from 'CMP_DIR/basic-edit-field-new/date-picker';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import CustomerBelong from '../components/customer-belong';
import { AntcValidity } from 'antc';
import ajax from 'MOD_DIR/contract/common/ajax';
import customerAjax from 'MOD_DIR/common/public/ajax/customer';
import { CONTRACT_STAGE, COST_STRUCTURE, COST_TYPE, OPERATE, VIEW_TYPE, PRIVILEGE_MAP, DISPLAY_TYPES} from 'MOD_DIR/contract/consts';
import { regex } from 'ant-utils';
import { getNumberValidateRule } from 'PUB_DIR/sources/utils/validate-util';
import routeList from 'MOD_DIR/contract/common/route';
import oplateConsts from 'LIB_DIR/consts';
import { CategoryList, ContractLabel } from 'PUB_DIR/sources/utils/consts';

const EDIT_FEILD_WIDTH = 380, EDIT_FEILD_LESS_WIDTH = 330;
const formItemLayout = {
    labelCol: {span: 0},
    wrapperCol: {span: 18},
};

let queryCustomerTimeout = null;

class DetailBasic extends React.Component {
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
            displayType: DISPLAY_TYPES.TEXT,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps.contract, 'id') && this.props.contract.id !== nextProps.contract.id || !_.isEqual(this.props.contract,nextProps.contract)) {
            let formData = _.cloneDeep(nextProps.contract);
            this.setState({
                formData,
                displayType: DISPLAY_TYPES.TEXT,
            });
        }
    }

    saveContractBasicInfo = (saveObj, successFunc, errorFunc) => {
        const handler = 'editContract';
        const route = _.find(routeList, route => route.handler === handler);
        const arg = {
            url: route.path,
            type: route.method,
            data: saveObj || {},
            params: {type: VIEW_TYPE.SELL}
        };

        ajax(arg).then(result => {
            if (result.code === 0) {
                message.success(Intl.get('user.edit.success', '修改成功'));
                if (_.isFunction(successFunc)) successFunc();
                const hasResult = _.isObject(result.result) && !_.isEmpty(result.result);
                let contract = _.extend({},this.props.contract, result.result);
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

    changeDisplayType(type) {
        if (type === DISPLAY_TYPES.TEXT) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '取消对所属客户的修改');
            this.setState({
                displayType: type,
                submitErrorMsg: '',
            });
        } else if (type === DISPLAY_TYPES.EDIT) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '点击设置所属客户按钮');
            this.setState({
                displayType: type
            });
        }
    }

    // 处理有效期限
    handleSubmitEditValidityTime = (startTime, endTime, successCallback, errorCallback) => {
        const saveObj = {
            start_time: startTime,
            end_time: endTime,
            id: this.state.formData.id
        };

        const successFunc = () => {
            let contract = this.state.formData;
            contract.start_time = startTime;
            contract.end_time = endTime;
            this.setState({contract}, () => {
                successCallback();
            });
        };

        this.saveContractBasicInfo(saveObj, successFunc, errorCallback);
    };
    handleSubmitEditUser = (saveObj, successFunc, errorCallback) => {
        const selectedUser = _.find(this.props.userList, item => item.user_id === saveObj.user_id);
        saveObj.user_name = selectedUser ? selectedUser.nick_name : '';
        saveObj.sales_team_id = selectedUser.group_id;
        saveObj.sales_team = selectedUser.group_name;

        this.saveContractBasicInfo(saveObj, successFunc, errorCallback);
    };
    handleSubmitEditMount = (saveObj, successFunc, errorCallback) => {
        let formData = this.state.formData, calProfit = 0;
        //成本额默认为0
        formData.cost_price = _.get(formData,'cost_price',0);

        //根据合同额和成本额计算毛利
        if (_.get(saveObj, 'contract_amount',0)) { // 合同额
            calProfit = saveObj.contract_amount - formData.cost_price;
        } else if (_.get(saveObj, 'cost_price',0)) { // 成本
            calProfit = formData.contract_amount - saveObj.cost_price;
        }
        if (isNaN(calProfit) || calProfit < 0) calProfit = '0';
        saveObj.gross_profit = parseFloat(calProfit);

        this.saveContractBasicInfo(saveObj, successFunc, errorCallback);
    };
    handleSubmitEditSales = (saveObj, successFunc, errorCallback) => {
        const selectedUser = _.find(this.props.userList, item => item.user_id === saveObj.sales_rep_id);
        saveObj.sales_rep = _.get(selectedUser,'nick_name','');
        saveObj.sales_rep_team_id = selectedUser.group_id;
        saveObj.sales_rep_team = selectedUser.group_name;

        this.saveContractBasicInfo(saveObj, successFunc, errorCallback);
    };
    // 所属客户处理事件
    handleCustomerSubmit = () => {
        Trace.traceEvent(this, '点击所属客户保存按钮');
        let _this = this;
        this.CustomerBelongRef.validate((result) => {
            let saveObj = {
                id: this.state.formData.id,
                customers: result
            };
            this.setState({loading: true});
            const successFunc = () => {
                _this.setState({
                    loading: false,
                    submitErrorMsg: '',
                    displayType: DISPLAY_TYPES.TEXT
                });
            };
            const errorFunc = (errorMsg) => {
                _this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg
                });
            };
            this.saveContractBasicInfo(saveObj,successFunc,errorFunc);
        });
    };
    handleCustomerCancel = () => {
        Trace.traceEvent(this, '点击所属客户保取消按钮');
        let formData = this.state.formData;
        formData.customers = _.cloneDeep(this.props.contract.customers);
        this.setState({
            displayType: DISPLAY_TYPES.TEXT,
            formData,
            submitErrorMsg: '',
        });
    };

    // 渲染基础信息
    renderBasicInfo() {
        const contract = this.state.formData;

        let categoryOptions = _.map(CategoryList, (category, index) => {
            return (<Option value={category.value} key={index}>{category.name}</Option>);
        });
        let copyNumArray = [];
        for (let i = 1; i < 11; i++) {
            copyNumArray.push(i + '');
        }
        copyNumArray = _.map(copyNumArray, copyNum => {
            return <Option key={copyNum} value={copyNum}>{copyNum}</Option>;
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
                        {Intl.get('contract.4', '甲方')}:
                    </span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={contract.id}
                        field="buyer"
                        value={contract.buyer}
                        placeholder={Intl.get('crm.contract.party.name', '请输入甲方名称')}
                        validators={[{
                            required: true, message: Intl.get('crm.contract.party.name', '请输入甲方名称')
                        }, {
                            pattern: regex.customerNameRegex,
                            message: Intl.get('contract.193', '客户名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号等字符，且长度在1到50（包括50）之间')
                        }]}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditInput={this.saveContractBasicInfo}
                        editBtnTip={Intl.get('contract.modify.partyA', '修改甲方')}
                        addDataTip={Intl.get('contract.set.partyA', '设置甲方')}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('crm.41', '客户名')}:
                    </span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={contract.id}
                        field="customer_name"
                        value={contract.customer_name}
                        placeholder={Intl.get('contract.58', '请填写客户名')}
                        validators={[{
                            required: true, message: Intl.get('contract.58', '请填写客户名')
                        }, {
                            pattern: regex.customerNameRegex,
                            message: Intl.get('contract.193', '客户名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号等字符，且长度在1到50（包括50）之间')
                        }]}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditInput={this.saveContractBasicInfo}
                        editBtnTip={Intl.get('contract.201', '修改客户名')}
                        addDataTip={Intl.get('crm.170', '设置客户名')}
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
                        {Intl.get('contract.37', '合同类型')}:
                    </span>
                    <BasicEditSelectField
                        id={contract.id}
                        displayText={contract.category}
                        value={contract.category}
                        field="category"
                        selectOptions={categoryOptions}
                        width={EDIT_FEILD_LESS_WIDTH}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditSelect={this.saveContractBasicInfo}
                        editBtnTip={Intl.get( 'contract.204', '修改合同类型')}
                        addDataTip={Intl.get('contract.205', '设置合同类型')}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.valid.term', '有效期限')}:
                    </span>
                    <AntcValidity
                        mode={hasEditPrivilege ? 'infoEdit' : 'info'}
                        startTime={contract.start_time}
                        endTime={contract.end_time}
                        onChange={this.handleSubmitEditValidityTime}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.32', '合同份数')}:
                    </span>
                    <BasicEditSelectField
                        id={contract.id}
                        displayText={contract.copy_number || 1 + '份'}
                        value={contract.copy_number}
                        field="copy_number"
                        selectOptions={copyNumArray}
                        width={EDIT_FEILD_LESS_WIDTH}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditSelect={this.saveContractBasicInfo}
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

    // 负责人
    renderUser() {
        const contract = this.state.formData;
        const userOptions = this.props.userList.map(user => {
            return <Option key={user.user_id} value={user.user_id}>{user.nick_name + ' - ' + user.group_name}</Option>;
        });
        const stageOptions = CONTRACT_STAGE.map(stage => {
            return <Option key={stage} value={stage}>{stage}</Option>;
        });
        let labelOptions = _.map(ContractLabel, (label) => {
            return <Option key={label.value} value={label.value}>{label.name}</Option>;
        });
        // 合同的签约类型
        const contractLabel = contract.label === 'new' ? Intl.get('crm.contract.new.sign', '新签') : Intl.get('contract.163', '续约');
        let hasEditPrivilege = this.state.hasEditPrivilege;

        const content = (
            <div>
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
                        noDataTip={Intl.get('contract.64', '暂无负责人')}
                        addDataTip={Intl.get( 'contract.206', '设置负责人')}
                        editBtnTip={Intl.get('contract.207', '修改负责人')}
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
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.164', '签约类型')}:
                    </span>
                    <BasicEditSelectField
                        id={contract.id}
                        displayText={contractLabel}
                        value={contractLabel}
                        field="label"
                        selectOptions={labelOptions}
                        width={EDIT_FEILD_LESS_WIDTH}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditSelect={this.saveContractBasicInfo}
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

    // 合同额
    renderAmount() {
        const contract = this.state.formData;

        const costOptions = _.map(COST_STRUCTURE, item => (
            <Option key={item} value={item}>{item}</Option>
        ));
        let hasEditPrivilege = this.state.hasEditPrivilege;
        const content = (
            <div>
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
                        saveEditInput={this.handleSubmitEditMount}
                        noDataTip={Intl.get('crm.contract.no.contract.money', '暂无合同额')}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.153', '成本额')}:
                    </span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={contract.id}
                        field="cost_price"
                        type='number'
                        displayText={contract.cost_price || 0}
                        validators={[getNumberValidateRule()]}
                        value={contract.cost_price}
                        placeholder={Intl.get('contract.enter.cost', '请输入成本额')}
                        afterValTip={Intl.get('contract.82', '元')}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditInput={this.handleSubmitEditMount}
                        addDataTip={Intl.get('contract.208', '设置成本额')}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.154', '合同毛利')}:
                    </span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={contract.id}
                        field="gross_profit"
                        displayText={_.get(contract,'gross_profit',0)}
                        type='number'
                        validators={[getNumberValidateRule()]}
                        placeholder={Intl.get('crm.contract.enter.gross', '请输入毛利')}
                        value={contract.gross_profit}
                        afterValTip={Intl.get('contract.82', '元')}
                        hasEditPrivilege={false}
                        noDataTip={Intl.get('crm.contract.no.gross', '暂无毛利额')}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('contract.165', '成本构成')}:
                    </span>
                    <BasicEditSelectField
                        id={contract.id}
                        displayText={contract.cost_structure}
                        value={contract.cost_structure ? contract.cost_structure.split(',') : []}
                        field="cost_structure"
                        multiple
                        selectOptions={costOptions}
                        width={EDIT_FEILD_LESS_WIDTH}
                        hasEditPrivilege={hasEditPrivilege}
                        validators={[{
                            required: true,
                            message: Intl.get('contract.209', '请选择成本构成'),
                            type: 'array'
                        }]}
                        saveEditSelect={(saveObj, successFunc, errorFunc) => {
                            saveObj.cost_structure = saveObj.cost_structure.join(',');
                            this.saveContractBasicInfo(saveObj, successFunc, errorFunc);
                        }}
                        noDataTip={Intl.get('clue.has.no.data', '暂无')}
                        addDataTip={Intl.get('contract.210', '设置成本构成')}
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

    // 所属客户
    renderCustomer() {
        const customers = this.state.formData.customers;

        const content = () => {
            if (this.state.displayType === DISPLAY_TYPES.TEXT) {
                return (
                    <div className="belong-customer-list">
                        {(customers || []).map((customer, index) => (
                            <div className="detail-item" key={index}>
                                <span className='detail-customer-name'>
                                    {customer.customer_name}
                                </span>
                                {customer.customer_sales_name ? (
                                    <div>
                                        {customer.customer_sales_name}
                                        {customer.customer_sales_team_name ? (
                                            <span>&nbsp;-&nbsp;
                                                {customer.customer_sales_team_name}
                                            </span>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                );
            } else if (this.state.displayType === DISPLAY_TYPES.EDIT) {
                return this.renderChangeCustomerSelect();
            }
        };

        const customerTitle = (
            <div className="sales-team">
                <span className="sales-team-label">{Intl.get('common.belong.customer', '所属客户')}:</span>
                {this.state.displayType === DISPLAY_TYPES.TEXT && this.state.hasEditPrivilege ? (
                    <DetailEditBtn title={Intl.get('common.edit', '编辑')}
                        onClick={this.changeDisplayType.bind(this, DISPLAY_TYPES.EDIT)}/>) : null}
            </div>
        );

        return (
            <DetailCard
                content={content()}
                title={customerTitle}
                isEdit={this.state.displayType !== DISPLAY_TYPES.TEXT}
                loading={this.state.loading}
                saveErrorMsg={this.state.submitErrorMsg}
                handleSubmit={this.handleCustomerSubmit}
                handleCancel={this.handleCustomerCancel}
                className="member-detail-container"
            />
        );
    }

    // 销售代表
    renderSales() {
        const contract = this.state.formData;
        const userOptions = this.props.userList.map(user => {
            return <Option key={user.user_id} value={user.user_id}>{user.nick_name + ' - ' + user.group_name}</Option>;
        });

        const content = (
            <div>
                <div className="basic-info-item">
                    <span className="basic-info-label">
                        {Intl.get('sales.commission.role.representative', '销售代表')}:
                    </span>
                    <BasicEditSelectField
                        id={contract.id}
                        displayText={contract.sales_rep ? contract.sales_rep + ' - ' + contract.sales_rep_team : ''}
                        value={contract.sales_rep_id}
                        field="sales_rep_id"
                        selectOptions={userOptions}
                        placeholder={Intl.get('choose.sales.representative', '请选择销售代表')}
                        validators={[{message: Intl.get('choose.sales.representative', '请选择销售代表')}]}
                        width={EDIT_FEILD_LESS_WIDTH}
                        hasEditPrivilege={this.state.hasEditPrivilege}
                        saveEditSelect={this.handleSubmitEditSales}
                        noDataTip={Intl.get('no.sales.representative', '暂无销售代表')}
                        addDataTip={Intl.get('crm.173', '设置销售')}
                        editBtnTip={Intl.get('crm.173', '设置销售')}
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

    // 备注
    renderRemarks() {
        let contract = this.state.formData;
        const content = (
            <div>
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

    renderChangeCustomerSelect() {
        return (
            <CustomerBelong
                wrappedComponentRef={ref => this.CustomerBelongRef = ref}
                customers={this.state.formData.customers}
            />
        );
    }

    render() {
        const DetailBlock = (
            <div className='clearfix contract-tab-container'>
                {this.renderBasicInfo()}
                {this.renderUser()}
                {this.renderAmount()}
                {this.renderCustomer()}
                {this.renderSales()}
                {this.renderRemarks()}
            </div>
        );

        return (
            <div style={{height: this.props.height}} data-tracename="合同详情页面">
                <GeminiScrollBar>
                    {DetailBlock}
                </GeminiScrollBar>
            </div>
        );
    }
}

DetailBasic.propTypes = {
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
    viewType: PropTypes.string,
    form: PropTypes.object
};
module.exports = Form.create()(DetailBasic);

