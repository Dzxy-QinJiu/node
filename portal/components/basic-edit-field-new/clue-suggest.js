/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by sunqingfeng on 2019/8/26.
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './css/clue-suggest.less';

import {Link} from 'react-router-dom';
import {Select} from 'antd';
import classNames from 'classnames';

import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import clueCustomerAjax from 'MOD_DIR/clue_customer/public/ajax/clue-customer-ajax';

const DELAY_TIME = 300; //搜索时ajax调用的延迟时间

class ClueSuggest extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //类型
            result_type: '',
            //从服务端获取的线索列表
            list: [],
            //显示提示
            show_tip: false,
            //联想接口错误时候的提示信息
            suggest_error_msg: '',
            //没有选择线索的提示
            no_select_error_msg: '',
            //当前选择的线索客户id
            curId: '',
            //当前输入的线索name
            curName: '',
            suggestTimer: null, //计时器,
            customerSuggestWrapId: this.props.customerSuggestWrapId || 'app',
            show_error: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id) {
            this.setState({
                id: nextProps.id,
            });
        }
        if (this.props.displayType !== nextProps.displayType){
            this.setState({
                displayType: nextProps.displayType,
                displayText: nextProps.displayText,
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
    }

    //调整右侧面板线索联想宽度
    adjustDropDownRightPos = () => {
        let $dropDown = $('.clue_combobox_search.ant-select-dropdown');
        if ($dropDown[0]) {
            $dropDown.css('right', 'auto');
            let width = $dropDown.outerWidth();
            let posLeft = parseInt($dropDown.offset().left);
            if ((posLeft + width) > $(window).width()) {
                $dropDown.css('right', 0);
            }
        }
    };

    //调用ajax获取线索列表
    suggestChange = (value) => {
        if (value){
            //隐藏客户是必填项的提示
            _.isFunction(this.props.hideClueRequiredTip) && this.props.hideClueRequiredTip(true);
        }else{
            _.isFunction(this.props.hideClueRequiredTip) && this.props.hideClueRequiredTip(false);
        }
        if(this.props.needRemovePrefix) {
            value = _.replace(value, /【.*】/, '');
        }
        let param = {
            pageSize: 10,
            name: value
        };
        clearTimeout(this.state.suggestTimer);
        this.setState({
            result_type: 'loading',
            suggest_error_msg: '',
            list: [],
            show_tip: false
        }, () => {
            this.adjustDropDownRightPos();
        });
        let suggestTimer = setTimeout(() => {
            clueCustomerAjax.getClueListByKeyword(param).then((data) => {
                let list = data.result;
                list = _.filter(list, (clueItem) => _.includes(_.toLower(clueItem.name), _.toLower(value)));
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
                    suggest_error_msg: errorMsg || Intl.get('failed.to.get.clue.customer.list','获取线索列表失败'),
                    show_tip: true,
                    list: []
                }, () => {
                    this.adjustDropDownRightPos();
                });
            });
        }, DELAY_TIME);
        this.setState({
            suggestTimer
        });
    };

    clueChosen = (value) => {
        if (value){
            //隐藏线索是必填项的提示
            _.isFunction(this.props.hideClueRequiredTip) && this.props.hideClueRequiredTip(true);
        }else{
            _.isFunction(this.props.hideClueRequiredTip) && this.props.hideClueRequiredTip(false);
        }
        let clueDetail = {};//线索客户详情
        let selectedClue = _.find(_.get(this.state, 'list'), clue => _.isEqual(clue.id, value));
        if (selectedClue) {
            let curClue = {
                curId: value,
                curName: selectedClue.name
            };
            clueDetail.id = value;
            clueDetail.name = selectedClue.name;
            this.setState({
                ...curClue,
                show_tip: false
            });
        } else {
            let curClue = {
                curId: '',
                curName: value,
            };
            clueDetail.id = '';
            clueDetail.name = value;
            this.setState({
                ...curClue,
                show_tip: false,
                list: []
            });
        }
        _.isFunction(this.props.clueChosen) && this.props.clueChosen(clueDetail);
    };

    getClueSearchInput = () => {
        let $search_input = $('.ant-select-search__field', this.clue_search_box);
        return $search_input;
    };

    retrySuggest = () => {
        let $search_input = this.getClueSearchInput();
        let search_input_val = $search_input.val();
        this.suggestChange(search_input_val);
    };

    getNoCustomerTip = () => {
        return this.props.canCreateClue && hasPrivilege('CUSTOMER_ADD_CLUE');
    };

    getSearchValue = () => {
        let $search_input = this.getClueSearchInput();
        return $search_input.val();
    };

    //返回提示内容
    renderClueSuggestTip() {
        let suggestTip = null;
        if(this.props.tryCustomer) {
            suggestTip = this.getNoCustomerTip() ?
                <span>{Intl.get('crm.suggest.clue.not.found','未找到该线索')}，<a onClick={this.props.searchCustomer}>{Intl.get('clue.customer.search.by.client.name', '根据客户名搜索')}</a>
                    {Intl.get('common.or', '或')}<Link to="/leads?add=true">{Intl.get('crm.clue.suggest.create.clue','创建线索')}</Link>
                </span> :
                <span>{Intl.get('crm.suggest.clue.not.found','未找到该线索')}, <a onClick={this.props.searchCustomer}>{Intl.get('clue.customer.search.by.client.name', '根据客户名搜索')}</a></span>;
        } else {
            suggestTip = this.getNoCustomerTip() ?
                <span>{Intl.get('crm.suggest.clue.not.found','未找到该线索')}，{Intl.get('common.yesno', '是否')}
                    <Link to="/leads?add=true">{Intl.get('crm.clue.suggest.create.clue','创建线索')}</Link>
                </span> :
                <span>{Intl.get('crm.suggest.clue.not.found','未找到该线索')}</span>;
        }
        return suggestTip;
    }
    //未找到线索时提示
    getClueTipBlock = () => {
        let search_input_val = this.getSearchValue();
        if (this.props.show_error) {
            return (
                <div className="clue_suggest_tip clue_suggest_error_tip">
                    {
                        search_input_val ?
                            Intl.get('crm.suggest.clue.not.found','未找到该线索') :
                            (this.props.required ? Intl.get('crm.suggest.select.clue','请选择线索') : '')
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
                    <div className="clue_suggest_tip clue_suggest_error_tip">
                        {this.state.suggest_error_msg}，{Intl.get('common.yesno', '是否')}
                        <a href="javascript:void(0)" onClick={this.retrySuggest} data-tracename="重新搜索线索">
                            {Intl.get('common.retry', '重试')}
                        </a>
                    </div>
                );
            } else if (this.state.no_select_error_msg){
                return (
                    <div className="clue_select_error_tip">{this.state.no_select_error_msg}</div>
                );
            }else{
                return (
                    <div className="clue_suggest_tip">
                        {this.renderClueSuggestTip()}
                    </div>
                );
            }
        }
    };

    //判断是否使用“error”样式
    getClueTipErrmsg = () => {
        let search_input_val = this.getSearchValue();
        return !this.props.show_error && search_input_val && this.state.show_tip && this.state.result_type !== 'error' && this.getNoCustomerTip();
    };

    //检查是否在下拉框中选中了线索，如果输入的值和列表中推荐线索的值是一样的，默认选中这个，如果不完全一致，
    onCheckIfClueChoose = (value) => {
        if (_.trim(value) && !_.get(this, 'state.curId') && _.get(this, 'state.list.length') > 0) {
            this.setState({
                no_select_error_msg: Intl.get('crm.suggest.select.clue.tip', '请在下拉框中选择线索'),
                show_tip: true
            });
        } else {
            this.setState({
                no_select_error_msg: '',
            });
        }
    };
    ignorePrefix = (input, option) => {
        let checkedOption = option.props.children;
        if(this.props.needRemovePrefix) {
            input = _.replace(input, /【.*】/, '');
        }
        return checkedOption.indexOf(input) >= 0;
    };
    render() {
        let displayCls = classNames({
            'clue-search-wrap': true,
            'clue-searchbox-error': this.props.show_error && this.props.required,
        });
        let wrapSelectId = this.state.customerSuggestWrapId;
        return (
            <div className={displayCls} data-tracename="搜索线索">
                <div ref={clue_search_box => this.clue_search_box = clue_search_box} className="associate-clue-wrap">
                    <Select
                        ref="selectSearch"
                        className={this.getClueTipErrmsg() ? 'err-tip' : ''}
                        combobox
                        autoFocus = {true}
                        placeholder={this.props.placeholder}
                        filterOption={(input, option) => this.ignorePrefix(input, option)}
                        onSearch={this.suggestChange}
                        onChange={this.clueChosen}
                        onBlur={this.onCheckIfClueChoose.bind(this)}
                        value={_.get(this.state, 'curName')}
                        dropdownMatchSelectWidth={false}
                        dropdownClassName="clue_combobox_search"
                        notFoundContent={Intl.get('common.no.data', '暂无数据')}
                        getPopupContainer={() => document.getElementById(wrapSelectId)}
                    >
                        {
                            this.state.list.map((item) => {
                                return (
                                    <Option value={item.id} key={item.id} title={item.name}>
                                        {item.name}
                                    </Option>
                                );
                            })
                        }
                    </Select>
                    {this.getClueTipBlock()}
                </div>
            </div>
        );
    }
}
ClueSuggest.defaultProps = {
    showCustomerId: '',//正在展示客户详情的客户id
    //是否是必填项
    required: true,
    //是否显示错误提示，一般在点击提交的时候，这个值为true
    show_error: false,
    canCreateClue: true,//找不到线索时能否创建线索
    //线索的id
    id: '',
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
    //是否有修改权限
    hasEditPrivilege: false,
    //是否尝试搜索客户
    tryCustomer: false,
    //搜索客户
    searchCustomer: function(){},
    //默认输入框提示
    placeholder: Intl.get('crm.suggest.clue.search', '输入线索名称搜索'),
    needRemovePrefix: false,//在添加日程中，因手动添加了【线索】的前缀，需要在搜索时去除前缀搜索
};
ClueSuggest.propTypes = {
    name: PropTypes.string,
    customerSuggestWrapId: PropTypes.string,
    id: PropTypes.string,
    displayType: PropTypes.string,
    displayText: PropTypes.string,
    keyword: PropTypes.string,
    show_error: PropTypes.bool,
    required: PropTypes.bool,
    canCreateClue: PropTypes.bool,
    clueChosen: PropTypes.func,
    field: PropTypes.string,
    handleCancel: PropTypes.func,
    hasEditPrivilege: PropTypes.bool,
    hideClueRequiredTip: PropTypes.func,
    tryCustomer: PropTypes.bool,
    searchCustomer: PropTypes.func,
    placeholder: PropTypes.string,
    needRemovePrefix: PropTypes.bool,
};

module.exports = ClueSuggest;
