require('../../css/dynamic.less');
//动态store
var DynamicStore = require('../../store/dynamic-store');
//动态action
var DynamicAction = require('../../action/dynamic-action');
var TimeLine = require('../../../../../components/time-line');
import RightPanelScrollBar from '../components/rightPanelScrollBar';

var Dynamic = React.createClass({
    getInitialState: function() {
        return this.getStateFromStore();
    },
    getStateFromStore: function() {
        return {
            dynamicList: DynamicStore.getDynamicListFromView(),
            windowHeight: $(window).height()
        };
    },
    onStoreChange: function() {
        this.setState(this.getStateFromStore());
    },
    componentDidMount: function() {
        DynamicStore.listen(this.onStoreChange);
        DynamicAction.getDynamicList(this.props.currentId);
        $(window).on('resize', this.onStoreChange);
    },
    componentWillReceiveProps: function(nextProps) {
        if (nextProps.currentId !== this.props.currentId) {
            setTimeout(() => {
                DynamicAction.getDynamicList(nextProps.currentId);
            });
        }
    },
    componentWillUnmount: function() {
        DynamicStore.unlisten(this.onStoreChange);
        $(window).off('resize', this.onStoreChange);
    },
    timeLineItemRender: function(item) {
        const call_time = Intl.get('crm.199',
            '在{time}拨打了号码{phone} ，通话时长{duration} 秒',
            {
                time: moment(item.call_date).format(oplateConsts.TIME_FORMAT),
                phone: item.dst,
                duration: item.billsec
            }
        );
        return (
            <dl>
                <dd>
                    {item.message}
                    {item.call_date ?
                        <p>{call_time}</p>
                        : null}
                </dd>
                <dt>{moment(item.date).format(oplateConsts.TIME_FORMAT)}</dt>
            </dl>
        );
    },
    render: function() {
        return (
            <RightPanelScrollBar>
                <div className="dynamicList">
                    <TimeLine
                        list={this.state.dynamicList}
                        groupByDay={true}
                        timeField="date"
                        render={this.timeLineItemRender}
                    />
                </div>
            </RightPanelScrollBar>
        );
    }
});

module.exports = Dynamic;
