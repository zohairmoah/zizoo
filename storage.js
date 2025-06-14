class ProjectStorage {
    static STORAGE_KEY = 'portfolio_projects';
    
    static getAllProjects() {
        try {
            const projects = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
            return projects;
        } catch (error) {
            console.error('Error loading projects:', error);
            return [];
        }
    }

    static saveProject(project) {
        try {
            let projects = this.getAllProjects();
            
            // إذا كان المشروع موجود، قم بتحديثه
            const index = projects.findIndex(p => p.id === project.id);
            if (index !== -1) {
                projects[index] = project;
            } else {
                // إضافة المشروع الجديد في بداية المصفوفة
                projects.unshift(project);
            }
            
            // حفظ في localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
            return true;
        } catch (error) {
            console.error('Error saving project:', error);
            throw new Error('فشل في حفظ المشروع. يرجى المحاولة مرة أخرى.');
        }
    }

    static deleteProject(id) {
        try {
            let projects = this.getAllProjects();
            projects = projects.filter(p => p.id !== id);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
            return true;
        } catch (error) {
            console.error('Error deleting project:', error);
            throw new Error('فشل في حذف المشروع. يرجى المحاولة مرة أخرى.');
        }
    }

    static getProjectById(id) {
        try {
            const projects = this.getAllProjects();
            return projects.find(p => p.id.toString() === id.toString());
        } catch (error) {
            console.error('Error getting project:', error);
            return null;
        }
    }

    static validateProject(project) {
        const requiredFields = ['title', 'description', 'category', 'technologies'];
        for (const field of requiredFields) {
            if (!project[field]) {
                throw new Error(`حقل "${field}" مطلوب`);
            }
        }

        if (!project.images || project.images.length === 0) {
            throw new Error('يجب إضافة صورة واحدة على الأقل');
        }

        return true;
    }

    static saveProjects(projects) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
            return true;
        } catch (error) {
            console.error('Error saving projects:', error);
            throw error;
        }
    }

    static importProjectsFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const projects = JSON.parse(event.target.result);
                    this.saveProjects(projects);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    }
}
