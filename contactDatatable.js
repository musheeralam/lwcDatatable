import { LightningElement, wire,track,api } from 'lwc';
import getContacts from '@salesforce/apex/contactHandler.getContacts';
import { NavigationMixin } from 'lightning/navigation';  
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord} from 'lightning/uiRecordApi';
const columns=[
   // { label: 'Id', fieldName: 'Id' }, 
    { label: 'Last Name', fieldName: 'LastName',  },
    { label: 'Account ID', fieldName: 'AccountId' },
    { label: 'Title', fieldName: 'Title' },
    { label: 'Phone', fieldName: 'Phone', type: 'phone' },
    { label: 'Email', fieldName: 'Email', type: 'email' },
    {type: "button",label:'View', typeAttributes: {  
        iconName:"action:preview", 
        name: 'View',  
        title: 'View',  
        disabled: false,  
        value: 'view',  
        iconPosition: 'left'  
    }},  
    {type: "button",label:'Edit', typeAttributes: {  
        iconName:"action:edit",   
        name: 'Edit',  
        title: 'Edit',  
        disabled: false,  
        value: 'edit',  
        iconPosition: 'left'  
    }},   
    {type: "button",label:'Delete', typeAttributes: {  
        iconName:"action:delete",   
        name: 'Delete',  
        title: 'Delete',  
        disabled: false,  
        value: 'delete',  
        iconPosition: 'left'  
    }},   
];

export default class ContactDatatable extends NavigationMixin(LightningElement) {
    nameVar='str';
    flag=0;
    @track page = 1; //this will initialize 1st page
    @track items = []; //it contains all the records.
    @track data = []; //data to be displayed in the table
    @track columns; //holds column info.
    @track startingRecord = 1; //start record position per page
    @track endingRecord = 0; //end record position per page
    @track pageSize = 5;
    @track totalRecountCount = 0; //total record count received from all retrieved records
    @track totalPage = 0; //total number of page is needed to display all records
    @track modalContainer = false;
    @track contactRow={};
    callRowAction( event ) {  
          
        const recId =  event.detail.row.Id;   
        const actionName = event.detail.action.name;  
        if ( actionName === 'Edit' ) {  
  
            this[NavigationMixin.Navigate]({  
                type: 'standard__recordPage',  
                attributes: {  
                    recordId: recId,  
                    objectApiName: 'Account',  
                    actionName: 'edit'  
                }  
            })  
  
        } else if ( actionName === 'View') {  
            const dataRow = event.detail.row;
            this.contactRow=dataRow;
            this.modalContainer=true;
        }  
        else if( actionName === 'Delete'){
            deleteRecord(recId)         
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record Is  Deleted',
                        variant: 'success',
                    }),
                );
               
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error While Deleting record',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });
        }      
    }  

    closeModalAction(){
        this.modalContainer=false;
    }

    get options() {
        return [
            { label: '5', value: 5 },
            { label: '10', value: 10 },
            { label: '15', value: 15 },
        ];
    }
   

    handleChange(event) {
        this.pageSize=event.detail.value;
        this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); 
        this.endingRecord = this.pageSize;
        this.displayRecordPerPage(1);
        this.page=1; 
    }
    
    columns=columns;
    @wire(getContacts , { nameVar:'$nameVar'})
    wiredAccounts({ error, data }) {
        if (data) {
            this.items = data;
            this.totalRecountCount = data.length; //here it is 23
            this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize); //here it is 5
            this.data = this.items.slice(0,this.pageSize); 
            this.endingRecord = this.pageSize;
            this.columns = columns;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }
       
    //First and last Page
    firstHandler(){
        this.page=1;
        this.displayRecordPerPage(1);
    }
    lastHandler(){
        this.page=this.totalPage;
        this.displayRecordPerPage( this.totalPage);

    }

    previousHandler() {
        if (this.page > 1) {
            this.page = this.page - 1; 
            this.displayRecordPerPage(this.page);
        }
    }

    nextHandler() {
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; 
            this.displayRecordPerPage(this.page);            
        }             
    }

    displayRecordPerPage(page){
        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);
        this.endingRecord = (this.endingRecord > this.totalRecountCount) 
                            ? this.totalRecountCount : this.endingRecord; 
        this.data = this.items.slice(this.startingRecord, this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    }    
}