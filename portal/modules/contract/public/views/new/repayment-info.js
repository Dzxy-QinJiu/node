/** Created by 2019-01-31 11:11 */

var React = require('react');
import { message, Select, Icon, Form, Input, DatePicker, Checkbox } from 'antd';

let Option = Select.Option;
let FormItem = Form.Item;
import Trace from 'LIB_DIR/trace';
import 'MOD_DIR/user_manage/public/css/user-info.less';
import DetailCard from 'CMP_DIR/detail-card';
import {AntcEditableTable} from 'antc';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import ajax from 'MOD_DIR/contract/common/ajax';
import { CONTRACT_STAGE, COST_STRUCTURE, COST_TYPE, OPERATE, VIEW_TYPE, PRIVILEGE_MAP} from 'MOD_DIR/contract/consts';
import routeList from 'MOD_DIR/contract/common/route';
import {parseAmount} from 'LIB_DIR/func';
import { getNumberValidateRule, numberAddNoMoreThan } from 'PUB_DIR/sources/utils/validate-util';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';

//展示的类型
const DISPLAY_TYPES = {
    EDIT: 'edit',//添加所属客户
    TEXT: 'text'//展示
};

const EDIT_FEILD_WIDTH = 380, EDIT_FEILD_LESS_WIDTH = 330;
const formItemLayout = {
    labelCol: {span: 5},
    wrapperCol: {span: 18},
};

class RepaymentInfo extends React.Component {
    state = {
        ...this.getInitStateData(this.props),
    };

    getInitStateData(props) {
        let hasEditPrivilege = hasPrivilege(PRIVILEGE_MAP.CONTRACT_UPDATE_REPAYMENT);

        return {
            formData: {},
            loading: false,
            submitErrorMsg: '',
            hasEditPrivilege,
            displayType: DISPLAY_TYPES.TEXT,
        };
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps.contract, 'id') && this.props.contract.id !== nextProps.contract.id) {
            this.setState({
                displayType: DISPLAY_TYPES.TEXT,
                // formData: JSON.parse(JSON.stringify(nextProps.contract)),
            });
        }
    }

    changeDisplayType(type) {
        if (type === DISPLAY_TYPES.TEXT) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '关闭添加已回款输入区');
            this.setState({
                displayType: type,
                submitErrorMsg: '',
            });
        } else if (type === DISPLAY_TYPES.EDIT) {
            this.setState({
                displayType: type
            });
        }
    }
    handleSubmit = () => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '添加已回款内容');
    };
    handleCancel = () => {
        this.changeDisplayType(DISPLAY_TYPES.TEXT);
    };

    renderAddRepaymentPanel(repayLists) {
        let {getFieldDecorator} = this.props.form;
        let formData = this.state.formData;
        const disabledDate = function(current) {
            //不允许选择大于当前天的日期
            return current && current.valueOf() > Date.now();
        };
        console.log(this.props.form.getFieldsValue());
        return (
            <Form layout='inline' className='add-repayment-form new-add-repayment-container'>
                <FormItem
                    className='add-repayment-date'
                >
                    {
                        getFieldDecorator('date', {
                            initialValue: formData.date ? moment(formData.date) : moment(),
                        })(
                            <DatePicker
                                value={formData.date ? moment(formData.date) : moment()}
                                disabledDate={disabledDate}
                            />
                        )
                    }
                </FormItem>
                <ReactIntl.FormattedMessage id="contract.108" defaultMessage="回款"/>
                <FormItem>
                    {
                        getFieldDecorator('amount', {
                            initialValue: formData.amount,
                            rules: [{
                                required: true,
                                message: Intl.get('contract.44', '不能为空')
                            }, getNumberValidateRule(), numberAddNoMoreThan.bind(this, this.props.contract.contract_amount, this.props.contract.total_amount, Intl.get('contract.161', '已超合同额'))]
                        })(
                            <Input
                                value={formData.amount}
                            />
                        )
                    }
                </FormItem>
                <ReactIntl.FormattedMessage id="contract.155" defaultMessage="元"/>,
                <ReactIntl.FormattedMessage id="contract.109" defaultMessage="毛利"/>
                <FormItem>
                    {
                        getFieldDecorator('gross_profit', {
                            initialValue: formData.gross_profit,
                            rules: [{
                                required: true,
                                message: Intl.get('contract.44', '不能为空')
                            }, getNumberValidateRule(), numberAddNoMoreThan.bind(this, this.props.form.getFieldValue('amount'), 0, Intl.get('contract.gross.profit.can.not.exceed.repayment', '毛利不能大于回款'))]
                        })(
                            <Input
                                value={formData.gross_profit}
                            />
                        )
                    }
                </FormItem>
                <ReactIntl.FormattedMessage id="contract.155" defaultMessage="元"/>
                <FormItem
                    className='add-repayment-check'
                >
                    {
                        getFieldDecorator('is_first', {
                            initialValue: ['true', true].indexOf(formData.is_first) > -1,
                        })(
                            <Checkbox
                                // checked={['true', true].indexOf(formData.is_first) > -1}
                            >
                                {Intl.get('contract.167', '首笔回款')}
                            </Checkbox>
                        )
                    }
                </FormItem>
                <SaveCancelButton
                    loading={this.state.loading}
                    saveErrorMsg={this.state.submitErrorMsg}
                    handleSubmit={this.handleSubmit.bind(this,'add')}
                    handleCancel={this.handleCancel}
                />
            </Form>
        );
    }
    renderRepaymentList(repayLists) {
        let num_col_width = 75;
        const columns = [
            {
                title: `${Intl.get('contract.108', '回款')}${Intl.get('crm.146', '日期')}`,
                dataIndex: 'date',
                key: 'date',
                width: 110,
                render: (text, record, index) => {
                    return <span>{moment(text).format(oplateConsts.DATE_FORMAT)}{<i className='iconfont icon-huikuan'></i>}</span>;
                },
                // validator: this.state.validator,
                getIsEdit: text => !text
            },
            {
                title: `${Intl.get('contract.28', '回款额')}${Intl.get('contract.155', '元')}`,
                dataIndex: 'amount',
                editable: true,
                key: 'amount',
                // width: 70,
                // validator: this.state.validator
            },
            {
                title: `${Intl.get('contract.29', '回款毛利')}(${Intl.get('contract.155', '元')})`,
                dataIndex: 'gross_profit',
                editable: true,
                key: 'gross_profit',
                // width: num_col_width,
                // validator: text => this.getNumberValidate(text)//this.state.validator
            }
        ];
        return (
            <AntcEditableTable
                ref={ref => this.producTableRef = ref}
                isEdit={this.state.isEdit}
                onChange={this.handleChange}
                columns={columns}
                dataSource={repayLists}
                bordered={true}
            />
        );
    }
    // 渲染基础信息
    renderBasicInfo() {
        const contract = this.props.contract;
        let repayments = _.sortBy(contract.repayments || [], item => item.date).reverse();
        let repayLists = _.filter(repayments,item => item.type === 'repay');
        const noRepaymentData = !repayLists.length && !this.state.loading;

        const content = () => {
            return (
                <div className="repayment-list">
                    {this.state.displayType === DISPLAY_TYPES.EDIT ? this.renderAddRepaymentPanel(repayLists) : this.state.displayType === DISPLAY_TYPES.TEXT && this.state.hasEditPrivilege ? (
                        <span className="iconfont icon-add" onClick={this.changeDisplayType.bind(this, DISPLAY_TYPES.EDIT)}
                            title={Intl.get('common.edit', '编辑')}/>) : null}
                    {this.renderRepaymentList(repayLists)}
                </div>
            );
        };

        let repayTitle = (
            <div className="repayment-repay">
                <span>{Intl.get('contract.194', '回款进程')}: </span>
                <span className='repayment-label'>{Intl.get('contract.179', '已回款')}: {parseAmount(contract.total_amount)}{Intl.get('contract.82', '元')}/ </span>
                <span className='repayment-label'>{Intl.get('contract.180', '尾款')}: {parseAmount(contract.total_plan_amount)}{Intl.get('contract.82', '元')}</span>
            </div>
        );

        return (
            <DetailCard
                content={content()}
                titleBottomBorderNone={noRepaymentData}
                title={repayTitle}
            />
        );
    }


    render() {
        return this.renderBasicInfo();
    }
}

RepaymentInfo.propTypes = {
    contract: PropTypes.object,
    repayLists: PropTypes.array,
    handleSubmit: PropTypes.func,
    showLoading: PropTypes.func,
    hideLoading: PropTypes.func,
    refreshCurrentContract: PropTypes.func,
    refreshCurrentContractRepayment: PropTypes.func,
    form: PropTypes.object
};
module.exports = Form.create()(RepaymentInfo);

