@RestResource(urlMapping='/createAccount/')
global with sharing class AccountRestService {

    @HttpPost
    global static String createAccount(String name, String phone, String industry) {
        Account acc = new Account(
            Name = name,
            Phone = phone,
            Industry = industry
        );
        insert acc;
        return 'Account Created: ' + acc.Id;
    }
}