import { LightningElement, wire, track } from 'lwc';
import canSeeEditButton from '@salesforce/apex/UserAccessController.canSeeEditButton';
import canSeeEditButtons from '@salesforce/apex/UserAccessController.canSeeEditButtons';

export default class ButtonVisibilityExample extends LightningElement {
    @track showEdit = false;

    @wire(canSeeEditButtons)
    wiredCheck({ data, error }) {
        if (data !== undefined) {
            this.showEdit = data;  // true for John, false for Mary
        } else if (error) {
            console.error('Error checking username: ', error);
        }
    }
}