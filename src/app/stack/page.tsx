"use client";
import React, { useEffect, useState } from 'react';
import { 
  SiPython, SiCplusplus, SiJavascript, SiHtml5, SiReact, 
  SiDjango, SiTailwindcss, SiBootstrap, SiMysql, SiGit, 
  SiDocker, SiFigma, SiAdobephotoshop, SiAdobeillustrator,
  SiTypescript, SiNextdotjs, SiNodedotjs, SiMongodb,
   SiPostman, SiLinux, SiVercel
} from 'react-icons/si';
import { FaJava, FaAws, FaDownload, FaEnvelope, FaTerminal } from 'react-icons/fa';
import { Briefcase, GraduationCap, Award, Terminal } from 'lucide-react';

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
      company: 'Cincinnati Childrens Hospital Medical Center',
      role: 'Software Development Engineer',
      duration: 'January 2025 - Present',
    },

    {
      company: 'Abhibus (Ixigo)',
      role: 'Software Development Engineer',
      duration: 'June 2023 - September 2023',
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
    languages: [
      { name: 'Python', icon: SiPython },
      { name: 'JavaScript', icon: SiJavascript },
      { name: 'TypeScript', icon: SiTypescript },
      { name: 'Java', icon: FaJava },
      { name: 'C++', icon: SiCplusplus },
      { name: 'HTML/CSS', icon: SiHtml5 }
    ],
    frameworks: [
      { name: 'React', icon: SiReact },
      { name: 'Next.js', icon: SiNextdotjs },
      { name: 'Node.js', icon: SiNodedotjs },
      { name: 'Django', icon: SiDjango },
      { name: 'TailwindCSS', icon: SiTailwindcss },
      { name: 'Bootstrap', icon: SiBootstrap }
    ],
    technologies: [
      { name: 'MySQL', icon: SiMysql },
      { name: 'MongoDB', icon: SiMongodb },
      { name: 'Git', icon: SiGit },
      { name: 'Docker', icon: SiDocker },
      { name: 'AWS', icon: FaAws },
      { name: 'Linux', icon: SiLinux }
    ],
    tools: [
      { name: 'Postman', icon: SiPostman },
      { name: 'Terminal', icon: FaTerminal },
      { name: 'Vercel', icon: SiVercel },
      { name: 'Figma', icon: SiFigma },
      { name: 'Photoshop', icon: SiAdobephotoshop },
      { name: 'Illustrator', icon: SiAdobeillustrator }
    ]
  };

  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Resume</h2>

      {/* Experience Section */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Briefcase className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          <h3 className="text-xl font-semibold dark:text-white">Experience</h3>
        </div>
        
        {experience.map((exp, index) => (
          <div key={index} className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 mb-4">
            <h4 className="text-lg font-medium dark:text-white">{exp.company}</h4>
            <p className="text-zinc-600 dark:text-zinc-400">{exp.role}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">{exp.duration}</p>
          </div>
        ))}
      </section>

      {/* Education Section */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <GraduationCap className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          <h3 className="text-xl font-semibold dark:text-white">Education</h3>
        </div>

        <div className="space-y-6">
          {education.map((edu, index) => (
            <div key={index} className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6">
              <h4 className="text-lg font-medium dark:text-white">{edu.school}</h4>
              <p className="text-zinc-600 dark:text-zinc-400">{edu.degree}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-4">{edu.duration}</p>
              <h5 className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">Coursework</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {edu.coursework.map((course, i) => (
                  <span key={i} className="text-sm text-zinc-600 dark:text-zinc-400">
                    • {course}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Section */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Terminal className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          <h3 className="text-xl font-semibold dark:text-white">Skills</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(skills).map(([category, items]) => (
            <div key={category} className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6">
              <h4 className="text-base font-medium mb-4 dark:text-white capitalize">{category}</h4>
              <div className="grid grid-cols-2 gap-4">
                {items.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <skill.icon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications Section */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          <h3 className="text-xl font-semibold dark:text-white">Certifications</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certifications.map((cert, index) => (
            <a
              key={index}
              href={cert.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <h4 className="text-lg font-medium dark:text-white">{cert.name}</h4>
              <p className="text-zinc-600 dark:text-zinc-400">{cert.issuer}</p>
            </a>
          ))}
        </div>
      </section>

      {/* LeetCode Stats */}
      {leetcodeStats && (
        <section className="mb-12">
          <h3 className="text-xl font-semibold mb-6 dark:text-white">LeetCode Stats</h3>
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-semibold dark:text-white">{leetcodeStats.totalSolved}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Problems Solved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-green-500">{leetcodeStats.easySolved}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Easy</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-yellow-500">{leetcodeStats.mediumSolved}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Medium</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-red-500">{leetcodeStats.hardSolved}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Hard</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <a
          href="https://drive.google.com/file/d/1gkWlc-wY-rQW2nAB8XzAk6lhAbCxb2Yc/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <FaDownload className="w-4 h-4" />
          <span>Download</span>
        </a>
        <a
          href="mailto:hi@rohanpothuru.com"
          className="flex items-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <FaEnvelope className="w-4 h-4" />
          <span>Contact</span>
        </a>
      </div>
    </div>
  );
};

export default Stack;