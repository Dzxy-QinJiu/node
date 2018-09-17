var React = require('react');
require('./css/customer-suggest.less');
import {Link} from 'react-router-dom';
import {Select, Tag} from 'antd';
var crmCustomerAjax = require('MOD_DIR/crm/public/ajax/index');
var userData = require('PUB_DIR/sources/user-data');
var classNames = require('classnames');
import {DetailEditBtn} from '../rightPanel';
import SaveCancelButton from '../detail-card/save-cancel-button';
import Trace from 'LIB_DIR/trace';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import {RightPanel} from 'CMP_DIR/rightPanel';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import crmUtil from 'MOD_DIR/crm/public/utils/crm-util';

class CustomerSuggest extends React.Component {
    static defaultProps = {
        showCustomerId: '',//正在展示客户详情的客户id
        isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
        customerOfCurUser: {},//当前展示用户所属客户的详情
        //是否是必填项
        required: true,
        //是否显示错误提示，一般在点击提交的时候，这个值为true
        show_error: false,
        //客户的id
        id: '',
        //客户的name
        customer_name: '',
        //当选中了customer的时候，会调用这个函数
        onCustomerChoosen: function() {
        },
        //告诉调用的父组件，隐藏错误提示
        hideCustomerError: function() {
        },
        //搜索关键词
        keyword: '',
        //外层的id
        customerSuggestWrapId: '',
        //展示内容（非编辑状态）
        displayText: '',
        //所展示客户的id
        displayCustomerId: '',
        //是否展示客户所属的销售
        isShowSales: false,
        //无数据时的提示（没有修改权限时提示没有数据）
        noDataTip: '',
        //添加数据的提示（有修改权限时，提示补充数据）
        addDataTip: '',
        //是否有修改权限
        hasEditPrivilege: false,
        hoverShowEdit: true,//编辑按钮是否在鼠标移入的时候再展示出来
        customerLable: '',//客户标签
        customer_id: '',//客户id
    };

    state = {
        //类型
        result_type: '',
        //从服务端获取的客户列表
        list: [],
        //显示提示
        show_tip: false,
        //联想接口错误时候的提示信息
        suggest_error_msg: '',
        //销售团队
        sales_team: {
            id: '',
            name: ''
        },
        //销售
        sales: {
            id: '',
            name: ''
        },
        //客户
        customer: {
            id: this.props.customer_id,
            name: this.props.customer_name
        },
        customerSuggestWrapId: this.props.customerSuggestWrapId || 'app',
        //线索的id
        id: this.props.id,
        displayType: this.props.displayType || 'text',
        displayText: this.props.displayText,//在界面上展示的值
        displayCustomerId: this.props.customer_id,
        value: this.props.customer_name,
        isShowSales: this.props.isShowSales
    };

    suggestTimer = null;

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id) {
            this.setState({
                displayType: nextProps.displayType,
                displayText: nextProps.displayText,
                displayCustomerId: nextProps.customer_id,
                value: nextProps.customer_name,
                id: nextProps.id,
                customer: {
                    id: nextProps.customer_id,
                    name: nextProps.customer_name
                },
            });
        }
        if (this.props.displayType !== nextProps.displayType || this.props.customer_id !== nextProps.customer_id){
            this.setState({
                displayType: nextProps.displayType,
                displayText: nextProps.displayText,
                displayCustomerId: nextProps.customer_id,
                value: nextProps.customer_name,
                customer: {
                    id: nextProps.customer_id,
                    name: nextProps.customer_name
                },
            });
        }
        if (this.props.keyword !== nextProps.keyword) {
            this.setState({
                keyword: nextProps.keyword
            });
        }
        if (this.props.customerSuggestWrapId !== nextProps.customerSuggestWrapId) {
            this.setState({
                customerSuggestWrapId: nextProps.customerSuggestWrapId
            });
        }
        if (this.props.isShowSales !== nextProps.isShowSales) {
            this.setState({
                isShowSales: nextProps.isShowSales
            });
        }
    }

    //调整右侧面板客户联想宽度
    adjustDropDownRightPos = () => {
        var $dropDown = $('.customer_combobox_search.ant-select-dropdown');
        if ($dropDown[0]) {
            $dropDown.css('right', 'auto');
            var width = $dropDown.outerWidth();
            var posLeft = parseInt($dropDown.offset().left);
            if ((posLeft + width) > $(window).width()) {
                $dropDown.css('right', 0);
            }
        }
    };

    suggestChange = (value) => {
        clearTimeout(this.suggestTimer);
        var _this = this;
        this.setState({
            result_type: 'loading',
            suggest_error_msg: '',
            list: [],
            show_tip: false
        }, () => {
            this.adjustDropDownRightPos();
        });
        if (this.props.show_error && !this.props.required) {
            this.props.hideCustomerError();
        }
        this.suggestTimer = setTimeout(() => {
            let condition = {name: value};
            let rangeParams = [{
                from: '',
                to: '',
                type: 'time',
                name: 'start_time'
            }];
            let queryObj = {
                total_size: 0,
                cursor: true,
                id: ''
            };
            let sorter = {
                field: 'start_time',
                order: 'descend'
            };
            crmCustomerAjax.queryCustomer(condition,rangeParams,10,sorter,queryObj).then((data) => {
                var list = data.result;
                _.forEach(list, (customerItem) => {
                    customerItem.customer_name = customerItem.name;
                    customerItem.customer_id = customerItem.id;
                });
                this.setState({
                    result_type: '',
                    suggest_error_msg: '',
                    list: list,
                    show_tip: list.length <= 0
                }, () => {
                    this.adjustDropDownRightPos();
                });
            }, (errorMsg) => {
                this.setState({
                    result_type: 'error',
                    suggest_error_msg: errorMsg || Intl.get('errorcode.61', '获取客户列表失败'),
                    show_tip: true,
                    list: []
                }, () => {
                    this.adjustDropDownRightPos();
                });
            });
        }, 300);
    };

    customerChoosen = (value, field) => {
        var customerForLeave = {
            id: '',
            name: '',
            address: ''
        };//出差申请的目的地
        var selectedCustomer = _.find(this.state.list, function(item) {
            if (item.customer_id === value) {
                return true;
            }
        });

        if (selectedCustomer) {
            var result = {
                sales_team: {
                    id: selectedCustomer.sales_team_id,
                    name: selectedCustomer.sales_team_name
                },
                sales: {
                    id: selectedCustomer.sales_id,
                    name: selectedCustomer.sales_name
                },
                customer: {
                    id: value,
                    name: selectedCustomer.customer_name
                }
            };
            customerForLeave.id = value;
            customerForLeave.name = selectedCustomer.customer_name;
            customerForLeave.province = selectedCustomer.province;
            customerForLeave.city = selectedCustomer.city;
            customerForLeave.county = selectedCustomer.county;
            customerForLeave.address = selectedCustomer.address;
            this.setState({
                ...result,
                show_tip: false
            });
        } else {
            var result = {
                sales_team: {
                    id: '',
                    name: ''
                },
                sales: {
                    id: '',
                    name: ''
                },
                customer: {
                    id: '',
                    name: value
                }
            };
            customerForLeave.id = '';
            customerForLeave.name = value;
            this.setState({
                ...result,
                show_tip: false,
                list: []
            });
        }
        _.isFunction(this.props.customerChoosen) && this.props.customerChoosen(customerForLeave);
    };

    getCustomerSearchInput = () => {
        var $search_input = $('.ant-select-search__field', this.refs.customer_searchbox);
        return $search_input;
    };

    retrySuggest = () => {
        var $search_input = this.getCustomerSearchInput();
        var search_input_val = $search_input.val();
        this.suggestChange(search_input_val);
    };

    getCustomerTipBlock = () => {
        var $search_input = this.getCustomerSearchInput();
        var search_input_val = $search_input.val();
        if (this.props.show_error) {
            return (
                <div className="customer_suggest_tip customer_suggest_error_tip">
                    {
                        search_input_val ?
                            Intl.get('user.customer.suggest.not.found', '未找到该客户') :
                            (this.props.required ? Intl.get('contract.59', '请选择客户') : '')
                    }
                </div>
            );
        }
        if (!search_input_val) {
            return null;
        }
        if (this.state.show_tip) {
            if (this.state.result_type === 'error') {
                return (
                    <div className="customer_suggest_tip">
                        {this.state.suggest_error_msg}，{Intl.get('common.yesno', '是否')}<a href="javascript:void(0)"
                            onClick={this.retrySuggest} data-tracename="重新搜索客户"><ReactIntl.FormattedMessage
                                id="common.retry" defaultMessage="重试"/></a>
                    </div>
                );
            } else {
                var canCreateCustomer = userData.getUserData().privileges.indexOf('CRM_CUSTOMER_INFO_EDIT') >= 0;
                //是否跳转到crm页面添加客户
                var noJumpToAddCrmPanel = this.props.noJumpToCrm;
                return (
                    <div className="customer_suggest_tip">
                        {canCreateCustomer ?
                            <span>{Intl.get('user.customer.suggest.not.found', '未找到该客户')}，{Intl.get('common.yesno', '是否')}
                                {noJumpToAddCrmPanel ?
                                    <a onClick={this.props.addAssignedCustomer} data-tracename="点击创建客户按钮">{Intl.get('user.customer.suggest.create.customer', '创建客户')}？</a> :
                                    <Link to="/crm?add=true">{Intl.get('user.customer.suggest.create.customer', '创建客户')}？</Link>}
                            </span> : <span>{Intl.get('user.customer.suggest.not.found', '未找到该客户')}</span>}
                    </div>
                );
            }
        }
    };

    handleCancel = (e) => {
        Trace.traceEvent(e, '取消对' + this.props.field + '修改');
        var customer = this.state.customer;
        customer.name = this.props.customer_name;
        this.setState({
            customer: customer,
            displayType: 'text',
            suggest_error_msg: ''
        });
        _.isFunction(this.props.handleCancel()) && this.props.handleCancel();
    };

    handleSubmit = (e) => {
        Trace.traceEvent(e, '保存对' + this.props.field + '修改');
        var customer = this.state.customer;
        var customerName = customer.name;
        var saveObj = {
            id: this.props.id,
            customer_name: customerName,
            customer_id: customer.id
        };
        this.setState({result_type: 'loading'});
        const setDisplayState = (displayText, displayCustomerId) => {
            this.setState({
                result_type: '',
                suggest_error_msg: '',
                value: customerName,
                displayType: 'text',
                displayText: displayText || '',
                displayCustomerId: displayCustomerId || ''
            });
        };
        if (customerName !== this.state.value) {
            this.props.saveEditSelectCustomer(saveObj, () => {
                setDisplayState(customerName, customer.id);
            }, (errorMsg) => {
                this.setState({
                    result_type: '',
                    suggest_error_msg: errorMsg || Intl.get('common.edit.failed', '修改失败')
                });
            });
        } else {
            setDisplayState(this.state.displayText, this.state.displayCustomerId);
        }

    };

    resetCustomer = () => {
        var result = {
            keyword: '',
            sales_team: {
                id: '',
                name: ''
            },
            sales: {
                id: '',
                name: ''
            },
            customer: {
                id: '',
                name: ''
            }
        };

        this.setState({
            customer_list: [],
            ...result,
            show_tip: false,
            list: []
        });
    };

    setEditable = (e) => {
        this.setState({
            keyword: this.props.keyword,
            displayType: 'edit',

        });
        Trace.traceEvent(e, '点击编辑' + this.props.field);
    };

    showCustomerDetail = (customerId) => {
        this.setState({
            showCustomerId: customerId
        });
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customerId,
                ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,
                hideRightPanel: this.closeRightPanel
            }
        });
    };

    closeRightPanel = () => {
        this.setState({
            showCustomerId: ''
        });
    };

    ShowCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });
    };

    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false
        });
    };

    render() {
        var displayCls = classNames({
            'customer_search_wrap': true,
            'customer_searchbox_error': this.props.show_error && this.props.required,
            'editing': this.state.displayType === 'edit'
        });
        var textBlock = null;
        var wrapSelectId = this.state.customerSuggestWrapId;
        var customerId = this.state.displayCustomerId;
        var cls = classNames('edit-container',{
            'hover-show-edit': this.props.hoverShowEdit && this.props.hasEditPrivilege
        });
        if (this.state.displayType === 'text') {
            if (this.state.displayText) {
                textBlock = (
                    <div className={cls}>
                        <span className="inline-block basic-info-text customer-name" data-tracename="查看客户详情" onClick={this.showCustomerDetail.bind(this, customerId)}>
                            {this.props.customerLable ? <Tag className={crmUtil.getCrmLabelCls(this.props.customerLable)}>{this.props.customerLable}</Tag> : null}
                            {this.state.displayText}
                            <span className="arrow-right">&gt;</span>
                        </span>
                        {this.props.hasEditPrivilege ? (
                            <DetailEditBtn title={this.props.editBtnTip}
                                onClick={this.setEditable.bind(this)}
                                data-tracaname="点击编辑客户按钮"
                            />) : null
                        }
                    </div>);
            } else {
                textBlock = (
                    <span className="inline-block basic-info-text no-data-descr">
                        {this.props.hasEditPrivilege ? (
                            <a onClick={this.setEditable.bind(this)} data-tracaname="点击编辑客户按钮">{this.props.addDataTip}</a>) : this.props.noDataTip}

                    </span>
                );
            }
        }
        var selectBlock = this.state.displayType === 'edit' ? (
            <div ref="customer_searchbox" className="associate-customer-wrap">
                <Select
                    combobox
                    autoFocus = {true}
                    placeholder={Intl.get('customer.search.by.customer.name', '请输入客户名称搜索')}
                    filterOption={false}
                    onSearch={this.suggestChange}
                    onChange={this.customerChoosen}
                    value={this.state.customer.name}
                    dropdownMatchSelectWidth={false}
                    dropdownClassName="customer_combobox_search"
                    notFoundContent={Intl.get('common.no.data', '暂无数据')}
                    getPopupContainer={() => document.getElementById(wrapSelectId)}
                >
                    {
                        this.state.list.map((item) => {
                            return (
                                <Option value={item.customer_id} key={item.customer_id} title={item.customer_name}>
                                    {this.state.isShowSales ? `${item['customer_name']}(${item['sales_name']})` : item['customer_name']}
                                </Option>
                            );
                        })
                    }
                </Select>
                {this.getCustomerTipBlock()}
                <div className="buttons">
                    {!this.props.hideButtonBlock ?
                        <SaveCancelButton loading={this.state.result_type === 'loading'}
                            saveErrorMsg={this.state.suggest_error_msg}
                            handleSubmit={this.handleSubmit}
                            handleCancel={this.handleCancel}
                        /> : null}
                </div>
            </div>
        ) : null;
        return (
            <div className={displayCls} data-tracename="搜索客户">
                {textBlock}
                {selectBlock}
                {/*该客户下的用户列表*/}
                {this.state.isShowCustomerUserListPanel ? <RightPanel
                    className="customer-user-list-panel"
                    showFlag={this.state.isShowCustomerUserListPanel}
                >
                    { this.state.isShowCustomerUserListPanel ?
                        <AppUserManage
                            customer_id={customerOfCurUser.id}
                            hideCustomerUserList={this.closeCustomerUserListPanel}
                            customer_name={customerOfCurUser.name}
                        /> : null
                    }
                </RightPanel> : null}
            </div>
        );
    }
}
CustomerSuggest.propTypes = {
    customer_id: PropTypes.string,
    customer_name: PropTypes.string,
    customerSuggestWrapId: PropTypes.string,
    id: PropTypes.string,
    displayType: PropTypes.string,
    displayText: PropTypes.string,
    isShowSales: PropTypes.boolean,
    keyword: PropTypes.string,
    show_error: PropTypes.boolean,
    required: PropTypes.boolean,
    hideCustomerError: PropTypes.func,
    customerChoosen: PropTypes.func,
    noJumpToCrm: PropTypes.boolean,
    addAssignedCustomer: PropTypes.func,
    field: PropTypes.string,
    handleCancel: PropTypes.func,
    saveEditSelectCustomer: PropTypes.func,
    hoverShowEdit: PropTypes.boolean,
    hasEditPrivilege: PropTypes.boolean,
    customerLable: PropTypes.string,
    editBtnTip: PropTypes.string,
    addDataTip: PropTypes.string,
    noDataTip: PropTypes.string,
    hideButtonBlock: PropTypes.boolean,
};

module.exports = CustomerSuggest;
