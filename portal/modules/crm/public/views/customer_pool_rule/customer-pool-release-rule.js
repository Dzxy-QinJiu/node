/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/12.
 */
//客户池释放规则
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import CustomerPoolReleaseRuleForm from './customer-pool-release-rule-form';
import Spinner from 'CMP_DIR/spinner';
import { DetailEditBtn } from 'CMP_DIR/rightPanel';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import {getMyTeamTreeAndFlattenList} from 'PUB_DIR/sources/utils/common-data-util';
import userData from 'PUB_DIR/sources/user-data';
import CustomerPoolAjax from '../../ajax/customer-pool-configs';
import DetailCard from 'MOD_DIR/crm/public/views/customer_pool_rule/customer-pool-visible-rule';
import { Checkbox, message } from 'antd';

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

class CustomerPoolReleaseRule extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isShowAddForm: false,//是否展示添加释放规则
            isLoading: false,//是否在获取释放规则信息中
            errMsg: '',
            listenScrollBottom: true,
            total: 0,
            teamList: [],
            defaultRuleConfig: {},//默认释放规则
            releaseRuleConfigs: [],//释放规则配置信息列表
        };
    }

    componentDidMount() {
        this.getCustomerPoolReleaseConfigs();
        this.getTeamTreeList();
    }

    // 获取团队数据
    getTeamTreeList() {
        getMyTeamTreeAndFlattenList((res) => {
            this.setState({teamList: res.teamList});
        });
    }

    // 获取客户池释放规则配置
    getCustomerPoolReleaseConfigs(lastId) {
        if(this.state.total === 0) {
            this.setState({isLoading: true});
        }

        let queryObj = {
            page_size: 50
        };

        if (lastId) {
            queryObj.sort_id = lastId;
        }

        CustomerPoolAjax.getCrpAutoReleaseConfigs(queryObj).then((res) => {
            let releaseRuleConfigs = this.state.releaseRuleConfigs.concat(_.get(res,'list', []));
            let defaultRuleConfig = this.state.defaultRuleConfig;
            if(_.isEmpty(this.state.defaultRuleConfig)) {
                defaultRuleConfig = _.find(releaseRuleConfigs, config => this.isDefaultRuleConfig(config));
                releaseRuleConfigs = _.filter(releaseRuleConfigs, config => !this.isDefaultRuleConfig(config));
                defaultRuleConfig.team_name = Intl.get('crm.119', '默认');
            }
            let total = _.get(res,'total', 0);

            this.setState({
                isLoading: false,
                defaultRuleConfig,
                errMsg: '',
                releaseRuleConfigs,
                total: total > 0 ? total - 1 : 0,//需要减去默认规则
            });
        }, (errorMsg) => {
            this.setState({
                isLoading: false,
                errMsg: errorMsg || Intl.get('crm.pool.get.rule.configs.faild', '获取规则配置失败')
            });
        });
    }

    //是否是默认释放规则
    isDefaultRuleConfig = (config) => {
        let organizationId = _.get(userData.getUserData(), 'organization.id');
        //默认释放规则id
        let defaultRuleConfigId = organizationId + '_customer_autorelease_config';
        return config.id === defaultRuleConfigId || config.team_id === organizationId;
    };

    handleScrollBottom = () => {
        let length = this.state.releaseRuleConfigs.length;
        if (length < this.state.total) {
            let lastId = this.state.releaseRuleConfigs[length - 1].id;
            this.getCustomerPoolReleaseConfigs(lastId);
        } else if (length === this.state.total) {
            this.setState({
                listenScrollBottom: false
            });
        }
    };

    handleEditDefaultRule = (type) => {
        let { defaultRuleConfig } = this.state;
        if(type === RULE_CONFIG_OPERATOR.EDIT) {
            defaultRuleConfig.isEditting = true;
        }else {
            defaultRuleConfig.isEditting = false;
        }
        this.setState({ defaultRuleConfig });
    };

    addRule = () => {
        this.setState({isShowAddForm: true}, () => {
            GeminiScrollbar.scrollTo(this.refs.scrolltoTop, 0);
        });
    };

    hideAddRule = () => {
        this.setState({isShowAddForm: false});
    };

    saveCustomerRuleBasicInfo = (type, saveObj, successFunc, errorFunc) => {
        if(type === FORM_TYPE.ADD) {//添加规则
            CustomerPoolAjax.addCrpAutoReleaseConfig(saveObj).then((res) => {
                message.success(Intl.get('crm.216', '添加成功'));
                let {releaseRuleConfigs, total} = this.state;
                releaseRuleConfigs.unshift(res);
                total++;
                this.setState({
                    releaseRuleConfigs,
                    total,
                    isShowAddForm: false,
                });
            }, (errorMsg) => {
                _.isFunction(errorFunc) && errorFunc(errorMsg);
            });
        }else if(_.includes([FORM_TYPE.EDIT, FORM_TYPE.DEFAULT], type)) {//编辑规则
            CustomerPoolAjax.updateCrpAutoReleaseConfig(saveObj).then((res) => {
                if(_.isEqual(res, true)) {
                    message.success(Intl.get('crm.218', '修改成功'));
                    if(type === FORM_TYPE.EDIT) {//编辑规则
                        let {releaseRuleConfigs} = this.state;
                        let curRuleIndex = _.findIndex(releaseRuleConfigs, rule => rule.id === saveObj.id);
                        let curRule = releaseRuleConfigs[curRuleIndex];
                        delete curRule.isEditting;
                        curRule = {...curRule, ...saveObj};
                        releaseRuleConfigs[curRuleIndex] = curRule;
                        this.setState({
                            releaseRuleConfigs
                        }, () => {
                            _.isFunction(successFunc) && successFunc();
                        });
                    }else{//编辑默认规则
                        let {defaultRuleConfig} = this.state;
                        defaultRuleConfig = {...defaultRuleConfig, ...saveObj};
                        defaultRuleConfig.isEditting = false;
                        this.setState({
                            defaultRuleConfig
                        }, () => {
                            _.isFunction(successFunc) && successFunc();
                        });
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
        let releaseRuleConfigs = this.state.releaseRuleConfigs;
        let curRuleConfig = releaseRuleConfigs[index];

        switch (operator) {
            // 编辑规则
            case RULE_CONFIG_OPERATOR.EDIT:
                _.each(releaseRuleConfigs, (config, idx) => {
                    config.isEditting = index === idx;
                });
                break;
            // 取消编辑规则
            case RULE_CONFIG_OPERATOR.CANCEL:
                curRuleConfig.isEditting = false;
                releaseRuleConfigs[index] = curRuleConfig;
                break;
            // 删除规则
            case RULE_CONFIG_OPERATOR.DELETE:
                this.deleteReleaseConfig(id);
                break;
        }
        this.setState({releaseRuleConfigs});
    };

    deleteReleaseConfig = (id) => {
        let releaseRuleConfigs = this.state.releaseRuleConfigs;
        let curRuleIndex = _.findIndex(releaseRuleConfigs, rule => rule.id === id);
        let curRule = releaseRuleConfigs[curRuleIndex];

        curRule.isEditting = false;
        curRule.isDelete = true;
        releaseRuleConfigs[curRuleIndex] = curRule;
        this.setState({releaseRuleConfigs});
        let errorFunc = (errorMsg) => {
            message.error(errorMsg || Intl.get('crm.139', '删除失败'));
            let curRuleIndex = _.findIndex(releaseRuleConfigs, rule => rule.id === id);
            let curRule = releaseRuleConfigs[curRuleIndex];

            delete curRule.isEditting;
            delete curRule.isDelete;
            releaseRuleConfigs[curRuleIndex] = curRule;
            this.setState({releaseRuleConfigs});
        };
        CustomerPoolAjax.deleteCrpAutoReleaseConfig({id}).then((res) => {
            if(_.isEqual(res, true)) {
                message.success(Intl.get('crm.138', '删除成功'));

                let curRuleIndex = _.findIndex(releaseRuleConfigs, rule => rule.id === id);
                releaseRuleConfigs.splice(curRuleIndex, 1);
                this.setState({releaseRuleConfigs, total: this.state.total - 1});
            }else {
                errorFunc();
            }
        }, errorFunc);
    };

    //渲染已配置的释放规则
    renderConfigBlock = (visibleTeamList) => {
        let releaseRuleConfigs = this.state.releaseRuleConfigs;
        let releaseRuleConfigsLength = _.get(releaseRuleConfigs, 'length');

        if(this.state.isLoading) {
            return <Spinner/>;
        } if(releaseRuleConfigsLength) {
            return (
                <div className="customer-rules-content">
                    {
                        _.map(releaseRuleConfigs, (config, index) => {
                            let visibleTeamlist = _.cloneDeep(visibleTeamList);
                            visibleTeamlist.unshift({
                                group_id: config.team_id,
                                group_name: config.team_name
                            });
                            return (
                                <CustomerPoolReleaseRuleForm
                                    key={config.id}
                                    isEdit={config.isEditting}
                                    showBtn={!this.state.isShowAddForm}
                                    formType={FORM_TYPE.EDIT}
                                    curRule={config}
                                    visibleTeamList={visibleTeamlist}
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
        }
        return null;
    };

    // 渲染默认规则
    renderDefaultRuleForm = () => {
        let { defaultRuleConfig } = this.state;
        return (
            <div className='default-config-rule-wrapper' data-tracename="默认释放规则配置">
                <CustomerPoolReleaseRuleForm
                    isEdit={defaultRuleConfig.isEditting}
                    formType={FORM_TYPE.EDIT}
                    curRule={defaultRuleConfig}
                    isDefaultRuleConfig={this.isDefaultRuleConfig}
                    handleSubmit={this.saveCustomerRuleBasicInfo.bind(this, FORM_TYPE.DEFAULT)}
                    handleEdit={this.handleEditDefaultRule.bind(this, RULE_CONFIG_OPERATOR.EDIT)}
                    handleCancel={this.handleEditDefaultRule.bind(this, RULE_CONFIG_OPERATOR.CANCEL)}
                />
            </div>
        );
    };

    render() {
        let contentHeight = $(window).height() - LAYOUT_CONSTS.TITLE_HEIGHT - LAYOUT_CONSTS.TITLE_MARGIN_BOTTOM;
        // 适用范围中设置的团队，其他规则中不能再添加此团队。
        let teamIds = _.map(this.state.releaseRuleConfigs, 'team_id');
        let visibleTeamList = _.filter(this.state.teamList, item => {
            return !_.includes(teamIds, item.group_id);
        });

        return (
            <div className="customer-rules-wrapper" style={{height: contentHeight}} ref="scrolltoTop">
                <div className="customer-title-wrapper">
                    <span
                        className="customer-title-btn"
                        title={Intl.get('crm.add.customer.pool.rule', '添加规则')}
                        onClick={this.addRule}
                    ><i className="iconfont icon-add"/>{Intl.get('crm.add.customer.pool.rule', '添加规则')}</span>
                </div>
                <GeminiScrollbar
                    handleScrollBottom={this.handleScrollBottom}
                    listenScrollBottom={this.state.listenScrollBottom}
                >
                    <div className="customer-rules-scroll-wrapper clearfix">
                        {this.state.isShowAddForm ? (
                            <CustomerPoolReleaseRuleForm
                                isEdit
                                formType={FORM_TYPE.ADD}
                                teamList={this.state.teamList}
                                visibleTeamList={visibleTeamList}
                                handleSubmit={this.saveCustomerRuleBasicInfo.bind(this, FORM_TYPE.ADD)}
                                handleCancel={this.hideAddRule}
                            />
                        ) : null}
                        {this.renderConfigBlock(visibleTeamList)}
                        {_.isEmpty(this.state.defaultRuleConfig) ? null : this.renderDefaultRuleForm()}
                    </div>
                </GeminiScrollbar>
            </div>
        );
    }
}

CustomerPoolReleaseRule.propTypes = {

};
export default CustomerPoolReleaseRule;