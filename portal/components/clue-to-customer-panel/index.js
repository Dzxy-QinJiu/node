/**
 * Copyright (c) 2015-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2019 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by yubin on 2019/11/11.
 *
 * 线索转客户面板组件
 */

require('./style.less');
import { message } from 'antd';
import ajax from 'ant-ajax';
import { TAB_KEYS } from 'MOD_DIR/crm/public/utils/crm-util';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import { phoneMsgEmitter } from 'PUB_DIR/sources/utils/emitters';
import CustomerList from './customer-list';
import CustomerSearch from './customer-search';
import CustomerMerge from './customer-merge';
import { VIEW_TYPE, NOOP, NOT_SHOW_FORM_ITEMS } from './consts';
const CRMAddForm = require('MOD_DIR/crm/public/views/crm-add-form');

class ClueToCustomerPanel extends React.Component {
    static defaultProps = {
        //视图类型
        viewType: '',
        //关闭面板
        onClose: NOOP,
        //转换后
        afterConvert: NOOP,
        //当前线索
        clue: {},
        //要合并到的客户
        targetCustomer: null,
        //相似客户
        similarCustomers: []
    }
    static propTypes = {
        viewType: PropTypes.string,
        onClose: PropTypes.func,
        afterConvert: PropTypes.func,
        clue: PropTypes.object,
        targetCustomer: PropTypes.object,
        similarCustomers: PropTypes.array
    }
    constructor(props) {
        super(props);

        this.state = {
            //视图类型
            viewType: this.props.viewType,
            //前一个视图类型
            prevViewType: '',
            //相似客户
            existingCustomers: [],
            //要合并到的客户
            targetCustomer: this.props.targetCustomer,
        };
    }

    componentDidMount() {
        const targetCustomer = this.props.targetCustomer;
        const similarCustomers = this.props.similarCustomers;
        const similarCustomerIds = this.props.clue.similarity_customer_ids;

        if (targetCustomer) {
            this.changeViewType(VIEW_TYPE.CUSTOMER_MERGE, targetCustomer);
        } else if (!_.isEmpty(similarCustomers)) {
            this.changeViewType(VIEW_TYPE.CUSTOMER_LIST, similarCustomers);
        } else if (!_.isEmpty(similarCustomerIds)) {
            this.getCustomerById(similarCustomerIds, customers => {
                this.changeViewType(VIEW_TYPE.CUSTOMER_LIST, customers);
            });
        } else {
            this.changeViewType(VIEW_TYPE.ADD_CUSTOMER);
        }
    }

    render() {
        return (
            <div className="clue-to-customer-panel">
                {this.renderContent()}
            </div>
        );
    }

    renderContent() {
        if (this.state.viewType === VIEW_TYPE.ADD_CUSTOMER) {
            return (
                <CRMAddForm
                    hideAddForm={this.props.onClose}
                    afterAddCustomer={this.handleAfterAddCustomer}
                    formData={this.props.clue}
                    isAssociateClue={true}
                    isContactWayExpanded={true}
                    notShowFormItems={NOT_SHOW_FORM_ITEMS}
                    isConvert={true}
                    phoneNum={_.get(this.props, 'clue.phones[0]', '')}
                    isShowMadal={false}
                    title={(
                        <div>
                            <span className="panel-title">
                                {Intl.get('common.convert.to.new.customer', ' 转为新客户')}
                            </span>
                            <span className="op-btn" onClick={this.changeViewType.bind(this, VIEW_TYPE.CUSTOMER_SEARCH)}>
                                {Intl.get('common.merge.to.other.customer', '合并到其他客户')}
                            </span>
                        </div>
                    )}
                />
            );
        } else if (this.state.viewType === VIEW_TYPE.CUSTOMER_LIST) {
            return (
                <CustomerList
                    changeViewType={this.changeViewType}
                    onClose={this.props.onClose}
                    parent={this}
                    customers={this.state.existingCustomers}
                    clue={this.props.clue}
                />
            );
        } else if (this.state.viewType === VIEW_TYPE.CUSTOMER_SEARCH) {
            return (
                <CustomerSearch
                    prevViewType={this.state.prevViewType}
                    changeViewType={this.changeViewType}
                    onClose={this.props.onClose}
                    parent={this}
                />
            );
        } else if (this.state.viewType === VIEW_TYPE.CUSTOMER_MERGE) {
            return (
                <CustomerMerge
                    prevViewType={this.state.prevViewType}
                    changeViewType={this.changeViewType}
                    onClose={this.props.onClose}
                    onMerged={this.onAfterConvert}
                    parent={this}
                    customer={this.state.targetCustomer}
                    clue={this.props.clue}
                />
            );
        } else {
            return null;
        }
    }

    getCustomerById(ids, cb) {
        ids = ids.join(',');

        ajax.send({
            url: '/force_use_common_rest/rest/customer/v3/customer/query/customers/by/ids',
            type: 'post',
            data: {
                id: ids
            }
        })
            .done(result => {
                if (_.isFunction(cb)) cb(result);
            })
            .fail(err => {
                this.props.onClose();
                const errMsg = Intl.get('member.apply.approve.tips', '操作失败') + Intl.get('user.info.retry', '请重试');
                message.error(errMsg);
            });
    }

    //线索转客户完成后的操作
    onAfterConvert = (customerId, delayShowCustomerDetail) => {
        //关闭线索转客户面板
        this.props.onClose();

        //关闭线索详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.CLOSE_CLUE_PANEL);

        //打开客户面板，显示合并后的客户信息
        function showCustomerDetail() {
            if (customerId) {
                phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
                    customer_params: {
                        currentId: customerId,
                        activeKey: TAB_KEYS.CONTACT_TAB
                    }
                });
            }
        }

        if (delayShowCustomerDetail) {
            setTimeout(showCustomerDetail, 1000);
        } else {
            showCustomerDetail();
        }


        //执行外部传入的回调
        this.props.afterConvert(this.props.clue);
    }

    handleAfterAddCustomer = customer => {
        const msgInfo = Intl.get('common.convert.to.new.customer', '转为新客户') + Intl.get('contract.41', '成功');
        message.success(msgInfo);
        this.onAfterConvert();
    }

    changeViewType = (viewType, customer) => {
        if (!viewType) {
            this.props.onClose();
            return;
        }

        let newState = {
            viewType,
            prevViewType: this.state.viewType,
        };

        if (customer) {
            if (_.isArray(customer)) {
                newState.existingCustomers = customer;
            } else {
                newState.targetCustomer = customer;
            }
        }

        this.setState(newState);
    }
}

export default ClueToCustomerPanel;
