var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
/**
 * 服务信息添加表单
 */

import { Form, Input, Select, Button, Alert } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import ValidateMixin from '../../../mixins/ValidateMixin';
import { REPORT_SERVICE, SERVICE_TYPE, REPORT_TYPE, LITE_SERVICE_TYPE } from '../consts';
import {getNumberValidateRule} from 'PUB_DIR/sources/utils/validate-util';
import ProductTable from 'CMP_DIR/basic-edit-field-new/product-table';
const defaultValueMap = {
    num: 1,
    total_price: 1000, 
    commission_rate: 6
};
const AddReport = createReactClass({
    displayName: 'AddReport',
    mixins: [ValidateMixin],

    getInitialState: function() {
        return {
            reports: [],
            formData: {},
            valid: false,
            pristine: true,
            validator: null
        };
    },

    addReport: function() {
        this.state.reports.push({});

        this.setState(this.state, () => {
            this.props.updateScrollBar();
        });
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
        const products = this.state.products;
        let flag = true;
        products.forEach(x => {
            //存在无数据的单元格，不通过验证
            ['num', 'commission_rate', 'total_price'].forEach(key => {
                if (!x[key]) {
                    flag = false;
                    return false;
                }
            });
        });
        this.setState({
            products,
            valid: flag,
            //点击下一步后展示错误提示
            pristine: false,
            validator: text => text
        });
        return cb(flag);
    }, 
    handleProductChange(data) {
        const list = data;
        let lastItem = null;
        if (list.length > 0) {
            lastItem = list[list.length - 1];
            if (REPORT_TYPE.includes(list[list.length - 1].name)) {
                list[list.length - 1] = {
                    ...list[list.length - 1],
                    num: '-',
                    report_type: list[list.length - 1].name
                };
            }
        }
        console.log(list);
        this.setState((state, props) => {
            return { reports: list.map(x => ({
                ...x,
                type: x.name
            })) };
        });
    },
    render: function() {
        const columns = [
            {
                title: Intl.get('contract.75', '服务类型'),
                dataIndex: 'type',
                key: 'type',               
            },
            {
                title: Intl.get('common.app.count', '数量'),
                dataIndex: 'num',
                editable: true,
                getIsEdit: value => !Number.isNaN(Number(value)),
                key: 'num',
                validator: this.state.validator
            },
            {
                title: Intl.get('contract.23', '总价') + '(' + Intl.get('contract.82', '元') + ')',
                dataIndex: 'total_price',
                key: 'total_price',
                editable: true,
                validator: this.state.validator
            },
            {
                title: Intl.get('contract.141', '提成比例') + '(%)',
                dataIndex: 'commission_rate',
                key: 'commission_rate',
                editable: true,
                validator: this.state.validator
            }
        ];       
        return (
            <div className="add-products">
                <div className="product-forms product-table-container">
                    <ProductTable
                        addBtnText={Intl.get('contract.75', '服务类型')}
                        ref={ref => this.producTableRef = ref}                      
                        defaultValueMap={defaultValueMap}
                        appList={REPORT_TYPE.concat(LITE_SERVICE_TYPE).map(x => ({
                            client_id: x,
                            client_name: x
                        }))}
                        data={this.state.reports}
                        isEdit={true}
                        columns={columns}
                        isSaveCancelBtnShow={false}
                        onChange={this.handleProductChange}
                    />
                </div>
            </div>
        );
        return (
            <div className="add-products">
                <div className="add-product">
                    <Button
                        className="btn-primary-sure"
                        onClick={this.addReport}
                    >
                        <ReactIntl.FormattedMessage id="sales.team.add.sales.team" defaultMessage="添加" />
                    </Button>
                </div>
                <div className="product-forms">
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        {reports.map((report, index) => {
                            return (
                                <Form key={index}>
                                    <FormItem
                                        label={Intl.get('contract.75', '服务类型')}
                                    >
                                        <Select
                                            placeholder={Intl.get('contract.76', '请选择类型')}
                                            value={report.type}
                                            onChange={this.setField2.bind(this, 'type', index)}
                                        >
                                            {serviceTypeOption}
                                        </Select>
                                    </FormItem>
                                    {report.type === REPORT_SERVICE ? (
                                        <FormItem
                                            label={Intl.get('contract.77', '报告类型')}
                                        >
                                            <Select
                                                placeholder={Intl.get('contract.76', '请选择类型')}
                                                value={report.report_type}
                                                onChange={this.setField2.bind(this, 'report_type', index)}
                                            >
                                                {reportTypeOption}
                                            </Select>
                                        </FormItem>
                                    ) : null}
                                    {report.type !== REPORT_SERVICE ? (
                                        <FormItem 
                                            label="数量（个）"
                                            validateStatus={this.getValidateStatus('num' + index)}
                                            help={this.getHelpMessage('num' + index)}
                                        >
                                            <Validator rules={[{pattern: /^\d+$/, message: Intl.get('contract.45', '请填写数字')}]}>
                                                <Input
                                                    name={'num' + index}
                                                    value={report.num}
                                                    onChange={this.setField2.bind(this, 'num', index)}
                                                />
                                            </Validator>
                                        </FormItem>
                                    ) : null}
                                    <FormItem 
                                        label="总价"
                                        validateStatus={this.getValidateStatus('total_price' + index)}
                                        help={this.getHelpMessage('total_price' + index)}
                                    >
                                        <Validator rules={[getNumberValidateRule()]}>
                                            <Input
                                                name={'total_price' + index}
                                                value={report.total_price}
                                                onChange={this.setField2.bind(this, 'total_price', index)}
                                            />
                                        </Validator>
                                    </FormItem>
                                    <FormItem 
                                        label={Intl.get('contract.141', '提成比例')}
                                        validateStatus={this.getValidateStatus('commission_rate' + index)}
                                        help={this.getHelpMessage('commission_rate' + index)}
                                    >
                                        <Validator rules={[getNumberValidateRule()]}>
                                            <Input
                                                name={'commission_rate' + index}
                                                value={(isNaN(report.commission_rate) ? '' : report.commission_rate).toString()}
                                                onChange={this.setField2.bind(this, 'commission_rate', index)}
                                            />
                                        </Validator>
                                &nbsp;%
                                    </FormItem>
                                </Form>
                            );
                        })}
                    </Validation>
                </div>
            </div>
        );
    },
});

module.exports = AddReport;


