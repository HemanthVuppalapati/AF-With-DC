public with sharing class SSRUploadController {
    @AuraEnabled
    public static void createSSRRecords(List<SSR__c> ssrList) {
        try {
            if (ssrList != null && !ssrList.isEmpty()) {
                insert ssrList;
            }
        } catch (Exception e) {
            // This will send the specific error (like Validation Rule failures) back to LWC
            throw new AuraHandledException(e.getMessage());
        }
    }
}