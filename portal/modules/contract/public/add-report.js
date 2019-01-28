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
import { parseAmount } from 'LIB_DIR/func';
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
    propTypes: {
        updateScrollBar: PropTypes.func
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
        /*if (list.length > 0) {
            lastItem = list[list.length - 1];
            if (REPORT_TYPE.includes(list[list.length - 1].name)) {
                list[list.length - 1] = {
                    ...list[list.length - 1],
                    // num: '-',
                    num: '',
                    report_type: list[list.length - 1].name
                };
            }
        }*/
        this.setState((state, props) => {
            return { reports: list.map(x => ({
                ...x,
                type: x.name
            })), pristine: true };
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
                        onChange={this.handleReportChange}
                    />
                    {
                        !this.state.pristine && !this.state.valid ?
                            <div className="alert-container">
                                <Alert type="error" message="请填写表格内容" showIcon/>
                            </div> : null
                    }
                </div>
            </div>
        );
    },
});

module.exports = AddReport;


