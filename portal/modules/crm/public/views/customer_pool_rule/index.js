/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/08/26.
 */
// 客户池规则设置
import '../../css/customer-pool-rule.less';
import {Select, message} from 'antd';
const Option = Select.Option;
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import DetailCard from 'CMP_DIR/detail-card';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import Spinner from 'CMP_DIR/spinner';
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
    EDIT: 'edit'
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
    {name: Intl.get('crm.customer.pool.default.visible.range', '客户池原始团队'), value: 'default'}
];

class CustomerPoolRule extends React.Component{
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
            this.setState({
                isCustomerConfigsLoading: false,
                errMsg: '',
                customerPoolConfigs,
                total: _.get(res,'total', 0)
            });
        }, (errorMsg) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.setState({
                isCustomerConfigsLoading: false,
                errMsg: errorMsg || Intl.get('crm.get.customer.pool.rule.faild', '获取客户池配置失败！！！')
            });
        });
    }

    closeRightPanel = () => {
        this.props.closeRightPanel();
    };

    addRule = () => {
        this.setState({isAddFormShow: true});
    };
    hideAddRule = () => {
        this.setState({isAddFormShow: false});
    };

    saveCustomerRuleBasicInfo = (type, saveObj, successFunc, errorFunc) => {
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
        }else if(type === FORM_TYPE.EDIT) {//编辑规则
            CustomerPoolAjax.updateCustomerPoolConfig(saveObj).then((res) => {
                message.success(Intl.get('crm.218', '修改成功'));
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
        CustomerPoolAjax.deleteCustomerPoolConfig({id}).then((res) => {
            message.success(Intl.get('crm.138', '删除成功'));

            let curRuleIndex = _.findIndex(customerPoolConfigs, rule => rule.id === id);
            customerPoolConfigs.splice(curRuleIndex, 1);
            this.setState({customerPoolConfigs});
        }, (errorMsg) => {
            message.error(errorMsg || Intl.get('crm.139', '删除失败'));
            let curRuleIndex = _.findIndex(customerPoolConfigs, rule => rule.id === id);
            let curRule = customerPoolConfigs[curRuleIndex];

            delete curRule.isEditting;
            delete curRule.isDelete;
            customerPoolConfigs[curRuleIndex] = curRule;
            this.setState({customerPoolConfigs});
        });
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

    renderTitleBlock = () => {
        return (
            <div className="customer-title-wrapper">
                <span>{Intl.get( 'crm.customer.rule.name', '规则设置')}</span>
                <span
                    className="customer-title-btn"
                    title={Intl.get('crm.add.customer.pool.rule', '添加规则')}
                    onClick={this.addRule}
                ><i className="iconfont icon-add"/>{Intl.get('crm.add.customer.pool.rule', '添加规则')}</span>
            </div>
        );
    };

    // 渲染默认规则
    renderDefaultRuleForm = () => {
        const defaultOptions = _.map(DEFAULT_VISIBLE_RANGE_MAPS, item => {
            return <Option key={item.value} value={item.value}>{item.name}</Option>;
        });
        return (
            <div>
                <div className="default-item-content">
                    <span className='customer-pool__label'>{Intl.get('crm.customer.visible.range', '可见范围')}:</span>
                    <BasicEditSelectField
                        width={EDIT_WIDTH}
                        id={''}
                        displayText={DEFAULT_VISIBLE_RANGE_MAPS[1].name + ` (${Intl.get('crm.customer.pool.rule.default.tip', '没有原始团队时，默认所有人可见')})`}
                        value={DEFAULT_VISIBLE_RANGE_MAPS[1].value}
                        field="range"
                        selectOptions={defaultOptions}
                        hasEditPrivilege={false}
                        placeholder={Intl.get('crm.customer.pool.select.range', '请选择可见范围')}
                        saveEditSelect={this.saveCustomerRuleBasicInfo.bind(this, 'team_id')}
                    />
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

    renderFormContent = () => {
        let contentHeight = $(window).height() - LAYOUT_CONSTS.TITLE_HEIGHT - LAYOUT_CONSTS.TITLE_MARGIN_BOTTOM;
        // 可见范围中设置的团队，其他规则中不能再添加此团队。
        let teamIds = _.map(this.state.customerPoolConfigs, 'team_id');
        let visibleTeamList = _.filter(this.state.teamList, item => {
            return !_.includes(teamIds, item.group_id);
        });

        return (
            <div className="customer-rules-wrapper" style={{height: contentHeight}}>
                <GeminiScrollbar
                    handleScrollBottom={this.handleScrollBottom}
                    listenScrollBottom={this.state.listenScrollBottom}
                >
                    <div className="customer-rules-scroll-wrapper clearfix">
                        {this.state.isAddFormShow ? (
                            <CustomerPoolRuleForm
                                isEdit
                                formType={FORM_TYPE.ADD}
                                teamList={this.state.teamList}
                                visibleTeamList={visibleTeamList}
                                customerLabelList={this.state.customerLabelList}
                                handleSubmit={this.saveCustomerRuleBasicInfo.bind(this, FORM_TYPE.ADD)}
                                handleCancel={this.hideAddRule}
                            />
                        ) : null}
                        {this.renderConfigBlock(visibleTeamList)}
                        <DetailCard
                            title={Intl.get('crm.customer.pool.rule.name', '{name}客户池', {name: Intl.get('crm.119', '默认')})}
                            titleBottomBorderNone
                            content={this.renderDefaultRuleForm()}
                            className='customer-rule-default-wrapper'
                        />
                    </div>
                </GeminiScrollbar>
            </div>
        );
    };

    render() {
        return (
            <RightPanelModal
                className="customer-pool-rules-container"
                isShowMadal={this.props.isShowModal}
                isShowCloseBtn
                onClosePanel={this.closeRightPanel}
                title={this.renderTitleBlock()}
                content={this.renderFormContent()}
                dataTracename="客户池规则设置"
            />
        );
    }
}
CustomerPoolRule.defaultProps = {
    closeRightPanel: function() {},
    isShowModal: false,
};
CustomerPoolRule.propTypes = {
    isShowModal: PropTypes.bool,
    closeRightPanel: PropTypes.func,

};
export default CustomerPoolRule;
