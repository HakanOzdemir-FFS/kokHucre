document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Sayfanın yeniden yüklenmesini engeller

    var form = event.target;
    var formData = new FormData(form);
    var actionUrl = form.action;

    fetch(actionUrl, {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(result => {
        var iframe = document.getElementById('responseFrame');
        var responseDiv = document.getElementById('response');
        iframe.contentDocument.open();
        iframe.contentDocument.write(result);
        iframe.contentDocument.close();
        responseDiv.style.display = 'block';
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
