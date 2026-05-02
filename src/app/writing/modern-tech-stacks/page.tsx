import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import CostComparison from './CostComparison';

export const metadata: Metadata = {
  title: 'Modern Tech Stacks Kill Startups — Rohan',
  description: 'Why chasing the latest frameworks and tools can kill a startup before it ever ships anything of value.',
  openGraph: {
    title: 'Modern Tech Stacks Kill Startups',
    description: 'Why chasing the latest frameworks and tools can kill a startup before it ever ships anything of value.',
    url: 'https://rohan.run/writing/modern-tech-stacks',
  },
  alternates: { canonical: 'https://rohan.run/writing/modern-tech-stacks' },
};

const ModernTechStacks: React.FC = () => {
  return (
    <article className="max-w-3xl pb-8 pt-0 px-4 sm:px-0">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-lg font-medium dark:text-white">Modern Tech Stacks Kill Startups</h1>
          <Link href="/writing" className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex-shrink-0 mt-1">writing</Link>
        </div>
        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 text-sm">
          <time dateTime="2024-06-10">June 10, 2024</time>
        </div>
      </header>

      <div className="text-sm max-w-3xl">

        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
          There is a specific kind of startup failure that nobody talks about because it does not look like failure from the outside. The team is talented, the idea is good, the GitHub organization is full of well-named repositories. But six months in there is no product. There is infrastructure. There is a Terraform setup, a Kubernetes cluster, a service mesh, an API gateway. There just is not anything a user can use. I have watched this happen. I have been adjacent to it in hackathons. And I have made the mistake myself on smaller side projects.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">The Pattern</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          It starts with stack selection. A first-time founder reads about microservices on Hacker News, sees that the big companies use Kubernetes, and decides the MVP should be built that way so it can scale. A few weeks later they are debugging service discovery issues and writing YAML files for services that do not have a single user yet. The product never ships because the infrastructure became the product.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The counterintuitive insight is that boring technology often scales better in practice than the modern alternative, at least for the first few years. PHP and MySQL run <a href="https://www.facebook.com" className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Facebook</a> at its beginning. Rails ran GitHub for a long time. The technology is not the constraint. The constraint is that you have not found product-market fit yet, which means you cannot predict what you need to scale.
        </p>

        <CostComparison />

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">The Hidden Cost of Complexity</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Kubernetes is a sophisticated piece of technology built by Google to solve problems Google has at Google&apos;s scale. If you have fewer than a million daily active users you almost certainly do not have those problems. But you do now have the operational overhead of running a distributed container orchestration system with a small team that is also supposed to be building product.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The cost shows up in unexpected places. Every new engineer you hire needs to understand your entire infrastructure before they can ship a feature. Debugging a user-facing bug now requires understanding which of your twelve services is involved. Your deployment pipeline has five more failure modes than a simple git push to a server. Each of these is a small drag that compounds over time.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">What Actually Matters Early</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The question to ask at the start of a project is not what stack will scale best. It is what stack lets you ship and change fastest. Early stage startups do not die from scaling too slowly. They die from not shipping, or from shipping the wrong thing and not being able to pivot fast enough. A monolith that deploys in 30 seconds is more valuable than a microservices architecture that deploys in 45 minutes when you are still figuring out what to build.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          The right time to introduce complexity is when the pain of not having it is greater than the cost of adding it. When your monolith genuinely becomes a bottleneck, split it. When you have a specific service that needs different scaling characteristics, extract it. Do not build for future problems you have not encountered yet.
        </p>

        <h2 className="text-base font-medium mt-8 mb-4 dark:text-white">Exceptions</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          None of this applies if your core product is inherently distributed. Real-time collaborative tools, systems that process large volumes of streaming data, or products that need geographic distribution from day one have legitimate reasons for more complex stacks. The point is not that microservices are always wrong. It is that most startups adopt them as a status signal rather than a solution to an actual technical problem.
        </p>

        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          The engineers who end up building the most interesting systems are usually the ones who understood the tradeoffs deeply enough to start simple, ship fast, and reach the point where they actually needed to solve hard infrastructure problems. You cannot get to interesting scale problems without first having scale.
        </p>
      </div>
    </article>
  );
};

export default ModernTechStacks;
