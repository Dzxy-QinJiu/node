var language = require('../../public/language/getLanguage');
if (language.lan() == 'es' || language.lan() == 'en') {
    require('./app-selector-es_VE.less');
}else if (language.lan() == 'zh'){
    require('./app-selector-zh_CN.less');
}
var classNames = require('classnames');
var AppSelectorStore = require('./app-selector.store');
var AppSelectorAction = require('./app-selector.action');
var immutable = require('immutable');
var insertStyle = require('../insert-style');
var DefaultUserLogoTitle = require('../default-user-logo-title');
var SearchList = require('../SearchList');
var AppRolePermission = require('../user_manage_components/app-role-permission');

//应用选择器，在销售机会、用户管理中使用
class AppSelector extends React.Component {
    static defaultProps = {
        //唯一id，用来关联当前组件的store和action
        uniqueId: 'uniqueId',
        //图片大小
        size: 60,
        //选中的app
        selectedApps: [],
        //所有app
        totalApps: [],
        //当app变化时，通知父组件做变更
        onChange: function() {},
        //父容器，用来计算弹出层位置
        container: null,
        //是否是只读模式，即不能添加应用
        readOnly: false,
        //只是修改角色和权限
        onlyEditRoleAndPermission: false,
        //不需要设置角色、权限
        doNotSetRolesAndPermission: false,
        //高度变化时触发回调
        onHeightChange: function(){},
        //应用主题
        appTheme: 'white'
    };

    constructor(props) {
        super(props);
        this.uniqueId = props.uniqueId;
        this.store = AppSelectorStore(this.uniqueId);
        this.action = AppSelectorAction(this.uniqueId);
        this.state = this.store.getState();
    }

    //为了给选择器设置不同的尺寸
    dynamicStyle = null;

    //唯一标识id
    uniqueId = null;

    //store整合数据
    store = null;

    //action整合操作
    action = null;

    onStoreChange = () => {
        var _this = this;
        this.setState(this.store.getState() , function() {
            _this.onHeightChange();
        });
    };

    showedRoleLayerForFirstApp = false;

    //传递的属性更新时，同步到store中
    componentWillReceiveProps(nextProps) {
        if(
            !immutable.is(nextProps.totalApps , this.props.totalApps) ||
            !immutable.is(nextProps.selectedApps , this.props.selectedApps)
        ) {
            var _this = this;
            setTimeout(function() {
                _this.action.setInitialData({
                    //全部应用列表
                    totalApps: nextProps.totalApps,
                    //选中的应用列表
                    selectedApps: nextProps.selectedApps,
                });
                _this.getImageByAppId(nextProps.selectedApps);
            });
        }
    }

    getImageByAppId = (apps) => {
        var _this = this;
        _.each(apps , function(app) {
            if(app.app_logo === 'default') {
                _this.action.getImageSrcByAjax(app);
            }
        });
    };

    componentDidMount() {
        this.store.listen(this.onStoreChange);
        this.bindEvent();
        var uniqueId = this.uniqueId;
        var size = this.props.size;
        this.dynamicStyle = insertStyle(
            `.app-selector-${uniqueId} .application-list-div{

                left:${size}px;
            }
            .app-selector-${uniqueId} .application-div .application-img-div{
                width:${size}px;
                height:${size}px;
                line-height:${size - 3}px;
            }
            .app-selector-${uniqueId} .application-div .application-img-div img.application-img {
                width:${size}px;
                height:${size}px;
            }
            .app-selector-${uniqueId} .no-user-logo-div {
                width:${size}px;
                height:${size}px;
                line-height:${size - 3}px;
            }
            `
        );
        var _this = this;
        setTimeout(function() {
            _this.action.setInitialData({
                //全部应用列表
                totalApps: _this.props.totalApps,
                //选中的应用列表
                selectedApps: _this.props.selectedApps
            });
            _this.getImageByAppId(_this.props.selectedApps);
        });
    }

    componentWillUnmount() {
        this.unbindEvent();
        this.store.unlisten(this.onStoreChange);
        this.store.destroy();
        this.action.destroy();
        this.dynamicStyle.destroy();
    }

    componentDidUpdate() {

        if(this.state.appLayerShow) {
            var isLeft = this.isShowInLeft();
            var arrow_position = isLeft ? 'left' : 'right';
            if(this.state.arrow_position != arrow_position) {
                this.action.setArrowPosition(arrow_position);
            }
        }
        var _this = this;
        if(
            this.props.onlyEditRoleAndPermission &&
            !this.showedRoleLayerForFirstApp &&
            this.state.selectedApps[0] &&
            this.action
        ) {
            this.showedRoleLayerForFirstApp = true;
            setTimeout(function() {
                _this.action.showPermissionLayerForApp(_this.state.selectedApps[0]);
            });
        }
    }

    bodyClickFun = (e) => {
        if(this.state.appLayerShow) {
            var target = e.target;
            if(!$.contains(this.refs.wrapDom , target)) {
                this.action.hideAppLayer();
            }
        }
    };

    bindEvent = () => {
        $('body').on('click' , this.bodyClickFun);
    };

    unbindEvent = () => {
        $('body').off('click' , this.bodyClickFun);
    };

    getUnchoosenApps = () => {
        var selectedAppIds = _.groupBy(this.state.selectedApps , function(obj) {
            return obj.app_id;
        });

        var unChoosenApps = _.filter(this.state.totalApps,function(obj) {
            return !selectedAppIds[obj.app_id];
        });

        return unChoosenApps;

    };

    addApp = (app) => {
        var _this = this;
        this.action.addApp(app);
        setTimeout(function(){
            _this.props.onChange(_this.state.selectedApps);
        });
    };

    removeApp = (app) => {
        var _this = this;
        this.action.removeApp(app);
        setTimeout(function(){
            _this.props.onChange(_this.state.selectedApps);
        });
    };

    showDropDown = () => {
        this.action.showAppLayer();
    };

    onHeightChange = () => {
        var _this = this;
        setTimeout(function(){
            _this.props.onHeightChange();
        });
    };

    isShowInLeft = () => {
        //如果没有传container，则无法计算左、右
        //直接认为是从右边显示
        if(!this.props.container) {
            return false;
        }
        var $container = $(this.props.container);
        var $dropList = $(this.refs.droplist);
        var $addBtn = $(this.refs.addBtn);
        var containerWidth = $container.width();
        var containerPos = $container.offset();
        var addBtnPos = $addBtn.offset();
        var addBtnWidth = $addBtn.width();
        var dropListWidth = $dropList.width();

        if((addBtnPos.left - containerPos.left + addBtnWidth + dropListWidth) > containerWidth) {
            return true;
        }

        return false;
    };

    //显示设置权限层
    showPermissionLayer = (app) => {
        this.action.showPermissionLayerForApp(app);
    };

    //角色权限改变时触发
    onRolesPermissionSelect = (roles, permissions) => {
        this.action.rolesPermissionChange({roles,permissions});
        setTimeout(() => {
            this.props.onChange(this.state.selectedApps);
        });
    };

    render() {
        var _this = this;
        var unchoosenApps = this.getUnchoosenApps();

        var unchoosenAppsBlock = (
            <SearchList
                list={unchoosenApps}
                nameProp="app_name"
                onSelect={this.addApp}
                notFoundContent={Intl.get('user.no.related.product','无相关产品')}
                noDataCoutent={Intl.get('user.no.product','暂无产品')}
            ></SearchList>
        );
        var selectedApp = this.state.selectedApp;
        var onlyEditRoleAndPermission = this.props.onlyEditRoleAndPermission;
        var doNotSetRolesAndPermission = this.props.doNotSetRolesAndPermission;
        var selectedApps = this.state.selectedApps.map(function(app , i) {
            var cls = classNames({
                'application-img-div': true,
                active: app.app_id === selectedApp.app_id
            });
            var permissionNotSetClass = classNames({
                setpermission: true,
                'not-set': !app.roles.length ? true : false
            });
            return (
                <div className={cls} key={i} title={app.app_name}>
                    {!onlyEditRoleAndPermission ? (
                        <div className="application-img-delete icon-close iconfont"
                            onClick={_this.removeApp.bind(_this, app)}
                        ></div>
                    ) : null}
                    <DefaultUserLogoTitle
                        nickName={app.app_name}
                        userLogo={app.app_logo}
                        defaultImgClass="application-img"
                    />
                    {
                        !doNotSetRolesAndPermission ?
                            (<div className={permissionNotSetClass} onClick={_this.showPermissionLayer.bind(_this,app)}>
                                {language.lan() == 'zh' ? null : Intl.get('user.setting.roles', '设置角色')}
                            </div>) :
                            null
                    }
                </div>
            );
        });

        var dropListCls;

        if(this.state.appLayerShow) {
            var isLeft = this.state.arrow_position === 'left';

            dropListCls = classNames({
                'application-list-div': true,
                'application-list-div-left': isLeft,
                [this.props.appTheme]: true
            });
        }
        if(!selectedApps.length && !unchoosenApps.length) {
            return (
                <div className="app-selector">
                    <div className="app-selector-nodata">{Intl.get('common.no.data','暂无数据')}</div>
                </div>
            );
        }
        var wrapClass = classNames({
            'app-selector': true,
            'read-only': this.props.readOnly,
            'do-not-set-roles-and-permission': this.props.doNotSetRolesAndPermission
        });
        wrapClass += ' app-selector-' + this.uniqueId;
        return (
            <div className={wrapClass} ref="wrapDom">
                <div className="application-div">
                    {selectedApps}
                    {!this.props.readOnly && unchoosenApps && unchoosenApps.length ? (
                        <div className="application-img-div" ref="addBtn">
                            <div className="icon-add iconfont handle-btn-item"
                                onClick={this.showDropDown}
                                ref="addBtnButton"
                            ></div>
                            {
                                this.state.appLayerShow && unchoosenApps && unchoosenApps.length ?
                                    (
                                        <div className={dropListCls} ref="droplist">
                                            <div className="arrow-left"></div>
                                            <div className="salesApplication-div">
                                                {unchoosenAppsBlock}
                                            </div>
                                            <div className="arrow-right"></div>
                                        </div>
                                    ) :
                                    null
                            }
                        </div>
                    ) : null}
                </div>
                {
                    _.isEmpty(selectedApp) ? null : (
                        <AppRolePermission
                            className="theme-b"
                            selectedRoles={selectedApp.roles}
                            selectedPermissions={selectedApp.permissions}
                            onRolesPermissionSelect={this.onRolesPermissionSelect}
                            app_id={selectedApp.app_id}
                        />
                    )
                }
            </div>
        );
    }
}

module.exports = AppSelector;
