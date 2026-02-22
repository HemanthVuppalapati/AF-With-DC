public with sharing class FetchOppsForFlexPT {

	public class Request {
        @InvocableVariable
        public String recordId;
    }

    public class Response {
        @InvocableVariable
        public String Prompt;
    }

    @InvocableMethod
    public static List<Response> processRequest(List<Request> requestList) {
        Request req = requestList[0];

        // Query the Opportunity record
        Opportunity opp = [
            SELECT Id, Name, StageName, Amount, CloseDate, AccountId
            FROM Opportunity
            WHERE Id = :req.recordId
            LIMIT 1
        ];

        // Convert the Opportunity record to JSON string
        String jsonResult = JSON.serialize(opp);

        // Prepare response
        Response res = new Response();
        res.Prompt = jsonResult;

        return new List<Response>{ res };
    }  
}