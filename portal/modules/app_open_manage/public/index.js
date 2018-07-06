import { Button, Modal } from 'antd';
require('./style/index.less');
const OpenAppAction = require('./action');


const appInfo = [
    {
        title: '合同管理',
        desc: '合同管理可以帮您管理合同,统计和分析合同数据',
        id: 'contract'
    }
];

class OpenApp extends React.Component {
    constructor(props) {
        super();
        this.state = {

        };
    }
    componentDidMount() {

    }
    handleCheckDetail(app) {

    }
    render() {
        return (
            <div className="open-app-wrapper">
                <div className="">
                    {
                        appInfo.map((app, index) => (
                            <fieldset key={index} className='app-container'>
                                <legend>{app.title}</legend>
                                <p>{app.desc}</p>
                                <div className="btn-bar">
                                    <Button onClick={this.handleCheckDetail.bind(this, app)}>查看详情</Button>
                                </div>
                            </fieldset>
                        ))
                    }
                </div>

            </div>
        );
        
    }
}
module.exports = OpenApp;