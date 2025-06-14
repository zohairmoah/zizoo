// المتغيرات العامة
let currentUser = null;
let projects = [];

// التحقق من البريد الإلكتروني المسموح به
function isAllowedEmail(email) {
    const allowedEmail = 'zizoalzohairy@gmail.com';
    return email === allowedEmail;
}

// التحقق من وجود مشاريع مخزنة
function loadProjects() {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
        projects = JSON.parse(storedProjects);
        displayProjects();
    }
}

// دالة تسجيل الدخول بحساب جوجل
function onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    const email = profile.getEmail();
    
    if (isAllowedEmail(email)) {
        currentUser = {
            name: profile.getName(),
            email: email,
            image: profile.getImageUrl()
        };
        showDashboard();
        loadProjects();
    } else {
        signOut();
        alert('عذراً، فقط البريد الإلكتروني zizoalzohairy@gmail.com مسموح له بالدخول');
    }
}

// دالة تسجيل الخروج
function signOut() {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
        currentUser = null;
        hideDashboard();
    });
}

// إظهار لوحة التحكم
function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    
    // تحديث معلومات المستخدم
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userImage').src = currentUser.image;
}

// إخفاء لوحة التحكم
function hideDashboard() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
}

// تحديث المعاينة
function updatePreview() {
    document.getElementById('previewTitle').textContent = document.getElementById('projectTitle').value;
    document.getElementById('previewDescription').textContent = document.getElementById('projectDescription').value;
    
    const technologies = document.getElementById('projectTechnologies').value
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech);
    
    document.getElementById('previewTechnologies').innerHTML = technologies
        .map(tech => `<span class="tech-tag">${tech}</span>`)
        .join('');
}

// تحويل الصورة إلى Base64
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('فشل في تحويل الصورة'));
        reader.readAsDataURL(file);
    });
}

// معالجة تحميل الصور
document.getElementById('projectImages').addEventListener('change', async (e) => {
    const files = e.target.files;
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';

    if (files.length > 0) {
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                alert('حجم الصورة كبير جداً. يجب أن يكون أقل من 5 ميجابايت');
                continue;
            }

            try {
                const base64Image = await convertImageToBase64(file);
                const imgContainer = document.createElement('div');
                imgContainer.className = 'preview-image-container';
                imgContainer.innerHTML = `<img src="${base64Image}" alt="معاينة">`;
                preview.appendChild(imgContainer);
                
                // تحديث صورة المعاينة الرئيسية
                if (preview.children.length === 1) {
                    document.getElementById('previewImage').src = base64Image;
                }
            } catch (error) {
                console.error('خطأ في تحميل الصورة:', error);
                alert('حدث خطأ في تحميل الصورة');
            }
        }
    }
});

// معالجة إضافة المشروع
document.getElementById('addProjectForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
        alert('يجب تسجيل الدخول أولاً');
        return;
    }

    if (!currentUser.email === 'zizoalzohairy@gmail.com') {
        alert('عذراً، لا يمكنك إضافة مشاريع');
        return;
    }

    const confirmAdd = confirm('هل أنت متأكد من إضافة المشروع؟');
    if (!confirmAdd) return;

    try {
        const imageFiles = document.getElementById('projectImages').files;
        if (!imageFiles || imageFiles.length === 0) {
            alert('الرجاء اختيار صورة واحدة على الأقل للمشروع');
            return;
        }

        const images = [];
        for (const file of imageFiles) {
            if (file.size > 5 * 1024 * 1024) {
                alert('حجم إحدى الصور كبير جداً. الرجاء اختيار صور أصغر');
                return;
            }
            const base64Image = await convertImageToBase64(file);
            images.push(base64Image);
        }
        
        const newProject = {
            id: Date.now(),
            title: document.getElementById('projectTitle').value,
            category: document.getElementById('projectCategory').value,
            description: document.getElementById('projectDescription').value,
            fullDescription: document.getElementById('projectFullDescription').value,
            technologies: document.getElementById('projectTechnologies').value
                .split(',')
                .map(tech => tech.trim())
                .filter(tech => tech),
            images: images,
            mainImage: images[0],
            projectUrl: document.getElementById('projectUrl').value || null,
            createdAt: new Date().toISOString()
        };

        await ProjectStorage.saveProject(newProject);
        projects = ProjectStorage.getAllProjects();
        displayProjects();
        
        e.target.reset();
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('previewImage').src = 'images/zizo.png';
        updatePreview();
        
        alert(`تم إضافة المشروع "${newProject.title}" بنجاح!`);
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'حدث خطأ أثناء حفظ المشروع');
    }
});

// عرض المشاريع
function displayProjects() {
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = '';

    if (!projects || projects.length === 0) {
        projectsList.innerHTML = '<p class="no-projects">لا توجد مشاريع حالياً</p>';
        return;
    }

    projects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'project-card';
        projectElement.innerHTML = `
            <div class="project-image">
                <img src="${project.mainImage}" alt="${project.title}">
            </div>
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-technologies">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <div class="project-actions">
                    <button onclick="editProject(${project.id})" class="edit-btn">تعديل</button>
                    <button onclick="deleteProject(${project.id})" class="delete-btn">حذف</button>
                </div>
            </div>
        `;
        projectsList.appendChild(projectElement);
    });
}

// حذف مشروع
async function deleteProject(id) {
    if (!currentUser || currentUser.email !== 'zizoalzohairy@gmail.com') {
        alert('عذراً، لا يمكنك حذف المشاريع');
        return;
    }

    if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
        try {
            await ProjectStorage.deleteProject(id);
            projects = ProjectStorage.getAllProjects();
            displayProjects();
            alert('تم حذف المشروع بنجاح');
        } catch (error) {
            alert('حدث خطأ في حذف المشروع');
        }
    }
}

// تعديل مشروع
async function editProject(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    document.getElementById('projectTitle').value = project.title;
    document.getElementById('projectCategory').value = project.category;
    document.getElementById('projectDescription').value = project.description;
    document.getElementById('projectFullDescription').value = project.fullDescription;
    document.getElementById('projectTechnologies').value = project.technologies.join(', ');
    document.getElementById('projectUrl').value = project.projectUrl || '';
    
    // عرض الصور الحالية
    const imagePreview = document.getElementById('imagePreview');
    imagePreview.innerHTML = project.images.map(img => `
        <div class="preview-image-container">
            <img src="${img}" alt="معاينة">
        </div>
    `).join('');

    // تحديث زر الإضافة
    const form = document.getElementById('addProjectForm');
    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.textContent = 'تحديث المشروع';
    form.dataset.editId = id;

    // التمرير إلى نموذج التعديل
    form.scrollIntoView({ behavior: 'smooth' });
}

// تحميل المشاريع عند بدء التطبيق
window.onload = () => {
    gapi.load('auth2', () => {
        gapi.auth2.init({
            client_id: '375217149185-5j13yqi2pq38ip3a0uv1ry6p2a3dtoul.apps.googleusercontent.com'
        });
    });
};
