/**
 * Created by hzl on 2019/10/17.
 */
require('../style/ip-filter.less');
import RightPanelModal from 'CMP_DIR/right-panel-modal';
const Spinner = require('CMP_DIR/spinner');
import {Icon, message, Checkbox } from 'antd';
import NoData from 'CMP_DIR/no-data';
import LoadDataError from 'CMP_DIR/load-data-error';
import DetailCard from 'CMP_DIR/detail-card';
import IpFilterAjax from '../ajax/ip-filter-ajax';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import AddIpForm from './add-ip-form';
import SavedTips from 'CMP_DIR/saved-tips';
import production_manager_privilegeConfig from '../privilege-config';

class IpFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            globalFilterIpList: _.get(props, 'globalFilterIpList'),
            isLoading: false, // 获取ip；列表loading
            errMsg: '',
            isShowAddIp: false, // 是否显示添加ip
            deleteIpId: '', // 删除ip的Id
            isDeletingLoading: false, // 删除loading
            isAddLoading: false, // 添加loading
            filterPrivateIpStatus: '', // 过滤内网网段状态
            setFilterPrivateIpMsg: '', // 设置过滤内网网段的错误信息
            setFilterPrivateResult: '', // 设置过滤内网网段的结果，默认为空，成功：success, 失败：error
        };
    }

    componentDidMount() {
        this.getFilterPrivateIp();
    }

    // 获取过滤内网网段
    getFilterPrivateIp = () => {
        this.setState({
            isLoading: true
        });
        IpFilterAjax.getFilterPrivateIp().then( (result) => {
            this.setState({
                filterPrivateIpStatus: result,
                isLoading: false
            });
        }, (errMsg) => {
            this.setState({
                isLoading: false
            });
        } );
    };


    renderNoDataOrLoadError = () => {
        let getErrMsg = this.state.getErrMsg;

        return (
            <div className="msg-tips">
                {
                    getErrMsg ? (
                        <LoadDataError
                            retryLoadData={this.getRefreshInfo}
                        />
                    ) : (
                        <div className="no-data-tips-operate">
                            <NoData
                                textContent={Intl.get('product.no.data.filter.ip', '暂无数据，请添加')}
                            />
                        </div>
                    )
                }
            </div>
        );
    };

    handleShowAddIp = () => {
        this.setState({
            isShowAddIp: true
        });
    };

    renderDetailTitle = () => {
        return (
            <div className="ip-filter-title">
                <span className="content">
                    {Intl.get('product.global.filter.ip.title', '全部产品统计分析时过滤以下IP：')}
                </span>
                {
                    hasPrivilege(production_manager_privilegeConfig.PRODUCTS_MANAGE) ? (
                        this.state.isShowAddIp ? null : (
                            <span className="operate-btn" onClick={this.handleShowAddIp}>
                                <i className="iconfont icon-plus"></i>
                            </span>
                        )
                    ) : null
                }
            </div>
        );
    };

    // 添加IP
    handleSubmitAddIp = (submitObj) => {
        this.setState({
            isAddLoading: true
        });
        IpFilterAjax.addIp(submitObj).then((result) => {
            this.setState({
                isAddLoading: false,
                isShowAddIp: false
            });
            if (_.isObject(result) && result.id) {
                let globalFilterIpList = this.state.globalFilterIpList;
                globalFilterIpList.unshift(result);
                this.props.updateFilterIpList(globalFilterIpList);
                this.setState({
                    globalFilterIpList: globalFilterIpList
                });
            } else {
                message.error(Intl.get('crm.154', '添加失败！'));
            }
        }, (errMsg) => {
            this.setState({
                isAddLoading: false,
                isShowAddIp: false
            });
            message.error(errMsg || Intl.get('crm.154', '添加失败！'));
        });
    };

    // 取消保存添加的ip
    handleCancelAddIP = () => {
        this.setState({
            isShowAddIp: false
        });
    };

    // 渲染添加IP内容
    renderAddIpContent = () => {
        return (
            <AddIpForm
                handleCancelAddIP={this.handleCancelAddIP}
                handleSubmitAddIp={this.handleSubmitAddIp}
                loading={this.state.isAddLoading}
            />
        );
    };
    // 点击删除IP
    handleDeleteIP = (ipItem) => {
        this.setState({
            deleteIpId: ipItem.id
        });
    };

    // 确认删除IP
    handleConfirmDeleteIp = (item, event) => {
        event && event.stopPropagation();
        const id = item.id;
        this.setState({
            isDeletingLoading: true
        });
        IpFilterAjax.deleteIp(id).then((result) => {
            this.setState({
                isDeletingLoading: false,
                deleteIpId: ''
            });
            if (result === true) { // 删除成功
                let globalFilterIpList = _.filter(this.state.globalFilterIpList, item => item.id !== id);
                this.props.updateFilterIpList(globalFilterIpList);
                this.setState({
                    globalFilterIpList: globalFilterIpList
                });
            } else {
                message.error(Intl.get('crm.139', '删除失败！'));
            }
        }, (errMsg) => {
            message.error(errMsg || Intl.get('crm.139', '删除失败！'));
            this.setState({
                isDeletingLoading: false,
                deleteIpId: ''
            });
        });
    };

    // 取消删除IP
    cancelDeleteIp = () => {
        this.setState({
            deleteIpId: ''
        });
    };

    getContainerHeight() {
        const PADDING = 80;
        return $('body').height()
            - $('.ip-filter-panel .right-panel-modal-title').outerHeight(true)
            - $('.ip-filter-panel .filter-private-ip-card-container').outerHeight(true)
            - PADDING;
    }


    renderIpContent = () => {
        let globalFilterIpList = this.state.globalFilterIpList;
        return (
            <div className="ip-filter-content">
                <GeminiScrollBar style={{height: this.getContainerHeight()}}>
                    {
                        this.state.isShowAddIp ? (
                            <div className="add-ip-content">
                                {this.renderAddIpContent()}
                            </div>
                        ) : null
                    }
                    <ul className="ip-content">
                        {_.map(globalFilterIpList, ipItem => {
                            return (
                                <li
                                    className="ip-item"
                                    key={ipItem.id}
                                >
                                    <span>{ipItem.ip}</span>
                                    <span className="ip-delete-operator-zone">
                                        {
                                            ipItem.id === this.state.deleteIpId ? (
                                                <span className="item-delete-buttons">
                                                    <span
                                                        className="item-delete-confirm"
                                                        disabled={this.state.isDeletingLoading}
                                                        onClick={this.handleConfirmDeleteIp.bind(this, ipItem)}
                                                    >
                                                        {
                                                            this.state.isDeletingLoading ? <Icon type="loading"/> : null
                                                        }
                                                        {Intl.get('crm.contact.delete.confirm', '确认删除')}
                                                    </span>
                                                    <span
                                                        className="item-delete-cancel"
                                                        onClick={this.cancelDeleteIp.bind(this, ipItem)}
                                                    >
                                                        {Intl.get('common.cancel', '取消')}
                                                    </span>
                                                </span>
                                            ) : (
                                                <span
                                                    onClick={this.handleDeleteIP.bind(this, ipItem)}
                                                    className="operate-btn"
                                                    data-tracename={'点击删除' + ipItem.ip}
                                                >
                                                    <i className="iconfont icon-delete handle-btn-item"></i>
                                                </span>
                                            )
                                        }
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </GeminiScrollBar>
            </div>
        );
    };

    renderIpList = () => {
        return (
            <DetailCard
                title={this.renderDetailTitle()}
                content={this.renderDetailIpList()}
                className='ip-filter-card-container'
            />
        );
    };

    renderDetailIpList = () => {
        let globalFilterIpList = this.state.globalFilterIpList;
        let length = _.get(globalFilterIpList, 'length');
        if (length || this.state.isShowAddIp) {
            return this.renderIpContent();
        } else {
            return this.renderNoDataOrLoadError();
        }
    };

    handleSetFilterPrivateIp = (event) => {
        const checked = event.target.checked;
        IpFilterAjax.setFilterPrivateIp({filter_lan: checked}).then( (result) => {
            if (result) {
                this.setState({
                    filterPrivateIpStatus: checked,
                    setFilterPrivateIpMsg: Intl.get('user.operate.success','操作成功'),
                    setFilterPrivateResult: 'success'
                });
            } else {
                this.setState({
                    setFilterPrivateIpMsg: Intl.get('member.apply.approve.tips','操作失败'),
                    setFilterPrivateResult: 'error'
                });
            }
        }, (errMsg) => {
            this.setState({
                setFilterPrivateIpMsg: errMsg || Intl.get('member.apply.approve.tips','操作失败'),
                setFilterPrivateResult: 'error'
            });
        } );

    };

    renderSetFilterPrivateIpTips = () => {
        let hide = () => {
            this.setState({
                setFilterPrivateIpMsg: '',
                setFilterPrivateResult: ''
            });
        };
        return (
            <SavedTips
                tipsContent={this.state.setFilterPrivateIpMsg}
                savedResult={this.state.setFilterPrivateResult}
                onHide={hide}
            />
        );
    };

    renderDetailPrivateFilterIP = () => {
        return (
            <div className="filter-private-ip">
                <Checkbox
                    checked={this.state.filterPrivateIpStatus}
                    onChange={this.handleSetFilterPrivateIp}
                    data-tracename="选中/取消过滤内网IP"
                />
                <span className="private-content">
                    {Intl.get('product.private.ip','内网IP')}
                </span>
                {
                    this.state.setFilterPrivateIpMsg ? (
                        <div className="private-ip-tips">
                            {this.renderSetFilterPrivateIpTips()}
                        </div>
                    ) : null
                }
            </div>
        );
    };

    renderFilterPrivateIpContent = () => {
        return (
            <DetailCard
                content={this.renderDetailPrivateFilterIP()}
                className='filter-private-ip-card-container'
            />
        );
    };

    renderFilterIpContent() {
        let isLoading = this.state.isLoading;
        return (
            <div className="ip-filter-container">
                {
                    isLoading ? ( <Spinner/>) : (
                        <div className="ip-filter-content-wrap">
                            <div className="private-filter-ip">
                                {this.renderFilterPrivateIpContent()}
                            </div>
                            <div className="ip-filter-wrap">
                                {this.renderIpList()}
                            </div>
                        </div>
                    )
                }
            </div>
        );
    }
    render() {
        return (
            <RightPanelModal
                className='ip-filter-panel'
                isShowModal={false}
                isShowCloseBtn={true}
                title={Intl.get('product.filter.ip', '过滤IP')}
                onClosePanel={this.props.closeIpFilterPanel}
                content={this.renderFilterIpContent()}
                dataTracename='过滤IP'
            />
        );
    }
}

IpFilter.propTypes = {
    closeIpFilterPanel: PropTypes.func,
    updateFilterIpList: PropTypes.func, // 更新全局过滤的IP
};

export default IpFilter;
