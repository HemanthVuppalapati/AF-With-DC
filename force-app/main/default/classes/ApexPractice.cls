public inherited sharing class ApexPractice {
    public List<Account> getAccounts() {
        return [SELECT Id, Name FROM Account]; // Only returns Accounts the user has access to
    }
}