/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/3/27.
 */
require('./style/index.less');
var classNames = require('classnames');
import AddApplyForm from './view/add_apply_form';
import AddAndShowApplyList from './view/add_and_show_apply_list';
import ButtonZones from 'CMP_DIR/top-nav/button-zones';
import {Button} from 'antd';
import {calculateHeight } from './utils/apply-approve-utils';
class ApplyApproveManage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAddForm: false,
            showApplyTypeList: [{'applyType': '默认申请审批','approveRoles': ['销售'],'approveCheck': false,id: '111111111111'},{'applyType': '请假申请审批','approveRoles': ['销售222'],'approveCheck': true,id: '222222222222222222'}],//申请审批的列表
        };
    }
    onStoreChange = () => {

    };
    updateShowApplyList = (showApplyTypeList) => {
        this.setState({
            showApplyTypeList: showApplyTypeList || this.state.showApplyTypeList,
            showAddForm: false
        });
    };

    renderApplyTypeList = () => {
        return (
            <AddAndShowApplyList
                showApplyList = {this.state.showApplyTypeList}
                showAddForm = {this.state.showAddForm}
                updateShowApplyList = {this.updateShowApplyList}
            />
        );
    };
    handleClickAddForm = () => {
        this.setState({
            showAddForm: true
        });
    };
    renderTopBottom = () => {
        return (
            <ButtonZones>
                <div className="btn-item-container">
                    <Button className='btn-item'
                        onClick={this.handleClickAddForm}>{Intl.get('apply.add.apply.type', '添加申请类型')}</Button>
                </div>
            </ButtonZones>
        );
    };
    render = () => {
        return (
            <div className="apply-approve-manage">
                {this.renderTopBottom()}
                <div className='apply-approve-container' style={{height: calculateHeight()}}>
                    {this.renderApplyTypeList()}
                </div>
            </div>

        );
    }
}

ApplyApproveManage.defaultProps = {

};

ApplyApproveManage.propTypes = {

};
export default ApplyApproveManage;