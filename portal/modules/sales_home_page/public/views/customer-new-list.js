let CrmList = require("../../../crm/public/crm-list");
import { RightPanelClose } from "CMP_DIR/rightPanel/index";

class CustomerNewList extends React.Component {
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
                <div className="customer-table-close topNav">
                    <RightPanelClose
                        title={Intl.get("common.app.status.close", "关闭")}
                        onClick={this.props.onClose}
                    />
                    <CrmList
                        location={{ query: "" }}
                        fromSalesHome={true}
                        params={{
                            rangParams: [{
                                from: this.props.params.startTime,
                                to: this.props.params.endTime,
                                type: "time",
                                name: "start_time"
                            }],
                            condition: {
                                customer_label: this.props.params.type,
                                term_fields: ["customer_label"]
                            }
                        }}
                    />
                </div>
            </div>
        )
    }
}
export default CustomerNewList;
