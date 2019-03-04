/** Created by 2019-01-31 11:11 */
/**
 * 已付款信息展示及编辑页面
 */
var React = require('react');
import { message, Select, Icon, Form, Input, DatePicker, Checkbox } from 'antd';

let Option = Select.Option;
let FormItem = Form.Item;
import Trace from 'LIB_DIR/trace';
import 'MOD_DIR/user_manage/public/css/user-info.less';
import DetailCard from 'CMP_DIR/detail-card';
import EditableTable from '../components/editable-table/';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import ajax from 'MOD_DIR/contract/common/ajax';
import { DISPLAY_TYPES, OPERATE, OPERATE_INFO, PRIVILEGE_MAP } from 'MOD_DIR/contract/consts';
import routeList from 'MOD_DIR/contract/common/route';
import { getNumberValidateRule } from 'PUB_DIR/sources/utils/validate-util';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';

const disabledDate = function(current) {
    //不允许选择大于当前天的日期
    return current && current.valueOf() > Date.now();
};

class DetailPayment extends React.Component {
    state = {
        ...this.getInitStateData(this.props),
    };

    getInitStateData(props) {
        let hasEditPrivilege = hasPrivilege(PRIVILEGE_MAP.CONTRACT_ADD_PAYMENT);

        return {
            loading: false,
            paymentLists: this.getPaymentLists(this.props.contract),
            submitErrorMsg: '',
            hasEditPrivilege,
            displayType: DISPLAY_TYPES.TEXT,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps.contract, 'id') && this.props.contract.id !== nextProps.contract.id) {

            this.setState({
                displayType: DISPLAY_TYPES.TEXT,
                paymentLists: this.getPaymentLists(nextProps.contract),
            });
        }
    }

    updateScrollBar = () => {
        const scrollBar = this.refs.gemiScrollBar;

        if (!scrollBar) {
            return;
        }

        scrollBar.update();
    };

    getPaymentLists(contract) {
        return _.sortBy(_.cloneDeep(contract.payments) || [], item => item.date).reverse();
    }
    changeDisplayType(type) {
        if (type === DISPLAY_TYPES.TEXT) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '关闭添加付款输入区');
            this.setState({
                displayType: type,
                submitErrorMsg: '',
            }, () => {
                this.updateScrollBar();
            });
        } else if (type === DISPLAY_TYPES.EDIT) {
            this.setState({
                displayType: type
            }, () => {
                this.updateScrollBar();
            });
        }
    }
    handleSubmit = (type) => {
        let _this = this;
        let saveObj;
        if(type === DISPLAY_TYPES.ADD) {
            this.props.form.validateFields((err,value) => {
                if (err) return false;

                this.setState({loading: true});

                saveObj = {...value};
                const params = {contractId: this.props.contract.id};

                if(saveObj.date) {
                    saveObj.date = saveObj.date.valueOf();
                }

                const successFunc = (resultData) => {
                    _this.setState({
                        loading: false,
                        paymentLists: this.getPaymentLists(this.props.contract),
                        submitErrorMsg: '',
                        displayType: DISPLAY_TYPES.TEXT
                    }, () => {
                        this.updateScrollBar();
                    });
                };
                const errorFunc = (errorMsg) => {
                    _this.setState({
                        loading: false,
                        submitErrorMsg: errorMsg
                    });
                };
                this.editInvoice(type, saveObj, params, '', successFunc, errorFunc);
            });
        }
    };
    editInvoice(type, data, params, id, successFunc, errorFunc) {
        const handler = type + 'Payment';
        const route = _.find(routeList, route => route.handler === handler);
        let arg = {
            url: route.path,
            type: route.method,
            data: data,
        };
        if (params) arg.params = params;


        Trace.traceEvent(ReactDOM.findDOMNode(this), OPERATE[type] + '付款信息');

        ajax(arg).then(result => {
            if (result.code === 0) {
                message.success(OPERATE_INFO[type].success);
                this.props.refreshCurrentContractNoAjax('payments', type, result.result, id);

                if (_.isFunction(successFunc)) successFunc(result.result);
            } else {
                if (_.isFunction(errorFunc)) errorFunc(OPERATE_INFO[type].faild);
            }
        }, errorMsg => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg || OPERATE_INFO[type].faild);
        });
    }
    handleCancel = () => {
        this.changeDisplayType(DISPLAY_TYPES.TEXT);
    };
    handleEditTableSave = (data, successFunc, errorFunc) => {
        const params = {contractId: this.props.contract.id};
        const successFuncs = () => {
            _.isFunction(successFunc) && successFunc();
            this.setState({
                paymentLists: this.getPaymentLists(this.props.contract)
            }, () => {
                this.updateScrollBar();
            });
        };
        if(data.date){
            data.date = data.date.valueOf();
        }
        this.editInvoice(DISPLAY_TYPES.UPDATE, data, params, data.id, successFuncs, (errorMsg) => {
            message.error(errorMsg);
            _.isFunction(errorFunc) && errorFunc();
        });
    };

    handleDelete = (record,successFunc, errorFunc) => {
        let params = { id: record.id };
        const successFuncs = (resultData) => {
            _.isFunction(successFunc) && successFunc();
            this.setState({
                paymentLists: this.getPaymentLists(this.props.contract),
            }, () => {
                this.updateScrollBar();
            });
        };
        this.editInvoice(DISPLAY_TYPES.DELETE, '', params, record.id, successFuncs, (errorMsg) => {
            message.error(errorMsg);
            _.isFunction(errorFunc) && errorFunc();
        });
    };

    renderAddPaymentPanel(paymentLists) {
        let {getFieldDecorator} = this.props.form;

        return (
            <Form layout='inline' className='detailcard-form-container new-add-repayment-container'>
                <FormItem
                    className='add-repayment-date'
                >
                    {
                        getFieldDecorator('date', {
                            initialValue: moment(),
                        })(
                            <DatePicker
                                disabledDate={disabledDate}
                            />
                        )
                    }
                </FormItem>
                <ReactIntl.FormattedMessage id="contract.91" defaultMessage="付款"/>
                <FormItem>
                    {
                        getFieldDecorator('amount', {
                            rules: [{
                                required: true,
                                message: Intl.get('contract.44', '不能为空')
                            }, getNumberValidateRule()]
                        })(
                            <Input/>
                        )
                    }
                </FormItem>
                <ReactIntl.FormattedMessage id="contract.155" defaultMessage="元"/>
                <SaveCancelButton
                    loading={this.state.loading}
                    saveErrorMsg={this.state.submitErrorMsg}
                    handleSubmit={this.handleSubmit.bind(this,DISPLAY_TYPES.ADD)}
                    handleCancel={this.handleCancel}
                />
            </Form>
        );
    }

    renderPaymentList(paymentLists) {
        let num_col_width = 75;
        const columns = [
            {
                title: Intl.get( 'contract.236', '付款日期'),
                dataIndex: 'date',
                editable: true,
                editor: 'DatePicker',
                editorConfig: {
                    initialValue: (value) => {
                        return moment(value);
                    }
                },
                editorProps: {
                    disabledDate
                },
                width: 'auto',
                render: (text, record, index) => {
                    return <span>{moment(text).format(oplateConsts.DATE_FORMAT)}</span>;
                },
            },
            {
                title: `${Intl.get('contract.200', '付款额')}(${Intl.get('contract.155', '元')})`,
                dataIndex: 'amount',
                editable: true,
                width: 'auto',
                editorConfig: {
                    rules: [{
                        required: true,
                        message: Intl.get('contract.44', '不能为空')
                    }, getNumberValidateRule()]
                }
            }
        ];

        return (
            <EditableTable
                ref={ref => this.paymentTableRef = ref}
                parent={this}
                isEdit={this.state.hasEditPrivilege}
                columns={columns}
                defaultKey='id'
                dataSource={paymentLists}
                onSave={this.handleEditTableSave}
                onDelete={this.handleDelete}
            />
        );
    }

    // 渲染基础信息
    renderBasicInfo() {
        const paymentLists = this.state.paymentLists;
        const noPaymentData = !paymentLists.length && !this.state.loading;

        const content = (
            <div className="repayment-list">
                {this.state.displayType === DISPLAY_TYPES.EDIT ? this.renderAddPaymentPanel(paymentLists) : this.state.displayType === DISPLAY_TYPES.TEXT && this.state.hasEditPrivilege ? (
                    <span className="iconfont icon-add" onClick={this.changeDisplayType.bind(this, DISPLAY_TYPES.EDIT)}
                        title={Intl.get('common.edit', '编辑')}/>) : null}
                {this.renderPaymentList(paymentLists)}
            </div>
        );

        let payTitle = (
            <div className="repayment-repay">
                <span>{Intl.get('contract.peyment.info', '付款信息')}</span>
            </div>
        );

        return (
            <DetailCard
                content={content}
                titleBottomBorderNone={noPaymentData}
                title={payTitle}
            />
        );
    }


    render() {
        return (
            <div className='clearfix contract-repayment-container' style={{height: this.props.height}} data-tracename="付款页面">
                <GeminiScrollBar ref='geminiScrollBar'>
                    {this.renderBasicInfo()}
                </GeminiScrollBar>
            </div>
        );
    }
}

DetailPayment.propTypes = {
    height: PropTypes.string,
    contract: PropTypes.object,
    handleSubmit: PropTypes.func,
    showLoading: PropTypes.func,
    hideLoading: PropTypes.func,
    refreshCurrentContract: PropTypes.func,
    refreshCurrentContractNoAjax: PropTypes.func,
    form: PropTypes.object
};
module.exports = Form.create()(DetailPayment);

