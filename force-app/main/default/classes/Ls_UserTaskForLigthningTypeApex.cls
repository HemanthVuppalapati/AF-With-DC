public class Ls_UserTaskForLigthningTypeApex {

    public class Request {
        @InvocableVariable(label='Timeline')
        public String timeline;
    }

    public class Response {
        @InvocableVariable(label='Timeline Data')
        public TimelineResult result;
    }

    public class TimelineResult {
        @InvocableVariable(label='Service Appointments')
        public List<AppointmentWrapper> appointments;
    }

    public class AppointmentWrapper {

        @InvocableVariable public String Id;
        @InvocableVariable public String Subject;
        @InvocableVariable public String Address;
        @InvocableVariable public String street;
        @InvocableVariable public String AccountName;
        @InvocableVariable public String ProductName;
        @InvocableVariable public Datetime SchedStartTime;
        @InvocableVariable public Datetime SchedEndTime;
        @InvocableVariable public String Preference;
        @InvocableVariable public String Status;
        @InvocableVariable public String HcpPriority;
        @InvocableVariable public String OwnerName;

        // Empty constructor for hardcoding
        public AppointmentWrapper() {}
    }

    @InvocableMethod(label='Retrieve User Tasks Based on Timeline (Hardcoded)')
    public static List<Response> retrieveUserTasks(List<Request> requests) {

        List<Response> finalResponses = new List<Response>();

        // Create Dummy Records
        List<AppointmentWrapper> dummyList = new List<AppointmentWrapper>();

        AppointmentWrapper a1 = new AppointmentWrapper();
        a1.Id = 'A1';
        a1.Subject = 'Follow-Up Visit';
        a1.Address = '123 MG Road';
        a1.street = 'MG Road';
        a1.AccountName = 'Dr. Amit Sharma';
        a1.ProductName = 'Thrombolin';
        a1.SchedStartTime = Datetime.now().addHours(2);
        a1.SchedEndTime = Datetime.now().addHours(3);
        a1.Preference = 'In-Person';
        a1.Status = 'Scheduled';
        a1.HcpPriority = 'A';
        a1.OwnerName = 'Carl Parker';

        AppointmentWrapper a2 = new AppointmentWrapper();
        a2.Id = 'A2';
        a2.Subject = 'New Discussion';
        a2.Address = '45 FC Road';
        a2.street = 'FC Road';
        a2.AccountName = 'Dr. Neha Kulkarni';
        a2.ProductName = 'Otera';
        a2.SchedStartTime = Datetime.now().addDays(1).addHours(1);
        a2.SchedEndTime = Datetime.now().addDays(1).addHours(2);
        a2.Preference = 'Virtual';
        a2.Status = 'Scheduled';
        a2.HcpPriority = 'B';
        a2.OwnerName = 'Carl Parker';

        dummyList.add(a1);
        dummyList.add(a2);

        // Build response
        TimelineResult tr = new TimelineResult();
        tr.appointments = dummyList;

        Response resp = new Response();
        resp.result = tr;

        finalResponses.add(resp);
        return finalResponses;
    }

    @AuraEnabled(cacheable=true)
    public static List<Response> retrieveUserTasksLWC(String timeline) {
        List<Request> reqList = new List<Request>();
        Request r = new Request();
        r.timeline = timeline;
        reqList.add(r);

        return retrieveUserTasks(reqList);
    }
}