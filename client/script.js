window.onload = function(){
    var chatContainer = document.getElementById('chat-ctr');
    if (chatContainer) {
        chatContainer.scrollBy(0,400000000000000)
    }

    var rpBtn = document.getElementsByClassName('razorpay-payment-button');
    if(rpBtn && rpBtn.length > 0) {
        document.getElementsByClassName("razorpay-payment-button")[0].classList.add("btn-large");
        document.getElementsByClassName("razorpay-payment-button")[0].classList.add("center");
    }
};

document.onreadystatechange = function () {
    if (document.readyState === "interactive") {
        document.getElementById("preloader-wrapper").style.display = "";
        document.getElementsByClassName("body-section")[0].classList.add("overlay");
    }
    if (document.readyState === "complete") {
        document.getElementById("preloader-wrapper").style.display = "none";
        document.getElementsByClassName("body-section")[0].classList.remove("overlay");
    }
};
