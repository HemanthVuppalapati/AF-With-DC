import { LightningElement, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import MY_CHANNEL from '@salesforce/messageChannel/myMessageChannel__c';

export default class ChildComponent extends LightningElement {
    @track receivedMessage = '';

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        // Subscribe to the channel
        subscribe(this.messageContext, MY_CHANNEL, (message) => {
            this.handleMessage(message);
        });
    }

    handleMessage(message) {
        this.receivedMessage = message.text;
    }
}