public class SobjectWrapper {

	public class AccConOpp{
		public Account accountRecord;
		public Contact contactRecord;
		public Opportunity opportunityRecord;
	}

	
	@AuraEnabled
	public static void LightningStudio(){
		System.debug('Lightning Studio');
	}
}