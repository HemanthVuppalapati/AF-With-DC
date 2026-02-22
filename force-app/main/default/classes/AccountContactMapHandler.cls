// USed to test the git
public class AccountContactMapHandler {


    @AuraEnabled
    public static void createAccounts(List<Account> accounts) {
        if (accounts == null || accounts.isEmpty()) {
            throw new AuraHandledException('No records to insert');
        }
        insert accounts;
    }

    // Method to fetch accounts and related contacts and return a Map<Id, List<Contact>>
    public static Map<Id, List<Contact>> getAccountContactsMap(List<Id> accountIds) {
        // Initialize the map and send
        Map<Id, List<Contact>> accConMap = new Map<Id, List<Contact>>();
        
        // Query accounts with related contacts
        List<Account> accountsWithContacts = [
            SELECT Id, Name, 
                   (SELECT Id, FirstName, LastName, Email, Phone FROM Contacts)
            FROM Account
            WHERE Id IN :accountIds
        ];
        
        // Populate the map
        for(Account acc : accountsWithContacts) {
            // acc.Contacts is a List<Contact> from the relationship query
            accConMap.put(acc.Id, acc.Contacts);
        }
        
        return accConMap;
    }

    // Optional: Method to debug the map content
    public static void debugAccountContactsMap(Map<Id, List<Contact>> accConMap) {
        for(Id accId : accConMap.keySet()) {
            System.debug('Account Id: ' + accId);
            List<Contact> contacts = accConMap.get(accId);
            if(contacts.isEmpty()) {
                System.debug('No contacts for this account.');
            } else {
                for(Contact c : contacts) {
                    System.debug('Contact: ' + c.FirstName + ' ' + c.LastName + ', Email: ' + c.Email + ', Phone: ' + c.Phone);
                }
            }
        }
    }
}