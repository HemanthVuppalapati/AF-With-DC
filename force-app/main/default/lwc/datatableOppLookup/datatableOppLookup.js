import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class DatatableOppLookup extends NavigationMixin(LightningElement) {
    @api value;
    @api fieldName;
    @api context; // The datatable passes the Row ID here
    @api objectApiName;
    @api showAddNew;

    handleChange(event) {
        const selectedId = event.detail.recordId;
        
        // Dispatch the event that the parent 'SSRRecordCreation' is listening for
        this.dispatchEvent(new CustomEvent('picklistchange', {
            composed: true,
            bubbles: true,
            detail: {
                data: {
                    context: this.context, // Now this won't be undefined
                    value: selectedId,
                    fieldName: this.fieldName
                }
            }
        }));
    }

    handleAddNew(event) {
        console.log('Plus icon clicked!'); // Add this to check your console
        
        // 3. Stop the datatable from handling this click
        event.preventDefault();
        event.stopPropagation();

        // Tell the main component to open the creation modal for this specific row
        this.dispatchEvent(new CustomEvent('openoppmodal', {
            composed: true,
            bubbles: true,
            detail: {
                context: this.context
            }
        }));
    }
}