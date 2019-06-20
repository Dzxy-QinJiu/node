/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/12.
 */
import {Dropdown, Icon, Menu} from 'antd';
import ColumnItem from './column-item';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {getColumnHeight} from './common-util';
const MY_HELPER_TYPES = [{name: Intl.get('home.page.helper.all', '全部事务'), value: ''},];
class MyHelperColumn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curHelperType: '',
        };
    }

    onChangeHelperType = (item, key) => {
        this.setState({curHelperType: key});
    }

    getHelperTypeDropdown() {
        const helperTypeMenu = (
            <Menu onClick={this.onChangeHelperType}>
                {_.map(MY_HELPER_TYPES, item => {
                    return (<Menu.Item key={item.value}>{item.name}</Menu.Item>);
                })}
            </Menu>);
        const curHelperType = _.find(MY_HELPER_TYPES, item => item.value === this.state.curHelperType);
        const curHelperTypeName = _.get(curHelperType, 'name', MY_HELPER_TYPES[0].name);
        return (
            <Dropdown overlay={helperTypeMenu} trigger={['click']}>
                <span className='my-helper-dropdown-trigger'>
                    {curHelperTypeName}
                    <Icon type='down' className='dropdown-icon'/>
                </span>
            </Dropdown>);
    }
    renderHelperContent() {
        return (
            <div className='my-insterest-content' style={{height: getColumnHeight()}}>
                <GeminiScrollbar>
                    {/*{this.renderNoticeList()}*/}
                </GeminiScrollbar>
            </div>);
    }

    render() {
        return (
            <ColumnItem contianerClass='my-helper-wrap'
                title={Intl.get('home.page.my.helper', '我的助手')}
                titleIcon={<span className='iconfont icon-interested title-icon'/>}
                titleHandleElement={this.getHelperTypeDropdown()}
                content={this.renderHelperContent()}
                width='50%'
            />);
    }
}

export default MyHelperColumn;