/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/3/27.
 */
require('../style/add_apply_form.less');
import {Tabs} from 'antd';
const TabPane = Tabs.TabPane;
import NoDataIntro from 'CMP_DIR/no-data-intro';
const TAB_KEYS = {
    FORM_CONTENT: '1',//表单内容
    APPLY_RULE: '2'//审批规则
};
import Trace from 'LIB_DIR/trace';
class AddApplyForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            applyApproveType: this.props.applyApproveType,//审批审批的类型
            activeKey: TAB_KEYS.FORM_CONTENT,//当前选中的TAB
            applyTypeData: this.props.applyTypeData//编辑某个审批的类型
        };
    }

    onStoreChange = () => {

    };
    handleTabChange = (key) => {
        let keyName = key === TAB_KEYS.FORM_CONTENT ? '表单内容' : '审批规则';
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-tabs-nav-wrap .ant-tabs-nav'), '查看' + keyName);
        this.setState({
            activeKey: key
        });
    };
    renderAddTip = () => {
        return (
            <span>
                {Intl.get('apply.approve.manage.add.from.right', '请从右边添加表单内容')}
            </span>
        );
    };

    renderAddFormContent = () => {
        var applyTypeData = this.state.applyTypeData;
        if (applyTypeData) {

        } else {
            //添加某个流程的时候
            return (
                <NoDataIntro
                    showAddBtn={true}
                    noDataAndAddBtnTip={Intl.get('apply.approve.manage.no.content', '暂无表单内容')}
                    renderAddAndImportBtns={this.renderAddTip}
                />
            );
        }

    };
    renderAddFormRules = () => {
        return (
            <div>
                sssss
            </div>
        );
    };
    renderFormContent = () => {

        return (
            <div className="apply-form-content-wrap" >
                <div className="apply-form-rules">
                    {this.renderAddFormRules()}
                </div>
                <div className="apply-form-content-container">
                    <div className="apply-form-content">
                        {this.renderAddFormContent()}
                    </div>

                </div>

            </div>
        );
    };
    renderAddApplyContent = () => {
        var height = $('.add-apply-form-container').height() - $('.add-apply-form-title').height();
        return (
            <div className="add-apply-form-content">
                <Tabs defaultActiveKey={TAB_KEYS.FORM_CONTENT}
                    activeKey={this.state.activeKey}
                    onChange={this.handleTabChange}>
                    <TabPane tab={Intl.get('apply.add.form.content', '表单内容')}
                        key={TAB_KEYS.FORM_CONTENT}>
                        {this.renderFormContent()}
                    </TabPane>
                    <TabPane tab={Intl.get('apply.add.form.regex', '审批规则')}
                        key={TAB_KEYS.APPLY_RULE}>
                        222222
                    </TabPane>
                </Tabs>
            </div>
        );
    };
    handleClickCloseAddPanel = () => {
        this.props.closeAddPanel();
    };
    render = () => {
        return (
            <div className="add-apply-form-container">
                <div className="add-apply-form-title">
                    <div className="show-and-edit-approve-type">
                        {this.state.applyApproveType}
                        <i className="pull-right iconfont icon-update"></i>
                    </div>
                    <i className="pull-right iconfont icon-close" onClick={this.handleClickCloseAddPanel}></i>
                </div>
                {this.renderAddApplyContent()}
            </div>
        );
    }
}

AddApplyForm.defaultProps = {
    applyApproveType: '',
    closeAddPanel: function() {

    },
    applyTypeData: {}
};

AddApplyForm.propTypes = {
    applyApproveType: PropTypes.string,
    closeAddPanel: PropTypes.func,
    applyTypeData: PropTypes.object
};
export default AddApplyForm;