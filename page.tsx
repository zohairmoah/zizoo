'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles.css';

const categories = [
  'الكل',
  'تطوير الويب',
  'تطبيقات الموبايل',
  'تطبيقات سطح المكتب',
  'تصميم جرافيك',
  'موشن جرافيك'
];

const projects = [
  {
    id: 1,
    title: 'منصة تعليم إلكتروني',
    category: 'تطوير الويب',
    image: '/globe.svg',
    description: 'منصة تعليمية متكاملة مع نظام إدارة المحتوى وتتبع تقدم الطلاب',
    technologies: ['React', 'Node.js', 'MongoDB'],
    gradient: 'from-violet-500 to-fuchsia-500',
  },
  {
    id: 2,
    title: 'تطبيق إدارة المهام',
    category: 'تطبيقات الموبايل',
    image: '/window.svg',
    description: 'تطبيق موبايل لإدارة المهام اليومية مع ميزات متقدمة للتنظيم',
    technologies: ['Flutter', 'Firebase'],
    gradient: 'from-blue-500 to-teal-500',
  },
];

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const filteredProjects = selectedCategory === 'الكل'
    ? projects
    : projects.filter(project => project.category === selectedCategory);

  return (
    <div className="animated-bg min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
      
      <div className="relative container mx-auto px-4 py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16 relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-3xl -z-10"></div>
          <h1 className="text-7xl font-bold text-white mb-6 neon-text">
            معرض أعمالي
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed glass-effect p-6 rounded-2xl">
            مجموعة مختارة من مشاريعي في مجالات تطوير الويب، تطبيقات الموبايل، والتصميم
          </p>
        </motion.div>

        {/* Categories Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-8 py-4 rounded-xl text-sm font-medium glass-effect transition-all duration-300 hover:scale-105 ${
                selectedCategory === category
                  ? 'border-2 border-white/50 text-white'
                  : 'text-white/70 hover:text-white'
              }`}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* Projects Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="project-card group"
                onHoverStart={() => setHoveredId(project.id)}
                onHoverEnd={() => setHoveredId(null)}
                style={{
                  transform: hoveredId === project.id 
                    ? `perspective(1000px) rotateY(${(mousePosition.x - window.innerWidth / 2) / 30}deg) rotateX(${-(mousePosition.y - window.innerHeight / 2) / 30}deg)`
                    : 'none'
                }}
              >
                <div className="animated-border rounded-2xl">
                  <div className={`glass-effect rounded-2xl overflow-hidden card-content transition-all duration-500`}>
                    <div className={`aspect-w-16 aspect-h-9 relative bg-gradient-to-r ${project.gradient} p-6`}>
                      <motion.img
                        src={project.image}
                        alt={project.title}
                        className="object-contain w-40 h-40 mx-auto drop-shadow-2xl float-animation"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                    </div>
                    <div className="p-8">
                      <h3 className="text-3xl font-bold text-white mb-3">{project.title}</h3>
                      <p className="text-white/80 mb-6 leading-relaxed">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors duration-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
