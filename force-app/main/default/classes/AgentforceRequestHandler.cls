/**
* @File Name : AgentforceRequestHandler.cls
* @Description :
* @Author :
* @Last Modified By :
* @Last Modified On : September 24, 2025
* @Modification Log :
*==============================================================================
* Ver | Date | Author | Modification
*==============================================================================
* 1.0 | September 24, 2025 |   | Initial Version
**/

public class AgentforceRequestHandler {
    
    public class AgentResponseWrapper{
        @AuraEnabled
        public string sessionId;
        @AuraEnabled
        public string agentResponse;
    }
    
    @AuraEnabled
    public static string invokeAgentforce(String userMessage, String sessionId) {
        
        AgentResponseWrapper responseWrapper = new AgentResponseWrapper();
        
        try{
            Invocable.Action action = Invocable.Action.createCustomAction('generateAiAgentResponse', 'Copilot_for_Salesforce');
            action.setInvocationParameter('userMessage',userMessage);
			if (String.isNotBlank(sessionId)) {
                action.setInvocationParameter('sessionId', sessionId);
            }
            
            List < Invocable.Action.Result > actionResults = action.invoke();
            Invocable.Action.Result result = actionResults[ 0 ];
            if (result.isSuccess()) {
                
                responseWrapper.sessionId = (String) result.getOutputParameters().get('sessionId');
                responseWrapper.agentResponse = (String) result.getOutputParameters().get('agentResponse');
                String agentResponseJSON = (String) result.getOutputParameters().get('agentResponse');
                
                System.debug('AgentOutput' + responseWrapper.agentResponse + '##' + responseWrapper.sessionId);               
                return responseWrapper.agentResponse + '##' + responseWrapper.sessionId;
                
            } else {
                System.debug('Java action execution failed: ' + result.getErrors());
                return 'error';
            }
            
            
        } catch (Exception e) {
            System.debug('Error invoking Java action: ' + e.getMessage());
            return 'error';
        }
        
    }
    
}