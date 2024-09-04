<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Formdan gelen verileri al
    $name = htmlspecialchars($_POST['name']);
    $phone = htmlspecialchars($_POST['phoneNumber']);
    $email = htmlspecialchars($_POST['email']);
    $size = htmlspecialchars($_POST['size']);
    
    // E-posta bilgileri
    $to = "koktensifa@gmail.com";  // Buraya kendi e-posta adresinizi girin
    $subject = "Yeni İletişim Formu Mesajı";
    
    // E-posta içeriği
    $message = "Ad Soyad: $name\n";
    $message .= "Telefon Numarası: $phone\n";
    $message .= "Mail Adresi: $email\n";
    $message .= "Tercih: $size\n";
    
    // E-posta başlıkları
    $headers = "From: $email";

    // E-postayı gönder
    if (mail($to, $subject, $message, $headers)) {
        echo "Mesaj başarıyla gönderildi.";
    } else {
        echo "Mesaj gönderilemedi.";
    }
}
?>
