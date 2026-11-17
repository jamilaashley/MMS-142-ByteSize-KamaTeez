const TO_ADDRESS = "hello@examplewebsite142.com";
const form = document.querySelector("#contact-form");

function buildOutlookLink() {
    const name = document.querySelector("#full-name").value;
    const topic = document.querySelector("#topic").value;
    const text = document.querySelector("#message").value;

    const emailSubject = "Website message: " + topic;
    
    const emailBody = 
        "Hello!\n\n" +
        "Here are my message details:\n\n" +
        "Name: " + name + "\n" +
        "Subject: " + topic + "\n\n" +
        "Message:\n" + text + "\n\n" +
        "Thank you.";

    return (
        "https://outlook.live.com/mail/0/deeplink/compose?" +
        "to=" + encodeURIComponent(TO_ADDRESS) +
        "&subject=" + encodeURIComponent(emailSubject) +
        "&body=" + encodeURIComponent(emailBody)
    );
}

form.addEventListener("submit", function (event) {
    event.preventDefault();
    window.location.href = buildOutlookLink();
});