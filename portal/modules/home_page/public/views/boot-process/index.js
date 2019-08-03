/** Created by 2019-07-26 11:10 */
/**
 *  引导流程
 */
import '../../css/boot-process.less';
import DialSrc from '../../images/call-system.svg';
import FinishedSrc from '../../images/guide-finished.svg';
import { Button, message } from 'antd';
import {Link} from 'react-router-dom';
import GuideAjax from 'MOD_DIR/common/public/ajax/guide';
import Spinner from 'CMP_DIR/spinner';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import CrmAddForm from 'MOD_DIR/crm/public/views/crm-add-form';
import RecommendClues from './recommend_clues';
import ImportCustomer from './import-customer';
import classNames from 'classnames';
import history from 'PUB_DIR/sources/history';
import DialUpKeyboard from 'CMP_DIR/dial-up-keyboard';
import userData from 'PUB_DIR/sources/user-data';
import {phoneEmitter} from 'PUB_DIR/sources/utils/emitters';
import MemberForm from 'MOD_DIR/member_manage/public/view/member-form';
import MemberFormAction from 'MOD_DIR/member_manage/public/action/member-form-actions';
import MemberManageAction from 'MOD_DIR/member_manage/public/action';
import { hasCalloutPrivilege } from 'PUB_DIR/sources/utils/common-method-util';
import {storageUtil} from 'ant-utils';

/**
 *  引导流程键值对，以及对应的角色
 *  {dial: false}//拨号
 *  {perfact_organization：false}//完善组织（管理员）
 *  {add_customer: false}//添加客户（管理员、销售）
 *  {extract_clue：false}//提取线索（管理员、销售、运营）
 */
//引导流程
const BOOT_PROCESS_KEYS_MAP = {
    // 拨号
    dial: {
        index: 0,
        key: 'dial',
        unfinishedText: {
            title: Intl.get('guide.dial.welcome.tip', '欢迎{name}，免费送您60分钟通话时长',{name: _.get(userData.getUserData(), 'nick_name', '###')}),
            /* eslint-disable */
            description: (
                <span>
                    <span>{Intl.get('gudie.dial.des', '拨号使用测试号码呼出，您可以')}</span>
                    <a href='https://caller.curtao.com' target="_blank">{Intl.get('guide.dial.apply.phone', '申请专属号码')}<i className='iconfont icon-tree-right-arrow'/></a>
                </span>
            ),
        },
        imgSrc: DialSrc,
        btnText: Intl.get('phone.dial.up.text', '拨号')
    },
    // 完成组织结构
    perfact_organization: {
        index: 1,
        key: 'perfact_organization',
        unfinishedText: {
            title: Intl.get('guide.add.organization.title', '完善您的组织架构'),
            description: Intl.get('guide.add.organization.des', '完善组织架构后,有利于您顺畅的使用其他功能')
        },
        finishedText: {
            title: Intl.get('guide.add.member.finished', '添加成员已完成'),
            /* eslint-disable */
            description: (
                <span>
                    <span>{Intl.get('guide.finished.can', '可以去')}</span>
                    <Link to="/background_management/member">{Intl.get('menu.user', '成员管理')}</Link>
                    <span>{Intl.get('guide.finished.see', '查看')}</span>
                </span>
            ),
        },

        icon: 'icon-add-member',
        bgColor: '#efc546',
        btnText: Intl.get('common.add.member', '添加成员')
    },
    // 添加客户
    add_customer: {
        index: 2,
        key: 'add_customer',
        unfinishedText: {
            title: Intl.get('guide.add.customer.title', '添加您的客户'),
            description: Intl.get('guide.add.customer.des', '添加客户后，可以轻松跟进您的客户')
        },
        finishedText: {
            title: Intl.get('guide.add.customer.finished', '添加客户已完成'),
            /* eslint-disable */
            description: (
                <span>
                    <span>{Intl.get('guide.finished.can', '可以去')}</span>
                    <Link to="/crm">{Intl.get('sales.home.customer', '客户')}</Link>
                    <span>{Intl.get('guide.finished.page.see', '界面查看')}</span>
                </span>
            ),
        },
        icon: 'icon-add-customer',
        bgColor: '#1fbeb8',
        btnText: Intl.get('crm.3', '添加客户')
    },
    // 提取线索
    extract_clue: {
        index: 3,
        key: 'extract_clue',
        unfinishedText: {
            title: Intl.get('guide.extract.clue.title', '提取您感兴趣的线索'),
            description: Intl.get('guide.extract.clue.des', '系统会根据您的兴趣，推荐给您线索')
        },
        finishedText: {
            title: Intl.get('guide.recommend.clue.finished', '推荐线索已提取'),
            /* eslint-disable */
            description: (
                <span>
                    <span>{Intl.get('guide.finished.can', '可以去')}</span>
                    <Link to="/clue_customer">{Intl.get('crm.sales.clue', '线索')}</Link>
                    <span>{Intl.get('guide.finished.page.see', '界面查看')}</span>
                </span>
            ),
        },
        icon: 'icon-clue_customer-ico',
        bgColor: '#8280e7',
        btnText: Intl.get('clue.extract.clue', '提取线索')
    },
};

// 添加客户的方式，添加或者导入
const CUSTOMER_ADD_TYPES = {
    ADD: 'add', // 添加
    IMPORT: 'import', //导入
    FINISHED: 'finished', //完成
};

const MEMBER_ADD_TYPES = {
    ADD: 'add',
    FINISHED: 'finished', //完成
};

const CLUE_EXTRACT_TYPES = {
    EXTRACT: 'extract', //提取
    FINISHED: 'finished'
};

class BootProcess extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            guideConfig: [],
            isShowDialUpKeyboard: false,//是否展示拨号键盘的标识
            ...this.getInitialState()
        };
    }

    getInitialState() {
        return {
            curGuideItem: null, // 当前点击的引导流程项
            curCustomerAddType: CUSTOMER_ADD_TYPES.ADD, // 当前添加客户的方式
            curMemberAddType: MEMBER_ADD_TYPES.ADD, // 当前添加成员的方式
            curClueExtractType: CLUE_EXTRACT_TYPES.EXTRACT, //当前提取线索的方式
        };
    }

    componentDidMount() {
        this.getGuideConfig();
        let isShowDialUpKeyboard = storageUtil.session.get('isShowDialUpKeyboard');
        this.setState({
            isShowDialUpKeyboard
        });
        phoneEmitter.on(phoneEmitter.CALL_CLIENT_INITED, this.triggerDialUpKeyboardShow);
        phoneEmitter.on(phoneEmitter.CALL_FINISHED, this.triggerDialFinished);
    }

    componentWillUnmount() {
        phoneEmitter.removeListener(phoneEmitter.CALL_CLIENT_INITED, this.triggerDialUpKeyboardShow);
        phoneEmitter.removeListener(phoneEmitter.CALL_FINISHED, this.triggerDialFinished);
    }

    getGuideConfig() {
        this.setState({loading: true});
        GuideAjax.getGuideConfig().then((res) => {
            // 处理数据
            let list = _.chain(res)
                .map(item => {
                    let guide = BOOT_PROCESS_KEYS_MAP[item.content];

                    if(guide) {
                        return _.extend(_.cloneDeep(guide), {finished: item.finished});
                    }
                })
                .sortBy('index')
                .value();

            this.setState({
                loading: false,
                guideConfig: list
            });
        }, (error) => {
            this.setState({loading: false});
        });
    }

    //呼叫中心的电话系统初始化完成后，触发拨号键盘是否展示的判断
    triggerDialUpKeyboardShow = () =>{
        //电话系统初始化完成后，判断是否有打电话的权限（是否配坐席号，配置了才可以打电话）
        if (hasCalloutPrivilege) {
            storageUtil.session.set('isShowDialUpKeyboard', true);
            this.setState({isShowDialUpKeyboard: true});
        }
    };

    // 设置引导流程标注（标记为已完成）
    setGuideMark = (cb, curItem) => {
        let curGuideItem = curItem || this.state.curGuideItem;
        GuideAjax.setGuideMark({
            step: curGuideItem.key
        }).then((data) => {
            let guideConfig = this.state.guideConfig;
            _.each(guideConfig, guide => {
                if(guide.key === curGuideItem.key) {
                    guide.finished = true;
                    curGuideItem.finished = true;
                }
            });
            this.setState({guideConfig});
            _.isFunction(cb) && cb(curGuideItem);
        }, (errorMsg) => {
            _.isFunction(cb) && cb(curGuideItem);
        });
    };

    // 关闭引导流程
    closeGuideMark = (item) => {
        let {guideConfig} = this.state;
        let hasLoading = _.find(guideConfig, guide => guide.loading);
        // 如果有正在关闭的流程，需等待
        if(hasLoading) return false;

        _.each(guideConfig, guide => {
            if(item.key === guide.key) {
                guide.loading = true;
            }
        });

        this.setState({guideConfig});
        GuideAjax.closeGuideMark({
            step: item.key
        }).then((data) => {
            let guideConfig = _.filter(guideConfig, guide => item.key !== guide.key);
            this.setState({guideConfig});
        }, (errorMsg) => {
            _.each(guideConfig, guide => {
                if(item.key === guide.key) {
                    guide.loading = false;
                }
            });
            this.setState({guideConfig});
            message.error(errorMsg || Intl.get('guide.close.faild', '关闭此流程失败'));
        });
    };

    onHandleClick = (item) => {
        if(item.finished) {
            this.closeGuideMark(item);
        }else {
            this.setState({
                curGuideItem: item,
                // curCustomerAddType: CUSTOMER_ADD_TYPES.ADD
            }, () => {
                // 添加成员时
                if(item.key === BOOT_PROCESS_KEYS_MAP.perfact_organization.key) {
                    this.showMemberForm();
                }
            });
        }
    };

    // 关闭右侧面板时
    closeGuidDetailPanel = () => {
        this.setState({...this.getInitialState()});
    };

    handleCustomerChange = (type) => {
        this.setState({curCustomerAddType: type});
    };

    //显示继续添加按钮
    showContinueAddButton = () => {};

    // 拨号结束后，触发事件
    triggerDialFinished = () => {
        let dialGuide = _.find(this.state.guideConfig, guide => guide.key === BOOT_PROCESS_KEYS_MAP.dial.key);
        // 已完成拨号流程
        this.setGuideMark(null, dialGuide);
    };

    // 添加成员成功后
    addMemberFinished = () => {
        let memberGuide = _.find(this.state.guideConfig, guide => guide.key === BOOT_PROCESS_KEYS_MAP.perfact_organization.key);

        this.setGuideMark((curGuideItem) => {
            this.setState({
                curGuideItem,
                curMemberAddType: MEMBER_ADD_TYPES.FINISHED
            });
        }, memberGuide);
    };

    // 添加/导入客户成功
    addCustomerFinished = () => {
        let customerGuide = _.find(this.state.guideConfig, guide => guide.key === BOOT_PROCESS_KEYS_MAP.add_customer.key);
        this.setGuideMark((curGuideItem) => {
            this.setState({
                curGuideItem,
                curCustomerAddType: CUSTOMER_ADD_TYPES.FINISHED
            });
        }, customerGuide);
    };

    // 提取线索成功后
    extractClueFinished = () => {
        let clueGuide = _.find(this.state.guideConfig, guide => guide.key === BOOT_PROCESS_KEYS_MAP.extract_clue.key);
        this.setGuideMark((curGuideItem) => {
            this.setState({
                curGuideItem,
                curClueExtractType: CLUE_EXTRACT_TYPES.FINISHED
            });
        }, clueGuide);
    };

    // 获取添加成员所需的数据
    showMemberForm = () => {
        //获取团队列表
        if (!Oplate.hideSomeItem) { // v8环境下，不显示所属团队，所以不用发请求
            MemberFormAction.setTeamListLoading(true);
            MemberFormAction.getUserTeamList(true);
        }
        // 获取职务列表
        MemberFormAction.setPositionListLoading(true);
        MemberFormAction.getSalesPosition();
        //获取角色列表
        MemberFormAction.setRoleListLoading(true);
        MemberFormAction.getRoleList();
        MemberManageAction.showMemberForm('add');
        MemberFormAction.setAddGroupForm(false);
    };

    renderGuideCard(item, index) {
        const contentCls = classNames('guide-content-wrap');

        let title = '';
        let description = '';
        if(_.isEqual(item.key, BOOT_PROCESS_KEYS_MAP.dial.key)) {
            title =  item.unfinishedText.title ;
            description = item.unfinishedText.description;
        }else {
            title = item.finished ? item.finishedText.title : item.unfinishedText.title;
            description = item.finished ? item.finishedText.description : item.unfinishedText.description;
        }

        return (
            <div className='guide-card-container'>
                <div className={contentCls} id={`home-page-guide${item.key}`}>
                    <div className="guide-card-info">
                        {
                            item.imgSrc ? (
                                <img src={item.imgSrc} alt=""/>
                            ) : ( <i className={`iconfont ${item.icon}`} style={{background: item.bgColor}}/>)
                        }
                        <div className="guide-text">
                            <div className="guide-text__title">{title}</div>
                            <div className="guide-text__des">{description}</div>
                        </div>
                    </div>
                    <div className='guide-btn-block'>
                        {this.renderBtnBlock(item)}
                    </div>
                    {item.finished && !item.loading ? <i className="iconfont icon-close" onClick={this.closeGuideMark.bind(this, item)} title={Intl.get('common.app.status.close','关闭')}/> : null}
                </div>
            </div>
        );
    }

    renderContent() {
        if(this.state.loading) {
            return <Spinner/>;
        }else {
            let guideList = [];
            //引导列表的渲染
            if (_.get(this.state.guideConfig,'[0]')) {
                _.each(this.state.guideConfig, (item, index) => {
                    if(item.key === BOOT_PROCESS_KEYS_MAP.dial.key) {
                        // 判断是否有拨打电话的权限
                        if(this.state.isShowDialUpKeyboard) {
                            guideList.push(this.renderGuideCard(item, index));
                        }
                    }else {
                        guideList.push(this.renderGuideCard(item, index));
                    }
                });
            }
            return guideList;
        }
    }

    // 完成界面
    renderFinishedBlock = (finishedObj) => {
        return (
          <div className="guide-finished-wrapper">
              <img src={FinishedSrc} alt=""/>
              <p>{finishedObj.text}</p>
              <div className="btn-wrapper">
                  <Button type="primary" onClick={finishedObj.continueFn}>{finishedObj.continueText || Intl.get('guide.continue.add', '继续添加')}</Button>
                  <Button onClick={finishedObj.goFn}>{finishedObj.goText || Intl.get()}</Button>
              </div>
          </div>
        );
    };

    // 添加成员
    renderAddMember() {
        switch (this.state.curMemberAddType) {
            case MEMBER_ADD_TYPES.ADD:
                let emptyMember = {
                    id: '',
                    name: '',
                    userName: '',
                    image: '',
                    password: '',
                    rePassword: '',
                    phone: '',
                    email: '',
                    role: [],
                    phoneOrder: ''
                };
                return (
                    <MemberForm
                        formType='add'
                        isShowAddGroupFrom
                        member={emptyMember}
                        returnInfoPanel={this.addMemberFinished}
                        showContinueAddButton={this.showContinueAddButton}
                        closeRightPanel={this.closeGuidDetailPanel}
                    />
                );
            case MEMBER_ADD_TYPES.FINISHED:
                let FinishedBlock = this.renderFinishedBlock({
                    text: Intl.get('guide.add.or.import.customer.success', '添加/导入成功'),
                    goText: Intl.get('guide.see.member', '查看成员'),
                    // 继续添加函数
                    continueFn: () => {
                        this.setState({
                            curMemberAddType: MEMBER_ADD_TYPES.ADD
                        });
                    },
                    // 查看成员
                    goFn: () => {
                        history.push('/background_management/member');
                    }
                });

                return (
                    <RightPanelModal
                        isShowMadal
                        isShowCloseBtn
                        onClosePanel={this.closeGuidDetailPanel}
                        content={FinishedBlock}
                        dataTracename="引导流程"
                    />
                );
        }
    }

    // 添加客户
    renderAddCustomer() {
        let {curCustomerAddType} = this.state;
        let title = null;

        switch (curCustomerAddType) {
            case CUSTOMER_ADD_TYPES.FINISHED:
                let FinishedBlock =  this.renderFinishedBlock({
                    text: Intl.get('user.user.add.success', '添加成功'),
                    goText: Intl.get('guide.see.cutomer', '查看客户'),
                    // 继续添加函数
                    continueFn: () => {
                        this.setState({
                            curCustomerAddType: CUSTOMER_ADD_TYPES.ADD
                        });
                    },
                    // 查看客户
                    goFn: () => {
                        history.push('/crm');
                    }
                });
                return (
                    <RightPanelModal
                        isShowMadal
                        isShowCloseBtn
                        onClosePanel={this.closeGuidDetailPanel}
                        content={FinishedBlock}
                        dataTracename="引导流程"
                    />
                );
            case CUSTOMER_ADD_TYPES.ADD:
                title = (
                    <div className="customer-title-wrapper">
                        <span>{Intl.get('crm.3', '添加客户')}</span>
                        <span
                            className="customer-title-btn"
                            title={Intl.get('crm.2', '导入客户')}
                            onClick={this.handleCustomerChange.bind(this, CUSTOMER_ADD_TYPES.IMPORT)}
                        >{Intl.get('crm.2', '导入客户')}</span>
                    </div>
                );
                return (
                    <CrmAddForm
                        isConvert={false}
                        hideAddForm={this.closeGuidDetailPanel}
                        title={title}
                        addOne={this.addCustomerFinished}
                    />
                );
            case CUSTOMER_ADD_TYPES.IMPORT:
                title = (
                    <div className="customer-title-wrapper">
                        <span>{Intl.get('crm.2', '导入客户')}</span>
                        <span
                            className="customer-title-btn"
                            title={Intl.get('crm.3', '添加客户')}
                            onClick={this.handleCustomerChange.bind(this, CUSTOMER_ADD_TYPES.ADD)}
                        >{Intl.get('crm.3', '添加客户')}</span>
                    </div>
                );
                return (
                    <ImportCustomer
                        title={title}
                        closeTemplatePanel={this.closeGuidDetailPanel}
                        afterImportCustomer={this.addCustomerFinished}
                    />
                );
        }
    }

    // 提取线索
    renderExtractClue() {
        let {curClueExtractType} = this.state;
        let detailContent = null;
        switch (curClueExtractType) {
            case CLUE_EXTRACT_TYPES.EXTRACT:
                detailContent = (
                    <RecommendClues
                        onClosePanel={this.closeGuidDetailPanel}
                        afterSuccess={this.extractClueFinished}
                    />
                );
                break;
            case CLUE_EXTRACT_TYPES.FINISHED:
                detailContent = this.renderFinishedBlock({
                    text: Intl.get('clue.extract.success', '提取成功'),
                    continueText: Intl.get('guide.continue.extract', '继续提取'),
                    goText: Intl.get('guide.see.clue', '查看线索'),
                    // 继续提取函数
                    continueFn: () => {
                        this.setState({
                            curClueExtractType: CLUE_EXTRACT_TYPES.EXTRACT
                        });
                    },
                    // 查看线索
                    goFn: () => {
                        history.push('/clue_customer');
                    }
                });
                break;
        }

        return (
            <RightPanelModal
                isShowMadal
                isShowCloseBtn
                onClosePanel={this.closeGuidDetailPanel}
                content={detailContent}
                dataTracename="引导流程"
            />
        );
    }

    renderGuideDetail = () => {
        const guide = this.state.curGuideItem;

        switch (guide.key) {
            case BOOT_PROCESS_KEYS_MAP.dial.key:// 拨号
                return null;
            case BOOT_PROCESS_KEYS_MAP.perfact_organization.key:// 添加成员
                return this.renderAddMember();
            case BOOT_PROCESS_KEYS_MAP.add_customer.key:// 添加客户
                return this.renderAddCustomer();
            case BOOT_PROCESS_KEYS_MAP.extract_clue.key: // 提取线索
                return this.renderExtractClue();
        }
    };

    renderBtnBlock = (item) => {
        const btnCls = classNames('btn-item', {
            'btn-finished': item.finished
        });

        if(item.key === BOOT_PROCESS_KEYS_MAP.dial.key) {
            if(!item.finished) {
                return (
                    <DialUpKeyboard
                        placement="bottomRight"
                        dialIcon={(
                            <Button className={btnCls}>{item.btnText}</Button>
                        )}
                    />
                );
            }
        }

        return (
            <Button
                className={btnCls}
                onClick={this.onHandleClick.bind(this, item)}
                loading={item.loading}
            >{item.finished ? Intl.get('guide.finished.know', '知道了') : item.btnText}</Button>
        );
    };

    render() {
        return (
            <div className="boot-process-content">
                {this.renderContent()}
                {this.state.curGuideItem ? this.renderGuideDetail() : null}
            </div>
        );
    }
}

export default BootProcess;