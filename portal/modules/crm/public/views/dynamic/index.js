require('../../css/dynamic.less');
//动态store
var DynamicStore = require('../../store/dynamic-store');
//动态action
var DynamicAction = require('../../action/dynamic-action');
var TimeLine = require('../../../../../components/time-line');
import RightPanelScrollBar from '../components/rightPanelScrollBar';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import Spinner from 'CMP_DIR/spinner';
import ClueRightPanel from 'MOD_DIR/clue_customer/public/views/clue-right-detail';
import {clueSourceArray, accessChannelArray, clueClassifyArray} from 'PUB_DIR/sources/utils/consts';
var Dynamic = React.createClass({
    getInitialState: function() {
        return {
            accessChannelArray: accessChannelArray,//线索渠道
            clueSourceArray: clueSourceArray,//线索来源
            clueClassifyArray: clueClassifyArray,//线索分类
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
        this.setState({
            clueId: clueId
        });
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
    hideRightPanel: function() {
        this.setState({
            clueId: ''
        });
    },
    getClueSource: function() {
        clueCustomerAjax.getClueSource().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    clueSourceArray: _.union(this.state.clueSourceArray, removeSpacesAndEnter(data.result))
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索来源出错了 ' + errorMsg);
        });
    },
    getClueChannel: function() {
        clueCustomerAjax.getClueChannel().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    accessChannelArray: _.union(this.state.accessChannelArray, removeSpacesAndEnter(data.result))
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索渠道出错了 ' + errorMsg);
        });
    },
    getClueClassify: function() {
        clueCustomerAjax.getClueClassify().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    clueClassifyArray: _.union(this.state.clueClassifyArray, removeSpacesAndEnter(data.result))
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索分类出错了 ' + errorMsg);
        });
    },
    //更新线索来源列表
    updateClueSource: function(newSource) {
        this.state.clueSourceArray.push(newSource);
        this.setState({
            clueSourceArray: this.state.clueSourceArray
        });
    },
    //更新线索渠道列表
    updateClueChannel: function(newChannel) {
        this.state.accessChannelArray.push(newChannel);
        this.setState({
            accessChannelArray: this.state.accessChannelArray
        });
    },
    //更新线索分类
    updateClueClassify: function(newClue) {
        this.state.clueClassifyArray.push(newClue);
        this.setState({
            clueClassifyArray: this.state.clueClassifyArray
        });
    },
    render: function() {
        return (
            <RightPanelScrollBar>
                {this.state.isLoading ? <Spinner/> : this.state.errorMsg ? (
                    <span className="dynamic-error-tip">{this.state.errorMsg}</span>) : _.get(this.state, 'dynamicList[0]') ? (
                    <div className="dynamicList">
                        <TimeLine
                            list={this.state.dynamicList}
                            groupByDay={true}
                            timeField="date"
                            render={this.timeLineItemRender}
                        />
                    </div>) : <NoDataIconTip tipContent={Intl.get('crm.dynamic.no.data', '暂无动态')}/>}
                {this.state.clueId ? <ClueRightPanel
                    showFlag={true}
                    currentId={this.state.clueId}
                    hideRightPanel={this.hideRightPanel}
                    accessChannelArray={this.state.accessChannelArray}
                    clueSourceArray={this.state.clueSourceArray}
                    clueClassifyArray={this.state.clueClassifyArray}
                    updateClueSource={this.updateClueSource}
                    updateClueChannel={this.updateClueChannel}
                    updateClueClassify={this.updateClueClassify}
                    salesManList={this.state.salesManList}
                /> : null}
            </RightPanelScrollBar>
        );
    }
});

module.exports = Dynamic;
