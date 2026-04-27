// ================== GALLERY / LIGHTBOX ==================
const images = document.querySelectorAll(".gallery-img");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

let currentIndex = 0;


// select location box
const locationBox = document.querySelector('.location');

// toggle dropdown on click
locationBox.addEventListener('click', (e) => {
  e.stopPropagation(); // prevent immediate closing
  locationBox.classList.toggle('active');
});

// close dropdown when clicking outside
document.addEventListener('click', () => {
  locationBox.classList.remove('active');
});

// Open lightbox
images.forEach((img, index) => {
  img.addEventListener("click", () => {
    lightbox.style.display = "flex";
    lightboxImg.src = img.src;
    currentIndex = index;
  });
});

// Close
document.querySelector(".close").onclick = () => {
  lightbox.style.display = "none";
};

// Next
document.querySelector(".next").onclick = () => {
  currentIndex = (currentIndex + 1) % images.length;
  lightboxImg.src = images[currentIndex].src;
};

// Prev
document.querySelector(".prev").onclick = () => {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  lightboxImg.src = images[currentIndex].src;
};



// ================== ACCORDION ==================
const headers = document.querySelectorAll(".accordion-header");

headers.forEach(header => {
  header.addEventListener("click", () => {

    const content = header.nextElementSibling;

    header.classList.toggle("active");

    if (content.style.maxHeight) {
      content.style.maxHeight = null;
      content.classList.remove("open");
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
      content.classList.add("open");
    }

  });
});



// ================== BOOKING CARD ==================
const prices = [94, 84, 20]; // Adult, Youth, Child
const plusBtns = document.querySelectorAll(".plus");
const minusBtns = document.querySelectorAll(".minus");
const counts = document.querySelectorAll(".count");
const extras = document.querySelectorAll(".extra");
const totalPrice = document.getElementById("totalPrice");

let values = [0, 0, 0];

// Update total
function updateTotal() {
  let total = 0;

  // Ticket calculation
  values.forEach((val, i) => {
    total += val * prices[i];
  });

  // Extras
  extras.forEach(extra => {
    if (extra.checked) {
      total += Number(extra.value);
    }
  });

  totalPrice.innerText = "$" + total.toFixed(2);
}

// Plus button
plusBtns.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    values[i]++;
    counts[i].innerText = values[i];
    updateTotal();
  });
});

// Minus button
minusBtns.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    if (values[i] > 0) {
      values[i]--;
      counts[i].innerText = values[i];
      updateTotal();
    }
  });
});

// Extras checkbox
extras.forEach(extra => {
  extra.addEventListener("change", updateTotal);
});


// SHARE FUNCTION
const shareBtn = document.getElementById("shareBtn");

shareBtn.addEventListener("click", async () => {
  const shareData = {
    title: "Trip to Paris",
    text: "Check out this amazing tour!",
    url: window.location.href
  };

  // If browser supports native share
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.log("Share cancelled");
    }
  } else {
    // fallback → copy link
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  }
});


// WISHLIST FUNCTION
const wishlistBtn = document.getElementById("wishlistBtn");
const heartIcon = wishlistBtn.querySelector("i");

// Load saved state
let isWishlisted = localStorage.getItem("wishlist") === "true";

updateWishlistUI();

wishlistBtn.addEventListener("click", () => {
  isWishlisted = !isWishlisted;

  // Save state
  localStorage.setItem("wishlist", isWishlisted);

  updateWishlistUI();
});

function updateWishlistUI() {
  if (isWishlisted) {
    heartIcon.classList.remove("fa-regular");
    heartIcon.classList.add("fa-solid");
    heartIcon.style.color = "red";
  } else {
    heartIcon.classList.remove("fa-solid");
    heartIcon.classList.add("fa-regular");
    heartIcon.style.color = "black";
  }
}



const stars = document.querySelectorAll("#rating i");
const ratingText = document.getElementById("ratingText");

let currentRating = 0;

// Load saved rating
if (localStorage.getItem("userRating")) {
  currentRating = Number(localStorage.getItem("userRating"));
  updateStars(currentRating);
}

// Click event
stars.forEach(star => {
  star.addEventListener("click", () => {
    const value = star.getAttribute("data-value");
    currentRating = value;

    // Save rating
    localStorage.setItem("userRating", value);

    updateStars(value);

    // Update text (optional)
    ratingText.textContent = `${value}.0 (You rated)`;
  });

  // Hover effect
  star.addEventListener("mouseover", () => {
    const value = star.getAttribute("data-value");
    highlightStars(value);
  });

  star.addEventListener("mouseout", () => {
    updateStars(currentRating);
  });
});

// Functions
function highlightStars(value) {
  stars.forEach(star => {
    if (star.getAttribute("data-value") <= value) {
      star.classList.add("active");
    } else {
      star.classList.remove("active");
    }
  });
}

function updateStars(value) {
  stars.forEach(star => {
    if (star.getAttribute("data-value") <= value) {
      star.classList.add("active");
    } else {
      star.classList.remove("active");
    }
  });
}

const reviewsBtn = document.getElementById("reviewsBtn");
const packagesBtn = document.getElementById("packagesBtn");
const contactBtn = document.getElementById("contactBtn");
const reviewsModal = document.getElementById("reviewsModal");
const packagesModal = document.getElementById("packagesModal");
const contactModal = document.getElementById("contactModal");
const modalCloses = document.querySelectorAll(".modal-close");
const contactForm = document.getElementById("contactForm");

function openModal(modal) {
  if (modal) {
    modal.classList.add("active");
  }
}

function closeModal(modal) {
  if (modal) {
    modal.classList.remove("active");
  }
}

reviewsBtn?.addEventListener("click", () => openModal(reviewsModal));
packagesBtn?.addEventListener("click", () => openModal(packagesModal));
contactBtn?.addEventListener("click", () => openModal(contactModal));

modalCloses.forEach(button => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal-overlay");
    closeModal(modal);
  });
});

[reviewsModal, packagesModal, contactModal].forEach(modal => {
  if (modal) {
    modal.addEventListener("click", event => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  }
});

if (contactForm) {
  contactForm.addEventListener("submit", event => {
    event.preventDefault();
    alert("Thanks! Your message has been sent.");
    closeModal(contactModal);
    contactForm.reset();
  });
}




