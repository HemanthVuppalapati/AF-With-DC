public with sharing class DataController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts() {
        return [SELECT Id, Name FROM Account LIMIT 10];
    }

    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunities() {
        return [SELECT Id, Name, StageName FROM Opportunity LIMIT 10];
    }

	@AuraEnabled
	public static String invokePrompt(String OppRecordId){

        // Create Prompt Input Parameter Variables
        ConnectApi.WrappedValue inputValueOppRecordId = new ConnectApi.WrappedValue();
        inputValueOppRecordId.value = OppRecordId;

        //Add Prompt input variables to a Map
        Map<String, ConnectApi.WrappedValue> inputParams = new Map<String, ConnectApi.WrappedValue>();        
        inputParams.put('Input:recordId', inputValueOppRecordId);   

		ConnectApi.EinsteinPromptTemplateGenerationsInput executeTemplateInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();
        executeTemplateInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
        executeTemplateInput.additionalConfig.applicationName = 'PromptBuilderPreview';
        executeTemplateInput.isPreview = false;
        executeTemplateInput.inputParams = inputParams;

		ConnectApi.EinsteinPromptTemplateGenerationsRepresentation generationsOutput = ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate('OpportunityFlexProbability', executeTemplateInput);

        // Consume response
        ConnectApi.EinsteinLLMGenerationItemOutput response = generationsOutput.generations[0];    
        return response.text;
    }
}