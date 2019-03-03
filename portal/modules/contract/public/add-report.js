var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
/**
 * 服务信息添加表单
 */

import { Form, Input, Select, Button, Alert, message } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import ValidateMixin from '../../../mixins/ValidateMixin';
import DetailCard from 'CMP_DIR/detail-card';
import ProductTable from 'CMP_DIR/basic-edit-field-new/product-table';
import DetailReport from './views/new/detail-report';
import { parseAmount } from 'LIB_DIR/func';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import { PRIVILEGE_MAP, VIEW_TYPE, REPORT_TYPE, LITE_SERVICE_TYPE, REPORT_SERVICE, SERVICE_TYPE } from 'MOD_DIR/contract/consts';
import Trace from 'LIB_DIR/trace';
import routeList from 'MOD_DIR/contract/common/route';
import ajax from 'MOD_DIR/contract/common/ajax';
const defaultValueMap = {
    num: 1,
    total_price: 1000, 
    commission_rate: 6
};
const AddReport = createReactClass({
    displayName: 'AddReport',
    mixins: [ValidateMixin],

    getInitialState: function() {
        let reports;

        if (_.isArray(this.props.reports) && this.props.reports.length) {
            reports = _.cloneDeep(this.props.reports);
            _.each(reports,(item) => {
                if(!item.name) {
                    item.id = item.type;
                    item.name = item.type;
                }
            });
        } else {
            reports = [];
        }
        return {
            reports,
            formData: {},
            valid: false,
            pristine: true,
            validator: null
        };
    },

    propTypes: {
        updateScrollBar: PropTypes.func,
        reports: PropTypes.array,
        contract: PropTypes.object,
        isDetailType: PropTypes.bool.isRequired,
        parent: PropTypes.object,
        refreshCurrentContract: PropTypes.func,
    },
    componentWillReceiveProps(nextProps) {
        if(_.get(this.props,'contract') && this.props.contract.id !== nextProps.contract.id){
            let newState = this.getInitialState(nextProps);
            newState.reports = _.cloneDeep(nextProps.contract.reports);
            this.setState(newState);
        }
    },
    addReport: function() {
        this.state.reports.push({});

        this.setState(this.state, () => {
            this.props.updateScrollBar();
        });
    },
    getNumberValidate(text) {
        return /^(\d|,)+(\.\d+)?$/.test(text);
    },
    setField2: function(field, index, e) {
        let value = _.isObject(e) ? e.target.value : e;
        const currentItem = this.state.reports[index];
        currentItem[field] = value;

        if (field === 'report_type') {
            delete currentItem['num'];
        }

        if (field === 'num') {
            delete currentItem['report_type'];
        }

        this.setState(this.state);
    },   
    validate(cb) {
        const reports = this.state.reports;
        let flag = true;
        reports.forEach(x => {
            //存在无数据的单元格，不通过验证
            ['num', 'commission_rate', 'total_price'].forEach(key => {
                if (!x[key]) {
                    flag = false;
                    return false;
                }
            });
        });
        this.setState({
            reports,
            valid: flag,
            //点击下一步后展示错误提示
            pristine: false,
            validator: text => text
        });
        cb && cb(flag);
        return flag;
    },
    handleReportChange(data) {
        const list = data;
        let lastItem = null;
        this.setState((state, props) => {
            return { reports: list.map(x => ({
                ...x,
                type: x.name
            })), pristine: true };
        }, () => {
            this.props.updateScrollBar();
        });
    },
    handleReportSave(saveObj,successFunc,errorFunc) {
        saveObj = {reports: saveObj};
        Trace.traceEvent(ReactDOM.findDOMNode(this),'修改服务产品信息');
        let valid = this.validate();
        if(!valid) {
            errorFunc(Intl.get('contract.table.form.fill', '请填写表格内容'));
            return false;
        }
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
                let contract = _.extend(this.props.contract,result.result);
                if (hasResult) {
                    this.props.refreshCurrentContract(this.props.contract.id, true, contract);
                }
            } else {
                if (_.isFunction(errorFunc)) errorFunc(Intl.get('common.edit.failed', '修改失败'));
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg || Intl.get('common.edit.failed', '修改失败'));
        });
    },
    handleReportCancel() {
        let reports = _.cloneDeep(this.props.reports);
        _.each(reports,(item) => {
            if(!item.name) {
                item.id = item.type;
                item.name = item.type;
            }
        });
        this.setState({reports}, () => {
            this.props.updateScrollBar();
        });
    },
    render: function() {
        let num_col_width = 75;
        const columns = [
            {
                title: Intl.get('contract.75', '服务类型'),
                dataIndex: 'type',
                key: 'type',
                width: 180,
            },
            {
                title: `${Intl.get('common.app.count', '数量')}(${Intl.get('contract.22', '个')})`,
                dataIndex: 'num',
                editable: true,
                // getIsEdit: value => !Number.isNaN(Number(value)),
                key: 'num',
                width: num_col_width,
                validator: text => this.getNumberValidate(text)//this.state.validator
            },
            {
                title: Intl.get('contract.23', '总价') + '(' + Intl.get('contract.82', '元') + ')',
                dataIndex: 'total_price',
                key: 'total_price',
                editable: true,
                width: num_col_width,
                validator: text => this.getNumberValidate(text)//this.state.validator
            },
            {
                title: Intl.get('sales.commission', '提成') + '(%)',
                dataIndex: 'commission_rate',
                key: 'commission_rate',
                editable: true,
                width: num_col_width,
                validator: text => this.getNumberValidate(text)//this.state.validator
            }
        ];

        // 如果是添加合同时，是可以编辑的（true），详情查看时，显示可编辑按钮，点编辑后，显示编辑状态且有保存取消按钮
        let isEditBtnShow = this.props.isDetailType && hasPrivilege(PRIVILEGE_MAP.CONTRACT_UPATE_PRIVILEGE);
        let isEdit = !this.props.isDetailType ? true :
            (isEditBtnShow && this.producTableRef ? this.producTableRef.state.isEdit : false);
        let isSaveCancelBtnShow = this.props.isDetailType;

        // 获取合同金额的大小
        let totalAmout = 0;
        if(isEditBtnShow) {
            let products = _.get(this,'props.parent.refs.addProduct.state.products') || _.get(this,'props.contract.products') || [];
            let totalProductsPrice = 0;
            products.length > 0 ? totalProductsPrice = _.reduce(products,(sum, item) => {
                const amount = +item.total_price;
                return sum + amount;
            }, 0) : '';
            totalAmout = this.props.contract.contract_amount - totalProductsPrice;
        }
        return (
            <div className="add-reports" data-tracename="添加编辑>服务产品信息">
                <div className="product-forms clearfix product-table-container">
                    {!this.props.isDetailType ? (
                        <div>
                            <div className='report-title'><i className='iconfont icon-fuwu'></i><span>{Intl.get('contract.96', '服务信息')}</span>
                            </div>
                            <ProductTable
                                addBtnText={Intl.get('contract.service.add', '添加服务')}
                                ref={ref => this.producTableRef = ref}
                                defaultValueMap={defaultValueMap}
                                appList={REPORT_TYPE.concat(LITE_SERVICE_TYPE).map(x => ({
                                    client_id: x,
                                    client_name: x
                                }))}
                                totalAmount={totalAmout}
                                data={this.state.reports}
                                dataSource={this.state.reports}
                                isEdit={true}
                                isEditBtnShow={isEditBtnShow}
                                isSaveCancelBtnShow={isSaveCancelBtnShow}
                                columns={columns}
                                onSave={this.handleReportSave}
                                handleCancel={this.handleReportCancel}
                                onChange={this.handleReportChange}
                            />
                            {
                                !isEditBtnShow && !this.state.pristine && !this.state.valid ?
                                    <div className="alert-container">
                                        <Alert type="error"
                                            message={Intl.get('contract.table.form.fill', '请填写表格内容')}
                                            showIcon/>
                                    </div> : null
                            }
                        </div>
                    ) : (
                        <DetailReport
                            contract={this.props.contract}
                            updateScrollBar={this.props.updateScrollBar}
                            refreshCurrentContract={this.props.refreshCurrentContract}
                        />
                    )}
                </div>
            </div>
        );
    },
});

module.exports = AddReport;


