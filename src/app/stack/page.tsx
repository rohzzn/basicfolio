"use client";
import React, { useEffect, useState } from 'react';

interface LeetCodeStats {
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  totalEasy: number;
  mediumSolved: number;
  totalMedium: number;
  hardSolved: number;
  totalHard: number;
  acceptanceRate: number;
  ranking: number;
  contributionPoints: number;
  reputation: number;
}

const Stack = () => {
  const [leetcodeStats, setLeetcodeStats] = useState<LeetCodeStats | null>(null);

  useEffect(() => {
    fetch('https://leetcode-stats-api.herokuapp.com/rohzzn')
      .then(res => res.json())
      .then(data => setLeetcodeStats(data))
      .catch(error => console.error('Error fetching LeetCode stats:', error));
  }, []);

  const experience = [
    {
      company: 'CCHMC',
      role: 'Software Engineer',
      duration: 'September 2025 - Present',
    },
    {
      company: 'CCHMC',
      role: 'Graduate Research Assistant',
      duration: 'January 2025 - September 2025',
      isSubRole: true,
    },
    {
      company: 'Abhibus (Ixigo)',
      role: 'Software Development Engineer',
      duration: 'June 2023 - June 2024',
    },
    {
      company: 'Fiverr (Freelance)',
      role: 'Frontend Developer & Designer',
      duration: 'November 2021 - June 2023',
    },
  ];

  const education = [
    {
      school: 'University of Cincinnati',
      degree: 'Master of Engineering - Computer Science',
      duration: 'August 2024 - April 2026',
      coursework: [
        "Advanced Algorithms I",
        "Advanced Algorithms II",
        "Distributed Operating Systems",
        "Cloud Computing",
        "Innovation Design Thinking",
        "Large Scale Software Engineering",
        "Network Security",
        "Software Testing and Quality Assurance",
      ],
    },
    {
      school: 'Malla Reddy Engineering College',
      degree: 'Bachelor of Technology - Computer Science',
      duration: 'August 2020 - June 2024',
      coursework: [
        "Data Structures and Algorithms",
        "Operating Systems",
        "Database Management Systems",
        "Object Oriented Programming",
        "Computer Networks",
        "Analysis and Design of Algorithms",
        "Software Engineering",
        "Computer Networks",
        "Compiler Design",
        "Internet of Things",
      ],
    }
  ];

  const certifications = [
    {
      name: "Azure Fundamentals",
      issuer: "Microsoft",
      url: "https://drive.google.com/file/d/1P_dInABO8tc5guuF4CxCmgsxnLe7Ya4A/view",
    },
    {
      name: "Solving Using Computational Thinking",
      issuer: "University of Michigan",
      url: "https://drive.google.com/file/d/1ZOZvdUZ_YluoHKgfZsxIajcsamvx4c_q/view",
    },
    {
      name: "Introduction to Machine Learning",
      issuer: "Duke University",
      url: "https://drive.google.com/file/d/1ohRxzCXpePCbCC6Zc7tZ9hb0oaQOo2s9/view",
    },
    {
      name: "Inclusive Leadership",
      issuer: "University of Colorado",
      url: "https://drive.google.com/file/d/1_z7XbC6OogTpci0yXp9uNW8Vle3NQRfX/view",
    },
    {
      name: "Algorithms and Data Structures",
      issuer: "FreeCodeCamp",
      url: "https://drive.google.com/file/d/1QU_5TBix_pCsqJdTRWoLUOHYZDBNNSmv/view",
    },
    {
      name: "Python Bootcamp",
      issuer: "London App Brewery",
      url: "https://drive.google.com/file/d/194Yz3p7RwjeKg37BifCNiqCc63y_kfbj/view",
    },
    {
      name: "Django Fundamentals",
      issuer: "Udemy",
      url: "https://drive.google.com/file/d/1ipvg-jlWsyByW3xbfnvtEwjw5SgCsdN-/view",
    }
  ];

  const skills = {
    languages: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'HTML/CSS'],
    frameworks: ['React', 'Next.js', 'Node.js', 'Django', 'TailwindCSS', 'Bootstrap'],
    technologies: ['MySQL', 'MongoDB', 'Git', 'Docker', 'AWS', 'Linux'],
    tools: ['Postman', 'Terminal', 'Vercel', 'Figma', 'Photoshop', 'Illustrator']
  };

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-8 dark:text-white">Resume</h2>

      {/* Resume PDF Container */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
        {/* Resume Header */}
        <div className="p-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              Rohan Pothuru
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
              Software Engineer & Computer Science Graduate Student
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-zinc-500 dark:text-zinc-500">
              <span>hi@rohanpothuru.com</span>
              <span>•</span>
              <span>Cincinnati, OH</span>
              <span>•</span>
              <span>github.com/rohzzn</span>
              <span>•</span>
              <span>linkedin.com/in/rohzzn</span>
            </div>
          </div>
        </div>

        {/* Resume Content */}
        <div className="p-8 space-y-8">
          {/* Experience Section */}
          <section>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-4 pb-1 border-b border-zinc-200 dark:border-zinc-800">
              EXPERIENCE
            </h3>
            
            <div className="space-y-4">
              {experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-zinc-900 dark:text-white">
                        {exp.role}
                      </h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {exp.company}
                      </p>
                    </div>
                    <time className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">
                      {exp.duration}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Education Section */}
          <section>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-4 pb-1 border-b border-zinc-200 dark:border-zinc-800">
              EDUCATION
            </h3>

            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-zinc-900 dark:text-white">
                        {edu.degree}
                      </h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {edu.school}
                      </p>
                    </div>
                    <time className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">
                      {edu.duration}
                    </time>
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
                    <strong>Relevant Coursework:</strong> {edu.coursework.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Skills Section */}
          <section>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-4 pb-1 border-b border-zinc-200 dark:border-zinc-800">
              TECHNICAL SKILLS
            </h3>

            <div className="space-y-3">
              {Object.entries(skills).map(([category, items]) => (
                <div key={category} className="flex items-start gap-4">
                  <div className="w-24 flex-shrink-0">
                    <h4 className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                      {category}
                    </h4>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {items.join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Certifications Section */}
          <section>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-4 pb-1 border-b border-zinc-200 dark:border-zinc-800">
              CERTIFICATIONS
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {certifications.map((cert, index) => (
                <a
                  key={index}
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group cursor-pointer block hover:bg-zinc-50 dark:hover:bg-zinc-800/50 p-2 -m-2 rounded transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {cert.name}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">
                        {cert.issuer}
                      </p>
                    </div>
                    <div className="text-xs text-zinc-400 dark:text-zinc-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      ↗
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* LeetCode Stats */}
          {leetcodeStats && (
            <section>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-4 pb-1 border-b border-zinc-200 dark:border-zinc-800">
                CODING STATISTICS
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded">
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">{leetcodeStats.totalSolved}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wide">Total Solved</p>
                </div>
                <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{leetcodeStats.easySolved}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wide">Easy</p>
                </div>
                <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded">
                  <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{leetcodeStats.mediumSolved}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wide">Medium</p>
                </div>
                <div className="text-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded">
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">{leetcodeStats.hardSolved}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase tracking-wide">Hard</p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Resume Footer */}
        <div className="p-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30">
          <div className="flex justify-center gap-8">
            <a
              href="https://drive.google.com/file/d/136cRqYTuEn55Yjge6dgyliQMT9XNZFF7/view"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              Download PDF
              <span className="text-xs">↓</span>
            </a>
            <a
              href="mailto:hi@rohanpothuru.com"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
            >
              Get in Touch
              <span className="text-xs">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stack;