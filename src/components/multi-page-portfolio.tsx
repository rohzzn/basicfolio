"use client";
import React, { useState, useEffect } from 'react';
import { Github, ExternalLink, Circle, Menu, X } from 'lucide-react';

const NavLink = ({ href, children, currentPage, setCurrentPage }) => (
  <button
    onClick={() => {
      setCurrentPage(href);
      window.history.pushState({}, '', href === '/' ? '/' : `/${href}`);
    }}
    className={`block px-2 py-1.5 text-sm transition-colors capitalize w-full text-left
      ${currentPage === href 
        ? 'text-black dark:text-white' 
        : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'}`}
  >
    {children}
  </button>
);

// Layout Component
const Layout = ({ children, currentPage, setCurrentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lanyardData, setLanyardData] = useState(null);
  const discordId = "407922731645009932";

  useEffect(() => {
    const ws = new WebSocket('wss://api.lanyard.rest/socket');
    ws.onopen = () => {
      ws.send(JSON.stringify({
        op: 2,
        d: { subscribe_to_id: discordId }
      }));
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.op === 0) setLanyardData(data.d);
    };
    return () => ws.close();
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.slice(1) || '/';
      setCurrentPage(path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setCurrentPage]);

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 text-zinc-600 dark:text-zinc-400"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-0 w-64 bg-zinc-50 dark:bg-zinc-900 
        border-r border-zinc-200 dark:border-zinc-800 p-8 
        transform lg:transform-none transition-transform duration-200 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        z-40
      `}>
        <div className="mb-12">
          <h1 className="text-2xl font-bold dark:text-white">John Doe</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">Software Engineer</p>
        </div>

        <nav className="space-y-1 flex-1">
          {[
            { path: '/', label: 'about' },
            { path: 'projects', label: 'projects' },
            { path: 'stack', label: 'stack' },
            { path: 'hobbies', label: 'hobbies' },
            { path: 'blog', label: 'blog' }
          ].map((item) => (
            <NavLink
              key={item.path}
              href={item.path}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {lanyardData && (
          <div className="py-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Circle 
                size={8} 
                fill={lanyardData.discord_status === 'online' ? '#43b581' : '#747f8d'} 
                className={lanyardData.discord_status === 'online' ? 'text-green-500' : 'text-gray-500'}
              />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {lanyardData.discord_status}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

// Page Components remain the same as before, just removing the react-router specific code
const About = () => (
  <div className="max-w-2xl">
    <h2 className="text-lg font-medium mb-6 dark:text-white">About</h2>
    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
      I'm a software engineer focused on building exceptional digital experiences. 
      Currently, I'm working on creating accessible, human-centered products.
    </p>
  </div>
);

// Projects component with the same content as before...
const Projects = () => (
  <div>
    <h2 className="text-lg font-medium mb-6 dark:text-white">Projects</h2>
    <div className="grid gap-8 md:grid-cols-2">
      {[
        {
          title: 'Project One',
          description: 'A minimal task management system built with React and TypeScript.',
          tech: ['React', 'TypeScript', 'Node.js'],
          github: 'https://github.com',
          live: 'https://example.com'
        },
        {
          title: 'Project Two',
          description: 'Real-time collaborative markdown editor using WebSocket.',
          tech: ['Next.js', 'Socket.io', 'PostgreSQL'],
          github: 'https://github.com',
          live: 'https://example.com'
        }
      ].map((project, index) => (
        <div key={index} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h3 className="text-base font-medium dark:text-white">{project.title}</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2 mb-4">{project.description}</p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {project.tech.map((tech, i) => (
                <span key={i} className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded">
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex gap-3 ml-auto">
              <a href={project.github} className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
                <Github size={16} />
              </a>
              <a href={project.live} className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Stack component with the same content as before...
const Stack = () => (
  <div>
    <h2 className="text-lg font-medium mb-6 dark:text-white">Stack</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[
        {
          category: 'Languages',
          items: ['TypeScript', 'Python', 'Rust']
        },
        {
          category: 'Frontend',
          items: ['React', 'Next.js', 'Tailwind CSS']
        },
        {
          category: 'Backend',
          items: ['Node.js', 'PostgreSQL', 'Redis']
        },
        {
          category: 'Tools',
          items: ['Git', 'Docker', 'AWS']
        }
      ].map((category, index) => (
        <div key={index} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h3 className="text-sm font-medium mb-4 text-zinc-800 dark:text-zinc-200">{category.category}</h3>
          <ul className="space-y-2">
            {category.items.map((item, i) => (
              <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400">{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

const Hobbies = () => (
  <div className="max-w-2xl">
    <h2 className="text-lg font-medium mb-6 dark:text-white">Hobbies</h2>
    <div className="space-y-4 text-zinc-600 dark:text-zinc-400">
      <p>
        When I'm not coding, you can find me exploring mechanical keyboards, 
        contributing to open-source projects, and learning about system design.
      </p>
      <p>
        I also enjoy reading technical blogs, participating in hackathons, 
        and experimenting with new programming languages.
      </p>
    </div>
  </div>
);

const Blog = () => (
  <div>
    <h2 className="text-lg font-medium mb-6 dark:text-white">Blog</h2>
    <div className="grid gap-8 md:grid-cols-2">
      {[
        {
          title: 'Understanding React Server Components',
          date: 'December 10, 2024',
          excerpt: 'An in-depth look at how React Server Components work and when to use them.',
          readTime: '5 min read',
          slug: 'understanding-react-server-components'
        },
        {
          title: 'Building with Web Components',
          date: 'December 5, 2024',
          excerpt: 'Learn how to create reusable web components for modern applications.',
          readTime: '4 min read',
          slug: 'building-with-web-components'
        }
      ].map((post, index) => (
        <div key={index} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <h3 className="text-base font-medium dark:text-white">{post.title}</h3>
          <div className="flex gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-3">{post.excerpt}</p>
          <button 
            onClick={() => window.history.pushState({}, '', `/blog/${post.slug}`)}
            className="inline-block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Read more →
          </button>
        </div>
      ))}
    </div>
  </div>
);

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('/');

  useEffect(() => {
    const path = window.location.pathname.slice(1) || '/';
    setCurrentPage(path);
  }, []);

  const renderContent = () => {
    switch (currentPage) {
      case '/':
        return <About />;
      case 'projects':
        return <Projects />;
      case 'stack':
        return <Stack />;
      case 'hobbies':
        return <Hobbies />;
      case 'blog':
        return <Blog />;
      default:
        return <About />;
    }
  };

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderContent()}
    </Layout>
  );
};

export default App;