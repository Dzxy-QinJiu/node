var Spinner = require('CMP_DIR/spinner');
var Icon = require('antd').Icon;
var Alert = require('antd').Alert;
var AlertTimer = require('CMP_DIR/alert-timer');
import IpConfig from './views/ip-config';
import RealmConfig from './views/realm-config';
import TeleConfig from './views/tele-config';
import Trace from 'LIB_DIR/trace';
import CompetingProductManage from './views/competing-product';
import CustomerStageManage from './views/customer-stage';
import SalesRoleManage from './views/sales-role-manage';
import IntegratedClueManage from './views/integrated-clue';
var PrivilegeChecker = require('CMP_DIR/privilege/checker').PrivilegeChecker;
var GeminiScrollBar = require('CMP_DIR/react-gemini-scrollbar');
require('./css/index.less');
const auths = {
    INDUSTRY: 'GET_CONFIG_INDUSTRY',//获取行业配置的权限
    IP: 'GET_CONFIG_IP',//获取IP配置的权限
    TELECONFIG: 'CUSTOMER_INVALID_PHONE_GET',// 获取客服电话权限
    COMPETING_PRODUCT: 'CRM_COMPETING_PRODUCT',//竞品管理权限
    CRM_CUSTOMER_CONF_LABEL: 'CRM_CUSTOMER_CONF_LABEL',//客户阶段管理权限
    TEAM_ROLE_MANAGE: 'TEAM_ROLE_MANAGE',//销售角色管理权限
    STRATEGY: 'GET_CONFIG_PWD_STRATEGY',// 获取安全域密码策略
    INTEGRATION_MANAGE: 'DATA_INTEGRATION_MANAGE'//获取线索集成列表权限
};

class ConfigManage extends React.Component {
    state = {
        //行业标签列表
        TagLists: [],
        //点击行业添加按钮的loading效果是否显示 否 -1 是 0
        isAddloading: -1,
        //当前正在删除的标签的id值 默认 -1
        DeletingItemId: -1,
        //点击刷新按钮的loading效果是否显示  否 -1 是 0
        isRefreshLoading: 0,
        //能否正常获取数据 否 -1 是 0
        isGetInforcorrect: -1,
        //加载失败的提示信息
        getErrMsg: '',
        //添加失败的信息
        addErrMsg: '',
        // 删除行业失败
        deleteErrMsg: '',
    };

    //获取初始行业列表
    getInitialData = () => {
        var _this = this;
        var page_size = 1000;
        $.ajax({
            url: '/rest/industries',
            type: 'get',
            dateType: 'json',
            data: {page_size: page_size},
            success: function(Msg) {
                _this.setState({
                    TagLists: Msg,
                    isRefreshLoading: -1,
                    isGetInforcorrect: 0

                });
            },
            error: function(errorMsg) {
                _this.setState({
                    isRefreshLoading: -1,
                    isGetInforcorrect: -1,
                    getErrMsg: errorMsg.responseJSON
                });
            }
        });

    };
    componentWillMount() {
        this.getInitialData();
    }

    //点击刷新按钮
    getRefreshInfo = (e) => {
        this.setState({
            isRefreshLoading: 0,
            TagLists: []
        });
        this.getInitialData();
    };

    //删除行业标签
    handleDeleteItem = (item) => {
        var _this = this;
        //当前正在删除的标签的id
        _this.setState({
            DeletingItemId: item.id
        });
        $.ajax({
            url: '/rest/delete_industries/' + item.id,
            type: 'delete',
            dateType: 'json',
            success: function(result) {
                //获取正在删除标签在数组中的下标
                var delIndex = '';
                _this.state.TagLists.forEach(function(tag, index) {
                    if (tag.id === item.id) {
                        delIndex = index;
                    }
                });
                //在数组中删除当前正在删除的标签
                _this.state.TagLists.splice(delIndex, 1);
                _this.setState({
                    DeletingItemId: -1,
                    TagLists: _this.state.TagLists
                });
            },
            error: function(errorInfo) {
                _this.setState({
                    DeletingItemId: -1,
                    deleteErrMsg: errorInfo.responseJSON
                });
            }
        });

    };

    //增加行业标签
    handleSubmit = (e) => {
        Trace.traceEvent(e, '点击添加行业按钮');
        var _this = this;
        e.preventDefault();
        //输入的行业名称去左右空格
        var text = _.trim(_this.refs.edit.value);
        // 判断是否是空格
        if(!text) {
            return;
        }
        //避免短时间多次点击添加按钮，将按钮类型改为button
        $('#addIndustrySaveBtn').attr({'disabled': 'disabled'});
        //显示添加的loading效果
        _this.setState({
            isAddloading: 0
        });
        $.ajax({
            url: '/rest/add_industries',
            type: 'post',
            dateType: 'json',
            data: {industry: text},
            success: function(result) {
                //数组开头添加输入的标签
                _this.state.TagLists.unshift(result);
                _this.setState({
                    TagLists: _this.state.TagLists,
                    isAddloading: -1
                });
                $('#addIndustrySaveBtn').removeAttr('disabled');
                _this.refs.edit.value = '';

            },
            error: function(errorInfo) {
                _this.setState({
                    isAddloading: -1,
                    addErrMsg: errorInfo.responseJSON || Intl.get('config.manage.add.industry.error','添加行业失败')
                });
            }
        });

    };

    //增加行业失败
    handleAddIndustryFail = () => {
        var hide = () => {
            this.setState({
                addErrMsg: '',
                isAddloading: -1
            });
            $('#addIndustrySaveBtn').removeAttr('disabled');
        };
        return (
            <div className="add-config-fail">
                <AlertTimer
                    time={4000}
                    message={this.state.addErrMsg}
                    type="error"
                    showIcon
                    onHide={hide}
                />
            </div>
        );
    };

    handleDeleteIndustryFail = () => {
        var hide = () => {
            this.setState({
                deleteErrMsg: ''
            });
        };
        return (
            <div className="delete_ip_config_err_tips">
                <AlertTimer
                    time={4000}
                    message={this.state.deleteErrMsg}
                    type="error"
                    showIcon
                    onHide={hide}
                />
            </div>
        );
    };
    renderIndutryConfig = () => {
        var TagLists = this.state.TagLists;
        return (
            <div className="box" data-tracename="行业配置">
                <div className="box-title">
                    <ReactIntl.FormattedMessage id="config.manage.industry.manage"
                        defaultMessage="行业管理"/>&nbsp;&nbsp;
                    <span
                        onClick={this.getRefreshInfo.bind(this)}
                        className="refresh"
                        data-tracename="点击获取行业刷新按钮"
                    >
                        <Icon type="reload" title={Intl.get('config.manage.reload.industry', '重新获取行业')}/>
                    </span>
                    {this.state.deleteErrMsg !== '' ? this.handleDeleteIndustryFail() : null}
                </div>
                <div className="box-body">
                    {this.state.isGetInforcorrect === -1 ? (
                        (this.state.isRefreshLoading === -1 ?
                            <Alert type="error" showIcon message={this.state.getErrMsg}/>
                            : <Spinner/>)
                    ) : (
                        TagLists.length === 0 && this.state.isRefreshLoading === -1 ?
                            (<Alert type="info" showIcon
                                message={Intl.get('config.manage.no.industry', '暂无行业配置，请添加！')}/>)
                            : (this.state.isRefreshLoading === -1 ? null : <Spinner/>)
                    )}
                    <ul className="mb-taglist">
                        {TagLists.map((item, index) => {
                            return (
                                <li className="mb-tag" key={index}>
                                    <div className="mb-tag-content">
                                        <span className="mb-tag-text">{item.industry}</span>
                                            &nbsp;&nbsp;
                                        <span className="glyphicon glyphicon-remove mb-tag-remove"
                                            onClick={this.handleDeleteItem.bind(this, item)}
                                            data-tracename="点击删除某个行业按钮"
                                        ></span>
                                        { this.state.DeletingItemId === item.id ? (
                                            <span ><Icon type="loading"/></span>
                                        ) : null
                                        }
                                    </div>
                                </li>
                            );
                        }
                        )}
                    </ul>
                </div>
                <div className="box-footer">
                    <form onSubmit={this.handleSubmit}>
                        <div>
                            <input className="mb-input" ref="edit"/>
                            <button className="btn mb-add-button" type="submit" id="addIndustrySaveBtn">
                                <ReactIntl.FormattedMessage id="common.add" defaultMessage="添加"/>
                                {this.state.isAddloading === 0 ?
                                    <Icon type="loading" style={{marginLeft: 12}}/> : (null)}
                            </button>
                        </div>
                        {this.state.addErrMsg !== '' ? this.handleAddIndustryFail() : null}
                    </form>
                </div>
            </div>
        );
    };

    render = () => {
        var height = $(window).height() - $('.topNav').height();
        return (
            <div className="config-manage-container" data-tracename="配置">
                <div className="config-container" style={{height: height}}>
                    <GeminiScrollBar>
                        <PrivilegeChecker check={auths.INDUSTRY}>
                            {this.renderIndutryConfig()}
                        </PrivilegeChecker>
                        <PrivilegeChecker check={auths.IP}>
                            <IpConfig />
                        </PrivilegeChecker>
                        <PrivilegeChecker check={auths.STRATEGY}>
                            <RealmConfig />
                        </PrivilegeChecker>
                        <PrivilegeChecker check={auths.TELECONFIG}>
                            <TeleConfig />
                        </PrivilegeChecker>
                        <PrivilegeChecker check={auths.COMPETING_PRODUCT}>
                            <CompetingProductManage/>
                        </PrivilegeChecker>
                        <PrivilegeChecker check={auths.CRM_CUSTOMER_CONF_LABEL}>
                            <CustomerStageManage/>
                        </PrivilegeChecker>
                        <PrivilegeChecker check={auths.TEAM_ROLE_MANAGE}>
                            <SalesRoleManage/>
                        </PrivilegeChecker>
                        <PrivilegeChecker check={auths.INTEGRATION_MANAGE}>
                            <IntegratedClueManage/>
                        </PrivilegeChecker>
                    </GeminiScrollBar>
                </div>
            </div>
        );
    }
}

module.exports = ConfigManage;

