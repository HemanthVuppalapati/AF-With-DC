declare module "@salesforce/apex/DataController.getAccounts" {
  export default function getAccounts(): Promise<any>;
}
declare module "@salesforce/apex/DataController.getOpportunities" {
  export default function getOpportunities(): Promise<any>;
}
declare module "@salesforce/apex/DataController.invokePrompt" {
  export default function invokePrompt(param: {OppRecordId: any}): Promise<any>;
}
