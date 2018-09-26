/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/26.
 */
const PropTypes = require('prop-types');
var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/27.
 */
var classNames = require('classnames');
require('./index.less');
import ApplyListItem from '../apply-list-item';
class ApplyList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            applyListObj: this.props.applyListObj,
        };
    }

    onStoreChange = () => {

    };
    componentDidMount = () => {

    };
    componentWillReceiveProps = (nextProps) => {
        this.setState({
            applyListObj: nextProps.applyListObj,
        });
    };
    componentWillUnmount = () => {

    };

    render(){
        return (
            <ul className="list-unstyled leave_manage_apply_list">
                {
                    this.state.applyListObj.list.map((obj, index) => {
                        return (
                            <ApplyListItem
                                key={index}
                                obj={obj}
                                index= {index}
                                clickShowDetail={this.props.clickShowDetail}
                                getApplyTopicText={this.props.getApplyTopicText}
                                getApplyStateText={this.props.getApplyStateText}
                                getTimeStr={this.props.getTimeStr}
                                processedStatus={this.props.processedStatus}
                                selectedDetailItem={this.props.selectedDetailItem}
                                selectedDetailItemIdx={this.props.selectedDetailItemIdx}
                            />
                        );
                    })
                }
            </ul>
        );
    }
}
ApplyList.defaultProps = {
    applyListObj: {},
    selectedDetailItem: {},
    selectedDetailItemIdx: '',
    getApplyTopicText: function() {

    },
    getApplyStateText: function() {

    },
    getTimeStr: function() {
        
    },
    clickShowDetail: function() {

    },
    processedStatus: '',

};
ApplyList.propTypes = {
    applyListObj: PropTypes.object,
    selectedDetailItem: PropTypes.object,
    selectedDetailItemIdx: PropTypes.string,
    getApplyTopicText: PropTypes.func,
    getApplyStateText: PropTypes.func,
    getTimeStr: PropTypes.func,
    clickShowDetail: PropTypes.func,
    processedStatus: PropTypes.string,
};

export default ApplyList;
