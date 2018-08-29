const PropTypes = require('prop-types');
var React = require('react');
import {Alert, Spin, Button} from 'antd';
const classname = require('classnames');

class TableList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedItemIdx: ''
        };
    }

    handleClickItem(item, idx) {
        this.setState({
            selectedItemIdx: idx
        });
        this.props.onClick(item);
    }

    onAdd() {
        //点击添加时将选中状态清空
        this.setState({
            selectedItemIdx: ''
        });
        this.props.onAdd();
    }

    render() {
        const {onClick, onAdd, onLoad} = this.props;
        const {errorMsg, data, loading, total, loadingMore} = this.props.tableListResult;
        const renderLoadMore = () => {
            if (errorMsg) {
                return;
            }
            if (loadingMore) {
                return (
                    <Spin size="small" style={{width: '100%', textAligh: 'center'}}/>
                );
            }
            if (data && (total > data.length)) {
                /* 将最后一条的sortId传入，用于分页查询 */
                return (
                    <Button
                        onClick={() => onLoad(data[data.length - 1].sortId)}
                    >
                        {Intl.get('contract.loadMore', '加载更多')}
                    </Button>
                );
            } else {
                return null;
            }
        };
        const renderErrorMsg = () => {
            if (errorMsg) {
                return (
                    (
                        <div className="alert-timer">
                            <Alert message={errorMsg} type="error" showIcon/>
                        </div>
                    )
                );
            }
        };
        const renderLoading = () => {
            if (errorMsg) {
                return;
            }
            if (loading) {
                return (
                    <Spin size="large" style={{width: '100%', textAligh: 'center'}}/>
                );
            }
        };
        const renderNoData = () => {
            if (errorMsg) {
                return;
            }
            if (!data || data.length === 0) {
                return (
                    (
                        <div className="alert-timer">
                            <Alert message={Intl.get('common.no.data', '暂无数据')} type="info" showIcon/>
                        </div>
                    )
                );
            }
        };
        const renderList = () => {
            if (errorMsg) {
                return;
            }
            if (data && data.length > 0) {
                return (
                    <ul>
                        {
                            data.map((item, idx) => {
                                const itemClassName = classname('table-item', {
                                    'selected': this.state.selectedItemIdx === idx
                                });
                                return (
                                    <li key={idx}
                                        className={itemClassName}
                                        onClick={this.handleClickItem.bind(this, item, idx)}
                                    >
                                        {item.view_name}
                                    </li>
                                );
                            })
                        }
                    </ul>
                );
            }
        };
        return (
            <div className="table-list-container" style={this.props.style && this.props.style}>
                <Button onClick={this.onAdd.bind(this)}>{Intl.get('common.add', '添加')}</Button>
                {renderList()}
                {renderNoData()}
                {renderLoading()}
                {renderErrorMsg()}
                {renderLoadMore()}
            </div>
        );
    }
}
TableList.propTypes = {
    onClick: PropTypes.func,
    onAdd: PropTypes.func,
    onLoad: PropTypes.func,
    tableListResult: PropTypes.object,
    style: PropTypes.object
};
export default TableList;