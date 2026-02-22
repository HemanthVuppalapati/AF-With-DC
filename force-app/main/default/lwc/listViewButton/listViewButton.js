import { LightningElement, track } from 'lwc';
import createAccounts from '@salesforce/apex/AccountContactMapHandler.createAccounts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ListViewButton extends LightningElement {

    file;
    @track data = [];
    @track draftValues = [];

    columns = [
        {
            label: 'Account Name',
            fieldName: 'Name',
            editable: true
        }
    ];

    handleFileChange(event) {
        this.file = event.target.files[0];
    }

    handleUpload() {
        if (!this.file) {
            this.showToast('Error', 'Please upload a file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result;
            this.parseCSV(text);
        };
        reader.readAsText(this.file);
    }

    parseCSV(text) {
        const rows = text.split('\n');
        this.data = [];

        // Skip header row
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim();
            if (row) {
                this.data.push({
                    Id: i, // temporary Id
                    Name: row.replace(/"/g, '')
                });
            }
        }
    }

    handleSaveDraft(event) {
        const drafts = event.detail.draftValues;

        drafts.forEach(draft => {
            const index = this.data.findIndex(row => row.Id === draft.Id);
            if (index !== -1) {
                this.data[index] = { ...this.data[index], ...draft };
            }
        });

        this.draftValues = [];
    }

    saveRecords() {
        const accounts = this.data.map(row => ({
            Name: row.Name
        }));

        createAccounts({ accounts })
            .then(() => {
                this.showToast('Success', 'Accounts created successfully', 'success');
                this.data = [];
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
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