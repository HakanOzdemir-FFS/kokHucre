import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDoc, deleteDoc, doc, getDocs } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js';


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

  const cardName = document.getElementById("card-name").value;
  const cardDescription = document.getElementById("card-description").value;
  const certDate = document.getElementById("cert-date").value;
  const cardImageInput = document.getElementById("cardImage");
  const certImageInput = document.getElementById("certImage");

  const file = cardImageInput.files[0];
  const file2 = certImageInput.files[0];

  const storage = getStorage();
  const cardImageRef = ref(storage, 'cardImages/' + file.name);
  const certImageRef = ref(storage, 'certImages/' + file2.name);

  try {
    let cardImageUrl = '';
    let certImageUrl = '';

    // Kart fotoğrafını yükle
    if (file) {
      const cardSnapshot = await uploadBytes(cardImageRef, file);
      cardImageUrl = await getDownloadURL(cardSnapshot.ref);
    }

    // Sertifika fotoğrafını yükle
    if (file2) {
      const certSnapshot = await uploadBytes(certImageRef, file2);
      certImageUrl = await getDownloadURL(certSnapshot.ref);
    }

    const dateDifference = card.dateDifference;

    // Firestore'a kaydet
    await addDoc(collection(db, 'cards'), {
      title: cardName,
      description: cardDescription,
      date: certDate,
      image: cardImageUrl,
      certImage: certImageUrl,
      dateDifference: dateDifference,
      timestamp: new Date()
    });

    console.log('Kart başarıyla Firebase\'e eklendi');
    loadCards(); // Kartları yeniden yükle

  } catch (error) {
    console.error('Kart eklenirken hata oluştu:', error);
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
        <td><img src="${card.certImage}" alt="Card Image" style="width: 100px; height: auto;"></td>
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
