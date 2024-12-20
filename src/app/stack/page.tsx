// src/app/stack/page.tsx

"use client";
import React from 'react';
import { 
  SiPython, 
  SiCplusplus, 
  SiJavascript, 
  SiHtml5, 
  SiReact, 
  SiDjango, 
  SiTailwindcss, 
  SiBootstrap, 
  SiMysql, 
  SiGit, 
  SiDocker, 
  SiFigma, 
  SiAdobephotoshop, 
  SiAdobeillustrator 
} from 'react-icons/si';
import { FaJava, FaTerminal, FaAws } from 'react-icons/fa';
import { AiOutlineSetting } from 'react-icons/ai';
import { FiSettings } from 'react-icons/fi';
import { BiUserVoice } from 'react-icons/bi';

const Stack: React.FC = () => {
  const certifications = [
    {
      name: "Azure Fundamentals",
      url: "https://drive.google.com/file/d/1P_dInABO8tc5guuF4CxCmgsxnLe7Ya4A/view?usp=sharing",
      issuer: "Microsoft",
    },
    {
      name: "Solving Using Computational Thinking",
      url: "https://drive.google.com/file/d/1ZOZvdUZ_YluoHKgfZsxIajcsamvx4c_q/view?usp=share_link",
      issuer: "University of Michigan",
    },
    {
      name: "Introduction to Machine Learning",
      url: "https://drive.google.com/file/d/1ohRxzCXpePCbCC6Zc7tZ9hb0oaQOo2s9/view?usp=share_link",
      issuer: "Duke University",
    },
    {
      name: "Inclusive Leadership",
      url: "https://drive.google.com/file/d/1_z7XbC6OogTpci0yXp9uNW8Vle3NQRfX/view?usp=share_link",
      issuer: "University of Colorado",
    },
    {
      name: "Algorithms and Data Structures",
      url: "https://drive.google.com/file/d/1QU_5TBix_pCsqJdTRWoLUOHYZDBNNSmv/view",
      issuer: "FreeCodeCamp",
    },
    {
      name: "Python Bootcamp",
      url: "https://drive.google.com/file/d/194Yz3p7RwjeKg37BifCNiqCc63y_kfbj/view?usp=share_link",
      issuer: "London App Brewery",
    },
    {
      name: "Django Fundamentals",
      url: "https://drive.google.com/file/d/1ipvg-jlWsyByW3xbfnvtEwjw5SgCsdN-/view?usp=share_link",
      issuer: "Udemy",
    },

  ];

  const education = [
    {
      degree: "Master of Engineering - Computer Science",
      institution: "University of Cincinnati",
      duration: "August 2024 - April 2026",
      coursework: [
        "Distributed Operating Systems",
        "Advanced Algorithms I",
        "Advanced Algorithms II",
        "Cloud Computing",
        "Innovation Design Thinking",
        "Large Scale Software Engineering",
        "Visual Interfaces Data",
        "Software Testing and Quality Assurance",

      ],
    },
    {
      degree: "Bachelor of Technology - Computer Science",
      institution: "Malla Reddy Engineering College",
      duration: "August 2020 - June 2024",
      coursework: [
        "Data Structures and Algorithms",
        "Operating Systems",
        "Database Management Systems",
        "Object Oriented Programming",
        "Computer Networks",
        "Analysis and Design of Algorithms",
      ],
    },
  ];

  const experience = [
    {
      company: "Abhibus (Ixigo)",
      role: "Software Development Engineer",
      type: "Internship",
      duration: "June 2023 - September 2023",
      
      techStackUsed: ["Node.js", "Docker", "Express", "MongoDB"],
    },
    // Add more experience as needed
  ];

  const skills = [
    {
      category: "Languages",
      items: [
        { name: 'Python', icon: SiPython },
        { name: 'Java', icon: FaJava },
        { name: 'C', icon: SiCplusplus },
        { name: 'JavaScript', icon: SiJavascript },
        { name: 'HTML/CSS', icon: SiHtml5 },
      ],
    },
    {
      category: "Frameworks",
      items: [
        { name: 'React', icon: SiReact },
        { name: 'Django', icon: SiDjango },
        { name: 'Tailwind', icon: SiTailwindcss },
        { name: 'Bootstrap', icon: SiBootstrap },
      ],
    },
    {
      category: "Technologies",
      items: [
        { name: 'MySQL', icon: SiMysql },
        { name: 'Git', icon: SiGit },
        { name: 'Bash', icon: FaTerminal },
        { name: 'Docker', icon: SiDocker },
        { name: 'PM2', icon: FiSettings },
        { name: 'AWS', icon: FaAws },
      ],
    },
    {
      category: "Design",
      items: [
        { name: 'Wireframing', icon: AiOutlineSetting },
        { name: 'UI/UX', icon: BiUserVoice },
        { name: 'Figma', icon: SiFigma },
        { name: 'Photoshop', icon: SiAdobephotoshop },
        { name: 'Illustrator', icon: SiAdobeillustrator },
      ],
    },
  ];

  return (
    <div className="max-w-4xl p-4">
      {/* Title */}
      <h2 className="text-4xl font-bold mb-12 dark:text-white">Resume</h2>

      {/* Experience Section */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-6 dark:text-white">Experience</h3>
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
          {experience.map((exp, index) => (
            <div key={index} className="mb-6">
              <h4 className="text-xl font-medium dark:text-white">{exp.company}</h4>
              <p className="text-gray-700 dark:text-gray-300">{exp.role}</p>
              <p className="text-gray-700 dark:text-gray-300">{exp.duration}</p>
              <div className="mt-2">
                <span className="text-gray-700 dark:text-gray-300 font-semibold">Tech Stack:</span>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                  {exp.techStackUsed.map((tech, idx) => (
                    <li key={idx}>{tech}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education Section */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-6 dark:text-white">Education</h3>
        <div className="flex flex-col md:flex-row gap-8">
          {education.map((edu, index) => (
            <div key={index} className="flex-1 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h4 className="text-xl font-medium mb-2 dark:text-white">{edu.institution}</h4>
              <p className="text-gray-700 dark:text-gray-300">{edu.degree}</p>
              <p className="text-gray-700 dark:text-gray-300">{edu.duration}</p>
              <br />
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                {edu.coursework.map((course, idx) => (
                  <li key={idx}>{course}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Section */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-6 dark:text-white">Skills</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {skills.map((skillCategory, index) => (
            <div key={index} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <h4 className="text-xl font-medium mb-4 dark:text-white">{skillCategory.category}</h4>
              <ul className="space-y-2">
                {skillCategory.items.map((skill, i) => (
                  <li key={i} className="flex items-center">
                    <skill.icon className="text-lg text-black dark:text-white mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications Section */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-6 dark:text-white">Certifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certifications.map((cert, index) => (
            <div key={index} className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-lg">
                {cert.name}
              </a>
              <p className="text-gray-700 dark:text-gray-300">{cert.issuer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Buttons Container */}
      <div className="mt-12 flex space-x-6">
        {/* Download Resume Button */}
        <a
          href="https://drive.google.com/file/d/15ldUNRR5SeBCkw_C7RXmrvWYisoDX-GD/view?usp=share_link" // Google Drive resume link
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 border border-gray-600 text-gray-600 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center w-40 text-sm"
        >
          Download
        </a>

        {/* Contact Me Button */}
        <a
          href="mailto:pothurrs@mail.uc.edu"
          className="px-6 py-3 border border-gray-600 text-gray-600 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center w-40 text-sm"
        >
          Hire Me
        </a>
      </div>
    </div>
  );
};

export default Stack;
