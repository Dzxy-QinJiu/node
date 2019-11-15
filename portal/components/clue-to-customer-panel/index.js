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
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import { AUTHS, TAB_KEYS } from 'MOD_DIR/crm/public/utils/crm-util';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import { phoneMsgEmitter } from 'PUB_DIR/sources/utils/emitters';
import { subtracteGlobalClue } from 'PUB_DIR/sources/utils/common-method-util';
import CustomerList from './customer-list';
import CustomerSearch from './customer-search';
import CustomerMerge from './customer-merge';
import { VIEW_TYPE, NOOP } from './consts';
const CRMAddForm = require('MOD_DIR/crm/public/views/crm-add-form');
const Spinner = require('CMP_DIR/spinner');

class ClueToCustomerPanel extends React.Component {
    static defaultProps = {
        //是否正在加载
        isLoading: true,
        //视图类型
        viewType: '',
        //关闭面板
        onClose: NOOP,
        //转换后
        afterConvert: NOOP,
        //当前线索
        clue: {},
        //要合并到的客户
        targetCustomer: {},
    }
    static propTypes = {
        isLoading: PropTypes.bool,
        viewType: PropTypes.string,
        onClose: PropTypes.func,
        afterConvert: PropTypes.func,
        clue: PropTypes.object,
        targetCustomer: PropTypes.object,
    }
    constructor(props) {
        super(props);

        this.state = {
            //是否正在加载
            isLoading: this.props.isLoading,
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
        if (!this.state.viewType) {
            this.checkExistingCustomer();
        }
    }

    render() {
        return (
            <div className="clue-to-customer-panel">
                {this.state.isLoading ? this.renderLoading() : this.renderContent()}
            </div>
        );
    }

    renderLoading() {
        return (
            <RightPanelModal
                isShowCloseBtn={true}
                onClosePanel={this.props.onClose}
                content={<Spinner />}
            />
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

    checkExistingCustomer() {
        let { name, phones } = this.props.clue;

        name = _.trim(name);

        //线索名为空时不能执行转为客户的操作
        //此时提示用户完善客户名
        if (!name) {
            message.error(Intl.get('clue.need.complete.clue.name', '请先完善线索名'));
            this.props.onClose();
            return;
        }

        //查询相似客户的接口要求线索名不能少于两个字
        if (name.length < 2) {
            message.error(Intl.get('common.clue.name.need.at.least.two.char.to.do.customer.convert', '线索名称必须在两个字或以上，才能进行转为客户的操作'));
            this.props.onClose();
            return;
        }

        if (_.isArray(phones)) {
            phones = phones.join(',');
        } else {
            phones = '';
        }
        
        //权限类型
        const authType = hasPrivilege(AUTHS.GETALL) ? 'manager' : 'user';

        //根据线索名称查询相似客户
        ajax.send({
            url: `/rest/customer/v3/customer/query/${authType}/similarity/customer`,
            query: {
                name,
                phones
            }
        })
            .done(result => {
                const existingCustomers = _.get(result, 'similarity_list');

                let newState = {
                    isLoading: false
                };

                //若存在相似客户
                if (_.isArray(existingCustomers) && !_.isEmpty(existingCustomers)) {
                    newState.existingCustomers = existingCustomers;
                    newState.viewType = VIEW_TYPE.CUSTOMER_LIST;
                } else {
                    newState.viewType = VIEW_TYPE.ADD_CUSTOMER;
                }

                this.setState(newState);
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
            phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
                customer_params: {
                    currentId: customerId,
                    activeKey: TAB_KEYS.CONTACT_TAB
                }
            });
        }

        if (delayShowCustomerDetail) {
            setTimeout(showCustomerDetail, 1000);
        } else {
            showCustomerDetail();
        }

        subtracteGlobalClue(this.props.clue);

        //执行外部传入的回调
        this.props.afterConvert(this.props.clue);
    }

    handleAfterAddCustomer = customer => {
        const msgInfo = Intl.get('common.convert.to.new.customer': '转为新客户') + Intl.get('contract.41', '成功');
        message.success(msgInfo);

        const customerId = _.get(customer, '[0].id');

        if (customerId) {
            this.onAfterConvert(customerId, true);
        }
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
            newState.targetCustomer = customer;
        }

        this.setState(newState);
    }
}

export default ClueToCustomerPanel;
