const PropTypes = require('prop-types');
var React = require('react');
/**
 * 自定义下拉菜单组件,在antd dropdown组件基础上进行设置的（带有保存、取消按钮，自定义下拉菜单中的展示的内容）
 * Created by wangliping on 2017/9/29.
 * 客户批量操作中有应用
 * 用法：
 *      <AntcDropdown
 *           content={changeBtns.tag}
 *           overlayTitle={Intl.get("common.tag", "标签")}
 *           isSaving={this.state.isLoading}
 *           overlayContent={this.renderTagChangeBlock()}
 *           handleSubmit={this.handleSubmit}
 *           okTitle={Intl.get("crm.32", "变更")}
 *           cancelTitle={Intl.get("common.cancel", "取消")}
 *           unSelectDataTip={Intl.get("crm.333","请选择要变更的标签")}
 *           clearSelectData={}this.clearSelectTags()
 *      />
 */
require('./index.less');
import {Icon, Menu, Dropdown, Button} from 'antd';
class AntcDropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            menuVisible: false//是否展示下拉菜单
        };
    }

    componentWillUnmount() {
        setTimeout(() => {
            this.handleCancel();
        });
    }

    handleVisibleChange(flag) {
        //如果content内容中有下拉框的时候，选中某一项之后，会把AntcDropdown组件也隐藏掉
        //加上stopContentHide 这个属性，打开内容区域后设置为true，关闭后设置为false，避免内容区有select下拉框，选中选项后会关闭content内容区域
        if (this.props.stopContentHide) {
            return;
        }
        this.setState({menuVisible: flag});
        if (!flag) {
            // 关面板后，清空选择的数据
            this.props.clearSelectData();
        }
    }

    handleMenuClick(e) {
        //点击选项时，如果不是关闭按钮时，不关闭操作面板
        if (e.domEvent && !$(e.domEvent.target).hasClass('icon-close')) {
            this.setState({menuVisible: true});
        }
    }

    handleCancel() {
        this.setState({menuVisible: false});
        // 关面板后，清空选择的数据
        this.props.clearSelectData();
        if (this.props.isShowDropDownContent) {
            this.props.showDropDownContent();
        }
    }

    render() {
        var dropdownContainer = this.props.datatraceContainer || '下拉框';
        const menu = (
            <Menu onClick={this.handleMenuClick.bind(this)}>
                <Menu.Item>
                    <div data-tracename={dropdownContainer}>
                        <div className="custom-dropdown-title-container dropdown-li" data-tracename="下拉选择框">
                            <div className="dropdown-title">
                                <span>{this.props.overlayTitle}</span>
                            </div>
                            <div className="dropdown-btn-container">
                                {this.props.isSaving && this.props.btnAtTop ? <Icon type="loading"/> : null}
                                {this.props.btnAtTop ?
                                    <span>
                                        <span title={this.props.okTitle} className="inline-block iconfont icon-choose"
                                            onClick={this.props.handleSubmit.bind(this)} data-tracename="点击保存按钮"/>
                                        <span title={this.props.cancelTitle} className="inline-block iconfont icon-close"
                                            onClick={this.handleCancel.bind(this)} data-tracename="点击关闭按钮"/>
                                    </span>
                                    : null}

                            </div>
                        </div>
                        <Menu.Divider />
                        <div className="custom-dropdown-content-container dropdown-li">
                            {this.props.overlayContent}
                        </div>
                        {!this.props.btnAtTop ? <div className="btn-container">
                            {this.props.unSelectDataTip ? (
                                <div className="un-select-data-tip">
                                * {this.props.unSelectDataTip}
                                </div>) : null}
                            <Button className="inline-block icon-close"
                                onClick={this.handleCancel.bind(this)}>{this.props.cancelTitle}

                            </Button>
                            <Button type='primary' className="inline-block icon-choose"
                                disabled={this.props.isSaving || this.props.isDisabled}
                                onClick={this.props.handleSubmit.bind(this)}>{this.props.okTitle}
                                {this.props.isSaving ? <Icon type="loading"/> : null}</Button>
                        </div> : null}
                    </div>
                </Menu.Item>
            </Menu>
        );
        let overLayClass = 'antc-dropdwon-container';
        if (this.props.overlayClassName) {
            overLayClass += ` ${this.props.overlayClassName}`;
        }
        return (
            <Dropdown overlay={menu} visible={this.props.isShowDropDownContent || this.state.menuVisible}
                placement={this.props.placement} trigger={[this.props.triggerEventStr || 'click']}
                onVisibleChange={this.handleVisibleChange.bind(this)}
                overlayClassName={overLayClass}
                getPopupContainer={this.getPopupContainer} disabled={this.props.isDropdownAble}
            >
                {this.props.content}
            </Dropdown>
        );
    }

    getPopupContainer = () => {
        if (this.props.popupContainerId) {
            return document.getElementById(this.props.popupContainerId);
        } else {
            return document.body;
        }
    }
}
AntcDropdown.defaultProps = {
    overlayClassName: 'dropdown-container',
    showMenu: false,//是否展示下拉菜单（boolean）
    content: '',//Dropdown默认展示的内容（string|ReactNode）
    overlayTitle: '',//下拉菜单中的标题（string|ReactNode）
    overlayContent: '',//下拉菜单中要展示的内容（string|ReactNode）
    okTitle: Intl.get('common.save', '保存'),//对号对应的title提示(string)
    cancelTitle: Intl.get('common.cancel', '取消'),//叉号对应的title提示(string)
    unSelectDataTip: '',//未选择数据保存时的提示信息
    isSaving: false,//是否正在保存数据（boolean）
    placement: 'bottomLeft', // 弹出位置
    handleSubmit: function() {
    },//保存时的处理
    clearSelectData: function() {
    },//关面板后，清空选择数据的处理
    btnAtTop: true,//是否在顶部展示确定按钮
    stopContentHide: false,//避免选中选项后会关闭content内容区域
    isDisabled: false, //未选选项时按钮是禁用状态
    isShowDropDownContent: false, // 是否显示dropdown中的内容
    showDropDownContent: function() { // 保存、取消时，dropdown不显示的处理

    },
    triggerEventStr: 'click',//触发事件hover、click
    popupContainerId: '',//渲染到哪个元素上默认body上
    isDropdownAble: false,
    datatraceContainer: '',
};
AntcDropdown.propTypes = {
    showMenu: PropTypes.bool,
    content: PropTypes.string,
    overlayTitle: PropTypes.string,
    overlayContent: PropTypes.string,
    okTitle: PropTypes.string,
    cancelTitle: PropTypes.string,
    unSelectDataTip: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    isSaving: PropTypes.bool,
    handleSubmit: PropTypes.func,
    clearSelectData: PropTypes.func,
    btnAtTop: PropTypes.bool,
    stopContentHide: PropTypes.bool,
    isDisabled: false,
    overlayClassName: PropTypes.string,
    placement: PropTypes.string,
    isShowDropDownContent: PropTypes.bool,
    showDropDownContent: PropTypes.func,
    popupContainerId: PropTypes.string,
    triggerEventStr: PropTypes.string,
    isDropdownAble: PropTypes.bool,
    datatraceContainer: PropTypes.string,
};
export default AntcDropdown;
