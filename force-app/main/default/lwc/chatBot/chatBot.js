import { LightningElement, track } from 'lwc';
import invokeAgentforce from '@salesforce/apex/AgentforceRequestHandler.invokeAgentforce';

export default class ChatBot extends LightningElement {
    @track userMessage = '';
    @track agentResponse = '';
    @track sessionId = '';
    @track isSending = false;

    // Getter for disabling send button
    get isSendDisabled() {
        return this.isSending || !this.userMessage.trim();
    }

    handleInputChange(event) {
        this.userMessage = event.target.value;
    }

    handleKeyDown(event) {
        // Send message on Enter key press
        if (event.key === 'Enter' && this.userMessage.trim() !== '') {
            event.preventDefault();
            this.handleSend();
        }
    }

    handleSend() {
        if (!this.userMessage.trim()) {
            return;
        }
        this.isSending = true;

        invokeAgentforce({
            userMessage: this.userMessage,
            sessionId: this.sessionId
        })
            .then((result) => {
                if (result === 'error') {
                    this.agentResponse = 'Error: Unable to get response.';
                    this.sessionId = '';
                } else {
                    // Parse response: "agentResponse##sessionId"
                    const separatorIndex = result.lastIndexOf('##');
                    if (separatorIndex !== -1) {
                        this.agentResponse = result.substring(0, separatorIndex);
                        this.sessionId = result.substring(separatorIndex + 2);
                    } else {
                        this.agentResponse = result;
                        this.sessionId = '';
                    }
                }
            })
            .catch((error) => {
                console.error('Error calling Apex:', error);
                this.agentResponse = 'Error: Unable to get response.';
                this.sessionId = '';
            })
            .finally(() => {
                this.isSending = false;
                this.userMessage = '';
            });
    }
}