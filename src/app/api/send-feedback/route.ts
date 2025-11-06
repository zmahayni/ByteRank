import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create email content
    const emailContent = `
New Feedback from ByteRank

From: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent from ByteRank Feedback Form
    `.trim();

    // For now, we'll use a simple approach with Resend or similar service
    // You'll need to set up an email service. Here's a template for using Resend:
    
    // Option 1: Using Resend (recommended)
    // Install: npm install resend
    // Set RESEND_API_KEY in your environment variables
    
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      // For development, log the feedback instead
      console.log('Feedback received:', { name, email, subject, message });
      return NextResponse.json({ 
        success: true, 
        message: 'Feedback logged (email service not configured)' 
      });
    }

    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ByteRank Feedback <onboarding@resend.dev>', // Update with your verified domain
        to: ['zmahayni056@gmail.com'],
        reply_to: email,
        subject: `ByteRank Feedback: ${subject}`,
        text: emailContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      throw new Error('Failed to send email');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback sent successfully' 
    });

  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { error: 'Failed to send feedback' },
      { status: 500 }
    );
  }
}
