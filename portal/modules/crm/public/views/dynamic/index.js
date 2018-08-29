var React = require('react');
require('../../css/dynamic.less');
//动态store
var DynamicStore = require('../../store/dynamic-store');
//动态action
var DynamicAction = require('../../action/dynamic-action');
var crmAction = require('../../action/crm-actions');
import {AntcTimeLine} from 'antc';
import RightPanelScrollBar from '../components/rightPanelScrollBar';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import Spinner from 'CMP_DIR/spinner';
import clueCustomerAjax from 'MOD_DIR/clue_customer/public/ajax/clue-customer-ajax';
var Dynamic = React.createClass({
    getInitialState: function() {
        return {
            ...DynamicStore.getState(),
            windowHeight: $(window).height()
        };
    },
    onStoreChange: function() {
        this.setState({...DynamicStore.getState()});
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
    showClueDetailOut: function(clueId) {
        crmAction.showClueDetail(clueId);
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
                    {item.relate_id && item.relate_name ?
                        <span className="relate-name" onClick={this.showClueDetailOut.bind(this, item.relate_id)}>{item.relate_name}</span>
                        : null}
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
                {this.state.isLoading ? <Spinner/> : this.state.errorMsg ? (
                    <span className="dynamic-error-tip">{this.state.errorMsg}</span>) : _.get(this.state, 'dynamicList[0]') ? (
                    <div className="dynamicList">
                        <AntcTimeLine
                            data={this.state.dynamicList}
                            groupByDay={true}
                            timeField="date"
                            contentRender={this.timeLineItemRender}
                        />
                    </div>) : <NoDataIconTip tipContent={Intl.get('crm.dynamic.no.data', '暂无动态')}/>}
            </RightPanelScrollBar>
        );
    }
});

module.exports = Dynamic;

