import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin client using service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    const { email, fullName, password, role, orgName, orgId, salary, dept, position, startDate } = await request.json();

    // 1. Create the user in Supabase Auth via Admin API
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirm automatically so they can log in immediately
      user_metadata: { full_name: fullName }
    });

    if (authError) throw authError;

    // 2. Create the profile record
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        full_name: fullName,
        email,
        role,
        organization_id: orgId,
        salary: salary ? Number(salary) : null,
        department: dept || null,
        position: position || null,
        start_date: startDate || null,
      });

    if (profileError) throw profileError;

    // 3. Send invitation email via MailerSend
    const sentFrom = new Sender("no-reply@high-score.dev", "Emply Pro");
    const recipients = [new Recipient(email, fullName)];

    const html = `
      <div style="font-family: 'Manrope', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f1f5f9; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
        <div style="background-color: #006a6a; padding: 48px 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.04em;">Emply Pro</h1>
          <p style="color: rgba(255,255,255,0.7); margin-top: 8px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Enterprise Management</p>
        </div>
        <div style="padding: 48px; background-color: white;">
          <h2 style="color: #0b1c30; margin-top: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">Welcome to the Team!</h2>
          <p style="color: #64748b; line-height: 1.8; font-size: 16px; font-weight: 500;">Hello <strong>${fullName}</strong>, you've been invited to join <strong>${orgName}</strong> on the Emply platform.</p>
          
          <div style="background-color: #f8f9ff; padding: 32px; border-radius: 20px; margin: 32px 0; border: 1px solid #eef2ff;">
            <p style="margin: 0 0 12px 0; font-size: 11px; color: #006a6a; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em;">Your Account Access</p>
            <p style="margin: 0; color: #0b1c30; font-size: 15px;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0 0 0; color: #0b1c30; font-size: 15px;"><strong>Temp Password:</strong> <code style="background: #ffffff; padding: 4px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">${password}</code></p>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/login" 
               style="display: inline-block; background-color: #006a6a; color: white; padding: 18px 48px; border-radius: 16px; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.3s; box-shadow: 0 10px 20px rgba(0,106,106,0.2);">
              Access Your Dashboard
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 12px; margin-top: 48px; border-top: 1px solid #f1f5f9; padding-top: 24px; text-align: center; font-weight: 500;">
            For security, please change your password immediately after your first login.
          </p>
        </div>
        <div style="background-color: #f8f9ff; padding: 24px; text-align: center;">
          <p style="color: #cbd5e1; font-size: 11px; font-weight: 600; margin: 0;">© 2024 Emply Systems Inc. All rights reserved.</p>
        </div>
      </div>
    `;

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(`Welcome to ${orgName}!`)
      .setHtml(html);

    const response = await mailersend.email.send(emailParams);
    console.log('MailerSend Response:', response);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Invite Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to invite user' }, { status: 400 });
  }
}
