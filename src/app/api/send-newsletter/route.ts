import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import sgMail from '@sendgrid/mail';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Define the data directory path within the project (fallback for development)
const DATA_DIR = path.join(process.cwd(), 'data');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');
const SENT_POSTS_FILE = path.join(DATA_DIR, 'sent_posts.json');

// Key for subscribers list in Vercel KV
const SUBSCRIBERS_KEY = 'newsletter:subscribers';
const SENT_POSTS_KEY = 'newsletter:sent_posts';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Helper function to get subscribers
async function getSubscribers(): Promise<string[]> {
  // Try to use Vercel KV in production
  if (process.env.VERCEL) {
    try {
      // Get subscribers from KV
      const subscribers = await kv.smembers(SUBSCRIBERS_KEY) as string[];
      return subscribers || [];
    } catch (error) {
      console.error('Vercel KV error:', error);
      // Fall back to file storage
      return getFileSubscribers();
    }
  } else {
    // Use file storage in development
    return getFileSubscribers();
  }
}

// Helper function to get already sent posts
async function getSentPosts(): Promise<string[]> {
  // Try to use Vercel KV in production
  if (process.env.VERCEL) {
    try {
      // Get sent posts from KV
      const sentPosts = await kv.smembers(SENT_POSTS_KEY) as string[];
      return sentPosts || [];
    } catch (error) {
      console.error('Vercel KV error:', error);
      // Fall back to file storage
      return getFileSentPosts();
    }
  } else {
    // Use file storage in development
    return getFileSentPosts();
  }
}

// Helper function to add a post to the sent list
async function addToSentPosts(postSlug: string): Promise<boolean> {
  // Try to use Vercel KV in production
  if (process.env.VERCEL) {
    try {
      // Add to sent posts in KV
      await kv.sadd(SENT_POSTS_KEY, postSlug);
      return true;
    } catch (error) {
      console.error('Vercel KV error:', error);
      // Fall back to file storage
      return addToFileSentPosts(postSlug);
    }
  } else {
    // Use file storage in development
    return addToFileSentPosts(postSlug);
  }
}

// Original file-based functions (used as fallback)
async function getFileSubscribers(): Promise<string[]> {
  try {
    // Ensure the data directory exists
    if (!existsSync(DATA_DIR)) {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
    
    if (!existsSync(SUBSCRIBERS_FILE)) {
      // Create the file if it doesn't exist
      await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = await fs.readFile(SUBSCRIBERS_FILE, 'utf8');
    try {
      return JSON.parse(data);
    } catch (e) {
      // If the file exists but can't be parsed as JSON, return empty array
      console.error('Error parsing subscribers file:', e);
      return [];
    }
  } catch (error) {
    console.error('Error reading subscribers file:', error);
    return [];
  }
}

async function getFileSentPosts(): Promise<string[]> {
  try {
    // Ensure the data directory exists
    if (!existsSync(DATA_DIR)) {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
    
    if (!existsSync(SENT_POSTS_FILE)) {
      // Create the file if it doesn't exist
      await fs.writeFile(SENT_POSTS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = await fs.readFile(SENT_POSTS_FILE, 'utf8');
    try {
      return JSON.parse(data);
    } catch (e) {
      // If the file exists but can't be parsed as JSON, return empty array
      console.error('Error parsing sent posts file:', e);
      return [];
    }
  } catch (error) {
    console.error('Error reading sent posts file:', error);
    return [];
  }
}

async function addToFileSentPosts(postSlug: string): Promise<boolean> {
  try {
    const sentPosts = await getFileSentPosts();
    
    // Check if post already in sent list
    if (sentPosts.includes(postSlug)) {
      return true; // Already marked as sent
    }
    
    // Add new post to sent list
    sentPosts.push(postSlug);
    
    // Ensure the data directory exists
    if (!existsSync(DATA_DIR)) {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
    
    await fs.writeFile(SENT_POSTS_FILE, JSON.stringify(sentPosts, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving sent post to file:', error);
    return false;
  }
}

// Helper function to send email to subscribers
async function sendEmailToSubscribers(
  subscribers: string[], 
  post: { 
    slug: string;
    title: string;
    description: string;
    url: string;
  }
): Promise<boolean> {
  console.log('SendGrid config check:');
  console.log('- API key exists:', !!process.env.SENDGRID_API_KEY);
  console.log('- FROM_EMAIL exists:', !!process.env.FROM_EMAIL);
  
  if (!process.env.SENDGRID_API_KEY || !process.env.FROM_EMAIL) {
    console.error('SendGrid API key or from email not configured');
    return false;
  }
  
  try {
    // Create email template
    const message = {
      to: '', // Will be set in the loop
      from: process.env.FROM_EMAIL,
      subject: `New Post: ${post.title}`,
      text: `I've published a new post: ${post.title}\n\n${post.description}\n\nRead it here: ${post.url}\n\n---\nTo unsubscribe, reply to this email with "unsubscribe" in the subject.`,
      html: `
        <h2>I've published a new post</h2>
        <h3><a href="${post.url}">${post.title}</a></h3>
        <p>${post.description}</p>
        <p><a href="${post.url}">Read the full article →</a></p>
        <hr>
        <p style="font-size: 12px; color: #666;">To unsubscribe, reply to this email with "unsubscribe" in the subject.</p>
      `,
    };
    
    console.log('Email template created, preparing to send to subscribers');
    
    // Send emails to each subscriber
    // Using individual emails for better privacy (not exposing other emails)
    let successCount = 0;
    let errorCount = 0;
    
    for (const email of subscribers) {
      try {
        console.log(`Sending email to: ${email}`);
        const personalizedMessage = { ...message, to: email };
        const response = await sgMail.send(personalizedMessage);
        console.log(`Email sent to ${email}, status code:`, response[0].statusCode);
        successCount++;
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Email sending complete. Success: ${successCount}, Failed: ${errorCount}`);
    
    // Return true if at least one email was sent successfully
    return successCount > 0;
  } catch (error) {
    console.error('Error sending newsletter emails:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    console.log('Newsletter API called, checking auth...');
    
    // Verify the request is authenticated
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.NEWSLETTER_API_KEY}`) {
      console.log('Newsletter API authentication failed:', { 
        authHeader: authHeader ? 'Present' : 'Missing',
        envKeyExists: process.env.NEWSLETTER_API_KEY ? 'Yes' : 'No',
        matches: authHeader === `Bearer ${process.env.NEWSLETTER_API_KEY}`
      });
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('Newsletter API authenticated, parsing post data...');
    
    // Parse request body
    const { post } = await request.json();
    
    if (!post || !post.slug || !post.title || !post.description || !post.url) {
      console.log('Invalid post data:', post);
      return NextResponse.json(
        { success: false, message: 'Invalid post data' },
        { status: 400 }
      );
    }
    
    console.log('Newsletter post data valid, checking if already sent...');
    
    // Check if this post has already been sent
    const sentPosts = await getSentPosts();
    console.log('Previously sent posts:', sentPosts);
    
    if (sentPosts.includes(post.slug)) {
      console.log(`Newsletter already sent for post: ${post.slug}`);
      return NextResponse.json({
        success: false,
        message: 'Newsletter already sent for this post'
      });
    }
    
    console.log('Post is new, fetching subscribers...');
    
    // Get subscribers
    const subscribers = await getSubscribers();
    console.log(`Found ${subscribers.length} subscribers`);
    
    if (subscribers.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No subscribers to send to'
      });
    }
    
    console.log('Sending emails to subscribers...');
    
    // Send emails
    const sent = await sendEmailToSubscribers(subscribers, post);
    
    if (sent) {
      console.log('Emails sent successfully, marking post as sent');
      // Mark post as sent
      await addToSentPosts(post.slug);
      
      return NextResponse.json({
        success: true,
        message: `Newsletter sent to ${subscribers.length} subscribers`,
        subscriberCount: subscribers.length
      });
    } else {
      console.log('Failed to send emails');
      return NextResponse.json(
        { success: false, message: 'Failed to send newsletter' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Newsletter sending error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
} 