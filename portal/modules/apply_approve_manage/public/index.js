/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/3/27.
 */
require('./style/index.less');
var classNames = require('classnames');
import ApplyProcessList from './view/apply_process_list';
import ButtonZones from 'CMP_DIR/top-nav/button-zones';
import {Button} from 'antd';

class ApplyApproveManage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAddWorkFlowName: false,//是否展示添加自定义流程的名字
        };
    }
    onStoreChange = () => {

    };
    updateShowApplyList = () => {
        this.setState({
            showAddWorkFlowName: false
        });
    };


    renderApplyTypeList = () => {
        return (
            <ApplyProcessList
                showAddWorkFlowName={this.state.showAddWorkFlowName}
                updateShowApplyList={this.updateShowApplyList}
            />
        );
    };
    handleClickAddForm = () => {
        this.setState({
            showAddWorkFlowName: true
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
                <div className='apply-approve-container'>
                    {this.renderApplyTypeList()}
                </div>
            </div>

        );
    }
}

ApplyApproveManage.defaultProps = {};

ApplyApproveManage.propTypes = {};
export default ApplyApproveManage;