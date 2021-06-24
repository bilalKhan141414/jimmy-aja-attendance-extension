import moment from 'moment';
import $ from 'jquery';
export default {
    setDataInStore : null,
    markAttendanceOnJimmyAja: function(type, setDataInStore) {
        console.log("checking browser url", window.location.href.includes("https://jimmyaja.com"))
        
        if(!window.location.href.includes("https://jimmyaja.com")){
            console.log("redirecting to jimmy aja")
            var newWin =window.open("https://jimmyaja.com/home", "_blank");           

            if(!newWin || newWin.closed || typeof newWin.closed=='undefined') 
            { 
                //POPUP BLOCKED
                window.location.href = "https://jimmyaja.com/home";
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
        // $("#form_attendance #inBtn").click();
        // $("#form_attendance #submit-btn").click();
        // this.checkAttendesMarkedSuccessfully();  
    },
    markOutAttendance: function(){
        console.log("marking Attandance")
        $(".page-sidebar-menu li.nav-item a[href='#attendance'] span").click();
        $("#form_attendance #comments").val("Out At : "+ moment().format("DD-MM-YYYY hh:mm a"));
        $("#form_attendance #outBtn").click();
        // $("#form_attendance #submit-btn").click();
        // this.checkAttendesMarkedSuccessfully();  
    },
    isThisValidHour: function(){
        console.log("current houre",this.getCurrentHour() );
        return (this.getCurrentHour() < 9 || this.getCurrentHour() >= 23);
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
                this.setDataInStore({
                    jimmyAja:{
                        isCheckedIn:true,
                        inDate: this.getTodayDate()
                    }
                })  
                clearInterval(intervalId);
            }
        }, 1000);
    }
}//end object