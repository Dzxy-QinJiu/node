var React = require('react');
require('../../css/dynamic.less');
//动态store
var CustomerDynamicStore = require('../../store/customer-dynamic-store');
//动态action
var CustomerDynamicAction = require('../../action/customer-dynamic-action');
var crmAction = require('../../action/crm-actions');
import {AntcTimeLine} from 'antc';
import RightPanelScrollBar from '../components/rightPanelScrollBar';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import Spinner from 'CMP_DIR/spinner';
import ShearContent from '../../../../../components/shear-content-new';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import DetailCard from 'CMP_DIR/detail-card';
class Dynamic extends React.Component {
    state = {
        ...CustomerDynamicStore.getState(),
        windowHeight: $(window).height()
    };

    onStoreChange = () => {
        this.setState({...CustomerDynamicStore.getState()});
    };

    componentDidMount() {
        CustomerDynamicStore.listen(this.onStoreChange);
        CustomerDynamicAction.getDynamicList(this.props.currentId);
        $(window).on('resize', this.onStoreChange);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentId !== this.props.currentId) {
            setTimeout(() => {
                CustomerDynamicAction.getDynamicList(nextProps.currentId);
            });
        }
    }

    componentWillUnmount() {
        CustomerDynamicStore.unlisten(this.onStoreChange);
        $(window).off('resize', this.onStoreChange);
    }
    hideRightPanel = () => {
        crmAction.showClueDetail('');
    }
    //删除线索之后
    afterDeleteClue = () => {
        crmAction.showClueDetail('');
    };
    showClueDetailOut = (clueId) => {
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_CLUE_PANEL, {
            clue_params: {
                currentId: clueId,
                hideRightPanel: this.hideRightPanel,
                afterDeleteClue: this.afterDeleteClue
            }
        });
    };

    timeLineItemRender = (item) => {
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
                    <ShearContent>
                        {item.message}
                    </ShearContent>
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
    };

    render() {
        return (
            <RightPanelScrollBar>
                {this.state.isLoading ? <Spinner/> : this.state.errorMsg ? (
                    <span className="dynamic-error-tip">{this.state.errorMsg}</span>) : _.get(this.state, 'dynamicList[0]') ? (
                    <div className="dynamic-list">
                        <DetailCard contentNoPadding={true} content={(
                            <AntcTimeLine
                                data={this.state.dynamicList}
                                groupByDay={true}
                                timeField="date"
                                contentRender={this.timeLineItemRender}
                            />
                        )}/>
                    </div>) : <NoDataIconTip tipContent={Intl.get('crm.dynamic.no.data', '暂无动态')}/>}
            </RightPanelScrollBar>
        );
    }
}
Dynamic.propTypes = {
    currentId: PropTypes.string
};
module.exports = Dynamic;

