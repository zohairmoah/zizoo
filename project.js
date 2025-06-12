async function loadProject() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (!projectId) {
        window.location.href = 'index.html';
        return;
    }

    const project = findProject(projectId);
    if (!project) {
        showError();
        return;
    }

    displayProject(project);
    document.title = `${project.title} - تفاصيل المشروع`;
}

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    
    if (!projectId) {
        window.location.href = 'index.html';
        return;
    }

    const project = ProjectStorage.getProjectById(projectId);
    if (!project) {
        showError();
        return;
    }

    displayProject(project);
    document.title = `${project.title} - تفاصيل المشروع`;
});

function findProject(id) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    return projects.find(p => p.id.toString() === id.toString());
}

function showError() {
    document.getElementById('projectContent').innerHTML = `
        <div class="error-message glass-effect">
            <h2>عذراً</h2>
            <p>لم يتم العثور على المشروع المطلوب</p>
            <a href="index.html" class="back-btn">العودة للصفحة الرئيسية</a>
        </div>
    `;
}

function displayProject(project) {
    // تحديث المعلومات الأساسية
    document.querySelector('.project-title').textContent = project.title;
    document.querySelector('.project-category').textContent = project.category;
    document.querySelector('.project-date').textContent = new Date(project.createdAt).toLocaleDateString('ar-SA');
    document.querySelector('.project-description').innerHTML = project.fullDescription || project.description;

    // تحميل الصور
    const mainImage = document.querySelector('.main-image');
    mainImage.src = project.mainImage || project.images[0];
    mainImage.alt = project.title;

    // إنشاء المصغرات
    const thumbnailsContainer = document.querySelector('.thumbnails-scroll');
    thumbnailsContainer.innerHTML = project.images.map((img, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
            <img src="${img}" alt="${project.title} - صورة ${index + 1}" loading="lazy">
        </div>
    `).join('');

    // إضافة التقنيات
    const techTags = document.querySelector('.tech-tags');
    techTags.innerHTML = project.technologies.map(tech => 
        `<span class="tech-tag">${tech}</span>`
    ).join('');

    // إضافة رابط المشروع إذا وجد
    if (project.projectUrl) {
        document.getElementById('projectUrl').innerHTML = `
            <a href="${project.projectUrl}" target="_blank" class="visit-project-btn">
                <i class="fas fa-external-link-alt"></i>
                زيارة المشروع
            </a>
        `;
    }

    initializeImageHandlers();
}

function initializeImageHandlers() {
    const viewer = document.getElementById('imageViewer');
    const viewerImg = viewer.querySelector('img');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.querySelector('.main-image');
    let currentImageIndex = 0;

    // معالجة النقر على المصغرات
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const index = parseInt(thumb.dataset.index);
            updateMainImage(index);
        });
    });

    // تكبير الصورة
    document.querySelector('.zoom-btn').addEventListener('click', () => {
        viewer.classList.add('active');
        viewerImg.src = mainImage.src;
    });

    // إغلاق المعرض
    viewer.querySelector('.close-viewer').addEventListener('click', () => {
        viewer.classList.remove('active');
    });

    // التنقل بين الصور
    viewer.querySelector('.next-image').addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % thumbnails.length;
        updateMainImage(currentImageIndex);
        viewerImg.src = mainImage.src;
    });

    viewer.querySelector('.prev-image').addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + thumbnails.length) % thumbnails.length;
        updateMainImage(currentImageIndex);
        viewerImg.src = mainImage.src;
    });

    // أزرار التنقل في المصغرات
    document.querySelector('.nav-btn.next').addEventListener('click', () => {
        thumbnailsContainer.scrollBy({ left: -100, behavior: 'smooth' });
    });

    document.querySelector('.nav-btn.prev').addEventListener('click', () => {
        thumbnailsContainer.scrollBy({ left: 100, behavior: 'smooth' });
    });

    function updateMainImage(index) {
        currentImageIndex = index;
        const newSrc = thumbnails[index].querySelector('img').src;
        mainImage.src = newSrc;
        thumbnails.forEach(t => t.classList.remove('active'));
        thumbnails[index].classList.add('active');
        thumbnails[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}
