public with sharing class UserAccessController {
    @AuraEnabled(cacheable=true)
    public static Boolean canSeeEditButton() {

        String currentUser = UserInfo.getUserName();

        // List of users allowed to see the Edit button
        Set<String> allowedUsers = new Set<String>{'shemanthvuppalapati5757@agentforce.com'};

        return allowedUsers.contains(currentUser);
    }
	@AuraEnabled(cacheable=true)
    public static Boolean canSeeEditButtons() {
        return FeatureManagement.checkPermission('Can_Edit_Component');
    }
}