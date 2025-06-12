// المتغيرات العامة
let currentUser = null;
let projects = [];

// التحقق من البريد الإلكتروني المسموح به
function isAllowedEmail(email) {
    const allowedEmail = process.env.ALLOWED_EMAIL;
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
    const email = profile.getEmail();    if (isAllowedEmail(email)) {
        currentUser = {
            name: profile.getName(),
            email: email,
            image: profile.getImageUrl()
        };
        
        showDashboard();
        loadProjects();
    } else {
        signOut();
        alert('عذراً، غير مسموح لك بالدخول للوحة التحكم');
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

// تحويل الصورة إلى Base64 مع ضغط الحجم
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const maxWidth = 800; // الحد الأقصى لعرض الصورة
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // تقليل حجم الصورة إذا كانت كبيرة
                if (width > maxWidth) {
                    height = Math.round(height * maxWidth / width);
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // ضغط الصورة بجودة 0.7
                const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
                resolve(compressedImage);
            };
            img.src = e.target.result;
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// حفظ المشاريع بشكل متقطع لتجنب تجاوز الحد
function saveProjects() {
    try {
        const projectsJSON = JSON.stringify(projects);
        localStorage.setItem('projects', projectsJSON);
    } catch (error) {
        console.error('خطأ في الحفظ:', error);
        alert('حدث خطأ في حفظ المشروع. قد يكون حجم الصورة كبير جداً.');
        throw error;
    }
}

// معاينة الصور قبل الرفع
document.getElementById('projectImages').addEventListener('change', async (e) => {
    const files = e.target.files;
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';

    if (files.length > 0) {
        for (const file of files) {
            try {
                const base64Image = await convertImageToBase64(file);
                const imgContainer = document.createElement('div');
                imgContainer.className = 'preview-image-container';
                imgContainer.innerHTML = `<img src="${base64Image}" alt="معاينة">`;
                preview.appendChild(imgContainer);
            } catch (error) {
                console.error('خطأ في تحميل الصورة:', error);
                alert('حدث خطأ في تحميل الصورة');
            }
        }
    }
});

// معاينة مباشرة للمشروع
document.getElementById('projectTitle').addEventListener('input', updatePreview);
document.getElementById('projectDescription').addEventListener('input', updatePreview);
document.getElementById('projectTechnologies').addEventListener('input', updatePreview);

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

// تحديث النموذج عند الإضافة
document.getElementById('addProjectForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const formData = new FormData(e.target);
        const project = {
            id: Date.now(),
            title: formData.get('projectTitle'),
            category: formData.get('projectCategory'),
            description: formData.get('projectDescription'),
            fullDescription: formData.get('projectFullDescription'),
            technologies: formData.get('projectTechnologies').split(',').map(t => t.trim()),
            image: await convertImageToBase64(formData.get('projectImage')),
            createdAt: new Date().toISOString()
        };

        if (ProjectStorage.saveProject(project)) {
            alert('تم إضافة المشروع بنجاح!');
            displayProjects();
            e.target.reset();
            document.getElementById('imagePreview').innerHTML = '';
            document.getElementById('previewImage').src = '';
            updatePreview();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ أثناء حفظ المشروع');
    }
});

// تحميل المشاريع عند بدء التطبيق
document.addEventListener('DOMContentLoaded', () => {
    try {
        displayProjects();
        setupImportHandler();
    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ في تحميل المشاريع');
    }
});

function setupImportHandler() {
    const importInput = document.getElementById('importProjects');
    importInput.addEventListener('change', async (e) => {
        if (e.target.files.length === 0) return;

        try {
            const file = e.target.files[0];
            await ProjectStorage.importProjectsFromFile(file);
            displayProjects();
            alert('تم استيراد المشاريع بنجاح!');
        } catch (error) {
            console.error('Error importing projects:', error);
            alert('حدث خطأ في استيراد المشاريع. تأكد من صحة الملف.');
        } finally {
            e.target.value = ''; // إعادة تعيين حقل الإدخال
        }
    });
}

// إضافة مشروع جديد
document.getElementById('addProjectForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // عرض رسالة تأكيد
    const confirmAdd = confirm('هل أنت متأكد من إضافة المشروع؟ سيظهر في الصفحة الرئيسية مباشرة.');
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
            technologies: document.getElementById('projectTechnologies').value.split(',').map(tech => tech.trim()),
            images: images,
            mainImage: images[0],
            projectUrl: document.getElementById('projectUrl').value || null,
            createdAt: new Date().toISOString()
        };

        // التحقق من صحة البيانات
        ProjectStorage.validateProject(newProject);
        
        // حفظ المشروع
        await ProjectStorage.saveProject(newProject);
        
        // تحديث القائمة
        projects = await ProjectStorage.getAllProjects();
        displayProjects();
        
        // إعادة تعيين النموذج
        e.target.reset();
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('previewImage').src = '';
        updatePreview();
        
        alert(`تم إضافة المشروع "${newProject.title}" بنجاح!\nيمكنك رؤية المشروع في قائمة المشاريع وفي الصفحة الرئيسية.`);
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'حدث خطأ أثناء حفظ المشروع');
    }
});

// حذف مشروع
async function deleteProject(id) {
    if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
        try {
            await ProjectStorage.deleteProject(id);
            projects = await ProjectStorage.getAllProjects();
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

// عرض المشاريع
function displayProjects() {
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = '';

    if (projects.length === 0) {
        projectsList.innerHTML = '<p class="no-projects">لا توجد مشاريع حالياً. أضف مشروعك الأول!</p>';
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

// تحميل المشاريع عند بدء التطبيق
window.onload = () => {
    gapi.load('auth2', () => {
        gapi.auth2.init({
            client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
        });
    });
};
