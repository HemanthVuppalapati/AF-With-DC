public with sharing class SSRTemplateController {

    @AuraEnabled
    public static String getTemplateData() {
        // Header row only
        return 'Review Type,Review Date,Stage,Status,Notes';
    }

    @AuraEnabled
    public static List<SSR__c> saveSSRRecords(List<SSR__c> records) {
        insert records;
        return records;
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, List<String>> getPicklistValues() {
        Map<String, List<String>> result = new Map<String, List<String>>();

        result.put('ReviewType', new List<String>{
            'Client Pipeline Review','Close Plan','NBM Coaching','Orals Debrief',
            'Origination','Other','Portfolio Pipeline Review','Pricing Review',
            'Qualification','Sales Team Staffing','Services Pipeline Review',
            'Solution Review','Status','Win Strategy'
        });

        result.put('Stage', new List<String>{
            'OA','1','2A','2B','3A','3B','3C','Closed'
        });

        result.put('Status', new List<String>{
            'Completed','Pending Actions','In Progress'
        });

        return result;
    }
}