import { LightningElement, api } from 'lwc';

export default class DatatablePicklist extends LightningElement {
    @api label;
    @api placeholder;
    @api options;
    @api value;
    @api context;    // Row ID
    @api fieldName;  // Field API Name

    // This ensures the dropdown matches the data when the table loads
    renderedCallback() {
        let selectElement = this.template.querySelector('select');
        if (selectElement) {
            selectElement.value = this.value;
        }
    }

    
    handleChange(event) {
        const selectedValue = event.target.value;   
        this.value = selectedValue;
        this.dispatchEvent(new CustomEvent('picklistchange', {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
                data: { 
                    context: this.context, 
                    value: this.value,
                    fieldName: this.fieldName 
                }
            }
        }));
    }
}