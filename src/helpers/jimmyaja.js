import moment from 'moment';
import $ from 'jquery';
import constants from '../constants';
export default {
    setDataInStore : null,
    markAttendanceOnJimmyAja: function(type,setDataInStore,  isUrlSaved = false) {
        console.log("checking browser url", window.location.href.includes("https://jimmyaja.com"))
        
        if(!window.location.href.includes("https://jimmyaja.com")){
            console.log("redirecting to jimmy aja")
            var newWin = window.open("https://jimmyaja.com/home", "_blank");           

            if(!newWin || newWin.closed || typeof newWin.closed == 'undefined') 
            { 
                //POPUP BLOCKED
                console.log("POPUP BLOCKED::isUrlSaved",isUrlSaved)
                if(!isUrlSaved){
                    window.postMessage({type:constants.SAVE_CURRENT_URL, payload:{ url: window.location.href, type}}, "*")
                }
                else{
                    window.location.href = "https://jimmyaja.com/home";
                }
            }
            return;
        }
        
        console.log("not in jimmy ja")
        this.setDataInStore = setDataInStore;

        if(window.location.href.includes("https://jimmyaja.com")){
            console.log("not in jimmy ja")
            let loginButton = $(".login-btn");
            if(loginButton.length > 0)//user not logged in
            {
                console.log("doLogin")
                this.doLogin();
            }
            else {
                console.log("already logged in ")
                type === "IN" ? this.markInAttendance() : this.markOutAttendance();
            }
        }
    },
    doLogin: function(){
        $(".login-detail #company_code").val("OBOBS");
        $(".login-detail #email").val("bilal.khan@codeinformatics.com");
        $(".login-detail input[name='password']").val("6reBR@stlDru");
        $(".login-detail input[name='remember_me']").click();
        $(".login-btn").click();
    },
    checkAlreadyMarkedAttendance: function(){
        let isAlreadyLoggedIn = true;
        $.each($(".moving-outlist marquee p"), function (indexInArray, valueOfElement) { 
             if($(valueOfElement).text().includes("Bilal Khan")){
                isAlreadyLoggedIn = false;
             }
        });
        return isAlreadyLoggedIn;
    },
    markInAttendance: function(){
        console.log("marking Attandance")
        $(".page-sidebar-menu li.nav-item a[href='#attendance'] span").click();
        $("#form_attendance #comments").val("In At : "+ moment().format("DD-MM-YYYY hh:mm a"));
        $("#form_attendance #inBtn").click();
        // $("#form_attendance #submit-btn").click();
        // this.checkAttendesMarkedSuccessfully(); 
                this.setDataInStore(); 
    },
    markOutAttendance: function(){
        console.log("marking Attandance")
        $(".page-sidebar-menu li.nav-item a[href='#attendance'] span").click();
        $("#form_attendance #comments").val("Out At : "+ moment().format("DD-MM-YYYY hh:mm a"));
        $("#form_attendance #outBtn").click();
        // $("#form_attendance #submit-btn").click();
        // this.checkAttendesMarkedSuccessfully();  
                this.setDataInStore();
    },
    isThisInValidHour: function(){
        console.log("current houre",this.getCurrentHour() );
        return (this.getCurrentHour() < 9 || this.getCurrentHour() >= 23); //current houre is less than 9 and greator than or equals to 11 pm
    },
    getCurrentHour: function(){
        return moment().format("H");
    },
    getTodayDate: function(){
        return moment().format("DD-MM-YYYY");
    },
    checkAttendesMarkedSuccessfully: function(){
        const intervalId = setInterval(() => {
            if(!$("#attendance").hasClass("in")){ //is check in model open
                this.setDataInStore();
                clearInterval(intervalId);
            }
        }, 1000);
    },
    checkAttandanceSuccessfully : function () {
        return $(".moving-outlist marquee p").text().includes("Muhammad Bilal")
    }
}//end object