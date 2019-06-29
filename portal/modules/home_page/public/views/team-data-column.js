/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/12.
 */
import ColumnItem from './column-item';

class TeamDataColumn extends React.Component {
    constructor(props) {
        super(props);
        // this.state = {
        //     curHelperType: '',
        // };
    }

    renderTeamDataContent() {
        return '';
    }

    render() {
        return (
            <ColumnItem contianerClass='team-data-wrap'
                title={Intl.get('home.page.my.data', '我的数据')}
                content={this.renderTeamDataContent()}
            />);
    }
}
export default TeamDataColumn;