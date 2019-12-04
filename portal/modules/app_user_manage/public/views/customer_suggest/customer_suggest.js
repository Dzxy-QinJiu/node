
var React = require('react');
var language = require('../../../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('./customer_suggest-es_VE.less');
}else if (language.lan() === 'zh'){
    require('./customer_suggest-zh_CN.less');
}
var Select = require('antd').Select;
var Icon = require('antd').Icon;
import {Link} from 'react-router-dom';
var crmCustomerAjax = require('MOD_DIR/crm/public/ajax/index');
var userData = require('../../../../../public/sources/user-data');
var classNames = require('classnames');

class CustomerSuggest extends React.Component {
    static defaultProps = {
        //是否是必填项
        required: true,
        //是否显示错误提示，一般在点击提交的时候，这个值为true
        show_error: false,
        //客户的id
        customer_id: '',
        //客户的name
        customer_name: '',
        //当选中了customer的时候，会调用这个函数
        onCustomerChoosen: function() {},
        //告诉调用的父组件，隐藏错误提示
        hideCustomerError: function() {},
        //搜索关键词
        keyword: '',
        //外层的id
        customerSuggestWrapId: ''
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
        keyword: this.props.customer_name,
        customerSuggestWrapId: this.props.customerSuggestWrapId || 'app',
    };

    suggestTimer = null;

    componentWillReceiveProps(nextProps) {
        if(this.props.customer_id !== nextProps.customer_id || this.props.customer_name !== nextProps.customer_name) {
            this.setState({
                customer: {
                    id: nextProps.customer_id,
                    name: nextProps.customer_name
                }
            });
            //没有客户的时候，将销售、销售团队置空
            if(!nextProps.customer_id) {
                this.setState({
                    list: [],
                    keyword: '',
                    sales_team: {
                        id: '',
                        name: ''
                    },
                    sales: {
                        id: '',
                        name: ''
                    }
                });
            }
        }
        if (this.props.keyword !== nextProps.keyword){
            this.setState({
                keyword: nextProps.keyword
            });
        }
        if (this.props.customerSuggestWrapId !== nextProps.customerSuggestWrapId){
            this.setState({
                customerSuggestWrapId: nextProps.customerSuggestWrapId
            });
        }
    }

    customerAjaxReq = null;

    getCustomerList = (suggestWord) => {
        var Deferred = $.Deferred();
        if(this.customerAjaxReq) {
            this.customerAjaxReq.abort();
        }
        this.customerAjaxReq = customerAjax.getCustomerSuggestListAjax().sendRequest({
            q: suggestWord
        }).success(function(list) {
            Deferred.resolve(list);
        }).error(function(xhr,statusText) {
            if(statusText !== 'abort') {
                Deferred.reject(xhr.responseJSON || Intl.get('errorcode.61','获取客户列表失败'));
            }
        }).timeout(function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('errorcode.61','获取客户列表失败'));
        });
        return Deferred.promise();
    };

    //调整右侧面板客户联想宽度
    adjustDropDownRightPos = () => {
        var $dropDown = $('.customer_combobox_search.ant-select-dropdown');
        if($dropDown[0]){
            $dropDown.css('right','auto');
            var width = $dropDown.outerWidth();
            var posLeft = parseInt($dropDown.offset().left);
            if((posLeft + width) > $(window).width()) {
                $dropDown.css('right',0);
            }
        }
    };

    suggestChange = (value) => {
        clearTimeout(this.suggestTimer);
        var _this = this;
        //是否展示客户名后的对号或者叉号
        _.isFunction(this.props.isShowUpdateOrClose) && this.props.isShowUpdateOrClose(false);
        this.setState({
            result_type: 'loading',
            suggest_error_msg: '',
            list: [],
            show_tip: false
        },() => {
            this.adjustDropDownRightPos();
        });
        if(this.props.show_error && !this.props.required) {
            this.props.hideCustomerError();
        }
        this.suggestTimer = setTimeout(function() {
            let condition = {name: _.trim(value)};
            let sorter = {
                field: 'start_time',
                order: 'descend'
            };
            let params = {
                data: JSON.stringify(condition)
            };
            crmCustomerAjax.queryCustomer(params, 10, 1, sorter).then(function(data) {
                var list = data.result;
                _.forEach(list, (customerItem) => {
                    customerItem.customer_name = customerItem.name;
                    customerItem.customer_id = customerItem.id;
                    customerItem.sales_name = customerItem.user_name;
                    customerItem.sales_id = customerItem.user_id;
                    customerItem.sales_team_name = customerItem.sales_team;
                });
                _this.setState({
                    result_type: '',
                    suggest_error_msg: '',
                    list: list,
                    show_tip: list.length <= 0
                },() => {
                    _this.adjustDropDownRightPos();
                    _.isFunction(_this.props.isShowUpdateOrClose) && _this.props.isShowUpdateOrClose(true);
                });
            } , function(errorMsg) {
                _this.setState({
                    result_type: 'error',
                    suggest_error_msg: errorMsg || Intl.get('errorcode.61', '获取客户列表失败'),
                    show_tip: true,
                    list: []
                },() => {
                    _this.adjustDropDownRightPos();
                    _.isFunction(_this.props.isShowUpdateOrClose) && _this.props.isShowUpdateOrClose(true);
                });
            });
        } , 300);
    };

    customerChoosen = (value, field) => {
        var selectedCustomer = _.find(this.state.list , function(item) {
            if(item.customer_id === value) {
                return true;
            }
        });
        if(selectedCustomer) {
            var result = {
                keyword: value,
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

            this.setState({
                ...result,
                show_tip: false
            });
            var resultClone = JSON.parse(JSON.stringify(result));
            this.props.onCustomerChoosen(resultClone);
        } else {
            var result = {
                keyword: value,
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
                ...result,
                show_tip: false,
                list: []
            });
            var resultClone = JSON.parse(JSON.stringify(result));
            this.props.onCustomerChoosen(resultClone);
        }
    };

    getCustomerSearchInput = () => {
        var $search_input = $('.ant-select-search__field',this.refs.customer_searchbox);
        return $search_input;
    };

    retrySuggest = () => {
        var $search_input = this.getCustomerSearchInput();
        var search_input_val = $search_input.val();
        this.suggestChange(search_input_val);
    };

    getCustomerLoadingBlock = () => {
        if(this.state.result_type === 'loading') {
            return (
                <Icon type="loading"/>
            );
        }
    };

    getCustomerTipBlock = () => {
        var $search_input = this.getCustomerSearchInput();
        var search_input_val = $search_input.val();
        if(this.props.show_error) {
            return (
                <div className="customer_suggest_tip customer_suggest_error_tip">
                    {
                        search_input_val ?
                            Intl.get('user.customer.suggest.not.found','未找到该客户') :
                            (this.props.required ? Intl.get('contract.59','请选择客户') : '')
                    }
                </div>
            );
        }
        if(!search_input_val) {
            return null;
        }
        if(this.state.show_tip) {
            if(this.state.result_type === 'error') {
                return (
                    <div className="customer_suggest_tip">
                        {this.state.suggest_error_msg}，{Intl.get('common.yesno','是否')}<a href="javascript:void(0)" onClick={this.retrySuggest}><ReactIntl.FormattedMessage id="common.retry" defaultMessage="重试" /></a>
                    </div>
                );
            } else {
                var canCreateCustomer = userData.getUserData().privileges.indexOf('CRM_CUSTOMER_INFO_EDIT') >= 0;
                //是否跳转到crm页面添加客户
                var noJumpToAddCrmPanel = this.props.noJumpToCrm;
                return (
                    <div className="customer_suggest_tip">
                        {canCreateCustomer ? <span>{Intl.get('user.customer.suggest.not.found','未找到该客户')}，{Intl.get('common.yesno','是否')}
                            {noJumpToAddCrmPanel ? <a onClick={this.props.addAssignedCustomer}>{Intl.get('user.customer.suggest.create.customer','创建客户')}？</a> : <Link to="/accounts?add=true">{Intl.get('user.customer.suggest.create.customer','创建客户')}？</Link>}
                        </span> : <span>{Intl.get('user.customer.suggest.not.found','未找到该客户')}</span>}
                    </div>
                );
            }
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

        var resultClone = JSON.parse(JSON.stringify(result));
        this.props.onCustomerChoosen(resultClone);
    };

    render() {
        if(this.state.sales.name) {
            return (
                <div ref="customer_searchbox" className="customer_searchbox_wrap customer_searchbox_text_wrap">
                    <div className="customer_choosen" title={Intl.get('user.customer.suggest.reselect','点击重新选择')} onClick={this.resetCustomer}>
                        <span>{this.state.customer.name}</span>
                        <i className="iconfont"></i>
                    </div>
                </div>
            );
        } else {

            var wrapClassName = classNames({
                customer_searchbox_wrap: true,
                customer_searchbox_error: this.props.show_error && this.props.required
            });

            var wrapSelectId = this.state.customerSuggestWrapId;

            return (
                <div ref="customer_searchbox" className={wrapClassName}>
                    <Select
                        combobox
                        searchPlaceholder={Intl.get('customer.search.by.customer.name', '请输入客户名称搜索')}
                        filterOption={() => _.get(this.state.list, 'length', 0)}
                        onSearch={this.suggestChange}
                        onChange={this.customerChoosen}
                        value={this.state.keyword}
                        dropdownMatchSelectWidth={false}
                        dropdownClassName="customer_combobox_search"
                        notFoundContent={Intl.get('common.no.data', '暂无数据')}
                        getPopupContainer={() => document.getElementById(wrapSelectId)}
                    >
                        {
                            this.state.list.map(function(item) {
                                return (
                                    <Option value={item.customer_id} key={item.customer_id} title={item.customer_name}>{item.customer_name}({item.sales_name})</Option>
                                );
                            })
                        }
                    </Select>
                    {this.getCustomerLoadingBlock()}
                    {this.getCustomerTipBlock()}
                </div>
            );
        }
    }
}

module.exports = CustomerSuggest;
