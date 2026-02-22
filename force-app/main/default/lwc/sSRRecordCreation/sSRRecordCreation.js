import { LightningElement, track, wire } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import sheetjs from '@salesforce/resourceUrl/sheetjs';
import saveSSRRecords from '@salesforce/apex/SSRUploadController.createSSRRecords';

// Getting Picklist Values and Object Info
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import SSR_OBJECT from '@salesforce/schema/SSR__c';
import REVIEW_TYPE_FIELD from '@salesforce/schema/SSR__c.Review_Type__c';
import STAGE_FIELD from '@salesforce/schema/SSR__c.Stage__c';
import STATUS_FIELD from '@salesforce/schema/SSR__c.Status__c';

// Toast Message on record creation
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SSRRecordCreation extends LightningElement {
    @track data = [];
    @track showModal = false;
    @track draftValues = [];
    librariesLoaded = false;

    // Picklist Values Storage
    @track reviewTypeOptions = [];
    @track stageOptions = [];
    @track statusOptions = [];

    @track isCustomModalOpen = false;
    @track currentRowContext; // To remember which row clicked the "+"

    // 1. Get Object Info
    @wire(getObjectInfo, { objectApiName: SSR_OBJECT })
    objectInfo;

    // 2. Wire Picklist Values
    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: REVIEW_TYPE_FIELD })
    wiredReviewType({ data }) { if (data) this.reviewTypeOptions = data.values; }

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: STAGE_FIELD })
    wiredStage({ data }) { if (data) this.stageOptions = data.values; }

    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: STATUS_FIELD })
    wiredStatus({ data }) { if (data) this.statusOptions = data.values; }

    // Dynamic Getter for Columns
    get columns() {
        return [
            { 
                label: 'Opportunity', 
                fieldName: 'OpportunityName', // Display text
                type: 'lookup', 
                editable: true,
                typeAttributes: {
                    placeholder: 'Search Opportunities...',
                    objectApiName: 'Opportunity',
                    value: { fieldName: 'Opportunity__c' }, // Actual ID
                    context: { fieldName: 'id' },
                    fieldName: 'Opportunity__c',
                    showAddNew: true 
                }
            },
            { 
                label: 'Review Type', fieldName: 'Review_Type__c', type: 'picklist', 
                typeAttributes: {
                    options: this.reviewTypeOptions,
                    value: { fieldName: 'Review_Type__c' },
                    context: { fieldName: 'id' },
                    fieldName: 'Review_Type__c' 
                }
            },
            { 
                label: 'Stage', fieldName: 'Stage__c', type: 'picklist', 
                typeAttributes: {
                    options: this.stageOptions,
                    value: { fieldName: 'Stage__c' },
                    context: { fieldName: 'id' },
                    fieldName: 'Stage__c'
                }
            },
            { 
                label: 'Status', fieldName: 'Status__c', type: 'picklist', 
                typeAttributes: {
                    options: this.statusOptions,
                    value: { fieldName: 'Status__c' },
                    context: { fieldName: 'id' },
                    fieldName: 'Status__c'
                }
            },
            { label: 'Review Date', fieldName: 'Review_Date__c', type: 'date', editable: true },
            { label: 'Notes', fieldName: 'Notes__c', editable: true }
        ];
    }

    renderedCallback() {
        if (this.librariesLoaded) return;
        loadScript(this, sheetjs)
            .then(() => { this.librariesLoaded = true; })
            .catch(error => console.error('Error loading SheetJS:', error));
    }

    // --- FILE UPLOAD LOGIC ---
    async handleFileUpload(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const bstr = e.target.result;
            const workbook = XLSX.read(bstr, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonRaw = XLSX.utils.sheet_to_json(worksheet);

            this.data = jsonRaw.map((row, index) => {
                return {
                    id: `row-${index}`, 
                    sobjectType: 'SSR__c', 
                    Opportunity__c: row['OpportunityID'],
                    OpportunityName: row['Opportunity Name'] || row['OpportunityID'], // Ensure Name is mapped if present
                    Review_Type__c: row['Review Type'] || '',
                    Review_Date__c: this.formatDate(row['Review Date']),
                    Stage__c: row['Stage'] ? String(row['Stage']) : '', 
                    Notes__c: row['Notes'] || '',
                    Status__c: 'In Progress' 
                };
            });
            this.showModal = true;
        };
        reader.readAsBinaryString(file);
    }

    // --- CHANGE HANDLERS ---

    // Unified handler for Picklist and Lookup changes
    handlePicklistChange(event) {
        // This is triggered by your custom components (Lookup/Picklist)
        const { context, value, fieldName } = event.detail.data;
        this.updateDraftValues(context, fieldName, value);
    }

    handleCellChange(event) {
        // Triggered by standard inline editing
        const newDraftValues = event.detail.draftValues;
        newDraftValues.forEach(item => {
            const rowId = item.id;
            Object.keys(item).forEach(key => {
                if(key !== 'id') {
                    this.updateDraftValues(rowId, key, item[key]);
                }
            });
        });
    }

    // Helper to keep this.data and this.draftValues in sync
    updateDraftValues(rowId, fieldName, value) {
        console.log('--- DATA UPDATE START ---');
        console.log('Target Row ID:', rowId);
        console.log('Field Being Changed:', fieldName);
        console.log('New Value:', value);

        // 1. Update UI data
        this.data = this.data.map(row => {
            if (row.id === rowId) {
                return { ...row, [fieldName]: value };
            }
            return row;
        });

        // 2. Update Draft Values
        let draftValues = [...this.draftValues];
        const index = draftValues.findIndex(d => d.id === rowId);

        if (index !== -1) {
            draftValues[index] = { ...draftValues[index], [fieldName]: value };
        } else {
            draftValues.push({ id: rowId, [fieldName]: value });
        }
        
        this.draftValues = draftValues;
        console.log('Current DraftValues State:', JSON.parse(JSON.stringify(this.draftValues)));
        console.log('--- DATA UPDATE END ---');
    }

    // --- SAVE LOGIC ---
    async handleManualSave() {
        console.log('--- PRE-SAVE INSPECTION ---');
        console.log('Original Data Count:', this.data.length);
        console.log('Draft Changes Count:', this.draftValues.length);

        const recordsToSave = this.data.map(record => {
            const update = this.draftValues.find(draft => draft.id === record.id);
            
            // This merges the original row with any edits
            let finalRecord = update ? { ...record, ...update } : { ...record };

            // We MUST remove 'id' and 'OpportunityName' because they don't exist in Salesforce
            const { id, OpportunityName, ...recordForApex } = finalRecord;
            
            return recordForApex;
        });

        console.log('FINAL PAYLOAD TO APEX:', JSON.parse(JSON.stringify(recordsToSave)));

        if (recordsToSave.length === 0 || !recordsToSave[0].Opportunity__c) {
            console.error('CRITICAL: Opportunity__c is missing in the payload!');
        }

        try {
            const result = await saveSSRRecords({ ssrList: recordsToSave });
            console.log('APEX SUCCESS:', result);
            this.showToast('Success', 'Records saved!', 'success');
            this.closeModal(); 
        } catch (error) {
            console.error('APEX ERROR:', error);
            // This will log the specific Salesforce Validation or Trigger error
            console.log('Error Body:', JSON.stringify(error.body)); 
            this.showToast('Error', error.body?.message || error.message, 'error');
        }
    }

    // ... (rest of your utility methods like handleDeleteRows, formatDate, etc.)
    handleDeleteRows() {
        const datatable = this.template.querySelector('c-ssr-custom-datatable');
        const selectedRows = datatable.getSelectedRows();
        if (selectedRows.length > 0) {
            const idsToDelete = new Set(selectedRows.map(row => row.id));
            this.data = this.data.filter(row => !idsToDelete.has(row.id));
            this.draftValues = this.draftValues.filter(draft => !idsToDelete.has(draft.id));
        }
    }

    formatDate(excelDate) {
        if(!excelDate) return null;
        const date = new Date(excelDate);
        return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
    }

    closeModal() {
        this.showModal = false;
        this.data = [];
        this.draftValues = [];
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    // This listens for a custom event from your datatableLookup component
    handleOpenOppModal(event) {
        // We expect the lookup to send the row ID (context)
        this.currentRowContext = event.detail.context;
        this.isCustomModalOpen = true;
    }

    closeCustomModal() {
        this.isCustomModalOpen = false;
    }

    handleOpportunityCreateSuccess(event) {
        const newOppId = event.detail.id;
        const newOppName = event.detail.fields.Name.value;

        this.showToast('Success', 'Opportunity Created and Assigned!', 'success');

        // Automatically apply this new Opportunity to the row that requested it
        this.updateDraftValues(this.currentRowContext, 'Opportunity__c', newOppId);
        
        // Also update the Display Name so the user sees the name in the table
        this.updateDraftValues(this.currentRowContext, 'OpportunityName', newOppName);

        this.isCustomModalOpen = false;
    }
}