import React from 'react';
import Link from 'next/link';
import { ExternalLink, Code, Cpu, Wand2, Brain, Terminal } from 'lucide-react';

interface Experiment {
  title: string;
  description: string;
  tech: string[];
  status: 'live' | 'in-progress' | 'archived';
  url?: string;
  githubUrl?: string;
  category: 'web' | 'ai' | 'cli' | 'ui' | 'research';
}

const experiments: Experiment[] = [
  {
    title: "AI Image Caption Generator",
    description: "Using OpenAI's CLIP model to generate detailed image descriptions.",
    tech: ["Python", "PyTorch", "OpenAI CLIP"],
    status: "live",
    url: "https://your-demo-url.com",
    githubUrl: "https://github.com/rohzzn/ai-caption",
    category: "ai"
  },
  {
    title: "Terminal Portfolio",
    description: "Interactive CLI portfolio built with Rust and ASCII art.",
    tech: ["Rust", "ASCII Art", "Terminal UI"],
    status: "in-progress",
    githubUrl: "https://github.com/rohzzn/term-portfolio",
    category: "cli"
  },
  {
    title: "Neural Style Transfer",
    description: "Real-time style transfer using TensorFlow.js in the browser.",
    tech: ["TensorFlow.js", "React", "WebGL"],
    status: "live",
    url: "https://style-transfer-demo.com",
    githubUrl: "https://github.com/rohzzn/style-transfer",
    category: "ai"
  },
  {
    title: "Smart Theme Generator",
    description: "Generates cohesive color themes using color theory algorithms.",
    tech: ["TypeScript", "React", "Color Theory"],
    status: "live",
    url: "https://theme-gen.com",
    category: "ui"
  },
  {
    title: "AGI Research Notes",
    description: "Interactive visualization of AGI concepts and architectures.",
    tech: ["D3.js", "React", "Research"],
    status: "in-progress",
    category: "research"
  }
];

const CategoryIcon = ({ category }: { category: Experiment['category'] }) => {
  switch (category) {
    case 'web':
      return <Code className="w-4 h-4" />;
    case 'ai':
      return <Brain className="w-4 h-4" />;
    case 'cli':
      return <Terminal className="w-4 h-4" />;
    case 'ui':
      return <Wand2 className="w-4 h-4" />;
    default:
      return <Cpu className="w-4 h-4" />;
  }
};

const ExperimentCard = ({ experiment }: { experiment: Experiment }) => (
  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
    <div className="flex items-center gap-2 mb-2">
      <CategoryIcon category={experiment.category} />
      <h3 className="text-sm font-medium dark:text-white">{experiment.title}</h3>
    </div>
    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{experiment.description}</p>
    
    <div className="flex flex-wrap gap-2 mb-4">
      {experiment.tech.map((tech, index) => (
        <span
          key={index}
          className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-full"
        >
          {tech}
        </span>
      ))}
    </div>
    
    <div className="flex gap-3 mt-auto">
      {experiment.url && (
        <Link
          href={experiment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
        >
          Demo <ExternalLink className="w-3 h-3" />
        </Link>
      )}
      {experiment.githubUrl && (
        <Link
          href={experiment.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
        >
          GitHub <ExternalLink className="w-3 h-3" />
        </Link>
      )}
      <span className={`text-xs ml-auto ${
        experiment.status === 'live' ? 'text-green-600 dark:text-green-400' :
        experiment.status === 'in-progress' ? 'text-yellow-600 dark:text-yellow-400' :
        'text-zinc-500 dark:text-zinc-500'
      }`}>
        {experiment.status}
      </span>
    </div>
  </div>
);

const LabPage = () => {
  return (
    <div className="max-w-7xl">
      <h2 className="text-lg font-medium mb-6 dark:text-white">Laboratory</h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">
        A collection of experiments, prototypes, and research projects I&#39;ve been working on.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {experiments.map((experiment, index) => (
          <ExperimentCard key={index} experiment={experiment} />
        ))}
      </div>
    </div>
  );
};

export default LabPage;