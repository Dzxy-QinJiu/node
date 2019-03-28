/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/3/27.
 */
require('./style/index.less');
var classNames = require('classnames');
import AddApplyForm from './view/add_apply_form';
const APPLYAPPROVE_LAYOUT = {
    TOPANDBOTTOM: 64
};
class ApplyApproveManage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showApplyTypeList: true
        };
    }

    onStoreChange = () => {

    };
    showApplyForm = () => {
        this.setState({
            showApplyTypeList: false
        });
    };
    renderAddApplyBtn = () => {
        return (
            <div className="apply-add-show-card add-card">
                <div className="add-card-tip" onClick={this.showApplyForm}>
                    + {Intl.get('apply.add.apply.type', '添加申请类型')}
                </div>
            </div>
        );
    };
    closeAddApplyPanel = () => {
        this.setState({
            showApplyTypeList: true
        });
    };
    renderAddApplyForm = () => {
        return (
            <AddApplyForm
                applyApproveType="一个自定义申请"
                applyTypeData= ""
                closeAddPanel ={this.closeAddApplyPanel}
            />
        );
    };
    renderApplyTypeList = () => {
        var hasExistedApplyList = this.state.existedApplyList;
        return (
            <div className="apply-list">
                {this.renderAddApplyBtn()}
                {/*渲染已经有的申请审批的类型*/}
            </div>
        );
    };
    render = () => {
        var showApplyList = this.state.showApplyTypeList;
        var cls = classNames('apply-approve-container',{'show-apply-list': showApplyList});
        var height = $(window).height() - APPLYAPPROVE_LAYOUT.TOPANDBOTTOM;
        return (
            <div className={cls} style={{height: height}}>
                {showApplyList ? this.renderApplyTypeList() : this.renderAddApplyForm()}
            </div>
        );
    }
}

ApplyApproveManage.defaultProps = {

};

ApplyApproveManage.propTypes = {

};
export default ApplyApproveManage;