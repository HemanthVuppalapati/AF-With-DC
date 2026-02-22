import { LightningElement, api, track } from 'lwc';
import invokePrompt from '@salesforce/apex/DataController.invokePrompt';

export default class LdsLWCS extends LightningElement {
    @api recordId;   // passed from record page
    @track result;
    @track loading = false;



    handleClick() {
        this.loading = true;
        this.result = null;
        //this.recordId = '006NS00000aT1PNYA0';
        console.log("Record ID:", this.recordId);

        invokePrompt({ OppRecordId: this.recordId })
            .then(response => {
                this.result = response;
            })
            .catch(error => {
                this.result = 'Error: ' + JSON.stringify(error);
            })
            .finally(() => {
                this.loading = false;
            });
    }
}