trigger AccountTrigger on Account (after insert) {
    for (Account acc : Trigger.new) {
        AccountSyncService.sendAccountToOrg2(acc);
    }
}