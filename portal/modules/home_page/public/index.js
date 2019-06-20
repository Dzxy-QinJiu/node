/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/11.
 */
import './css/index.less';
import MyHelperColumn from './views/my-helper-column';
import MyInsterestColumn from './views/my-insterest-column';
import TeamDataColumn from './views/team-data-column';

class HomePage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='home-page-container'>
                <MyHelperColumn/>
                <MyInsterestColumn/>
                <TeamDataColumn/>
            </div>);
    }
}

export default HomePage;