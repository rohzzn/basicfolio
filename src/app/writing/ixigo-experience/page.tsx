import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BlogPostProps {
  title: string;
  date: string;
  readTime: string;
  content: React.ReactNode;
}

const blogPosts: { [key: string]: BlogPostProps } = {
  'ixigo-experience': {
    title: 'Ixigo Experience',
    date: 'March 5, 2024',
    readTime: '3 min read',
    content: (
      <>
        <p className="text-zinc-600 dark:text-zinc-400 mt-4">
          As I reflect on my SDE (Software Development Engineer) internship experience at Abhibus Ixigo, I’m filled with a sense of accomplishment and gratitude. It was a journey that began with curiosity, and it led me through various projects, challenges, and new friendships.
        </p>

        {/* Adding an Image */}
        <div className="mt-6">
          <Image
            src="/images/ixigo-internship.jpg" // Ensure this path is correct
            alt="Ixigo Internship"
            width={800}
            height={450}
            className="rounded-md shadow-lg"
          />
        </div>

        <h3 className="text-md font-semibold mt-6 dark:text-white">Getting Started</h3>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          My initial days at Abhibus were marked by excitement and a bit of apprehension. I was just getting started with the architecture and system design, trying to wrap my head around the company’s tech stack and workflows. The learning curve was steep, but the support I received from my team was invaluable. I found myself surrounded by talented individuals who were always willing to guide me.
        </p>

        <h3 className="text-md font-semibold mt-6 dark:text-white">Versatility in Projects</h3>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          One of the unique aspects of my internship was the variety of projects I got to work on. Since I was the only intern in the team, I had the opportunity to explore different domains.
        </p>
        <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 mt-2 space-y-1">
          <li><strong>KSRTC Tourist Packages Report Fetching:</strong> I contributed to fetching and presenting tourist package reports for KSRTC, enhancing the user experience.</li>
          <li><strong>HRTC Feedback Alignment and Dynamic Data Fetching:</strong> I worked on aligning feedback data for HRTC and implemented dynamic data fetching to keep information up-to-date.</li>
          <li><strong>Soup UI Gender and Senior Concession Total Fare Error Fix:</strong> I resolved issues in the Soup UI related to gender and senior concession fare calculations, ensuring the accuracy of data.</li>
          <li><strong>Banner Updates on All RTC:</strong> I participated in updating banners across all RTC platforms, enhancing their visual appeal and user engagement.</li>
          <li><strong>KSRTC Ant to Maven Project Conversion:</strong> I played a role in migrating the KSRTC project from Ant to Maven, improving build and dependency management.</li>
          <li><strong>Solr Debug Fix for KSRTC:</strong> Debugging and fixing issues with Solr search functionality in the KSRTC project to enhance search capabilities.</li>
          <li><strong>GST Details in Final Ticket:</strong> I integrated GST details into the final ticket generation process, ensuring compliance with tax regulations.</li>
          <li><strong>Service Feedback Hyperlink Fix:</strong> I fixed service feedback links, making it easier for users to provide valuable feedback.</li>
          <li><strong>PM2 Fix for React KSRTC:</strong> One of my significant achievements was integrating PM2 for the React-based KSRTC project, ensuring robust process management.</li>
          <li><strong>Sleeper API Layout Issue:</strong> I addressed layout issues in the Sleeper API, focusing on improving the user interface for both lower and upper berths.</li>
          <li><strong>User Session Working in React KSRTC:</strong> I made sure that user sessions worked seamlessly in the React-based KSRTC application.</li>
        </ul>

        <h3 className="text-md font-semibold mt-6 dark:text-white">Conclusion</h3>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          My SDE internship at Abhibus (Ixigo) was an enriching experience that allowed me to grow both personally and professionally. I learned the importance of adaptability and versatility in a dynamic work environment. The exposure to a wide range of projects and the guidance of a supportive team helped me gain invaluable skills and knowledge.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          As I look back on my journey, I’m filled with a sense of achievement and gratitude for the opportunity to contribute to such meaningful projects and to work alongside talented individuals. My time at Abhibus was not just a stepping stone in my career, but a memorable chapter in my life that I will cherish forever.
        </p>
      </>
    ),
  },
  // Add more posts here as needed
};

interface PageProps {
  params: {
    slug: string;
  };
}

const BlogPost: React.FC<PageProps> = ({ params }) => {
  const { slug } = params;
  const post = blogPosts[slug];

  if (!post) {
    return (
      <div className="text-center text-zinc-600 dark:text-zinc-400">
        <p>Post not found.</p>
        <Link href="/writing" className="text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to Writing
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/writing" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        ← Back to Writing
      </Link>
      <h2 className="text-2xl font-bold mt-4 dark:text-white">{post.title}</h2>
      <div className="flex gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-2">
        <span>{post.date}</span>
        <span>•</span>
        <span>{post.readTime}</span>
      </div>
      <div className="mt-6">
        {post.content}
      </div>
    </div>
  );
};

export default BlogPost;
