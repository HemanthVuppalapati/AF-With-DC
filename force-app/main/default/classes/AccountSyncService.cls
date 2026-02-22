public with sharing class AccountSyncService {
    public static void sendAccountToOrg2(Account acc) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Org2_API/createAccount');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(acc));
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        System.debug('Response from Org2: ' + res.getBody());
    }
}