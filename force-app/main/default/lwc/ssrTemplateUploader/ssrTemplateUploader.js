import { LightningElement, api, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import ssrRecordTemplate from '@salesforce/resourceUrl/SSR_Record_Template';

import getTemplateData from '@salesforce/apex/SSRTemplateController.getTemplateData';
import getPicklistValues from '@salesforce/apex/SSRTemplateController.getPicklistValues';
import saveSSRRecords from '@salesforce/apex/SSRTemplateController.saveSSRRecords';

export default class SsrTemplateUploader extends LightningElement {
    @api recordId; // Opportunity Id

    showModal = false;
    records = [];
    draftValues = [];
    picklists = {};

    columns = [
        { label: 'Opportunity', fieldName: 'Opportunity__c', editable: true },
        { label: 'Review Type', fieldName: 'Review_Type__c', editable: true },
        { label: 'Review Date', fieldName: 'Review_Date__c', type: 'date', editable: true },
        { label: 'Stage', fieldName: 'Stage__c', editable: true },
        { label: 'Status', fieldName: 'Status__c', editable: true },
        { label: 'Notes', fieldName: 'Notes__c', editable: true }
    ];

    connectedCallback() {
        getPicklistValues().then(data => this.picklists = data);
    }

    downloadTemplate() {
        window.location.href = ssrRecordTemplate;
    }

    handleUploadClick() {
        this.template.querySelector('[data-id="fileInput"]').value = null;
        this.template.querySelector('[data-id="fileInput"]').click();
    }

    handleExcelUpload(event) {
        if (this.currentView !== 'edit') {
            this.previousViewBeforeEdit = this.currentView;
            this.currentView = 'edit';
        }

        if (!this.sheetJsLoaded) {
            return;
        }

        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const workbook = XLSX.read(reader.result, { type: 'binary' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const excelRows = XLSX.utils.sheet_to_json(worksheet);
            alert('HI');
            this.records = excelRows.map((row, index) => ({
                id: index,
                Opportunity__c: this.recordId,
                Review_Type__c: row['Review Type'],
                Review_Date__c: row['Review Date'],
                Stage__c: row['Stage'],
                Status__c: row['Status'],
                Notes__c: row['Notes']
            }));
        };

        reader.readAsBinaryString(file);
    }

    handleDraftSave(event) {
        this.draftValues = event.detail.draftValues;
    }

    handleDelete() {
        this.records = this.records.filter(r => !this.draftValues.some(d => d.id === r.id));
        this.draftValues = [];
    }

    closeModal() {
        this.showModal = false;
    }

    saveChanges() {
        // Mandatory validation
        for (let r of this.records) {
            if (!r.Review_Type__c || !r.Review_Date__c || !r.Stage__c) {
                alert('Mandatory fields missing');
                return;
            }
        }
        saveSSRRecords({ records: this.records }).then(() => {
            this.showModal = false;
        });
    }
}