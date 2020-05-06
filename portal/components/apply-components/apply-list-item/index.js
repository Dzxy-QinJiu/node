/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/26.
 */
var classNames = require('classnames');
require('./index.less');
import {getApplyStateText, getTimeStr, getApplyTopicText} from 'PUB_DIR/sources/utils/common-method-util';
class ApplyListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDetailItem: this.props.selectedDetailItem,
            selectedDetailItemIdx: this.props.selectedDetailItemIdx

        };
    }
    componentWillReceiveProps = (nextProps) => {
        this.setState({
            selectedDetailItem: nextProps.selectedDetailItem,
            selectedDetailItemIdx: nextProps.selectedDetailItemIdx,
        });
    };
    componentWillUnmount = () => {

    };

    render() {
        var obj = this.props.obj;
        var index = this.props.index;
        var btnClass = classNames({
            processed: obj.status !== this.props.processedStatus
        });
        var currentClass = classNames('apply-list-item',{
            current: obj.id === this.state.selectedDetailItem.id && index === this.state.selectedDetailItemIdx
        });
        let customerName = _.get(obj, 'detail.customer_name');
        // 机会申请、预约拜访申请显示客户名
        if (_.get(obj, 'workflow_type') === 'business_opportunities') { // 机会申请
            customerName = _.get(obj, 'detail.customer.name');
        } else if ( _.get(obj, 'workflow_type') === 'visitapply') { // 预约拜访申请
            customerName = _.get(obj, 'detail.customers[0].name');
        }
        return (
            <li key={obj.id} className={currentClass}
                onClick={this.props.clickShowDetail.bind(this, obj, index)}
            >
                <dl>
                    <dt>
                        <span className='user-apply-name'>{_.get(obj,'detail.user_apply_name') || getApplyTopicText(obj)}
                            {this.props.hasUnreadReply ? <span className="iconfont icon-apply-message-tip"
                                title={Intl.get('user.apply.unread.reply', '有未读回复')}/> : null}
                        </span>
                        <em className={btnClass}>{getApplyStateText(obj)}</em>
                    </dt>
                    {
                        customerName ? (
                            <dd className="clearfix" title={customerName}>
                                <span>{customerName}</span>
                            </dd>
                        ) : null
                    }

                    <dd className="clearfix">
                        <span>{Intl.get('user.apply.presenter', '申请人')}:{_.get(obj, 'applicant.nick_name')}</span>
                        <em>{getTimeStr(obj.create_time, oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT)}</em>
                    </dd>
                </dl>
            </li>
        );


    }
}
ApplyListItem.defaultProps = {
    selectedDetailItem: {},
    obj: {},
    index: '',
    selectedDetailItemIdx: '',

    clickShowDetail: function() {

    },
    processedStatus: '',
    hasUnreadReply: false
};
ApplyListItem.propTypes = {
    selectedDetailItem: PropTypes.object,
    obj: PropTypes.object,
    index: PropTypes.string,
    selectedDetailItemIdx: PropTypes.string,
    clickShowDetail: PropTypes.func,
    processedStatus: PropTypes.string,
    hasUnreadReply: PropTypes.bool
};

export default ApplyListItem;
