import { LightningElement, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import MY_CHANNEL from '@salesforce/messageChannel/myMessageChannel__c';

export default class ParentComponent extends LightningElement {
    messageText = '';

    @wire(MessageContext)
    messageContext;

    handleChange(event) {
        this.messageText = event.target.value;
    }

    handleSend() {
        const message = { text: this.messageText };
        publish(this.messageContext, MY_CHANNEL, message);
    }
}