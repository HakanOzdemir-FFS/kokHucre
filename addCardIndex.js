import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js';

// Firebase yapılandırmanızı burada yapın
const firebaseConfig = {
  apiKey: "AIzaSyBJ9b_kW8x_g0MPseuYZvNKFFzY62V8yRM",
  authDomain: "koktensifa-8b9d6.firebaseapp.com",
  projectId: "koktensifa-8b9d6",
  storageBucket: "koktensifa-8b9d6.appspot.com",
  messagingSenderId: "430082742734",
  appId: "1:430082742734:web:e9f7e56af807b8ad56b39f"
};

// Firebase'i başlatın
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', async function() {
  var cardsContainer = document.querySelector('#section-certificate .slider');
  if (!cardsContainer) {
    console.error("cardsContainer element not found!");
    return;
  }

  try {
    // Firestore'dan veriyi çekin
    const querySnapshot = await getDocs(collection(db, "cards"));
    const cards = querySnapshot.docs.map(doc => doc.data());

    function createSlides(cards) {
      var slides = [];

      if (cards.length === 0) {
        // Kart bulunamadığında mesaj göster
        slides.push(`<div class="slide row">
          <h1 class="heading-secondary">Sertifika bulunamadı</h1></div>`);
      } else {
        for (var i = 0; i < cards.length; i += 3) {
          var slideContent = `<div class="slide row">`;
          var hasContent = false;
          var cardCount = 0;

          for (var j = i; j < i + 3 && j < cards.length; j++) {
            var card = cards[j];
            var dateDifference = card.dateDifference || { years: 0, months: 0, days: 0 }; // Varsayılan değerler

            slideContent += `
              <div class="col-1-of-3">
                <div class="card">
                  <div class="card__side card__side--front">
                    <div class="card__picture card__picture--${j}" style="background-image: url('${card.image}');">
                    &nbsp;</div>
                    <h4 class="card__heading">
                      <span class="card__heading--span card__heading--span--${j}">${card.title}</span>
                    </h4>
                    <div class="card__details">
                      <ul>
                        <li>${card.description}</li>
                        <li>Tarih: ${card.date}</li>
                      </ul>
                    </div>
                  </div>
                  <div class="card__side card__side--back card__side--back-${j}">
                    <div class="card__cta">
                      <div class="card__price-box">
                        <p class="card__price-only">${card.title}</p>
                        <p class="card__price-value">Geçen süre: ${dateDifference.years} yıl, ${dateDifference.months} ay, ${dateDifference.days} gün</p>
                      </div>
                      <a href="#section-book" class="btn btn--white card__cta__btn">Sen de Katıl!</a>
                    </div>
                  </div>
                </div>
              </div>
            `;
            hasContent = true;
            cardCount++;
          }

          // Boş alan ekleme mantığı
          if (cardCount === 1) {
            slideContent += `
              <div class="col-1-of-3">&nbsp;</div>
              <div class="col-1-of-3">&nbsp;</div>
            `;
          } else if (cardCount === 2) {
            slideContent += `
              <div class="col-1-of-3">&nbsp;</div>
            `;
          }

          if (hasContent) {
            slideContent += `</div>`;
            slides.push(slideContent);
          }
        }
      }

      return slides;
    }

    function renderSlides(slides) {
      cardsContainer.innerHTML = '';
      slides.forEach(function(slide) {
        cardsContainer.insertAdjacentHTML('beforeend', slide);
      });
    }

    function updateSlider() {
      const slider = document.querySelector('.slider');
      let currentIndex = 0;

      function updateSlidePosition() {
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
      }

      function updateButtons() {
        const prevButton = document.querySelector('.prevSlider');
        const nextButton = document.querySelector('.nextSlider');

        if (slides.length <= 1) {
          prevButton.style.display = 'none';
          nextButton.style.display = 'none';
        } else {
          prevButton.style.display = currentIndex === 0 ? 'none' : 'block';
          nextButton.style.display = currentIndex === slides.length - 1 ? 'none' : 'block';
        }
      }

      document.querySelector('.nextSlider').addEventListener('click', function() {
        if (currentIndex < slides.length - 1) {
          currentIndex++;
          updateSlidePosition();
          updateButtons();
        }
      });

      document.querySelector('.prevSlider').addEventListener('click', function() {
        if (currentIndex > 0) {
          currentIndex--;
          updateSlidePosition();
          updateButtons();
        }
      });

      // Initialize button states
      updateButtons();
    }

    function filterCards() {
      var cardName = document.querySelector('#card-name').value.toLowerCase();
      var cardDescription = document.querySelector('#card-description').value.toLowerCase();
      
      var filteredCards = cards.filter(function(card) {
        var titleMatch = cardName === '' || card.title.toLowerCase().includes(cardName);
        var descriptionMatch = cardDescription === '' || card.description.toLowerCase().includes(cardDescription);
        return titleMatch && descriptionMatch;
      });

      var slides = createSlides(filteredCards);
      renderSlides(slides);
      updateSlider();
    }

    // Event listeners for input changes
    document.querySelector('#card-name').addEventListener('input', filterCards);
    document.querySelector('#card-description').addEventListener('input', filterCards);

    // Initial render
    var slides = createSlides(cards);
    renderSlides(slides);
    updateSlider();
  } catch (error) {
    console.error("Firestore'dan veri çekilirken hata oluştu: ", error);
  }
});
