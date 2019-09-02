/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by sunqingfeng on 2019/9/2.
 */
import './style/index.less';

import {Button, Icon} from 'antd';
import {BACKGROUG_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';


class ClueAssignment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    //添加分配策略
    addAssignmentStrategy = () => {
        console.log('hi');
    }

    //渲染顶端操作项
    renderTopNavOperation = () => {
        return (
            <div className="add-clue-assignment-top">
                <div className="add-clue-assignment-btn">
                    <Button
                        className="add-btn-item"
                        onClick={this.addAssignmentStrategy}
                        data-tracename="添加分配策略"
                    >
                        <Icon type="plus" />
                        {Intl.get('clue.assignment.strategy.add','添加分配策略')}
                    </Button>
                </div>
            </div>
        );
    }


    render() {
        let height = $(window).height() - BACKGROUG_LAYOUT_CONSTANTS.PADDING_HEIGHT;
        let containerHeight = height - BACKGROUG_LAYOUT_CONSTANTS.TOP_ZONE_HEIGHT;
        return (
            <div style={{height: height}}
                className="clue-assignment-container"
                data-tracename="线索分配"
            >
                <div className="clue-top-nav">
                    {this.renderTopNavOperation()}
                </div>
            </div>
        );
    }
}

export default ClueAssignment;