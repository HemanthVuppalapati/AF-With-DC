@RestResource(urlMapping='/MyApiEndpoint/*')
global with sharing class MyApiClass {
    @HttpPost
    global static String doSomething() {
        RestRequest req = RestContext.request;
        String body = req.requestBody.toString();
        System.debug('Received: ' + body);
        return 'Success from AF With DC Org!';
    }
    @HttpGet
    global static String getAccounts() {
        // Query 10 accounts from Salesforce
        List<Account> accounts = [SELECT Id, Name, Phone, Industry FROM Account LIMIT 1];
        
        // Optional: Debug the accounts retrieved
        System.debug('Accounts retrieved: ' + accounts);
        
        // Return the list of accounts
        return JSON.Serialize(accounts);
    }
}