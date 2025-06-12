document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('reviewModal');
    const addReviewBtn = document.getElementById('addReviewBtn');
    const closeModal = document.querySelector('.close-modal');
    const reviewForm = document.getElementById('reviewForm');
    const ratingInput = document.getElementById('ratingInput');
    const ratingValue = document.getElementById('ratingValue');
    const stars = document.querySelectorAll('.star-icon');
    let selectedRating = 0;

    // عرض/إخفاء النموذج
    addReviewBtn.onclick = () => modal.classList.add('active');
    closeModal.onclick = () => modal.classList.remove('active');

    function updateStars(value) {
        stars.forEach((star, index) => {
            star.classList.toggle('active', index < value);
        });
    }

    // تحديث النجوم عند تحريك شريط التمرير
    ratingInput.addEventListener('input', () => {
        const value = parseInt(ratingInput.value);
        ratingValue.textContent = value;
        updateStars(value);
    });

    // تحديث أولي للنجوم
    updateStars(parseInt(ratingInput.value));

    // معالجة إرسال التقييم
    reviewForm.onsubmit = (e) => {
        e.preventDefault();
        const review = {
            name: document.getElementById('reviewName').value,
            rating: parseInt(ratingInput.value),
            text: document.getElementById('reviewText').value,
            date: new Date().toISOString(),
            // صورة افتراضية للمستخدم
            image: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(document.getElementById('reviewName').value)
        };

        saveAndDisplayReview(review);
        modal.classList.remove('active');
        reviewForm.reset();
        ratingInput.value = 3;
        ratingValue.textContent = '3';
    };

    // حفظ وعرض التقييمات
    function saveAndDisplayReview(review) {
        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        reviews.push(review);
        localStorage.setItem('reviews', JSON.stringify(reviews));
        displayReviews();
    }

    // تحديث طريقة عرض التقييمات
    function displayReviews() {
        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        const grid = document.getElementById('testimonialsGrid');
        
        grid.innerHTML = reviews.map(review => `
            <div class="testimonial-card">
                <div class="testimonial-header">
                    <img src="${review.image}" alt="${review.name}" class="client-image">
                    <div class="client-info">
                        <h4>${review.name}</h4>
                        <p>${new Date(review.date).toLocaleDateString('ar-SA')}</p>
                    </div>
                </div>
                <p class="testimonial-text">${review.text}</p>
                <div class="stars-display">
                    ${Array(5).fill().map((_, i) => `
                        <i class="fas fa-star star-icon ${i < review.rating ? 'active' : ''}"></i>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // عرض التقييمات الموجودة عند تحميل الصفحة
    displayReviews();
});

let currentUser = null;

function onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    currentUser = {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        image: profile.getImageUrl()
    };

    // تحديث واجهة المستخدم
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('reviewForm').classList.remove('hidden');
    document.getElementById('googleSignInBtn').classList.add('hidden');
    document.getElementById('userImage').src = currentUser.image;
    document.getElementById('userName').textContent = currentUser.name;
    
    // تعبئة اسم المستخدم تلقائياً
    document.getElementById('reviewName').value = currentUser.name;
}

// التحقق من حالة تسجيل الدخول عند فتح النافذة
function checkAuthStatus() {
    if (gapi.auth2) {
        const auth2 = gapi.auth2.getAuthInstance();
        if (auth2.isSignedIn.get()) {
            onSignIn(auth2.currentUser.get());
        }
    }
}

// تسجيل الخروج
function signOut() {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
        currentUser = null;
        document.getElementById('userInfo').classList.add('hidden');
        document.getElementById('reviewForm').classList.add('hidden');
        document.getElementById('googleSignInBtn').classList.remove('hidden');
    });
}
