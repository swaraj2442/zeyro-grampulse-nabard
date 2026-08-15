import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, workEmail } = body;

    if (!workEmail) {
      return NextResponse.json({ error: 'Work email is required' }, { status: 400 });
    }

    // Extract first name from full name
    const firstName = fullName?.trim() ? fullName.trim().split(' ')[0] : 'there';

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('RESEND_API_KEY environment variable is not configured.');
      return NextResponse.json(
        { error: 'RESEND_API_KEY environment variable is missing. Please add it to your .env file.' },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    // Read the email template
    const templatePath = path.join(process.cwd(), 'src', 'assests', 'email', 'email.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf-8');

    // Read image files for inline attachments (CID embedding)
    const imagesDir = path.join(process.cwd(), 'src', 'assests', 'images');
    const logoImgPath = path.join(imagesDir, 'zeyro_white_logo.png');
    const headlineImgPath = path.join(imagesDir, 'demo-headline-image.png');
    const emailImgPath = path.join(imagesDir, 'email.png');

    const attachments: Array<{
      filename: string;
      content: Buffer;
      contentId: string;
    }> = [];

    if (fs.existsSync(logoImgPath)) {
      attachments.push({
        filename: 'zeyro_white_logo.png',
        content: fs.readFileSync(logoImgPath),
        contentId: 'zeyro_white_logo',
      });
      htmlContent = htmlContent.replace('../images/zeyro_white_logo.png', 'cid:zeyro_white_logo');
    }

    if (fs.existsSync(headlineImgPath)) {
      attachments.push({
        filename: 'demo-headline-image.png',
        content: fs.readFileSync(headlineImgPath),
        contentId: 'demo_headline_image',
      });
      htmlContent = htmlContent.replace('../images/demo-headline-image.png', 'cid:demo_headline_image');
    }

    if (fs.existsSync(emailImgPath)) {
      attachments.push({
        filename: 'email.png',
        content: fs.readFileSync(emailImgPath),
        contentId: 'email_image',
      });
      htmlContent = htmlContent.replace('../images/email.png', 'cid:email_image');
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://zeyro.tech';

    // Replace template variables
    htmlContent = htmlContent.replace(/\{\{first_name\}\}/g, firstName);
    htmlContent = htmlContent.replace(/\{\{docs_link\}\}/g, `${origin}/docs`);
    htmlContent = htmlContent.replace(/\{\{FOOTER_IMAGE_URL\}\}/g, '');
    htmlContent = htmlContent.replace(/\.\.\/images\//g, `${origin}/images/`);

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Zeyro <onboarding@resend.dev>';

    const data = await resend.emails.send({
      from: fromEmail,
      to: [workEmail.trim()],
      subject: 'Demo request received — Zeyro',
      html: htmlContent,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    if (data.error) {
      console.error('Error sending email via Resend:', data.error);
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data.data });
  } catch (error: any) {
    console.error('Send email API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
