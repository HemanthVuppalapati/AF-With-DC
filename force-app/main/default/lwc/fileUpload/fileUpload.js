import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import SHEETJS from '@salesforce/resourceUrl/sheetjs';
import ssrRecordTemplate from '@salesforce/resourceUrl/SSR_Record_Template';

export default class FileUpload extends LightningElement {
    isLoading = false;


    connectedCallback() {
        /*Excel functionality start*/
        if (!this.sheetJsInitialized) {
            loadScript(this, SHEETJS)
                .then(() => {
                    this.sheetJsInitialized = true;
                })
                .catch(error => {
                    console.error('SheetJS failed to load', error);
                });
        }
    }

    onDownloadFile() {
        window.location.href = ssrRecordTemplate;
    }

    onUploadFile(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

                const filteredJson = json.filter(row => {
                return ['Workstream', 'Task', 'Category', 'Type', 'Status']
                .some(field => row[field] && row[field].toString().trim() !== '');
                });////added for Task Default Mapping cmdt (trimming empty cells uploaded from excel to avoid creation of empty rows)
                

                const errorMessages = [];
                const parsedRows = filteredJson.map((row, index) => {
                    const errors = {};

                    const validatePicklistValue = (field, value, fieldName) => {
                        const options = this.picklistValues?.[field] || [];
                        const isEmpty = value === null || value === undefined || value === '';
                        const isValid = options.some(option => option.value === value);
                        if (!isValid || isEmpty) {
                            errors[fieldName] = 'Please select a valid value';
                        }
                        return isValid ? value : '';
                    };

                    const workstream = validatePicklistValue('Workstream__c', row['Workstream'] || '', 'workstream');
                    const tasks = validatePicklistValue('Tasks__c', row['Task'] || '', 'tasks');
                    const category = validatePicklistValue('Category__c', row['Category'] || '', 'category');
                    const milestoneType = validatePicklistValue('Type__c', row['Type'] || '', 'milestoneType');
                    const status = validatePicklistValue('Status__c', row['Status'] || '', 'status');

                    // changes Added for US- 1469303 and 1554468S
                    const acnOwnerName = row['ACN Owner'] ? String(row['ACN Owner']).trim() : '';
                    const clientOwnerName = row['Client Owner'] ? String(row['Client Owner']).trim() : '';
                    //End of Changes US- 1469303 and 1554468S
                    
                    // Dependency field handling
                    const dependencyName = row['Dependency'] ? String(row['Dependency']).trim() : '';


                    //Added for other picklist value story  upload template: Get the custom values from the 'if Other' columns US-1473036
                    const workstreamIfOther = row['Workstream (If Other)'] || '';
                    const taskIfOther = row['Task (If Other)'] || '';
                    //Added for other picklist value story  upload template: Determine if 'Other' was the selected value in the Excel sheet US-1473036
                    const isWorkstreamOther = (workstream.toLowerCase() === OTHER_STR.toLowerCase());
                    const isTaskOther = (tasks.toLowerCase() === OTHER_STR.toLowerCase());
                    //Changes ended for other picklist value story  upload template US-1473036

                    const rawStartDate = convertToISODate(row['Start Date'] || '');
                    const rawEndDate = convertToISODate(row['End Date'] || '');

                    // if (rawStartDate && rawEndDate && new Date(rawEndDate) <= new Date(rawStartDate)) {
                    //     errors.endDate = 'End Date should be after Start Date';
                    // }
                     
                      // changes Start here for  Bug 1525754: R26.0.1 | Close Plan | 1497450 | Error Shown on Upload When Start Equals End Date, and Save Allowed When Dates Different for Milestone category task
                    const startDateObj = rawStartDate ? new Date(rawStartDate) : null;
                    const endDateObj = rawEndDate ? new Date(rawEndDate) : null;
                    const isMilestone = category === this.CATEGORY_MILESTONE; // Check against the Milestone constant

                    if (startDateObj && endDateObj) {
                           if (isMilestone) {
                   // If Category is 'Milestone': Start Date MUST equal to End Date.
                // Use getTime() for accurate comparison of Date objects.
                   if (endDateObj.getTime() !== startDateObj.getTime()) {
                           errors[this.END_DATE] = 'Start and End Date should be the same for Milestone.';
                      }

                  } else {
                        // For ALL OTHER Categories
                        if (endDateObj < startDateObj) {
                            errors[this.END_DATE] = 'End Date cannot be before Start Date.';
                        }
                    }
                }
                //Changes end here Bug 1525754: R26.0.1 | Close Plan | 1497450 | Error Shown on Upload When Start Equals End Date, and Save Allowed When Dates Different for Milestone category task

                    if (Object.keys(errors).length > 0) {
                        errorMessages.push(`Row ${index + 1} has validation errors.`);
                    }

                    return {
                        id: `new-${Date.now()}-${index}`,
                        //Added for other picklist value story upload template : Assign 'Other' to the main picklist field if that was the selection US-1473036
                        workstream: isWorkstreamOther ? OTHER_STR : workstream,
                        // Assign the custom value to the 'ifOther' field US-1461059
                        workstreamIfOther: workstreamIfOther,
                        isWorkstreamOther: isWorkstreamOther, 
                        //Added for other picklist value story upload template : Repeat for tasks US-1473036
                        tasks: isTaskOther ? OTHER_STR : tasks,
                        taskIfOther: taskIfOther,
                        isTaskOther: isTaskOther, //Releted to other picklist value upload document changes ends here. US-1473036
                        category,
                        startDate: rawStartDate,
                        endDate: rawEndDate,
                        milestoneType,
                        status,
                        acnOwnerName, // Added for  us-1469303 and 1554468S
                        clientOwnerName, // Added for  us-1469303 and 1554468S
                        comments: row['Comments'] || '',
                        dependencyName: dependencyName, // Dependency from Excel
                        dependencyId: null, // Will be resolved after looking up the task
                        isSelected: true,
                        isEditing: true,
                        fieldErrors: errors
                    };
                });

            //Changes Added for Us- 1469303 and 1554468S
            const acnNames = [...new Set(parsedRows.map(r => r.acnOwnerName).filter(n => n))];
            const clientNames = [...new Set(parsedRows.map(r => r.clientOwnerName).filter(n => n))];

            getOwnerIdsFromNames({ acnOwnerNames: acnNames, clientOwnerNames: clientNames })
                .then(resultMap => {
                    console.log('Resolved Owner IDs:', resultMap);

                        // Resolve dependency IDs from dependency names 
                        // originalTimelineDataCopy is now a flat array
                        const allExistingTasks = [...this.originalTimelineDataCopy];

                    this.parsedRows = parsedRows.map(row => {
                        const acnKey = row.acnOwnerName ? row.acnOwnerName.toLowerCase().trim() : null;
                        const clientKey = row.clientOwnerName ? row.clientOwnerName.toLowerCase().trim() : null;

                            // Resolve dependencyId from dependencyName 
                            let resolvedDependencyId = null;
                            if (row.dependencyName) {
                                const depNameLower = row.dependencyName.toLowerCase().trim();
                                // Find matching task by comparing with task display name (tasks or taskIfOther)
                                const matchingTask = allExistingTasks.find(task => {
                                    const taskDisplayName = task.taskIfOther || task.tasks || '';
                                    return taskDisplayName.toLowerCase().trim() === depNameLower;
                                });
                                // If valid match found, use its ID; otherwise leave as null (invalid dependency)
                                resolvedDependencyId = matchingTask ? matchingTask.id : null;
                            }

                        return {
                            ...row,
                            acnOwnerId: resultMap[acnKey] || null,
                                clientOwnerId: resultMap[clientKey] || null,
                                dependencyId: resolvedDependencyId // Resolved from dependencyName
                    };
                });

                // Update your table data here
                    this.newRows = [...this.newRows, ...this.parsedRows];
                this.updateDeleteButtonState();

                // Now show toast based on validation results
                if (errorMessages.length > 0) {
                            this.dispatchEvent(
                                new ShowToastEvent({
                        title: 'Validation Errors',
                        message: errorMessages.join('\n'),
                        variant: 'error'
                                })
                            );
                } else {
                            this.dispatchEvent(
                                new ShowToastEvent({
                        title: 'Success',
                        message: 'All rows uploaded successfully.',
                        variant: 'success'
                                })
                            );
                }

                    this.isLoading = false;
                })
                .catch(error => {
                    console.error('Error resolving owner IDs:', error);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'Failed to resolve ACN/Client Owner IDs: ' + (error.body?.message || error),
                            variant: 'error'
                        })
                    );
                    this.isLoading = false;
                });
            //Changes Ended for US-1469303 and 1554468S
            };
            reader.readAsBinaryString(file);
        }
    }
}