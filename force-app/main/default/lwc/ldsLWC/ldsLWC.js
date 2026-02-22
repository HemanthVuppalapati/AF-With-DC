import { LightningElement, api, track, wire } from 'lwc';
import invokePrompt from '@salesforce/apex/DataController.invokePrompt';
import { getRecord , updateRecord } from 'lightning/uiRecordApi';
import STAGE_NAME_FIELD from '@salesforce/schema/Opportunity.StageName';
import DESCRIPTION_FIELD from '@salesforce/schema/Opportunity.Description';
import ID_FIELD from '@salesforce/schema/Opportunity.Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class LdsLWC extends LightningElement {
    @api recordId;   // passed from record page
    @track result;
    @track loading = false;
    @track closedWon = false;
    @track isEditing = false;
    @track isEditingView = true;
    stageName;
    textValue;


    @wire(getRecord, { recordId: '$recordId', fields: [STAGE_NAME_FIELD] })
    wiredOpp({ error, data }) {
        if (data) {
            this.stageName = data.fields.StageName.value;
            if(this.stageName == 'Closed Won'){
                this.closedWon = true;
            }
        } else if (error) {
            console.error('Error fetching Opportunity Stage:', error);
        }
    }

    connectedCallback() {
        //this.handleClicks();
    }

    handleClick() {
        this.loading = true;
        this.result = null;
        console.log("Record ID:", this.recordId);

        invokePrompt({ OppRecordId: this.recordId })
            .then(response => {
                this.result = response;
                this.textValue = response;
                //this.updateDescription(this.result);
            })
            .catch(error => {
                this.result = 'Error: ' + JSON.stringify(error);
            })
            .finally(() => {
                this.loading = false;
            });
    }

    

    handleEdit() {
        this.isEditing = true;
        this.isEditingView = false;
    }

    handleTextChange(event) {
        this.textValue = event.target.value;
        this.result = this.textValue;
        
    }

    handleUpdatedes() {
        this.updateDescription(this.textValue);
    }

    updateDescription(textValue) {
        this.isEditing = false;
        this.isEditingView = true;
        const fields = {};
        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[DESCRIPTION_FIELD.fieldApiName] = textValue;

        const recordInput = { fields };

        updateRecord(recordInput)
            .then(() => {
                this.showToast('Success', 'Opportunity Description updated!', 'success');
            })
            .catch(error => {
                this.showToast('Error updating Description', JSON.stringify(error), 'error');
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }

}