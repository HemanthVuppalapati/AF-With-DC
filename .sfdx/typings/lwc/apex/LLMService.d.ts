declare module "@salesforce/apex/LLMService.generateText" {
  export default function generateText(param: {prompt: any}): Promise<any>;
}
declare module "@salesforce/apex/LLMService.createChatGenerations" {
  export default function createChatGenerations(param: {userPrompt: any, systemPrompt: any}): Promise<any>;
}
