import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDoc, deleteDoc, doc, getDocs } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyBJ9b_kW8x_g0MPseuYZvNKFFzY62V8yRM",
  authDomain: "koktensifa-8b9d6.firebaseapp.com",
  projectId: "koktensifa-8b9d6",
  storageBucket: "koktensifa-8b9d6.appspot.com",
  messagingSenderId: "430082742734",
  appId: "1:430082742734:web:e9f7e56af807b8ad56b39f"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Maksimum deneme hakkı
const MAX_ATTEMPTS = 3;
let attemptCount = 0;

async function checkPassword() {
  while (attemptCount < MAX_ATTEMPTS) {
    const userPassword = prompt("Şifre Giriniz...");

    if (userPassword === null) {
      // Kullanıcı "İptal" butonuna bastıysa
      attemptCount++;
      if (attemptCount >= MAX_ATTEMPTS) {
        console.log("Deneme hakkınız bitti.");
        alert("Deneme hakkınız bitti. Sayfa yüklenmeyecek.");
        document.body.innerHTML = "<h1>Deneme hakkınız bitti. Sayfa yüklenmedi.</h1>";
        return;
      } else {
        alert(`İptal edildi. Kalan deneme hakkınız: ${MAX_ATTEMPTS - attemptCount}`);
        continue;
      }
    }

    try {
      // Belirtilen konumdan veriyi al
      const docRef = doc(db, 'password', '2');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const storedPassword = docSnap.data().password; // Şifreyi al

        if (userPassword === storedPassword) {
          console.log("Şifre doğru!");
          return; // Şifre doğruysa fonksiyonu bitir
        } else {
          console.log("Şifre yanlış!");
          attemptCount++;
          alert(`Şifre yanlış! Kalan deneme hakkınız: ${MAX_ATTEMPTS - attemptCount}`);
        }
      } else {
        console.log('Şifre verisi bulunamadı');
        alert('Şifre verisi bulunamadı.');
        document.body.innerHTML = "<h1>Şifre verisi bulunamadı. Sayfa yüklenmedi.</h1>";
        return;
      }
    } catch (error) {
      console.error('Şifre doğrulama sırasında hata oluştu:', error);
      alert('Şifre doğrulama sırasında bir hata oluştu.');
      document.body.innerHTML = "<h1>Bir hata oluştu. Sayfa yüklenmedi.</h1>";
      return;
    }
  }

  // Maksimum deneme hakkı aşıldığında
  console.log("Deneme hakkınız bitti.");
  alert("Deneme hakkınız bitti. Sayfa yüklenmeyecek.");
  document.body.innerHTML = "<h1>Deneme hakkınız bitti. Sayfa yüklenmedi.</h1>";
}

// Kart ekleme işlevi
document.getElementById("create-card-btn").addEventListener("click", async function (event) {
  event.preventDefault();

  var cardName = document.getElementById("card-name").value;
  var cardDescription = document.getElementById("card-description").value;
  var certDate = document.getElementById("cert-date").value;
  var cardImageInput = document.getElementById("cardImage");
  var certImageInput = document.getElementById("certImage");

  var file = cardImageInput.files[0];
  var file2 = certImageInput.files[0];

  function calculateDateDifference(startDate) {
    const today = new Date();
    const start = new Date(startDate);

    let years = today.getFullYear() - start.getFullYear();
    let months = today.getMonth() - start.getMonth();
    let days = today.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return {
      years: years,
      months: months,
      days: days,
    };
  }

  var cardImageReader = new FileReader();
  var certImageReader = new FileReader();

  cardImageReader.onloadend = async function () {
    var cardImage = cardImageReader.result;
    var certImage = certImageReader.result;

    var dateDifference = calculateDateDifference(certDate);

    try {
      await addDoc(collection(db, 'cards'), {
        title: cardName,
        description: cardDescription,
        date: certDate,
        image: cardImage,
        imageCert: certImage,
        dateDifference: dateDifference,
        timestamp: new Date()
      });
      console.log('Kart başarıyla Firebase\'e eklendi');
      loadCards(); // Kartları yeniden yükle
    } catch (error) {
      console.error('Kart eklenirken hata oluştu:', error);
    }
  };

  if (file) {
    cardImageReader.readAsDataURL(file);
  }

  if (file2) {
    certImageReader.readAsDataURL(file2);
  }
});


// Kartları Firebase'den yükleyip tabloya ekleme işlevi
async function loadCards() {
  const cardsTableBody = document.querySelector('#cardsTable tbody');
  if (!cardsTableBody) {
    console.error("cardsTableBody element not found!");
    return;
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'cards'));
    cardsTableBody.innerHTML = ''; // Önceki verileri temizle

    querySnapshot.forEach((doc) => {
      const card = doc.data();
      const cardId = doc.id;
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${card.title}</td>
        <td>${card.description}</td>
        <td>${card.date}</td>
        <td><img src="${card.image}" alt="Card Image" style="width: 100px; height: auto;"></td>
        <td><img src="${card.imageCert}" alt="Card Image" style="width: 100px; height: auto;"></td>
        <td><button class="delete-btn" data-id="${cardId}">Sil</button></td>
      `;

      cardsTableBody.appendChild(row);
    });

    // Silme butonlarına tıklama olayı ekle
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', async (event) => {
        const cardId = event.target.getAttribute('data-id');
        try {
          await deleteDoc(doc(db, 'cards', cardId));
          console.log('Kart başarıyla silindi');
          loadCards(); // Güncel kartları tekrar yükle
        } catch (error) {
          console.error('Kart silinirken hata oluştu:', error);
        }
      });
    });
  } catch (error) {
    console.error('Veriler çekilirken hata oluştu:', error);
  }
}

// Sayfa yüklendiğinde kartları yükle
document.addEventListener('DOMContentLoaded', loadCards);

// Şifre kontrolünü başlat
checkPassword();
