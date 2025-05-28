import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Define the data directory path within the project (fallback for development)
const DATA_DIR = path.join(process.cwd(), 'data');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');

// Key for subscribers list in Vercel KV
const SUBSCRIBERS_KEY = 'newsletter:subscribers';

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

// Helper function to save a subscriber
async function saveSubscriber(email: string): Promise<boolean> {
  // Try to use Vercel KV in production
  if (process.env.VERCEL) {
    try {
      // Add email to the subscribers set
      await kv.sadd(SUBSCRIBERS_KEY, email);
      return true;
    } catch (error) {
      console.error('Vercel KV error:', error);
      // Fall back to file storage
      return saveFileSubscriber(email);
    }
  } else {
    // Use file storage in development
    return saveFileSubscriber(email);
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

async function saveFileSubscriber(email: string): Promise<boolean> {
  try {
    const subscribers = await getFileSubscribers();
    
    // Check if email already exists
    if (subscribers.includes(email)) {
      return true; // Already subscribed
    }
    
    // Add new subscriber
    subscribers.push(email);
    
    // Ensure the data directory exists
    if (!existsSync(DATA_DIR)) {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
    
    await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving subscriber to file:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }
    
    // Get current subscribers to check if email exists
    const subscribers = await getSubscribers();
    
    // Check if email already exists
    if (subscribers.includes(email)) {
      return NextResponse.json(
        { success: false, message: 'You are already subscribed!' },
        { status: 400 }
      );
    }
    
    // Save the new subscriber
    const saved = await saveSubscriber(email);
    
    if (!saved) {
      return NextResponse.json(
        { success: false, message: 'Failed to save subscription. Please try again.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Thanks for subscribing! You\'ll receive updates when new content is published.'
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return the list of subscribers for admin page
    const subscribers = await getSubscribers();
    return NextResponse.json({ 
      success: true,
      count: subscribers.length,
      subscribers: subscribers 
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch subscribers', subscribers: [] },
      { status: 500 }
    );
  }
} 