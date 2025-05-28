import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function GET(request: Request) {
  try {
    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY || !process.env.FROM_EMAIL) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'SendGrid not configured',
          sendgridKey: process.env.SENDGRID_API_KEY ? 'Exists' : 'Missing',
          fromEmail: process.env.FROM_EMAIL ? 'Exists' : 'Missing'
        },
        { status: 500 }
      );
    }
    
    // Extract email from URL for testing
    const url = new URL(request.url);
    const testEmail = url.searchParams.get('email');
    
    if (!testEmail) {
      return NextResponse.json(
        { success: false, message: 'No test email provided. Add ?email=your@email.com to the URL.' },
        { status: 400 }
      );
    }
    
    // Send a test email
    const message = {
      to: testEmail,
      from: process.env.FROM_EMAIL,
      subject: 'Newsletter Test Email',
      text: 'This is a test email to verify your newsletter setup is working correctly.',
      html: '<h1>Newsletter Test</h1><p>This is a test email to verify your newsletter setup is working correctly.</p>',
    };
    
    await sgMail.send(message);
    
    return NextResponse.json({
      success: true,
      message: `Test email sent to ${testEmail}. Check your inbox.`,
      fromEmail: process.env.FROM_EMAIL
    });
  } catch (error: unknown) {
    console.error('Test email sending error:', error);
    
    // Type assertion for error handling
    const errorObj = error as { 
      message?: string, 
      response?: { 
        body?: Record<string, unknown> 
      } 
    };
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send test email',
        error: errorObj.message || 'Unknown error',
        sendgridResponse: errorObj.response?.body || 'No response details'
      },
      { status: 500 }
    );
  }
} 