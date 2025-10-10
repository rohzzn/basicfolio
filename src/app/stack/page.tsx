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
        "Visual Interfaces Data",
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
      <h2 className="text-lg font-medium mb-6 dark:text-white">Resume</h2>

      {/* Experience Section */}
      <section className="mb-12">
        <h3 className="text-lg font-medium mb-6 dark:text-white">Experience</h3>
        
        <div className="space-y-6">
          {experience.map((exp, index) => (
            <article key={index}>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex-1">
                  {exp.company}
                </h4>
                <time className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                  {exp.duration}
                </time>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {exp.role}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 my-12"></div>

      {/* Education Section */}
      <section className="mb-12">
        <h3 className="text-lg font-medium mb-6 dark:text-white">Education</h3>

        <div className="space-y-6">
          {education.map((edu, index) => (
            <article key={index}>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex-1">
                  {edu.school}
                </h4>
                <time className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                  {edu.duration}
                </time>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                {edu.degree}
              </p>
              <div className="text-xs text-zinc-500 dark:text-zinc-500">
                {edu.coursework.join(' • ')}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 my-12"></div>

      {/* Skills Section */}
      <section className="mb-12">
        <h3 className="text-lg font-medium mb-6 dark:text-white">Skills</h3>

        <div className="space-y-6">
          {Object.entries(skills).map(([category, items]) => (
            <article key={category}>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex-1 capitalize">
                  {category}
                </h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {items.join(' • ')}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 my-12"></div>

      {/* Certifications Section */}
      <section className="mb-12">
        <h3 className="text-lg font-medium mb-6 dark:text-white">Certifications</h3>

        <div className="space-y-6">
          {certifications.map((cert, index) => (
            <a
              key={index}
              href={cert.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group cursor-pointer block"
            >
              <article>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors flex-1">
                    {cert.name}
                  </h4>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                    →
                  </div>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {cert.issuer}
                </p>
              </article>
            </a>
          ))}
        </div>
      </section>

      {/* LeetCode Stats */}
      {leetcodeStats && (
        <>
          {/* Divider */}
          <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 my-12"></div>
          
          <section className="mb-12">
            <h3 className="text-lg font-medium mb-6 dark:text-white">LeetCode Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{leetcodeStats.totalSolved}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Problems Solved</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{leetcodeStats.easySolved}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Easy</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{leetcodeStats.mediumSolved}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Medium</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{leetcodeStats.hardSolved}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Hard</p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Divider */}
      <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 my-12"></div>

      {/* Action Buttons */}
      <div className="flex gap-6">
        <a
          href="https://drive.google.com/file/d/136cRqYTuEn55Yjge6dgyliQMT9XNZFF7/view"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-600"
        >
          Download →
        </a>
        <a
          href="mailto:hi@rohanpothuru.com"
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-600"
        >
          Contact →
        </a>
      </div>
    </div>
  );
};

export default Stack;