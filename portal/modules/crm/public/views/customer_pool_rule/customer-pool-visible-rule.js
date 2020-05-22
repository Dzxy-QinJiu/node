/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/12.
 */
//客户池可见规则
import {message, Checkbox} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
import DetailCard from 'CMP_DIR/detail-card';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import Spinner from 'CMP_DIR/spinner';
import {DetailEditBtn} from 'CMP_DIR/rightPanel';
import CustomerPoolRuleForm from './customer-pool-rule-form';
import {getMyTeamTreeAndFlattenList} from 'PUB_DIR/sources/utils/common-data-util';
import userData from 'PUB_DIR/sources/user-data';
import CustomerPoolAjax from '../../ajax/customer-pool-configs';

const EDIT_WIDTH = 340;

const LAYOUT_CONSTS = {
    TITLE_HEIGHT: 70,
    TITLE_MARGIN_BOTTOM: 16,
};

const FORM_TYPE = {
    ADD: 'add',
    EDIT: 'edit',
    DEFAULT: 'default'
};
// 规则操作符
const RULE_CONFIG_OPERATOR = {
    EDIT: 'edit',
    CANCEL: 'cancel',
    DELETE: 'delete'
};

// 默认客户池的可见范围
const DEFAULT_VISIBLE_RANGE_MAPS = [
    {name: Intl.get('crm.customer.pool.all.visible.range', '所有人'), value: 'all'},
    {name: Intl.get('crm.customer.pool.default.visible.range', '客户原始团队'), value: 'default'}
];

class CustomerPoolVisibleRule extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isAddFormShow: false, //展示添加规则面板
            listenScrollBottom: true,
            total: 0,
            teamList: [],
            customerLabelList: [],
            isCustomerConfigsLoading: false, // 获取客户池配置
            errMsg: '',
            customerPoolConfigs: [],
            defaultRuleConfig: {}, // 默认客户池的配置
            isDefaultEdit: false,
            isDefaultLoading: false,
            defaultErrMsg: '',
            defaultChecked: false,
        };
    }

    componentDidMount() {
        this.getCustomerPoolConfigs();
        this.getTeamTreeList();
        this.getCustomerLabelList();
    }

    // 获取团队数据
    getTeamTreeList() {
        getMyTeamTreeAndFlattenList((res) => {
            this.setState({teamList: res.teamList});
        });
    }

    // 获取客户标签
    getCustomerLabelList() {
        let userProperty = 'customer_label_list';
        let customerLabelList = userData.getUserData()[userProperty] || [];
        if(_.get(customerLabelList, '[0]')) {
            this.setState({
                customerLabelList
            });
        }else {
            CustomerPoolAjax.getCustomerLabel({type: 'manager'}).then((res) => {
                let customerLabelList = _.isArray(res.result) ? res.result : [];
                this.setState({customerLabelList});
                // 保存到userData中
                userData.setUserData(userProperty, customerLabelList);
            }, (err) => {

            });
        }
    }

    // 获取客户池配置
    getCustomerPoolConfigs(lastId) {
        if(this.state.total === 0) {
            this.setState({isCustomerConfigsLoading: true});
        }

        let queryObj = {
            page_size: 50
        };

        if (lastId) {
            queryObj.sort_id = lastId;
        }

        CustomerPoolAjax.getCustomerPoolConfigs(queryObj).then((res) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            let customerPoolConfigs = this.state.customerPoolConfigs.concat(_.get(res,'list', []));
            let defaultRuleConfig = this.state.defaultRuleConfig;
            let defaultChecked = this.state.defaultChecked;
            if(_.isEmpty(this.state.defaultRuleConfig)) {
                defaultRuleConfig = _.find(customerPoolConfigs, config => this.isDefaultRuleConfig(config));
                customerPoolConfigs = _.filter(customerPoolConfigs, config => !this.isDefaultRuleConfig(config));
                defaultChecked = !_.get(defaultRuleConfig,'show_my_customers', undefined);
            }
            let total = _.get(res,'total', 0);

            this.setState({
                isCustomerConfigsLoading: false,
                defaultRuleConfig,
                defaultChecked,
                errMsg: '',
                customerPoolConfigs,
                total: total > 0 ? total - 1 : 0
            });
        }, (errorMsg) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.setState({
                isCustomerConfigsLoading: false,
                errMsg: errorMsg || Intl.get('crm.pool.get.rule.configs.faild', '获取规则配置失败')
            });
        });
    }

    //是否是默认客户池配置
    isDefaultRuleConfig = (config) => {
        let organizationId = _.get(userData.getUserData(), 'organization.id');
        //默认客户池规则id
        let defaultRuleConfigId = organizationId + '_customerpool_config';
        return config.id === defaultRuleConfigId || config.team_id === organizationId;
    };

    addRule = () => {
        this.setState({isAddFormShow: true}, () => {
            GeminiScrollbar.scrollTo(ReactDOM.findDOMNode(this.refs.geminiScrollbarRef), 0);
        });
    };

    hideAddRule = () => {
        this.setState({isAddFormShow: false});
    };

    saveCustomerRuleBasicInfo = (type, saveObj, successFunc, errorFunc) => {
        if(type !== FORM_TYPE.DEFAULT) {
            // 处理数据
            saveObj.team_range = _.filter(saveObj.team_range, range => {
                let isAllNull = _.isEmpty(range.team_id)
                    && _.isEmpty(range.team_name)
                    && _.isEmpty(range.customer_label)
                    && _.isEmpty(range.labels);
                if(isAllNull) {
                    return false;
                }
                return true;
            });
        }

        if(type === FORM_TYPE.ADD) {//添加规则
            CustomerPoolAjax.addCustomerPoolConfig(saveObj).then((res) => {
                message.success(Intl.get('crm.216', '添加成功'));
                let {customerPoolConfigs, total} = this.state;
                customerPoolConfigs.unshift(res);
                total++;
                this.setState({
                    customerPoolConfigs,
                    total,
                    isAddFormShow: false,
                });
            }, (errorMsg) => {
                _.isFunction(errorFunc) && errorFunc(errorMsg);
            });
        }else if(_.includes([FORM_TYPE.EDIT, FORM_TYPE.DEFAULT], type)) {//编辑规则
            CustomerPoolAjax.updateCustomerPoolConfig(saveObj).then((res) => {
                if(_.isEqual(res, true)) {
                    message.success(Intl.get('crm.218', '修改成功'));
                    if(type === FORM_TYPE.EDIT) {//编辑规则
                        let {customerPoolConfigs} = this.state;
                        let curRuleIndex = _.findIndex(customerPoolConfigs, rule => rule.id === saveObj.id);
                        let curRule = customerPoolConfigs[curRuleIndex];
                        delete curRule.isEditting;
                        curRule = {...curRule, ...saveObj};
                        customerPoolConfigs[curRuleIndex] = curRule;
                        this.setState({
                            customerPoolConfigs
                        }, () => {
                            _.isFunction(successFunc) && successFunc();
                        });
                    }else{//编辑默认规则
                        _.isFunction(successFunc) && successFunc();
                    }
                }else {
                    _.isFunction(errorFunc) && errorFunc(Intl.get('crm.219', '修改失败'));
                }
            }, (errorMsg) => {
                _.isFunction(errorFunc) && errorFunc(errorMsg || Intl.get('crm.219', '修改失败'));
            });
        }
    };

    handleEditRule = (index, operator, id) => {
        let customerPoolConfigs = this.state.customerPoolConfigs;
        let curRuleConfig = customerPoolConfigs[index];

        switch (operator) {
            // 编辑规则
            case RULE_CONFIG_OPERATOR.EDIT:
                curRuleConfig.isEditting = true;
                customerPoolConfigs[index] = curRuleConfig;
                this.setState({customerPoolConfigs});
                break;
            // 取消编辑规则
            case RULE_CONFIG_OPERATOR.CANCEL:
                curRuleConfig.isEditting = false;
                customerPoolConfigs[index] = curRuleConfig;
                this.setState({customerPoolConfigs});
                break;
            // 删除规则
            case RULE_CONFIG_OPERATOR.DELETE:
                this.deleteCustomerPoolConfig(id);
                break;
        }
    };

    deleteCustomerPoolConfig = (id) => {
        let customerPoolConfigs = this.state.customerPoolConfigs;
        let curRuleIndex = _.findIndex(customerPoolConfigs, rule => rule.id === id);
        let curRule = customerPoolConfigs[curRuleIndex];

        curRule.isEditting = false;
        curRule.isDelete = true;
        customerPoolConfigs[curRuleIndex] = curRule;
        this.setState({customerPoolConfigs});
        let errorFunc = (errorMsg) => {
            message.error(errorMsg || Intl.get('crm.139', '删除失败'));
            let curRuleIndex = _.findIndex(customerPoolConfigs, rule => rule.id === id);
            let curRule = customerPoolConfigs[curRuleIndex];

            delete curRule.isEditting;
            delete curRule.isDelete;
            customerPoolConfigs[curRuleIndex] = curRule;
            this.setState({customerPoolConfigs});
        };
        CustomerPoolAjax.deleteCustomerPoolConfig({id}).then((res) => {
            if(_.isEqual(res, true)) {
                message.success(Intl.get('crm.138', '删除成功'));

                let curRuleIndex = _.findIndex(customerPoolConfigs, rule => rule.id === id);
                customerPoolConfigs.splice(curRuleIndex, 1);
                this.setState({customerPoolConfigs, total: this.state.total - 1});
            }else {
                errorFunc();
            }
        }, errorFunc);
    };

    handleScrollBottom = () => {
        let length = this.state.customerPoolConfigs.length;
        if (length < this.state.total) {
            let lastId = this.state.customerPoolConfigs[length - 1].id;
            this.getCustomerPoolConfigs(lastId);
        } else if (length === this.state.total) {
            this.setState({
                listenScrollBottom: false
            });
        }
    };

    handleEditDefaultRule = (type) => {
        if(type === RULE_CONFIG_OPERATOR.EDIT) {
            this.setState({
                isDefaultEdit: true
            });
        }else {
            this.setState({
                isDefaultEdit: false,
                defaultChecked: !_.get(this.state.defaultRuleConfig,'show_my_customers')
            });
        }
    };


    onDefaultRuleChange = (e) => {
        let checked = e.target.checked;
        this.setState({defaultChecked: checked});
    };

    handleDefaultSubmit = () => {
        let saveObj = {
            id: this.state.defaultRuleConfig.id,
            show_my_customers: !this.state.defaultChecked,
        };
        this.setState({isDefaultLoading: true});
        let successFunc = () => {
            let {defaultChecked, defaultRuleConfig} = this.state;
            defaultRuleConfig.show_my_customers = !defaultChecked;
            this.setState({
                isDefaultLoading: false,
                defaultErrMsg: '',
                isDefaultEdit: false,
                defaultRuleConfig
            });
        };
        let errorFunc = (errorMsg) => {
            this.setState({
                isDefaultLoading: false,
                defaultErrMsg: errorMsg
            });
        };
        this.saveCustomerRuleBasicInfo(FORM_TYPE.DEFAULT, saveObj,successFunc,errorFunc);
    };

    // 渲染默认规则
    renderDefaultRuleForm = () => {
        const defaultOptions = _.map(DEFAULT_VISIBLE_RANGE_MAPS, item => {
            return <Option key={item.value} value={item.value}>{item.name}</Option>;
        });
        // 自己释放的可见，true: 可见，false: 不可见
        let showMyCustomers = _.get(this.state.defaultRuleConfig, 'show_my_customers', undefined);
        // 展示时，可见时不展示，不可见时展示
        let text = showMyCustomers ? '' : ` (${Intl.get('crm.customer.pool.rule.own.visible', '自己释放的自己不可见')})`;
        return (
            <div data-tracename="默认客户池配置">
                <div className="default-item-content">
                    <span className='customer-pool__label'>{Intl.get('crm.customer.visible.range', '可见范围')}:</span>
                    <BasicEditSelectField
                        width={EDIT_WIDTH}
                        id={''}
                        displayText={DEFAULT_VISIBLE_RANGE_MAPS[1].name + text}
                        value={DEFAULT_VISIBLE_RANGE_MAPS[1].value}
                        field="range"
                        selectOptions={defaultOptions}
                        hasEditPrivilege={false}
                        placeholder={Intl.get('crm.customer.pool.select.range', '请选择可见范围')}
                        saveEditSelect={this.saveCustomerRuleBasicInfo.bind(this, 'team_id')}
                    />
                    {this.state.isDefaultEdit ? (
                        <div>
                            <Checkbox
                                dataTracename="释放设置checkbox按钮"
                                className="visible-checkbox"
                                checked={this.state.defaultChecked}
                                onChange={this.onDefaultRuleChange}
                                disabled={this.state.isDefaultLoading}
                            >{Intl.get('crm.customer.pool.rule.own.visible', '自己释放的自己不可见')}</Checkbox>
                        </div>
                    ) : null}
                </div>
                <div className="default-item-content">
                    <span className='customer-pool__label'>{Intl.get('crm.customer.pool.source', '客户来源')}:</span>
                    <span className="customer-pool__text">{Intl.get('crm.customer.pool.unlimited', '不限')}</span>
                </div>
            </div>
        );
    };

    // 渲染已配置的规则
    renderConfigBlock = (visibleTeamList) => {
        let customerPoolConfigs = this.state.customerPoolConfigs;
        let cosutomerPoolConfigsLength = _.get(customerPoolConfigs, 'length');

        if(this.state.isCustomerConfigsLoading) {
            return <Spinner/>;
        }else if(cosutomerPoolConfigsLength) {

            return (
                <div className="customer-rules-content">
                    {
                        _.map(customerPoolConfigs, (config, index) => {
                            let visibleTeamlist = _.cloneDeep(visibleTeamList);
                            visibleTeamlist.unshift({
                                group_id: config.team_id,
                                group_name: config.team_name
                            });
                            return (
                                <CustomerPoolRuleForm
                                    key={config.id}
                                    isEdit={config.isEditting}
                                    formType={FORM_TYPE.EDIT}
                                    curCustomerRule={config}
                                    teamList={this.state.teamList}
                                    visibleTeamList={visibleTeamlist}
                                    customerLabelList={this.state.customerLabelList}
                                    handleSubmit={this.saveCustomerRuleBasicInfo.bind(this, FORM_TYPE.EDIT)}
                                    handleEdit={this.handleEditRule.bind(this, index, RULE_CONFIG_OPERATOR.EDIT)}
                                    handleCancel={this.handleEditRule.bind(this, index, RULE_CONFIG_OPERATOR.CANCEL)}
                                    handleDelete={this.handleEditRule.bind(this, index, RULE_CONFIG_OPERATOR.DELETE, config.id)}
                                />
                            );
                        })
                    }
                </div>
            );
        }else {
            return null;
        }
    };

    renderDefaultTitleBlock = () => {
        return (
            <div>
                <span>{Intl.get('crm.customer.pool.rule.name', '{name}客户池', {name: Intl.get('crm.119', '默认')})}</span>
                {this.state.isDefaultEdit ? null : (
                    <DetailEditBtn
                        dataTracename="默认客户池编辑按钮"
                        title={Intl.get('common.edit', '编辑')}
                        onClick={this.handleEditDefaultRule.bind(this, RULE_CONFIG_OPERATOR.EDIT)}
                    />
                )}
            </div>
        );
    };

    render() {
        let contentHeight = $(window).height() - LAYOUT_CONSTS.TITLE_HEIGHT - LAYOUT_CONSTS.TITLE_MARGIN_BOTTOM;
        // 可见范围中设置的团队，其他规则中不能再添加此团队。
        let teamIds = _.map(this.state.customerPoolConfigs, 'team_id');
        let visibleTeamList = _.filter(this.state.teamList, item => {
            return !_.includes(teamIds, item.group_id);
        });

        return (
            <div className="customer-rules-wrapper" style={{height: contentHeight}}>
                <div className="customer-title-wrapper">
                    <span
                        className="customer-title-btn"
                        title={Intl.get('crm.add.customer.pool.rule', '添加规则')}
                        onClick={this.addRule}
                    ><i className="iconfont icon-add"/>{Intl.get('crm.add.customer.pool.rule', '添加规则')}</span>
                </div>
                {this.state.isAddFormShow ? (
                    <div className="customer-rule-add-form">
                        <CustomerPoolRuleForm
                            isEdit
                            isUseGeminiScrollbar
                            formType={FORM_TYPE.ADD}
                            teamList={this.state.teamList}
                            visibleTeamList={visibleTeamList}
                            customerLabelList={this.state.customerLabelList}
                            handleSubmit={this.saveCustomerRuleBasicInfo.bind(this, FORM_TYPE.ADD)}
                            handleCancel={this.hideAddRule}
                        />
                    </div>
                ) : null}
                <GeminiScrollbar
                    ref="geminiScrollbarRef"
                    handleScrollBottom={this.handleScrollBottom}
                    listenScrollBottom={this.state.listenScrollBottom}
                >
                    <div className="customer-rules-scroll-wrapper clearfix">
                        {this.renderConfigBlock(visibleTeamList)}
                        {
                            _.isEmpty(this.state.defaultRuleConfig) ? null : (
                                <DetailCard
                                    title={this.renderDefaultTitleBlock()}
                                    isEdit={this.state.isDefaultEdit}
                                    loading={this.state.isDefaultLoading}
                                    saveErrorMsg={this.state.defaultErrMsg}
                                    content={this.renderDefaultRuleForm()}
                                    handleSubmit={this.handleDefaultSubmit}
                                    handleCancel={this.handleEditDefaultRule.bind(this,RULE_CONFIG_OPERATOR.CANCEL)}
                                    className='customer-rule-default-wrapper'
                                />
                            )
                        }
                    </div>
                </GeminiScrollbar>
            </div>
        );
    }
}

CustomerPoolVisibleRule.propTypes = {

};
export default CustomerPoolVisibleRule;