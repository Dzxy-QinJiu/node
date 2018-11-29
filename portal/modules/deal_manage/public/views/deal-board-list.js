/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/11/27.
 */

import HTML5Backend from 'react-dnd-html5-backend';
import {DragDropContext} from 'react-dnd';
import DealStageBoard from './deal-stage-board';

class DealBoardList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stageList: this.getFormatStageList(props.stageList),
            containerHeight: props.containerHeight
        };
    }
    componentWillReceiveProps(nextProps) {
        if (this.state.containerHeight !== nextProps.containerHeight) {
            this.setState({containerHeight: nextProps.containerHeight});
        }
    }

    getFormatStageList(stageList) {
        stageList = _.map(stageList, stage => {
            return {...stage, value: stage.name};
        });
        //丢单、赢单的添加
        stageList = _.concat(stageList, [
            {
                name: Intl.get('crm.order.status.won', '赢单'),
                value: 'win'
            },
            {
                name: Intl.get('crm.order.status.lost', '丢单'),
                value: 'lose'
            }
        ]);
        return stageList;
    }

    render() {
        return (
            <div className="deal-board-list">
                {_.map(this.state.stageList, (stage, index) => {
                    return (<DealStageBoard stage={stage} key={index}
                        showDetailPanel={this.props.showDetailPanel}
                        showCustomerDetail={this.props.showCustomerDetail}
                        containerHeight={this.state.containerHeight}/>);
                })}
            </div>);
    }
}

DealBoardList.propTypes = {
    stageList: PropTypes.array,
    containerHeight: PropTypes.number,
    showDetailPanel: PropTypes.func,
    showCustomerDetail: PropTypes.func
};

export default DragDropContext(HTML5Backend)(DealBoardList);