let CrmList = require("../../../crm/public/crm-list");
import {RightPanelClose} from "CMP_DIR/rightPanel/index";

class CustomerStageTable extends React.Component {
    constructor(props) {
        super(props);       
    }   

    render() {
        return (
            <div>
                <div className="customer-table-close">
                    <RightPanelClose 
                        title={Intl.get("common.app.status.close", "关闭")}
                        onClick={this.props.onClose}                        
                    />
                </div>
                <CrmList
                    location={{ query: "" }}
                    fromSalesHome={true}
                    params={{
                        rangParams: [{
                            from: moment(this.props.params.date).startOf('day'),
                            to: moment(this.props.params.date).endOf('day'),
                            type: "time",
                            name: "start_time"
                        }],
                        condition: {
                            user_id: this.props.params.user_id,
                            customer_label: this.props.params.type,
                            term_fields: ["customer_label"]
                        }
                    }}
                />
            </div>
        )
    }
}
export default CustomerStageTable;