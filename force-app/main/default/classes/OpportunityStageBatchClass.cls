global class OpportunityStageBatchClass implements Database.Batchable<sObject> {
	
    global Database.QueryLocator start(Database.BatchableContext BC){
        return Database.GetQueryLocator([SELECT Id,StageName,CloseDate FROM Opportunity LIMIT 10]);
    }
	global void execute(Database.BatchableContext BC , List<sObject> Scope){
        for(sObject sc : Scope){
            
        }
    }
	global void finish(Database.BatchableContext BC){
        
    }

}