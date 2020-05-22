/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/3/27.
 */
require('./style/index.less');
import ApplyProcessList from './view/apply_process_list';
import {Button, Icon} from 'antd';
import {BACKGROUG_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';

class ApplyApproveManage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAddWorkFlowName: false,//是否展示添加自定义流程的名字
            showAddTopNav: true,//是否展示添加的topnav
        };
    }
    onStoreChange = () => {

    };
    updateShowApplyList = () => {
        this.setState({
            showAddWorkFlowName: false
        });
    };
    showOrCloseApplyDetail = (flag = false) => {
        this.setState({
            showAddTopNav: flag
        });
    };

    renderApplyTypeList = () => {
        return (
            <ApplyProcessList
                showAddWorkFlowName={this.state.showAddWorkFlowName}
                updateShowApplyList={this.updateShowApplyList}
                showOrCloseApplyDetail={this.showOrCloseApplyDetail}
            />
        );
    };
    handleClickAddForm = () => {
        this.setState({
            showAddWorkFlowName: true
        });
    };

    renderTopNavOperation = () => {
        return (
            <div className='condition-operator'>
                <div className='pull-left'>
                    <Button
                        className="btn-item"
                        data-tracename="添加申请类型"
                        onClick={this.handleClickAddForm}
                    >
                        <Icon type="plus" />{Intl.get('apply.add.apply.type', '添加申请类型')}
                    </Button>
                </div>
            </div>
        );
    };

    render = () => {
        let height = $(window).height() - BACKGROUG_LAYOUT_CONSTANTS.PADDING_HEIGHT;
        return (
            <div className="apply-approve-manage" style={{height: height}}>
                <div className="apply-approve-wrap" style={{height: height}}>
                    {this.state.showAddTopNav ?
                        <div className='apply-approve-top-nav'>
                            {this.renderTopNavOperation()}
                        </div> : null}
                    <div className='apply-approve-container'>
                        {this.renderApplyTypeList()}
                    </div>
                </div>
            </div>

        );
    }
}

ApplyApproveManage.defaultProps = {};

ApplyApproveManage.propTypes = {};
export default ApplyApproveManage;
