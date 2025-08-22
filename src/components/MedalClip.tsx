import React from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface MedalClipProps {
  contentTitle: string;
  contentThumbnail: string;
  embedIframeUrl: string;
  categoryName: string;
  createdTimestamp: number;
  directClipUrl?: string;
}

const MedalClip: React.FC<MedalClipProps> = ({
  contentTitle,
  contentThumbnail,
  embedIframeUrl,
  categoryName,
  createdTimestamp,
  directClipUrl
}) => {
  // Format date from timestamp
  const formattedDate = new Date(createdTimestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="flex flex-col rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
      <Link 
        href={directClipUrl || embedIframeUrl} 
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative aspect-video w-full">
          <Image
            src={contentThumbnail}
            alt={contentTitle}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 rounded-lg px-4 py-2">
              <span className="text-white font-medium">View on Medal.tv</span>
            </div>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <h3 className="text-sm font-medium text-zinc-800 dark:text-white truncate" title={contentTitle}>
          {contentTitle}
        </h3>

        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {formattedDate}
          </span>
          <Link 
            href={directClipUrl || embedIframeUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span className="mr-1">Visit Profile</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MedalClip;
