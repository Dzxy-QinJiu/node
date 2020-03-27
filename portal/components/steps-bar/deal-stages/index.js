/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/5/10.
 */
import {Menu, Dropdown, Popconfirm} from 'antd';
import StepsBar from 'CMP_DIR/steps-bar';
//订单状态
const ORDER_STATUS = {
    WIN: 'win',//赢单
    LOSE: 'lose'//丢单
};
class DealStagesStepsBar extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            curOrderCloseStatus: ''//当前选中的关闭状态
        };
    }

    selectCloseOrderStatus = () => {

    }
    cancelCloseOrder=() => {

    }

    getDropDownMenus(){
        return (
            <Menu onClick={this.selectCloseOrderStatus} selectedKeys={[this.state.curOrderCloseStatus]}>
                <Menu.Item key={ORDER_STATUS.WIN}>
                    {Intl.get('crm.order.status.win', '赢单')}
                </Menu.Item>
                <Menu.Item key={ORDER_STATUS.LOSE}>
                    {Intl.get('crm.order.status.lose', '丢单')}
                </Menu.Item>
            </Menu>
        );
    }
    //关闭订单项
    getCloseOrderStep(){
        return (
            <Dropdown overlay={this.getDropDownMenus()} trigger={['click']}>
                {this.state.curOrderCloseStatus === ORDER_STATUS.WIN ? (
                    <Popconfirm visible={true} onCancel={this.cancelCloseOrder}
                        onConfirm={this.closeOrder.bind(this, ORDER_STATUS.WIN)}
                        title={Intl.get('crm.order.close.win.confirm', '确定将订单的关闭状态设为赢单吗？')}>
                    </Popconfirm>) : (
                    <span className="order-stage-name"/>)}
            </Dropdown>
        );
    }
    getStageStepList(currentStageIndex){
        let stageList = this.props.stageList;
        return _.map(stageList, (stage, index) => {
            const stageName = stage.name ? stage.name.split('阶段')[0] : '';
            if (index === currentStageIndex || this.props.disableEdit) {
                //title用于展示
                return {title: stageName};
            } else {
                return {
                    title: stageName,
                    //该步骤的处理元素渲染
                    stepHandleElement: (
                        <Popconfirm title={Intl.get('crm.order.update.confirm', '确定要修改订单阶段？')}
                            onConfirm={this.editOrderStage.bind(this, stage.name)}>
                            <span className="order-stage-name"/>
                        </Popconfirm>)
                };
            }
        });
    }

    render(){
        let curStage = this.props.curStage;
        let stageList = this.props.stageList;
        let currentStageIndex = _.findIndex(stageList, stage => stage.name === curStage);
        let stageStepList = this.getStageStepList(currentStageIndex);
        if(!this.props.disableEdit){
            stageStepList.push({title: Intl.get('crm.order.close.step', '关闭订单'), stepHandleElement: this.getCloseOrderStep()});
        }
        return (
            <StepsBar stepDataList={stageStepList} currentStepIndex={currentStageIndex}
                onClickStep={this.onClickStep.bind(this)}/>);
    }
}
DealStagesStepsBar.propTypes = {
    stageList: PropTypes.array,//订单阶段列表
    disableEdit: PropTypes.bool,//是否不能修改
    curStage: PropTypes.object,//当前的订单状态
};
export default ErrorHandleHoc.withErrorHandler(DealStagesStepsBar);