var React = require('react');
import DetailCard from 'CMP_DIR/detail-card';
import { AntcTable, AntcValidity } from 'antc';
import { num as antUtilsNum } from 'ant-utils';
const parseAmount = antUtilsNum.parseAmount;
import classNames from 'classnames';
import Trace from 'LIB_DIR/trace';
import { Button, Icon, message, DatePicker } from 'antd';
const RangePicker = DatePicker.RangePicker;
import ContractAction from '../../action/contract-action';
const ContractAjax = require('../../ajax/contract-ajax');
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
const AlertTimer = require('CMP_DIR/alert-timer');
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import ProductTable from 'CMP_DIR/basic-edit-field-new/product-table';
const { CategoryList, ContractLabel} = require('PUB_DIR/sources/utils/consts');
import {DetailEditBtn} from 'CMP_DIR/rightPanel';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
const EDIT_WIDTH = 350;
//权限常量
const PRIVILEGE_MAP = {
    CONTRACT_BASE_PRIVILEGE: 'CRM_CONTRACT_COMMON_BASE',//合同基础角色的权限，开通合同管理应用后会有此权限
};

class ContractItem extends React.Component {
    state = {
        isDeleteContractFlag: false, // 是否删除合同，默认false
        formData: JSON.parse(JSON.stringify(this.props.contract)),
        isLoading: false,
        errMsg: '', // 删除错误的信息提示
        isShowProductEdit: false, //是否显示添加产品
    };

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps.contract, 'id') && this.props.contract.id !== nextProps.contract.id) {
            this.setState({
                formData: JSON.parse(JSON.stringify(nextProps.contract)),
            });
        }
    }

    toggleContractDetail = (event) => {
        let formData = this.state.formData;
        formData.isShowAllContractInfo = !formData.isShowAllContractInfo;
        if (formData.isShowAllContractInfo) {
            Trace.traceEvent(event, '点击展开详情');
        } else {
            Trace.traceEvent(event, '点击收起详情');
        }
        this.setState({formData});
    };

    cancelDeleteContract = (event) => {
        Trace.traceEvent(event, '点击取消删除合同');
        this.setState({
            isDeleteContractFlag: false,
            errMsg: ''
        });
    };

    // 删除合同
    deleteContract = (contract, event) => {
        Trace.traceEvent(event, '点击确认删除合同');
        this.setState({isLoading: true});
        ContractAjax.deletePendingContract(contract.id, {type: contract.type}).then( (resData) => {
            if (resData && resData.code === 0) {
                message.success(Intl.get('crm.138', '删除成功'));
                this.setState({
                    errMsg: '',
                    isDeleteContractFlag: false,
                    isLoading: false
                });
                ContractAction.deleteContact(contract);
            } else {
                this.setState({
                    errMsg: Intl.get('crm.139', '删除失败'),
                    isLoading: false
                });
            }
        }, (errMsg) => {
            this.setState({
                isLoading: false,
                errMsg: errMsg || Intl.get('crm.139', '删除失败')
            });
        });
    };

    showDeleteContractConfirm = (event) => {
        Trace.traceEvent(event, '点击删除按钮');
        this.setState({
            isDeleteContractFlag: true
        });
    };

    renderContractTitle = () => {
        const contract = this.state.formData;
        let contractStageClass = classNames('contract-stage', {
            'contract-pending': contract.stage === '待审',
            'contract-review': contract.stage === '审核',
            'contract-filed': contract.stage === '归档'
        });
        let contractClass = classNames('iconfont',{
            'icon-down-twoline': !contract.isShowAllContractInfo,
            'icon-up-twoline': contract.isShowAllContractInfo

        });
        let contractTitle = contract.isShowAllContractInfo ? Intl.get('crm.basic.detail.hide', '收起详情') :
            Intl.get('crm.basic.detail.show', '展开详情');

        return (
            <div className='contract-title'>
                {contract.stage === '待审' && !contract.num ? (
                    <span className='contract-item-stage'>{Intl.get('crm.contract.pending.contract', '合同待审')}</span>
                ) : (
                    <span className='contract-item-title'>
                        <span className={contractStageClass}>
                            <span className='contract-left-bracket'>[</span>{contract.stage}<span className='contract-right-bracket'>]</span>
                        </span>
                        <span className='contract-num'>{contract.num}</span>
                    </span>
                )}
                <span className='contract-item-buttons'>
                    {
                        this.state.isLoading ? <Icon type='loading' /> : null
                    }
                    {
                        this.state.isDeleteContractFlag ? (
                            <span className='item-delete-buttons'>
                                <Button className='item-delete-cancel delete-button-style'
                                    onClick={this.cancelDeleteContract}>
                                    {Intl.get('common.cancel', '取消')}
                                </Button>
                                <Button className='item-delete-confirm delete-button-style'
                                    onClick={this.deleteContract.bind(this, contract)}>
                                    {Intl.get('crm.contact.delete.confirm', '确认删除')}
                                </Button>
                            </span>) : (
                            !this.props.disableEdit && hasPrivilege(PRIVILEGE_MAP.CONTRACT_BASE_PRIVILEGE) && contract.stage === '待审' ? (
                                <span className='iconfont icon-delete' title={Intl.get('common.delete', '删除')}
                                    onClick={this.showDeleteContractConfirm}/>
                            ) : null
                        )
                    }
                </span>
                <span className={contractClass} title={contractTitle} onClick={this.toggleContractDetail}/>
            </div>
        );
    };

    // 格式化数值
    formatValues = (value, showUnit = true) => {
        // 校验参数是否为数值
        value = parseFloat(value);
        if (isNaN(value)) {
            value = 0;
        }
        // 保留两位小数
        value = value.toFixed(2);
        // 增加千分位分割
        if (value) {
            value = parseAmount(value);
        }
        return showUnit ? value + Intl.get('contract.155', '元') : value;
    };

    saveContractBasicInfo = (updateField, saveObj, successFunc, errorFunc) => {
        let contract = this.state.formData;
        // 客户信息
        saveObj.customers = [{customer_name: contract.customer_name, customer_id: this.props.customerId}];
        ContractAjax.editPendingContract({type: 'sell', property: updateField}, saveObj).then( (resData) => {
            if (resData && resData.code === 0) {
                message.success(Intl.get('user.edit.success', '修改成功'));
                if (_.isFunction(successFunc)) successFunc(resData.result);
            } else {
                if (_.isFunction(errorFunc)) {
                    errorFunc(Intl.get('common.edit.failed', '修改失败'));
                }
            }
        }, (errMsg) => {
            if (_.isFunction(errorFunc)) {
                errorFunc(errMsg || Intl.get('common.edit.failed', '修改失败'));
            }
        });
    };

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

        this.saveContractBasicInfo('start_time',saveObj, successFunc, errorCallback);
    };

    handleProductSave = (data, successFunc, errorFunc) => {
        let saveObj = {
            products: data,
            id: this.state.formData.id
        };

        const successFn = (result) => {
            let formData = this.state.formData;
            formData.products = _.get(result, 'products', []);
            this.setState({formData}, () => {
                _.isFunction(successFunc) && successFunc();
            });
        };

        this.saveContractBasicInfo('products', saveObj, successFn, errorFunc);
    };

    handleShowAddProduct = (flag) => {
        this.setState({isShowProductEdit: flag});
    };

    renderContractContent = () => {
        const contract = this.state.formData;
        const start_time = contract.start_time ? moment(contract.start_time).format(oplateConsts.DATE_FORMAT) : '';
        const end_time = contract.end_time ? moment(contract.end_time).format(oplateConsts.DATE_FORMAT) : '';
        let itemClassName = classNames('contract-item-content', {
            'item-edit-style': contract.stage === '待审' && hasPrivilege(PRIVILEGE_MAP.CONTRACT_BASE_PRIVILEGE)
        });
        let categoryOptions = _.map(CategoryList, (category, index) => {
            return (<Option value={category.value} key={index}>{category.name}</Option>);
        });
        let labelOptions = _.map(ContractLabel, (label) => {
            return <Option key={label.value} value={label.value}>{label.name}</Option>;
        });
        // 合同的签约类型
        const contractLabel = contract.label === 'new' ? Intl.get('crm.contract.new.sign', '新签') : Intl.get('contract.163', '续约');
        let hasEditPrivilege = !this.props.disableEdit && contract.stage === '待审' && hasPrivilege(PRIVILEGE_MAP.CONTRACT_BASE_PRIVILEGE) || false;
        let validityTime = Intl.get('crm.contract.validity.one.year', '有效期一年');
        return (
            <div className='contract-item'>
                <div className={itemClassName}>
                    <span className='contract-label'>{Intl.get('contract.4', '甲方')}:</span>
                    <BasicEditInputField
                        width={EDIT_WIDTH}
                        id={contract.id}
                        field='buyer'
                        value={contract.buyer}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditInput={this.saveContractBasicInfo.bind(this, 'buyer')}
                        placeholder={Intl.get('crm.contract.party.name', '请输入甲方名称')}
                        addDataTip={Intl.get('crm.contract.add.buyer', '添加甲方')}
                    />
                </div>
                <div className={itemClassName}>
                    <span className='contract-label'>{Intl.get('crm.contract.validity.time', '有效期')}:</span>
                    <div className='contract-validity-edit-block'>
                        <AntcValidity
                            mode={contract.stage === '待审' && !this.props.disableEdit ? 'infoEdit' : 'info'}
                            className='validity-time'
                            startTime={contract.start_time}
                            endTime={contract.end_time}
                            onChange={this.handleSubmitEditValidityTime}
                        />
                    </div>
                </div>
                <div className={itemClassName}>
                    <span className='contract-label'>{Intl.get('contract.25', '合同额')}:</span>
                    <BasicEditInputField
                        width={EDIT_WIDTH}
                        id={contract.id}
                        type='number'
                        field='contract_amount'
                        value={contract.contract_amount}
                        afterValTip={Intl.get('contract.82', '元')}
                        placeholder={Intl.get('crm.contract.enter.contract.money', '请输入合同额')}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditInput={this.saveContractBasicInfo.bind(this, 'contract_amount')}
                        noDataTip={Intl.get('crm.contract.no.contract.money', '暂无合同额')}
                        addDataTip={Intl.get('crm.contract.add.money', '添加合同额')}
                    />
                </div>
                <div className={itemClassName}>
                    <span className='contract-label'>{Intl.get('contract.109', '毛利')}:</span>
                    <BasicEditInputField
                        width={EDIT_WIDTH}
                        id={contract.id}
                        type='number'
                        field='gross_profit'
                        value={contract.gross_profit}
                        afterValTip={Intl.get('contract.82', '元')}
                        placeholder={Intl.get('crm.contract.enter.gross', '请输入毛利')}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditInput={this.saveContractBasicInfo.bind(this, 'cost_price')}
                        noDataTip={Intl.get('crm.contract.no.gross', '暂无毛利额')}
                        addDataTip={Intl.get('crm.contract.add.gross', '添加毛利')}
                    />
                </div>
                <div className={itemClassName}>
                    <span className='contract-label'>{Intl.get('contract.37', '合同类型')}:</span>
                    <BasicEditSelectField
                        width={EDIT_WIDTH}
                        id={contract.id}
                        displayText={contract.category}
                        value={contract.category}
                        field="category"
                        selectOptions={categoryOptions}
                        hasEditPrivilege={hasEditPrivilege}
                        placeholder={Intl.get('contract.72', '请选择合同类型')}
                        saveEditSelect={this.saveContractBasicInfo.bind(this, 'category')}
                    />
                </div>
                <div className={itemClassName}>
                    <span className='contract-label'>{Intl.get('contract.164', '签约类型')}:</span>
                    <BasicEditSelectField
                        width={EDIT_WIDTH}
                        id={contract.id}
                        displayText={contractLabel}
                        value={contractLabel}
                        field="label"
                        selectOptions={labelOptions}
                        hasEditPrivilege={hasEditPrivilege}
                        placeholder={Intl.get('crm.contract.select.sign.type', '请选择签约类型')}
                        saveEditSelect={this.saveContractBasicInfo.bind(this, 'label')}
                    />
                </div>
                {
                    contract.isShowAllContractInfo ? (
                        <div className={itemClassName}>
                            <span className='contract-label'>{Intl.get('contract.95', '产品信息')}:</span>
                            <span className='contract-value'>
                                {_.get(contract.products, '[0]') || this.state.isShowProductEdit ? (
                                    <ProductTable
                                        appList={this.props.appList}
                                        dataSource={contract.products}
                                        totalAmount={contract.contract_amount}
                                        isEditBtnShow={hasEditPrivilege}
                                        isEdit={this.state.isShowProductEdit}
                                        onSave={this.handleProductSave}
                                        handleCancel={this.handleShowAddProduct.bind(this, false)}
                                    />
                                ) : (
                                    hasEditPrivilege ? <a className="no-data-descr__link" onClick={this.handleShowAddProduct.bind(this, true)}>{Intl.get('config.product.add', '添加产品')}</a>
                                        : Intl.get('crm.contract.no.product.info', '暂无产品信息')
                                )}
                            </span>
                        </div>
                    ) : null
                }
                {
                    contract.remarks ? (
                        contract.isShowAllContractInfo ? (
                            <div className={itemClassName}>
                                <span className='contract-label'>{Intl.get('common.remark', '备注')}:</span>
                                <BasicEditInputField
                                    width={EDIT_WIDTH}
                                    id={contract.id}
                                    type="textarea"
                                    field='remarks'
                                    value={contract.remarks}
                                    hasEditPrivilege={hasEditPrivilege}
                                    saveEditInput={this.saveContractBasicInfo.bind(this, 'remarks')}
                                    addDataTip={Intl.get('crm.contract.add.remarks', '添加备注')}
                                />
                            </div>
                        ) : null
                    ) : null
                }
            </div>
        );
    };

    // 隐藏错误信息
    hideErrorMsg = () => {
        this.setState({
            errMsg: ''
        });
    };

    renderContractBottom = () => {
        const contract = this.state.formData;
        const date = contract.date ? moment(contract.date).format(oplateConsts.DATE_FORMAT) : '';
        return (
            <div className='contract-bottom-wrap'>
                {
                    this.state.errMsg ? (
                        <AlertTimer
                            time={3000}
                            message={this.state.errMsg}
                            type='error'
                            showIcon
                            onHide={this.hideErrorMsg}
                        />
                    ) : null
                }
                <ReactIntl.FormattedMessage
                    id='crm.contract.sign.time'
                    defaultMessage={'{uername}签订于{date}'}
                    values={{
                        'uername': <span className='signed-username'>{contract.user_name}</span>,
                        'date': date
                    }}
                />
            </div>
        );
    };

    render() {
        let containerClassName = classNames('contract-item-container', {
            'item-delete-border': this.state.isDeleteContractFlag,
        });
        const contract = this.state.formData;
        return (
            <DetailCard
                title={this.renderContractTitle()}
                content={this.renderContractContent()}
                bottom={this.renderContractBottom()}
                className={containerClassName}
            />
        );
    }
}
ContractItem.propTypes = {
    disableEdit: PropTypes.bool,
    appList: PropTypes.array,
    customerId: PropTypes.string,
    contract: PropTypes.object,
};
module.exports = ContractItem;

