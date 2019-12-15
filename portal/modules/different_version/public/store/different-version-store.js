import differentVersionAction from '../action/different-version-action';

class DifferentVersionStore {
    constructor() {
        this.loading = true;
        this.versionData = [];
        this.errorMessage = null;
        this.bindActions(differentVersionAction);
    }
    getAllVersions(data) {
        if(data.loading){
            this.loading = data.loading;
        } else {
            this.loading = false;
        }
        if(!data.error){
            this.versionData = data.result.versionData;
        }else{
            this.errorMessage = data.result;
        }
    }
}

export default alt.createStore(DifferentVersionStore, 'DifferentVersionStore');