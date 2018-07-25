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

    handleVisibleChange(flag) {
        //如果content内容中有下拉框的时候，选中某一项之后，会把AntcDropdown组件也隐藏掉
        //加上stopContentHide 这个属性，打开内容区域后设置为true，关闭后设置为false，避免内容区有select下拉框，选中选项后会关闭content内容区域
        if (this.props.stopContentHide){
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
    }

    render() {
        const menu = (
            <Menu onClick={this.handleMenuClick.bind(this)}>
                <div className="custom-dropdown-title-container dropdown-li" data-tracename="下拉选择框">
                    <div className="dropdown-title">
                        <span>{this.props.overlayTitle}</span>
                    </div>
                    <div className="dropdown-btn-container">
                        { this.props.unSelectDataTip ? (
                            <span className="un-select-data-tip">
                                * {this.props.unSelectDataTip}
                            </span>) : null}
                    </div>
                </div>
                <Menu.Divider />
                <div className="custom-dropdown-content-container dropdown-li">
                    {this.props.overlayContent}
                </div>
                <div className="btn-container">

                    <Button className="inline-block icon-close"
                        onClick={this.handleCancel.bind(this)} data-tracename="点击关闭按钮">{this.props.cancelTitle}

                    </Button>
                    <Button type='primary' className="inline-block icon-choose" disabled={this.props.isSaving}
                        onClick={this.props.handleSubmit.bind(this)} data-tracename="点击保存按钮">{this.props.okTitle}
                        {this.props.isSaving ? <Icon type="loading"/> : null}</Button>
                </div>
            </Menu>
        );

        return (
            <Dropdown overlay={menu} visible={this.state.menuVisible}
                placement="bottomLeft" trigger={['click']}
                onVisibleChange={this.handleVisibleChange.bind(this)}

            >
                {this.props.content}
            </Dropdown>
        );
    }
}
AntcDropdown.defaultProps = {
    showMenu: false,//是否展示下拉菜单（boolean）
    content: '',//Dropdown默认展示的内容（string|ReactNode）
    overlayTitle: '',//下拉菜单中的标题（string|ReactNode）
    overlayContent: '',//下拉菜单中要展示的内容（string|ReactNode）
    okTitle: Intl.get('common.save', '保存'),//对号对应的title提示(string)
    cancelTitle: Intl.get('common.cancel', '取消'),//叉号对应的title提示(string)
    unSelectDataTip: '',//未选择数据保存时的提示信息
    isSaving: false,//是否正在保存数据（boolean）
    handleSubmit: function() {
    },//保存时的处理
    clearSelectData: function() {
    },//关面板后，清空选择数据的处理
    stopContentHide: false
};
AntcDropdown.propTypes = {
    showMenu: React.PropTypes.bool,
    content: React.PropTypes.string,
    overlayTitle: React.PropTypes.string,
    overlayContent: React.PropTypes.string,
    okTitle: React.PropTypes.string,
    cancelTitle: React.PropTypes.string ,
    unSelectDataTip: React.PropTypes.string,
    isSaving: React.PropTypes.bool,
    handleSubmit: React.PropTypes.func,
    clearSelectData: React.PropTypes.func,
    stopContentHide: React.PropTypes.bool,
};
export default AntcDropdown;