/**
 * Created by hzl on 2020/5/25.
 * 移动端适配的操作记录
 */
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import Spinner from 'CMP_DIR/spinner';
import userInfoAjax from '../ajax/user-info-ajax';
import NoData from 'CMP_DIR/no-data';
import LoadDataError from 'CMP_DIR/load-data-error';
import {NavLink} from 'react-router-dom';
import DetailCard from 'CMP_DIR/detail-card';
import '../css/operate-record.less';
import adaptiveHeightHoc from 'CMP_DIR/adaptive-height-hoc';

const pageSize = 10;

class OperateRecord extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageSize: pageSize,
            loading: false, 
            recordList: [],
            errorMsg: '', 
            sortId: '', 
            total: 0,
            listenScrollBottom: true // 下拉加载
        };
    }

    // 获取用户交易记录
    getUserOperateRecord = (queryObj) => {
        if (this.state.sortId === '') {
            this.setState({
                loading: true
            });
        }
        let submitObj = {
            load_size: pageSize,
        };
        let sortId = _.get(queryObj, 'sort_id');
        if (sortId) {
            submitObj.sort_id = sortId;
        }
        userInfoAjax.getLogList(submitObj).then( (result) => {
            let total = _.get(result, 'total', 0);
            let recordList = this.state.recordList;
            recordList = recordList.concat(_.get(result, 'list', []));
            let length = recordList.length;
            let sortId = length > 0 ? _.last(recordList).sortValuse : '';
            let listenScrollBottom = length < total ? true : false;
            this.setState({
                loading: false,
                recordList: recordList,
                sortId: sortId,
                total: total,
                listenScrollBottom: listenScrollBottom
            });
        }, (errMsg) => {
            this.setState({
                loading: false,
                errorMsg: errMsg,
                listenScrollBottom: false
            });
        } );
    };

    componentDidMount() {
        this.getUserOperateRecord();
    }

    setInitialData = () => {
        this.setState = {
            pageSize: pageSize,
            loading: false,
            recordList: [],
            errorMsg: '',
            sortId: '',
            total: 0,
            listenScrollBottom: true,
        };
    }

    handleScrollBarBottom = () => {
        console.log('###############:', this.state.listenScrollBottom);
        if (this.state.listenScrollBottom) {
            this.getUserOperateRecord({sort_id: this.state.sortId});
        }
    };

    renderLoadingBlock = () => {
        if (!this.state.sortId && this.state.loading) {
            return (
                <div className="trade-record-loading">
                    <Spinner loadingText={Intl.get('common.sales.frontpage.loading', '加载中')}/>
                </div>
            );
        } else {
            return null;
        }
    };

    renderCardTitle = (item) => {
        let timestamp = _.get(item, 'timestamp');
        return (
            <div className="card-title">
                <span className="content">
                    {
                        timestamp ? (moment(_.toNumber(timestamp)).format(oplateConsts.DATE_TIME_FORMAT)) : null
                    }
                </span>
            </div>
        );
    };

    renderRecordAddress = (item) => {
        const country = _.isEqual(item.country, null) ? '' : item.country;
        const province = _.isEqual(item.province, null) ? '' : item.province;
        const city = _.isEqual(item.city, null) ? '' : item.city;
        return `${country}` + `${province}` + `${city}`;
    }

    renderRecordBrowser = (item) => {
        const browserList = {
            'Chrome': Intl.get('user.login.browser.chrom', '谷歌'),
            'Firefox': Intl.get('user.login.browser.Firefox', '火狐'),
            'Microsoft Edge': Intl.get('user.login.browser.MicrosoftEdge', 'Edge'),
            'Rest': Intl.get('user.login.browser.Rest', 'Rest接口'),
            'Internet Explorer': Intl.get('user.login.browser.InternetExplorer', 'IE'),
        };
        const browser = _.get(item, 'browser');
        return browserList[browser];
    }

    renderRecordEquipment = (item) => {
        const equipment = {
            Computer: Intl.get('user.login.equipment.pc', '电脑',),
            Mobile: Intl.get('member.phone', '手机'),
            Unknown: Intl.get('common.unknown', '未知'),
            Tablet: Intl.get('user.login.equipment.Tablet', '平板电脑'),

        };
        const device = _.get(item, 'device');
        return equipment[device];
    }

    renderCardContent = (item) => {
        return (
            <div className="card-content">
                <div className="operate-record-item">
                    <span className="item-title">{Intl.get('user.info.login.address','地点')}:</span>
                    <span className="item-content">{this.renderRecordAddress(item)}</span>
                </div>

                <div className="operate-record-item">
                    <span className="item-title">IP:</span>
                    <span className="item-content">{_.get(item,'ip')}</span>
                </div>

                <div className="operate-record-item">
                    <span className="item-title">{Intl.get('user.info.login.browser','浏览器')}:</span>
                    <span className="item-content">{this.renderRecordBrowser(item)}</span>
                </div>

                <div className="operate-record-item">
                    <span className="item-title">{Intl.get('common.login.equipment','设备')}:</span>
                    <span className="item-content">{this.renderRecordEquipment(item)}</span>
                </div>

                <div className="operate-record-item">
                    <span className="item-title">{Intl.get('common.operate','操作')}:</span>
                    <span className="item-content">
                        {
                            _.isEqual(item.operate, null) ? '' : item.operate
                        }
                    </span>
                </div>

            </div>
        );
    }

    renderUserRecordContent = (recordList) => {
        return (
            <div className="content-wrap">
                {
                    _.map(recordList, item => {
                        return (
                            <DetailCard
                                title={this.renderCardTitle(item)}
                                content={this.renderCardContent(item)}
                            />
                        );
                    })
                }
            </div>
        );
    }

    renderUserOperateRecordContent = () => {
        let recordList = this.state.recordList;
        let length = _.get(recordList, 'length');
        if (length) {
            return this.renderUserRecordContent(recordList);
        } else {
            return this.renderNoDataOrLoadError();
        }
    };

    renderNoDataOrLoadError = () => {
        let errorMsg = this.state.errorMsg;
        return (
            <div className="msg-tips">
                {
                    errorMsg ? (
                        <LoadDataError
                            retryLoadData={this.getUserOperateRecord}
                        />
                    ) : (
                        <div className="no-data-tips-operate">
                            <NoData textContent={Intl.get('common.no.data','暂无数据')}/>
                        </div>
                    )
                }
            </div>
        );
    };

    render() {
        return (
            <div className="operate-record-wrap" style={{height: this.props.adaptiveHeight}}>
                <GeminiScrollBar
                    handleScrollBottom={this.handleScrollBarBottom.bind(this)}
                    listenScrollBottom={true}
                >
                    <div className="operate-record-content">
                        <div className="title-zone">
                            <label className="log-title-tips">
                                <ReactIntl.FormattedMessage
                                    id="user.info.log.record.tip"
                                    defaultMessage={'以下为您最近的操作记录，若存在异常情况，请在核实后尽快{editpassword}'}
                                    values={{
                                        editpassword: <span className="update-pwd">
                                            <NavLink
                                                to="/user-preference/password"
                                                activeClassName="active"
                                                data-tracename="修改密码"
                                            >
                                                {Intl.get('common.edit.password','修改密码')}
                                            </NavLink>
                                        </span>
                                    }}
                                />
                            </label>
                        </div>
                        {this.renderLoadingBlock()}
                        {this.renderUserOperateRecordContent()}
                    </div>
                </GeminiScrollBar>
            </div>
        );
    }
}

OperateRecord.propTypes = {
    adaptiveHeight: PropTypes.number
};

export default adaptiveHeightHoc(OperateRecord, '.operate-record-wrap');
