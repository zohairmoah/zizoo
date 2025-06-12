// تحديد العناصر
const categoryButtons = document.querySelectorAll('.category-btn');
const projectCards = document.querySelectorAll('.project-card');

// إضافة مستمعي الأحداث لأزرار التصنيف
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        // إزالة الفئة النشطة من جميع الأزرار
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        // إضافة الفئة النشطة للزر المحدد
        button.classList.add('active');
        
        const selectedCategory = button.getAttribute('data-category');
        
        // تصفية المشاريع
        projectCards.forEach(card => {
            if (selectedCategory === 'الكل' || card.getAttribute('data-category') === selectedCategory) {
                card.style.display = 'block';
                // إضافة تأثير الظهور
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
            });
    });
});

// تأثير المتابعة للماوس على البطاقات
projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
});

// تأثيرات التحميل الأولي
document.addEventListener('DOMContentLoaded', () => {
    projectCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

// تعريف المشاريع الأساسية
const defaultProjects = [
    {
        id: 1,
        title: "منصة تعليم إلكتروني",
        category: "تطوير الويب",
        description: "منصة تعليمية متكاملة مع نظام إدارة المحتوى وتتبع تقدم الطلاب",
        fullDescription: "منصة تعليمية متكاملة تتيح للطلاب التعلم عن بعد مع ميزات متقدمة للتفاعل والمتابعة",
        technologies: ["React", "Node.js", "MongoDB"],
        image: "/globe.svg"
    },
    {
        id: 2,
        title: "تطبيق إدارة المهام",
        category: "تطبيقات الموبايل",
        description: "تطبيق موبايل لإدارة المهام اليومية مع ميزات متقدمة للتنظيم",
        fullDescription: "تطبيق متكامل لإدارة المهام اليومية مع إمكانية التنظيم والتصنيف",
        technologies: ["Flutter", "Firebase"],
        image: "/window.svg"
    }
];

// تحميل وعرض المشاريع
function loadAndDisplayProjects() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const container = document.querySelector('.projects-grid');
    if (!container) return;

    if (projects.length === 0) {
        container.innerHTML = '<p class="no-projects">لم يتم إضافة أي مشاريع بعد</p>';
        return;
    }

    container.innerHTML = projects.map(project => `
        <div class="project-card" data-category="${project.category}" >
            <div class="project-image">
                <img src="${project.mainImage || project.images[0]}" alt="${project.title}">
                <div class="project-overlay"></div>
            </div>
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="technologies">
                    ${project.technologies.map(tech => `<span>${tech}</span>`).join('')}
                </div>
                <a href="project.html?id=${project.id}" class="project-link">
                    عرض التفاصيل <i class="fas fa-arrow-left"></i>
                </a>
                ${project.projectUrl ? `
                    <a href="${project.projectUrl}" target="_blank" class="visit-project-btn">
                        زيارة المشروع <i class="fas fa-external-link-alt"></i>
                    </a>
                ` : ''}
            </div>
        </div>
    `).join('');

    addProjectAnimations();
}

// إضافة تأثيرات الحركة للمشاريع
function addProjectAnimations() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// تحميل المشاريع عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadAndDisplayProjects();

    // تصفية المشاريع حسب الفئة
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            
            document.querySelectorAll('.category-btn').forEach(btn => 
                btn.classList.remove('active'));
            button.classList.add('active');
            
            document.querySelectorAll('.project-card').forEach(project => {
                if (category === 'الكل' || project.dataset.category === category) {
                    project.style.display = 'block';
                    project.style.opacity = '0';
                    setTimeout(() => {
                        project.style.opacity = '1';
                    }, 100);
                } else {
                    project.style.display = 'none';
                }
            });
        });
    });
});

// تهيئة EmailJS
document.addEventListener('DOMContentLoaded', function() {
    emailjs.init(process.env.EMAILJS_PUBLIC_KEY);

    document.getElementById('contactForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const submitButton = this.querySelector('.submit-btn');
        const btnText = submitButton.querySelector('.btn-text');
        const spinner = submitButton.querySelector('.loading-spinner');
        const messageStatus = document.querySelector('.message-status');
        
        // إظهار حالة التحميل
        submitButton.disabled = true;
        btnText.style.opacity = '0';
        spinner.style.display = 'block';
        messageStatus.innerHTML = '';

        // تجهيز البيانات بالشكل الصحيح
        function sanitizeInput(input) {
            const div = document.createElement('div');
            div.textContent = input;
            return div.innerHTML;
        }

        const templateParams = {
            from_name: sanitizeInput(document.getElementById('from_name').value),
            from_email: sanitizeInput(document.getElementById('from_email').value),
            message: sanitizeInput(document.getElementById('message').value),
            to_name: 'زهير'
        };

        // إرسال البريد
        emailjs.send(process.env.EMAILJS_SERVICE_ID, process.env.EMAILJS_TEMPLATE_ID, templateParams)
            .then(function(response) {
                console.log("SUCCESS", response);
                messageStatus.innerHTML = '<div class="success-message">تم إرسال رسالتك بنجاح!</div>';
                document.getElementById('contactForm').reset();
            })
            .catch(function(error) {
                console.log("FAILED", error);
                messageStatus.innerHTML = '<div class="error-message">حدث خطأ في إرسال الرسالة. الرجاء المحاولة مرة أخرى.</div>';
            })
            .finally(() => {
                submitButton.disabled = false;
                btnText.style.opacity = '1';
                spinner.style.display = 'none';
            });
})});

// تصفية المشاريع حسب الفئة
document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;
        
        // تحديث الزر النشط
        document.querySelectorAll('.category-btn').forEach(btn => 
            btn.classList.remove('active'));
        button.classList.add('active');
        
        // تصفية المشاريع
        const projects = document.querySelectorAll('.project-card');
        projects.forEach(project => {
            if (category === 'الكل' || project.dataset.category === category) {
                project.style.display = 'block';
            } else {
                project.style.display = 'none';
            }
        });
    });
});

function displayProjects() {
    const projects = ProjectStorage.getAllProjects();
    const container = document.getElementById('projectsContainer');
    
    if (!projects.length) {
        container.innerHTML = '<p class="no-projects">لم يتم إضافة أي مشاريع بعد</p>';
        return;
    }    container.innerHTML = projects.map(project => `
        <div class="project-card" data-category="${project.category}">
            <div class="card-inner">            <div class="project-image">
                <img src="${project.mainImage || project.images[0]}" 
                     alt="${project.title} - ${project.category} - زهير الزهيري"
                     title="${project.title} - ${project.description}"
                     loading="lazy">
            </div>
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="technologies">
                    ${project.technologies.map(tech => `<span>${tech}</span>`).join('')}
                </div>
                <div class="project-actions">                <a href="project.html?id=${project.id}" class="project-link" 
                   title="عرض تفاصيل مشروع ${project.title}"
                   aria-label="عرض المزيد عن مشروع ${project.title}">
                        عرض تفاصيل ${project.title}
                        <i class="fas fa-arrow-left" aria-hidden="true"></i>
                    </a>
                    ${project.projectUrl ? `
                        <a href="${project.projectUrl}" target="_blank" class="view-project-link">
                            زيارة المشروع
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    ` : ''}
                </div>
                </div>
            </div>
        </div>
    `).join('');

    addProjectAnimations();
}

// تحميل المشاريع عند بدء التطبيق
document.addEventListener('DOMContentLoaded', displayProjects);

// تأثيرات التمرير في شريط التنقل
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.main-nav');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// تأثيرات بطاقات المشاريع
document.addEventListener('DOMContentLoaded', () => {
    const projectCards = document.querySelectorAll('.project-card');
    
    // إضافة تأثيرات حركة للبطاقات عند الظهور
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    projectCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease';
        observer.observe(card);
    });
});

function initSlideshow() {
    const slides = document.querySelectorAll('.slide-image');
    let currentSlide = 0;

    function showNextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    setInterval(showNextSlide, 5000); // Change slide every 5 seconds
}

// Initialize slideshow when the page loads
document.addEventListener('DOMContentLoaded', initSlideshow);