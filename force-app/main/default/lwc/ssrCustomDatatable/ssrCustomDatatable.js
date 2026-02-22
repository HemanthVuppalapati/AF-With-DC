import LightningDatatable from 'lightning/datatable';
import lookupTemplate from './lookupOppTemplate.html';
import picklistTemplate from './picklistTemplate.html';

export default class SsrCustomDatatable extends LightningDatatable {
    static customTypes = {
        picklist: {
            template: picklistTemplate,
            standardCellLayout: true,
            typeAttributes: ['label', 'placeholder', 'options', 'value', 'context', 'fieldName']
        },
        lookup: {
            template: lookupTemplate,
            standardCellLayout: true,
            typeAttributes: ['value', 'fieldName', 'objectApiName', 'context', 'showAddNew']
        }
    };
}