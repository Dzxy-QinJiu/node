/**
 * 销售合同基本信息展示及编辑页面
 */

import { Form, Input, Select, Row, Col } from 'antd';
const FormItem = Form.Item;
import ValidateMixin from '../../../mixins/ValidateMixin';
import BasicMixin from './mixin-basic';
import rightPanelUtil from '../../../components/rightPanel';
const RightPanelEdit = rightPanelUtil.RightPanelEdit;
const RightPanelClose = rightPanelUtil.RightPanelClose;
const RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
const RightPanelCancel = rightPanelUtil.RightPanelCancel;
const hasPrivilege = require('../../../components/privilege/checker').hasPrivilege;
import { getTeamName, getLabelName } from './utils';
import AddBasic from './add-basic';
import AddProduct from './add-product';
import DetailRepayment from './detail-repayment';
import { REPAYMENT_OWN_COLUMNS } from '../consts';
const Validation = require('rc-form-validation');
import { AntcMdTable } from 'antc';
const extend = require('extend');
import { parseAmount } from 'LIB_DIR/func';
import { VIEW_TYPE } from '../consts';

const REFS = {
    //合同基本信息表单组件ref
    BASIC_INFO_FORM: 'addBasic',
    //产品表单组件ref
    PRODUCT_FORM: 'addProduct',
};

const DetailBasic = React.createClass({
    mixins: [ValidateMixin, BasicMixin],
    getInitialState: function() {
        return {
            isBasicInfoEdit: false,
            isAppEdit: false,
            isRepaymentEdit: false,
            isBelongCustomerEdit: false,
            isRepaymentLoading: false,
        };
    },
    componentDidMount: function() {
        //在回款列表上打开详情时，由于列表项中不包含回款记录字段，所以要再用合同id获取一下合同详情
        if (this.props.viewType === VIEW_TYPE.REPAYMENT && !this.props.contract.repayments) {
            this.refreshContract();
        }
    },
    refreshContract: function() {
        this.props.refreshCurrentContract(this.props.contract.id, false);
        this.setState({isRepaymentLoading: true});
    },
    componentWillReceiveProps: function(nextProps) {
        if (this.props.contract.id !== nextProps.contract.id) {
            let newState = this.getInitialState();
            newState.formData = JSON.parse(JSON.stringify(nextProps.contract));

            //在回款列表上打开详情时，由于列表项中不包含回款记录字段，所以要再用合同id获取一下合同详情
            if (nextProps.viewType === VIEW_TYPE.REPAYMENT && !nextProps.contract.repayments) {
                nextProps.refreshCurrentContract(nextProps.contract.id, false);
                newState.isRepaymentLoading = true;
            } else {
                newState.isRepaymentLoading = false;
            }

            this.setState(newState);
        } else {
            if (nextProps.viewType === VIEW_TYPE.REPAYMENT && !nextProps.contract.repayments) {
                nextProps.refreshCurrentContract(nextProps.contract.id, false);
                this.setState({isRepaymentLoading: true});
            } else {
                this.setState({isRepaymentLoading: false});
            }
        }
    },
    showBasicInfoForm: function() {
        this.setState({isBasicInfoEdit: true, isAppEdit: false, isRepaymentEdit: false});
    },
    hideBasicInfoForm: function() {
        this.setState({isBasicInfoEdit: false});
    },
    showAppForm: function() {
        this.setState({isAppEdit: true, isBasicInfoEdit: false, isRepaymentEdit: false}, () => {
            this.props.updateScrollBar();
        });
    },
    hideAppForm: function() {
        this.setState({isAppEdit: false}, () => {
            this.props.updateScrollBar();
        });
    },
    showRepaymentForm: function() {
        this.setState({isRepaymentEdit: true, isBasicInfoEdit: false, isAppEdit: false}, () => {
            this.props.updateScrollBar();
        });
    },
    hideRepaymentForm: function() {
        this.setState({isRepaymentEdit: false}, () => {
            this.props.updateScrollBar();
        });
    },
    showBelongCustomerForm: function() {
        this.setState({isBelongCustomerEdit: true}, () => {
            this.scrollBottom();
        });
    },
    hideBelongCustomerForm: function() {
        this.setState(this.getInitialState);
    },
    getRowKey: function(record, index) {
        return index;
    },
    handleSubmit: function(target) {
        const ref = target === 'app' ? REFS.PRODUCT_FORM : REFS.BASIC_INFO_FORM;

        const component = this.refs[ref];

        if (component) {
            component.refs.validation.validate(valid => {
                if (!valid) {
                    return;
                } else {
                    this.doSubmit(target);
                }
            });
        } else {
            this.doSubmit(target);
        }
    },
    handleBelongCustomerSubmit: function() {
        this.refs.validation.validate(valid => {
            if (!valid) {
                return;
            } else {
                this.handleSubmit();
            }
        });
    },
    //执行提交，若target指定为app，则提交产品数据，否则提交合同基本信息数据
    doSubmit: function(target) {
        if (target === 'app') {
            //获取应用数据
            let products = this.refs[REFS.PRODUCT_FORM].state.products;
            //过滤掉未选择应用的项
            products = _.filter(products, item => item.name);
            //获取合同基本信息表单数据
            this.state.formData = JSON.parse(JSON.stringify(this.props.contract));
            //将应用数据赋给当前编辑的合同
            this.state.formData.products = products;
        } else {
            //获取合同基本信息表单数据
            if (this.refs[REFS.BASIC_INFO_FORM]) {
                this.state.formData = this.refs[REFS.BASIC_INFO_FORM].state.formData;
            }
        }

        this.props.handleSubmit(() => {
            if (target === 'app') {
                this.hideAppForm();
            } else {
                this.hideBasicInfoForm();
                this.hideBelongCustomerForm();
            }
        }, true);
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
    render: function() {
        const contract = this.props.contract;
        const products = contract.products || [];
        const repayments = contract.repayments || [];

        const productColumns = [
            {
                title: Intl.get('common.app.name', '应用名称'),
                dataIndex: 'name',
                key: 'name',
                nonNumeric: true,
            },
            {
                title: Intl.get('contract.21', '版本号'),
                dataIndex: 'version',
                key: 'version',
                nonNumeric: true,
            },
            {
                title: Intl.get('common.app.count', '数量'),
                dataIndex: 'count',
                key: 'count',
                render: function(text) {
                    return <span>{text}个</span>;
                }
            },
            {
                title: Intl.get('contract.23', '总价'),
                dataIndex: 'total_price',
                key: 'total_price',
                render: (text) => {
                    return <span>{this.formatValues(text)}</span>;
                } 
            },
            {
                title: Intl.get('contract.141', '提成比例'),
                dataIndex: 'commission_rate',
                key: 'commission_rate',
                render: function(text) {
                    return <span>{text ? text + ' %' : ''}</span>;
                }
            },
        ];

        const repaymentColumns = extend(true, [], REPAYMENT_OWN_COLUMNS).map(column => {
            column.dataIndex = column.dataIndex.replace('repayment_', '');
            // 如果列索引为回款额或汇款毛利时，将值保留两位小数，数字千分位分割
            if (['amount', 'gross_profit'].includes(column.dataIndex)) {
                column.render = (text) => {
                    return <span>{this.formatValues(text)}</span>;
                };
            }
            return column;
        });

        const start_time = contract.start_time ? moment(contract.start_time).format(oplateConsts.DATE_FORMAT) : '';

        const end_time = contract.end_time ? moment(contract.end_time).format(oplateConsts.DATE_FORMAT) : '';

        const date = contract.date ? moment(contract.date).format(oplateConsts.DATE_FORMAT) : '';

        const isEditBtnShow = !this.state.isBasicInfoEdit && !this.state.isAppEdit && hasPrivilege('OPLATE_CONTRACT_UPDATE');

        return (
            <div className="detail-basic">
                {this.state.isBasicInfoEdit ? (
                    <div>
                        <AddBasic
                            ref={REFS.BASIC_INFO_FORM}
                            contract={this.props.contract}
                            teamList={this.props.teamList}
                            userList={this.props.userList}
                            getUserList={this.props.getUserList}
                            isGetUserSuccess={this.props.isGetUserSuccess}
                            isEdit={true}
                        />
                        <div className="op-buttons">
                            <RightPanelCancel onClick={this.hideBasicInfoForm}><ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" /></RightPanelCancel>
                            <RightPanelSubmit onClick={this.handleSubmit}><ReactIntl.FormattedMessage id="common.sure" defaultMessage="确定" /></RightPanelSubmit>
                        </div>
                    </div>
                ) : null}

                {!this.state.isAppEdit && !this.state.isBasicInfoEdit && !this.state.isRepaymentEdit ? (
                    <div className="basic-info"> 
                        <div className="block-title">
                            <div className="detail-item">
                                {contract.num}
                            </div>
                            <div className="detail-item">
                                {Intl.get('call.record.customer', '客户')}:
                                {contract.customer_name}
                            </div>
                            <div className="detail-item">
                                {Intl.get('contract.4', '甲方')}:
                                {contract.buyer}
                            </div>
    
                            {isEditBtnShow ? (
                                <div className="edit-zone">
                                    {this.renderLabelField()}
                                    {this.renderStageField()}
                                    <RightPanelEdit 
                                        onClick={this.showBasicInfoForm}
                                    />
                                </div>
                            ) : null}
                        </div>

                        <Row>
                            <Col span="8">
                                <div className="detail-item">
                                    {Intl.get('contract.25', '合同额')}:
                                    {this.formatValues(contract.contract_amount)}
                                </div>
                            </Col>
                            <Col span="8">
                                <div className="detail-item">
                                    {Intl.get('contract.26', '成本额')}:
                                    {this.formatValues(contract.cost_price)}
                                </div>
                            </Col>
                            <Col span="8">
                                <div className="detail-item">
                                    {Intl.get('contract.27', '合同毛利')}:
                                    {this.formatValues(contract.gross_profit)}
                                </div>
                            </Col>
                        </Row>
                        {contract.cost_structure ? (
                            <div className="detail-item">
                                {Intl.get('contract.165', '成本构成')}:
                                {contract.cost_structure}
                            </div>
                        ) : null}
                        {contract.copy_number ? (
                            <div className="detail-item">
                                {Intl.get('contract.32', '合同份数')}:
                                <ReactIntl.FormattedMessage
                                    id="contract.33"
                                    values={{'num': contract.copy_number}}
                                    defaultMessage={'{num}份'} />
                            </div>
                        ) : null}
                        <Row>
                            <Col span="8">
                                <div className="detail-item">
                                    {Intl.get('contract.34', '签订时间')}:
                                    {date}
                                </div>
                            </Col>
                            {start_time || end_time ? (
                                <Col span="16">
                                    <div className="detail-item">
                                        {Intl.get('common.valid.time', '有效时间')}:
                                        {start_time}
                                        {end_time ? Intl.get('common.time.connector', '至') : ''}
                                        {end_time}
                                    </div>
                                </Col>
                            ) : null}
                        </Row>
                        <div className="detail-item">
                            {Intl.get('contract.37', '合同类型')}:
                            {contract.category}
                        </div>
                        {contract.remarks ? (
                            <div className="detail-item">
                                {Intl.get('common.remark', '备注')}:
                                <div className="remarks">
                                    {contract.remarks}
                                </div>
                            </div>
                        ) : null}

                        <div className="block-bottom">
                            <div className="detail-item">
                                {Intl.get('crm.6', '负责人')}:
                                {contract.user_name}
                            &nbsp;-
                                {contract.sales_team || getTeamName(this.props.teamList, contract.sales_team_id)}
                            </div>
                            <div className="detail-item">
                                {Intl.get('sales.commission.role.representative', '销售代表')}:
                                {contract.sales_rep}
                            &nbsp;-
                                {contract.sales_rep_team || getTeamName(this.props.teamList, contract.sales_rep_team_id)}
                            </div>
                        </div>
                    </div>
                ) : null}

                {this.state.isAppEdit ? (
                    <div>
                        <AddProduct
                            ref={REFS.PRODUCT_FORM}
                            products={products}
                            appList={this.props.appList}
                            updateScrollBar={this.props.updateScrollBar}
                        />
                        <div className="op-buttons">
                            <RightPanelCancel onClick={this.hideAppForm}><ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" /></RightPanelCancel>
                            <RightPanelSubmit onClick={this.handleSubmit.bind(this, 'app')}><ReactIntl.FormattedMessage id="common.sure" defaultMessage="确定" /></RightPanelSubmit>
                        </div>
                    </div>
                ) : null}

                {this.state.isRepaymentEdit ? (
                    <div>
                        <RightPanelCancel onClick={this.hideRepaymentForm} style={{margin: '0 37px 10px 0'}}>返回合同详情页</RightPanelCancel>
                        <DetailRepayment
                            ref="detailRepayment"
                            contract={this.props.contract}
                            showLoading={this.props.showLoading}
                            hideLoading={this.props.hideLoading}
                            refreshCurrentContract={this.props.refreshCurrentContract}
                        />
                    </div>
                ) : null}

                {!this.state.isAppEdit && !this.state.isBasicInfoEdit && !this.state.isRepaymentEdit ? (
                    <div className="basic-info">
                        <div className="block-title">
                            <Row>
                                <Col span={8}>
                                    {Intl.get('contract.179', '已回款')}：
                                    {this.formatValues(contract.total_amount)}
                                </Col>
                                <Col span={8}>
                                    {Intl.get('contract.180', '尾款')}：
                                    {this.formatValues(contract.total_plan_amount)}
                                </Col>
                            </Row>
                            {hasPrivilege('OPLATE_REPAYMENT_ADD') ? (
                                <RightPanelEdit 
                                    onClick={this.showRepaymentForm}
                                />
                            ) : null}
                        </div>
                        <AntcMdTable
                            dataSource={repayments}
                            columns={repaymentColumns}
                            rowKey={this.getRowKey}
                            pagination={false}
                            loading={this.state.isRepaymentLoading}
                        />
                    </div>
                ) : null}

                {!this.state.isAppEdit && !this.state.isBasicInfoEdit && !this.state.isRepaymentEdit ? (
                    <div className="basic-info">
                        <div className="block-title">
                            {Intl.get('contract.178', '购买产品')}
                            {hasPrivilege('OPLATE_CONTRACT_UPDATE') ? (
                                <RightPanelEdit 
                                    onClick={this.showAppForm}
                                />
                            ) : null}
                        </div>
                        <AntcMdTable
                            dataSource={products}
                            columns={productColumns}
                            rowKey={this.getRowKey}
                            pagination={false}
                        />
                    </div>
                ) : null}

                {!this.state.isAppEdit && !this.state.isBasicInfoEdit && !this.state.isRepaymentEdit ? (
                    <div className="basic-info"> 
                        <div className="block-title">
                            <div className="detail-item">
                                {Intl.get('common.belong.customer', '所属客户')}
                            </div>
                            {hasPrivilege('OPLATE_CONTRACT_UPDATE') ? (
                                <div>
                                    {this.state.isBelongCustomerEdit ? (
                                        <RightPanelClose 
                                            onClick={this.hideBelongCustomerForm}
                                        />
                                    ) : (
                                        <RightPanelEdit 
                                            onClick={this.showBelongCustomerForm}
                                        />
                                    )}
                                </div>
                            ) : null}
                        </div>
                        {this.state.isBelongCustomerEdit ? (
                            <div className="belong-customer">
                                <Validation ref="validation" onValidate={this.handleValidate}>
                                    {this.renderBelongCustomerField()}
                                    <RightPanelSubmit onClick={this.handleBelongCustomerSubmit}>{Intl.get('common.save', '保存')}</RightPanelSubmit>
                                    <RightPanelCancel onClick={this.hideBelongCustomerForm}>{Intl.get('common.cancel', '取消')}</RightPanelCancel>
                                </Validation>
                            </div>
                        ) : (
                            <div className="belong-customer-list">
                                {(contract.customers || []).map((customer, index) => (
                                    <div className="detail-item" key={index}>
                                        {customer.customer_name}
                                        {customer.customer_sales_name ? (
                                            <div>
                                                {customer.customer_sales_name}
                                                {customer.customer_sales_team_name ? (
                                                    <span>
                                        &nbsp;-&nbsp;
                                                        {customer.customer_sales_team_name}
                                                    </span>
                                                ) : null}
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        );
    }
});

module.exports = DetailBasic;

