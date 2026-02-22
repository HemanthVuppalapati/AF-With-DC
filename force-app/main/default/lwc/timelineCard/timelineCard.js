import { LightningElement, api, track } from 'lwc';
import MapIcon from '@salesforce/resourceUrl/highlight';
import CallIcon from '@salesforce/resourceUrl/SiteSamples';

export default class TimelineCard extends LightningElement {
    _scheduleData;
    _value;
    callIcon = CallIcon;
    mapIcon = MapIcon;

    @track loading = false;
    @track error;
    @track groups = [];
    @track expandedDates = new Set();
    @track expandedAppointments = new Set();

    /* ------------------------------
       SUPPORT Agentforce → value
    --------------------------------*/
    @api 
    get value() {
        return this._value;
    }

    set value(val) {
        this._value = val;
        if (val) {
            this._scheduleData = val;
            this.processScheduleData();
        }
    }

    /* ------------------------------
       SUPPORT Flow → record
    --------------------------------*/
    @api
    get record() {
        return this._scheduleData;
    }

    set record(val) {
        if (val) {
            this._scheduleData = val;
            this.processScheduleData();
        }
    }

    /* -------------------------------- */
    get cardTitle() {
        return "Scheduled Calls:";
    }

    get hasAppointments() {
        return this.groups && this.groups.length > 0;
    }

    get hasNoAppointments() {
        const data = this._scheduleData || this._value;
        return !this.loading && !this.error && (!this.groups || this.groups.length === 0) && data;
    }

    connectedCallback() {
        const data = this.value || this.record;
        if (data) {
            this._scheduleData = data;
            this.processScheduleData();
        }
    }

    /* -------- Toggle Date -------- */
    toggleDate(event) {
        const date = event.currentTarget.dataset.date;

        if (this.expandedDates.has(date)) {
            this.expandedDates.delete(date);
        } else {
            this.expandedDates.add(date);
        }
        this.updateGroupExpansion(date);
    }

    toggleAppointment(event) {
        const id = event.currentTarget.dataset.id;

        if (this.expandedAppointments.has(id)) {
            this.expandedAppointments.delete(id);
        } else {
            this.expandedAppointments.add(id);
        }
        this.updateItemExpansion(id);
    }

    updateGroupExpansion(date) {
        this.groups = this.groups.map(group => {
            if (group.date === date) {
                group.expanded = this.expandedDates.has(date);
            }
            return group;
        });
    }

    updateItemExpansion(id) {
        this.groups.forEach(group => {
            group.items = group.items.map(item => {
                if (item.Id === id) {
                    item.expanded = this.expandedAppointments.has(id);
                }
                return item;
            });
        });
    }

    /* ----------------------------------------
       MAIN: Process Schedule Data safely
    ---------------------------------------- */
    processScheduleData() {
        this.loading = true;
        this.error = null;

        if (!this._scheduleData) {
            this.groups = [];
            this.loading = false;
            return;
        }

        let parsed = this._scheduleData;

        // SAFE JSON PARSE (Agentforce compatible)
        if (typeof parsed === 'string') {
            try {
                parsed = JSON.parse(parsed);
            } catch (e) {
                console.warn("Non-JSON input received, using raw string.");
            }
        }

        console.log('TimelineCard parsed:', JSON.stringify(parsed, null, 2));

        let appointments = [];

        // STRUCTURE 1 — [ { result: { appointments: [] }} ]
        if (Array.isArray(parsed) && parsed[0]?.result?.appointments) {
            appointments = parsed[0].result.appointments;
        }
        // STRUCTURE 2 — { result: { appointments } }
        else if (parsed?.result?.appointments) {
            appointments = parsed.result.appointments;
        }
        // STRUCTURE 3 — { appointments: [] }
        else if (parsed?.appointments) {
            appointments = parsed.appointments;
        }
        // STRUCTURE 4 — Array of appointments directly
        else if (Array.isArray(parsed)) {
            appointments = parsed;
        }

        console.log('Appointments extracted:', appointments.length);

        this.processSchedule(appointments);
    }

    /* ----------------------------------------
       Convert & group schedule
    ---------------------------------------- */
    processSchedule(appointments) {
        try {
            if (!appointments || appointments.length === 0) {
                this.groups = [];
                this.loading = false;
                return;
            }

            const mapped = appointments
                .map(item => {
                    if (!item.SchedStartTime) return null;

                    const start = new Date(item.SchedStartTime);

                    const dateStr = start.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }).toUpperCase();

                    const timeStr = start.toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    });

                    const baseSubject = item.Subject || 'No Subject';
                    const accountName = item.AccountName || '';
                    const fullSubject = accountName ? `${baseSubject} with ${accountName}` : baseSubject;

                    // FIXED — Street field casing error
                    const street = item.street || item.Street || item.Address || '';

                    const locationText = street ? street : 'Virtual Call';

                    return {
                        Id: item.Id,
                        dateKey: dateStr,
                        date: dateStr,
                        time: timeStr,
                        product: item.ProductName || '',
                        link: `/lightning/r/ServiceAppointment/${item.Id}/view`,
                        subject: fullSubject,
                        subjectShort: baseSubject,
                        street: street,
                        locationText: locationText,
                        expanded: this.expandedAppointments.has(item.Id)
                    };
                })
                .filter(i => i);

            const groupsMap = {};

            mapped.forEach(item => {
                if (!groupsMap[item.dateKey]) {
                    groupsMap[item.dateKey] = {
                        date: item.date,
                        items: [],
                        expanded: this.expandedDates.has(item.dateKey)
                    };
                }
                groupsMap[item.dateKey].items.push(item);
            });

            this.groups = Object.values(groupsMap);

            // DEFAULT OPEN ALL
            this.groups.forEach(group => {
                this.expandedDates.add(group.date);
                group.expanded = true;

                group.items.forEach(item => {
                    this.expandedAppointments.add(item.Id);
                    item.expanded = true;
                });
            });

        } catch (e) {
            console.error('Error processing schedule:', e);
            this.error = 'Error processing appointments: ' + e.message;
            this.groups = [];
        }

        this.loading = false;
    }
}