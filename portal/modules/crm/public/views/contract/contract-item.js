import DetailCard from 'CMP_DIR/detail-card';
import { AntcTable } from 'antc';
import { num as antUtilsNum } from 'ant-utils';
const parseAmount = antUtilsNum.parseAmount;
import classNames from 'classnames';
import Trace from 'LIB_DIR/trace';
import { Button, Icon, message } from 'antd';
import ContractAction from '../../action/contract-action';
const ContractAjax = require('../../ajax/contract-ajax');
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
const AlertTimer = require('CMP_DIR/alert-timer');
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
const UserData = require('PUB_DIR/sources/user-data');
const { CategoryList} = require('PUB_DIR/sources/utils/consts');

const ContractItem = React.createClass({
    getInitialState() {
        return {
            isDeleteContractFlag: false, // 是否删除合同，默认false
            formData: JSON.parse(JSON.stringify(this.props.contract)),
            isLoading: false,
            errMsg: '', // 删除错误的信息提示
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
            if (resData && resData.code !== 0) {
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
            'contract-filed': contract.stage === '归档',
            'contract-scrapped': contract.stage === '报废'
        });
        let contractClass = classNames('iconfont',{
            'icon-down-twoline': !contract.isShowAllContractInfo,
            'icon-up-twoline': contract.isShowAllContractInfo
        });
        let contractTitle = contract.isShowAllContractInfo ? Intl.get('crm.basic.detail.hide', '收起详情') :
            Intl.get('crm.basic.detail.show', '展开详情');

        let pendingContractClass = classNames('iconfont',{
            'icon-down-twoline': contract.isShowAllContractInfo,
            'icon-up-twoline': !contract.isShowAllContractInfo
        });
        let pendingContractTitle = !contract.isShowAllContractInfo ? Intl.get('crm.basic.detail.hide', '收起详情') :
            Intl.get('crm.basic.detail.show', '展开详情');
        return (
            <div className='contract-title'>
                {contract.stage === '待审' && !contract.num ? (
                    <span className='contract-item-stage'>{Intl.get('contract.170', '合同待审')}</span>
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
                {
                    contract.stage === '待审' ? (
                        <span className={pendingContractClass} title={pendingContractTitle} onClick={this.toggleContractDetail}/>
                    ) : (
                        <span className={contractClass} title={contractTitle} onClick={this.toggleContractDetail}/>
                    )
                }

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
                title: Intl.get('contract.175', '产品名称'),
                dataIndex: 'name',
                key: 'name',
                width: '50%',
                render: (text, record, index) => {
                    return <span className='app-info'>{this.renderAppIconName(text, record.id)}</span>;
                }
            },
            {
                title: Intl.get('contract.176', '账号数量'),
                dataIndex: 'count',
                width: '20%',
                key: 'count'
            },
            {
                title: Intl.get('contract.172', '金额(元)'),
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
            <AntcTable
                dataSource={products}
                columns={columns}
                pagination={false}
                bordered
            />
        );
    },
    saveContractBasicInfo(saveObj, successFunc, errorFunc) {
        let contract = this.state.formData;
        contract.user_id = UserData.getUserData().user_id || '';
        contract.user_name = UserData.getUserData().user_name || '';
        // 客户信息
        contract.customers = [{customer_name: contract.customer_name, customer_id: this.props.customerId}];
        if (_.has(saveObj, 'buyer')) { // 修改甲方
            contract.buyer = saveObj.buyer;
        } else if (_.has(saveObj, 'customer_name')) { // 修改客户名
            contract.customer_name = saveObj.customer_name;
        } else if (_.has(saveObj, 'contract_amount')) { // 修改合同额
            contract.contract_amount = saveObj.contract_amount;
        } else if (_.has(saveObj, 'gross_profit')) { // 修改毛利
            contract.contract_amount = saveObj.gross_profit;
        } else if (_.has(saveObj, 'category')) { // 修改合同类型
            contract.category = saveObj.category;
        }
        ContractAjax.editPendingContract({type: 'sell'}, contract).then( (resData) => {
            if (resData && resData.code === 0) {
                if (_.isFunction(successFunc)) successFunc();
                if (_.has(saveObj, 'customer_name')) {
                    setTimeout(() => {
                        _.isFunction(this.props.refreshCustomerList) && this.props.refreshCustomerList(this.props.customerId);
                    }, 1000);
                }
            } else {
                if (_.isFunction(errorFunc)) {
                    errorFunc(Intl.get('common.save.failed', '保存失败'));
                }
            }
        }, (errMsg) => {
            if (_.isFunction(errorFunc)) {
                errorFunc(errMsg || Intl.get('common.save.failed', '保存失败'));
            }
        });
    },
    renderContractContent() {
        const contract = this.state.formData;
        const start_time = contract.start_time ? moment(contract.start_time).format(oplateConsts.DATE_FORMAT) : '';
        const end_time = contract.end_time ? moment(contract.end_time).format(oplateConsts.DATE_FORMAT) : '';
        // 管理员，有编辑合同的权限
        let itemClassName = classNames('contract-item-content', {
            'item-edit-style': contract.stage === '待审' && hasPrivilege('OPLATE_CONTRACT_UPDATE')
        });
        let categoryOptions = _.map(CategoryList, (category, index) => {
            return (<Option value={category.value} key={index}>{category.name}</Option>);
        });
        return (
            <div className='contract-item'>
                <div className={itemClassName}>
                    <span className='contract-label'>{Intl.get('contract.4', '甲方')}:</span>
                    {contract.stage === '待审' ? (
                        <BasicEditInputField
                            width={350}
                            id={contract.id}
                            field='buyer'
                            value={contract.buyer}
                            hasEditPrivilege={hasPrivilege('OPLATE_CONTRACT_UPDATE') ? true : false}
                            saveEditInput={this.saveContractBasicInfo}
                        />
                    ) : (
                        <span className='contract-value'>{contract.buyer}</span>
                    )}
                </div>
                <div className={itemClassName}>
                    <span className='contract-label'> {Intl.get('call.record.customer', '客户')}:</span>
                    {contract.stage === '待审' ? (
                        <BasicEditInputField
                            width={350}
                            id={contract.id}
                            field='customer_name'
                            value={contract.customer_name}
                            hasEditPrivilege={hasPrivilege('OPLATE_CONTRACT_UPDATE') ? true : false}
                            saveEditInput={this.saveContractBasicInfo}
                        />
                    ) : (
                        <span className='contract-value'>{contract.customer_name}</span>
                    )}
                </div>
                <div className={itemClassName}>
                    <span className='contract-label'>{Intl.get('contract.168', '有效期')}:</span>
                    <span className='contract-value'>
                        {start_time}
                        {end_time ? Intl.get('common.time.connector', '至') : ''}
                        {end_time}
                    </span>
                </div>
                <div className={itemClassName}>
                    <span className='contract-label'>{Intl.get('contract.25', '合同额')}:</span>
                    {contract.stage === '待审' ? (
                        <BasicEditInputField
                            width={350}
                            id={contract.id}
                            type='number'
                            field='contract_amount'
                            value={contract.contract_amount}
                            afterValTip={Intl.get('contract.82', '元')}
                            placeholder={Intl.get('contract.177', '请输入合同额')}
                            hasEditPrivilege={hasPrivilege('OPLATE_CONTRACT_UPDATE') ? true : false}
                            saveEditInput={this.saveContractBasicInfo}
                            noDataTip={Intl.get('contract.178', '暂无合同额')}
                        />
                    ) : (
                        <span className='contract-value'>{this.formatValues(contract.contract_amount)}</span>
                    )}
                </div>
                <div className={itemClassName}>
                    <span className='contract-label'>{Intl.get('contract.109', '毛利')}:</span>
                    {contract.stage === '待审' ? (
                        <BasicEditInputField
                            width={350}
                            id={contract.id}
                            type='number'
                            field='gross_profit'
                            value={contract.gross_profit}
                            afterValTip={Intl.get('contract.82', '元')}
                            placeholder={Intl.get('contract.179', '请输入毛利')}
                            hasEditPrivilege={hasPrivilege('OPLATE_CONTRACT_UPDATE') ? true : false}
                            saveEditInput={this.saveContractBasicInfo}
                            noDataTip={Intl.get('contract.180', '暂无毛利额')}
                        />
                    ) : (
                        <span className='contract-value'>{this.formatValues(contract.gross_profit)}</span>
                    )}
                </div>
                <div className={itemClassName}>
                    <span className='contract-label'>{Intl.get('contract.37', '合同类型')}:</span>
                    {contract.stage === '待审' ? (
                        <BasicEditSelectField
                            id={contract.id}
                            displayText={contract.category}
                            value={contract.category}
                            field="category"
                            selectOptions={categoryOptions}
                            hasEditPrivilege={hasPrivilege('OPLATE_CONTRACT_UPDATE') ? true : false}
                            placeholder={Intl.get('contract.72', '请选择合同类型')}
                            saveEditSelect={this.saveContractBasicInfo}
                        />
                    ) : (
                        <span className='contract-value'>{contract.category}</span>
                    )}
                </div>
                {
                    contract.stage === '待审' ? (
                        contract.isShowAllContractInfo ? null : (
                            <div className={itemClassName}>
                                <span className='contract-label'>{Intl.get('contract.95', '产品信息')}:</span>
                                <span className='contract-value'>
                                    {_.get(contract.products, '[0]') ? this.renderProductInfo(contract.products) : Intl.get('contract.173', '暂无产品信息')}
                                </span>
                            </div>
                        )
                    ) : (
                        contract.isShowAllContractInfo ? (
                            <div className={itemClassName}>
                                <span className='contract-label'>{Intl.get('contract.95', '产品信息')}:</span>
                                <span className='contract-value'>
                                    {_.get(contract.products, '[0]') ? this.renderProductInfo(contract.products) : Intl.get('contract.173', '暂无产品信息')}
                                </span>
                            </div>
                        ) : null
                    )
                }
                {
                    contract.isShowAllContractInfo && contract.remarks ? (
                        <div className={itemClassName}>
                            <span className='contract-label'>{Intl.get('common.remark', '备注')}:</span>
                            <span className='contract-value contract-remarks'>
                                {contract.remarks}
                            </span>
                        </div>
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
                    id='contract.169'
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