var React = require('react');
require('./index.less');
var ajax = require('./ajax');
var SelectFullWidth = require('../select-fullwidth');
var Select = require('antd').Select;
var Option = Select.Option;
var userData = require('../../public/sources/user-data');

class AnalysisAppSelector extends React.Component {
    static defaultProps = {
        onSelectApp: function() {},
        //默认宽度没有限制
        type: 'user',
        //是否默认选中第一个应用
        isSelectFirstApp: false
    };

    state = {
        appList: [],
        selectedApp: '',
        hasAll: false,
    };

    //失败次数
    failCount = 0;

    //是否选中第一个应用
    isChoosenFirst = () => {
        if (this.props.isSelectFirstApp) return true;

        var privileges = userData.getUserData().privileges || [];
        if(privileges.indexOf('APP_MANAGE_LIST_APPS') >= 0) {
            return false;
        }
        if(privileges.indexOf('USER_INFO_MYAPP') >= 0) {
            return true;
        }
        return false;
    };

    selectApp = (appId, hasAll, apps) => {
        //bugfix（已完成）:如果是销售，没有应用列表，并且不展示所有应用，应该将appId置空
        if(!hasAll && appId === 'all' && !apps.length) {
            appId = '';
        }
        this.setState({
            selectedApp: appId
        });
        //是否选中全部
        var isChoosenAll = appId === 'all';
        //针对选中“全部应用”进行特殊处理
        if(isChoosenAll && this.state.hasAll && this.props.type === 'user') {
            appId = 'all';
        }
        this.props.onSelectApp(appId,isChoosenAll,hasAll,apps);
    };

    getAppList = () => {
        var _this = this;
        ajax.getAppList().then(function(data) {

            var list = data.list;
            var hasAll = data.hasAll;

            _this.setState({
                appList: list,
                hasAll: hasAll
            });

            //如果是产品总经理，需要选中第一个应用
            if(_.isArray(list) && list[0] && list[0].id) {
                //上次选中的应用
                const selectedApp = _this.props.selectedApp;
                //上次选中的应用在现在的应用列表中对应的值
                const selectedAppObj = _.find(list, item => item.id === selectedApp);
                if (selectedApp && selectedAppObj) {
                    _this.selectApp(selectedApp,hasAll,list);
                } else {
                    if(_this.isChoosenFirst()) {
                        _this.selectApp(list[0].id,hasAll,list);
                    } else {
                        _this.selectApp('all',hasAll,list);
                    }
                }
            } else {
                if(_this.props.type === 'user') {
                    _this.selectApp('',hasAll,list);
                } else {
                    _this.selectApp('all',hasAll,list);
                }
            }
        });
    };

    componentDidMount() {
        this.getAppList();
    }

    onSelectedAppChange = (app_id, name) => {
        this.selectApp(app_id,this.state.hasAll,this.state.appList);
    };

    render() {
        var appList = this.state.appList;
        var options = appList.map(function(appInfo) {
            return (
                <Option key={appInfo.id} value={appInfo.id}>{appInfo.name}</Option>
            );
        });
        if(this.state.hasAll && !this.props.isSelectFirstApp) {
            options.unshift(<Option key="all" value="all">{Intl.get('oplate.user.analysis.22', '综合')}</Option>);
        }
        return (
            <SelectFullWidth
                optionFilterProp="children"
                showSearch
                className="analysis-filter-select"
                minWidth={150}
                value={this.state.selectedApp}
                onChange={this.onSelectedAppChange}
                notFoundContent={!options.length ? Intl.get('user.no.product','暂无产品') : Intl.get('user.no.related.product','无相关产品')}
            >
                {options}
            </SelectFullWidth>
        );
    }
}

module.exports = AnalysisAppSelector;

