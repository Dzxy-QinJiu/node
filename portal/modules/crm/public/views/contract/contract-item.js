import DetailCard from 'CMP_DIR/detail-card';
import { AntcTable } from 'antc';
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

const ContractItem = React.createClass({
    getInitialState() {
        return {
            isDeleteContractFlag: false, // 是否删除合同，默认false
            formData: JSON.parse(JSON.stringify(this.props.contract)),
            isLoading: false,
            errMsg: '', // 删除错误的信息提示
            editValidityLoading: false, // 编辑有效期的loading，默认false
            isShowValidityTimeEdit: false, // 是否显示编辑有效期，默认false
            editValidityTimeErrMsg: '', // 编辑有效期错误信息提示
        };
    },
    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps.contract, 'id') && this.props.contract.id !== nextProps.contract.id) {
            this.setState({
                formData: JSON.parse(JSON.stringify(nextProps.contract)),
            });
        }
    },
    toggleContractDetail(event) {
        let formData = this.state.formData;
        formData.isShowAllContractInfo = !formData.isShowAllContractInfo;
        if (formData.isShowAllContractInfo) {
            Trace.traceEvent(event, '点击展开详情');
        } else {
            Trace.traceEvent(event, '点击收起详情');
        }
        this.setState({formData});
    },
    cancelDeleteContract(event) {
        Trace.traceEvent(event, '点击取消删除合同');
        this.setState({
            isDeleteContractFlag: false,
            errMsg: ''
        });
    },
    // 删除合同
    deleteContract(contract, event) {
        Trace.traceEvent(event, '点击确认删除合同');
        this.setState({isLoading: true});
        ContractAjax.deletePendingContract(contract.id).then( (resData) => {
            this.state.isLoading = false;
            if (resData && resData.code === 0) {
                message.success(Intl.get('crm.138', '删除成功'));
                this.state.errMsg = '';
                this.state.isDeleteContractFlag = false;
                ContractAction.deleteContact(contract);
            } else {
                this.state.errMsg = Intl.get('crm.139', '删除失败');
            }
            this.setState(this.state);
        }, (errMsg) => {
            this.setState({
                isLoading: false,
                errMsg: errMsg || IIntl.get('crm.139', '删除失败')
            });
        });
    },
    showDeleteContractConfirm(event) {
        Trace.traceEvent(event, '点击删除按钮');
        this.setState({
            isDeleteContractFlag: true
        });
    },
    renderContractTitle() {
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
                            hasPrivilege('OPLATE_CONTRACT_DELETE_UNCHECK') && contract.stage === '待审' ? (
                                <span className='iconfont icon-delete' title={Intl.get('common.delete', '删除')}
                                    onClick={this.showDeleteContractConfirm}/>
                            ) : null
                        )
                    }
                </span>
                <span className={contractClass} title={contractTitle} onClick={this.toggleContractDetail}/>
            </div>
        );
    },
    // 格式化数值
    formatValues(value, showUnit = true) {
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
    },
    renderAppIconName(appName, appId) {
        let appList = this.props.appList;
        let matchAppObj = _.find( appList, (appItem) => {
            return appItem.client_id === appId;
        });
        return (
            <span className='app-icon-name'>
                {appName ? (
                    matchAppObj && matchAppObj.client_image ? (
                        <span className='app-self'>
                            <img src={matchAppObj.client_image} />
                        </span>
                    ) : (
                        <span className='app-default'>
                            <i className='iconfont icon-app-default'></i>
                        </span>
                    )
                ) : null}
                <span className='app-name' title={appName}>{appName}</span>
            </span>
        );
    },
    getProductColumns() {
        return [
            {
                title: Intl.get('crm.contract.product.name', '产品名称'),
                dataIndex: 'name',
                key: 'name',
                width: '50%',
                render: (text, record, index) => {
                    return <span className='app-info'>{this.renderAppIconName(text, record.id)}</span>;
                }
            },
            {
                title: Intl.get('crm.contract.account.count', '账号数量'),
                dataIndex: 'count',
                width: '20%',
                key: 'count'
            },
            {
                title: Intl.get('crm.contract.money', '金额(元)'),
                dataIndex: 'total_price',
                key: 'total_price',
                width: '30%',
                render: (text) => {
                    return <span>{parseAmount(text.toFixed(2))}</span>;
                }
            }
        ];
    },
    renderProductInfo(products) {
        let columns = this.getProductColumns(products);
        return (
            <ProductTable
                appList={this.state.appList}
                dataSource={products}
                columns={columns}
            />
        );
    },
    saveContractBasicInfo(saveObj, successFunc, errorFunc) {
        let contract = this.state.formData;
        // 客户信息
        saveObj.customers = [{customer_name: contract.customer_name, customer_id: this.props.customerId}];
        ContractAjax.editPendingContract({type: 'sell'}, saveObj).then( (resData) => {
            if (resData && resData.code === 0) {
                message.success(Intl.get('user.edit.success', '修改成功'));
                if (_.isFunction(successFunc)) successFunc();
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
    },
    showEditValidityTime(event) {
        Trace.traceEvent(event, '修改合同的有效期');
        this.setState({
            isShowValidityTimeEdit: true
        });
    },
    handleValidityTimeRange(dates) {
        let contract = this.state.formData;
        let startTime = _.get(dates, '[0]') && _.get(dates, '[0]').valueOf() || '';
        let endTime = _.get(dates, '[1]') && _.get(dates, '[1]').valueOf() || '';
        contract.start_time = startTime;
        contract.end_time = endTime;
        this.setState({contract});
    },
    handleSubmitEditValidityTime() {
        let saveObj = {
            start_time: this.state.contract.start_time,
            end_time: this.state.contract.end_time,
            id: this.state.contract.id
        };
        let successFunc = () => {
            this.setState({
                editValidityLoading: false,
                isShowValidityTimeEdit: false,
                editValidityTimeErrMsg: ''
            });
        };
        let errorFunc = () => {
            this.setState({
                editValidityLoading: false,
                editValidityTimeErrMsg: Intl.get('common.edit.failed', '修改失败')
            });
        };
        this.saveContractBasicInfo(saveObj, successFunc, errorFunc);
    },
    handleCancelEditValidityTime() {
        this.setState({
            isShowValidityTimeEdit: false
        });
    },
    showProductInfo(itemClassName, products) {
        return (
            <div className={itemClassName}>
                <span className='contract-label'>{Intl.get('contract.95', '产品信息')}:</span>
                <span className='contract-value'>
                    {_.get(products, '[0]') ? this.renderProductInfo(products) : Intl.get('crm.contract.no.product.info', '暂无产品信息')}
                </span>
            </div>
        );
    },
    renderContractContent() {
        const contract = this.state.formData;
        const start_time = contract.start_time ? moment(contract.start_time).format(oplateConsts.DATE_FORMAT) : '';
        const end_time = contract.end_time ? moment(contract.end_time).format(oplateConsts.DATE_FORMAT) : '';
        let itemClassName = classNames('contract-item-content', {
            'item-edit-style': contract.stage === '待审' && hasPrivilege('OPLATE_CONTRACT_UPDATE')
        });
        let categoryOptions = _.map(CategoryList, (category, index) => {
            return (<Option value={category.value} key={index}>{category.name}</Option>);
        });
        let labelOptions = _.map(ContractLabel, (label) => {
            return <Option key={label.value} value={label.value}>{label.name}</Option>;
        });
        // 合同的签约类型
        const contractLabel = contract.label === 'new' ? Intl.get('crm.contract.new.sign', '新签') : Intl.get('contract.163', '续约');
        let hasEditPrivilege = contract.stage === '待审' && hasPrivilege('OPLATE_CONTRACT_UPDATE') || false;
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
                        saveEditInput={this.saveContractBasicInfo}
                        placeholder={Intl.get('crm.contract.party.name', '请输入甲方名称')}
                    />
                </div>
                <div className={itemClassName}>
                    <span className='contract-label'>{Intl.get('crm.contract.validity.time', '有效期')}:</span>
                    {
                        this.state.isShowValidityTimeEdit ? (
                            <div className='contract-validity-edit-block'>
                                <RangePicker
                                    className='validity-time'
                                    value={[moment(contract.start_time), moment(contract.end_time)]}
                                    ranges={{ [validityTime]: [moment(moment().valueOf()), moment(moment().add(1, 'year').valueOf())] }}
                                    onChange={this.handleValidityTimeRange}
                                    allowClear={false}
                                />
                                <SaveCancelButton
                                    loading={this.state.editValidityLoading}
                                    saveErrorMsg={this.state.editValidityTimeErrMsg}
                                    handleSubmit={this.handleSubmitEditValidityTime}
                                    handleCancel={this.handleCancelEditValidityTime}
                                />
                            </div>
                        ) : (
                            <span className='contract-value'>
                                {start_time}
                                {end_time ? Intl.get('common.time.connector', '至') : ''}
                                {end_time}
                            </span>
                        )
                    }
                    { !this.state.isShowValidityTimeEdit && contract.stage === '待审' ? <DetailEditBtn onClick={this.showEditValidityTime}/> : null}
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
                        saveEditInput={this.saveContractBasicInfo}
                        noDataTip={Intl.get('crm.contract.no.contract.money', '暂无合同额')}
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
                        saveEditInput={this.saveContractBasicInfo}
                        noDataTip={Intl.get('crm.contract.no.gross', '暂无毛利额')}
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
                        saveEditSelect={this.saveContractBasicInfo}
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
                        saveEditSelect={this.saveContractBasicInfo}
                    />
                </div>
                {
                    contract.isShowAllContractInfo ? (
                        this.showProductInfo(itemClassName, contract.products)
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
                                    saveEditInput={this.saveContractBasicInfo}
                                />
                            </div>
                        ) : null
                    ) : null
                }
            </div>
        );
    },
    // 隐藏错误信息
    hideErrorMsg() {
        this.setState({
            errMsg: ''
        });
    },
    renderContractBottom() {
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
    },
    render(){
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
});

module.exports = ContractItem;