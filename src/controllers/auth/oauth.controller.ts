import type { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db.config';
import { generateToken } from '../../services/jwt/jwt.service';

export function googleOAuthInit(req: Request, res: Response) {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8080/auth/google/callback',
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };
  const qs = new URLSearchParams(options).toString();
  return res.redirect(`${rootUrl}?${qs}`);
}

export async function googleOAuthCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Authorization code is missing' });
    }

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const values = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8080/auth/google/callback',
      grant_type: 'authorization_code',
    };

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(values).toString(),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('Google Token Exchange Error:', errText);
      return res.status(500).json({ success: false, message: 'Google authentication failed' });
    }

    const data = await tokenResponse.json() as any;
    const accessToken = data.access_token;

    const profileResponse = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${accessToken}`);
    if (!profileResponse.ok) {
      return res.status(500).json({ success: false, message: 'Failed to fetch Google profile' });
    }

    const profile = await profileResponse.json() as any;
    const email = profile.email;
    const googleId = profile.sub;
    const firstName = profile.given_name || 'Google';
    const lastName = profile.family_name || 'User';

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account does not contain a verified email' });
    }

    // Link by email or find by googleId
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email }
        ]
      }
    });

    if (user) {
      // Link Google Account if not already linked
      const updateData: any = {};
      if (!user.googleId) {
        updateData.googleId = googleId;
      }
      if (!user.isVerified) {
        updateData.isVerified = true;
      }

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    } else {
      // Create a new User via OAuth
      user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          googleId,
          isVerified: true,
          password: null,
        },
      });
    }

    const token = generateToken({ userId: user.id, email: user.email });
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-callback`);
  } catch (error) {
    next(error);
  }
}

export function githubOAuthInit(req: Request, res: Response) {
  const rootUrl = 'https://github.com/login/oauth/authorize';
  const options = {
    client_id: process.env.GITHUB_CLIENT_ID || '',
    redirect_uri: process.env.GITHUB_CALLBACK_URL || 'http://localhost:8080/auth/github/callback',
    scope: 'user:email',
  };
  const qs = new URLSearchParams(options).toString();
  return res.redirect(`${rootUrl}?${qs}`);
}

export async function githubOAuthCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Authorization code is missing' });
    }

    const tokenUrl = 'https://github.com/login/oauth/access_token';
    const values = {
      code,
      client_id: process.env.GITHUB_CLIENT_ID || '',
      client_secret: process.env.GITHUB_CLIENT_SECRET || '',
      redirect_uri: process.env.GITHUB_CALLBACK_URL || 'http://localhost:8080/auth/github/callback',
    };

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(values),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('GitHub Token Exchange Error:', errText);
      return res.status(500).json({ success: false, message: 'GitHub authentication failed' });
    }

    const data = await tokenResponse.json() as any;
    const accessToken = data.access_token;

    // Fetch Profile
    const profileResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profileResponse.ok) {
      return res.status(500).json({ success: false, message: 'Failed to fetch GitHub profile' });
    }

    const profile = await profileResponse.json() as any;
    const githubId = String(profile.id);
    const name = profile.name || profile.login || 'GitHub User';
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'GitHub';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    // Fetch Emails
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    let email = null;
    if (emailsResponse.ok) {
      const emailsList = await emailsResponse.json() as any[];
      const primaryEmail = emailsList.find((e: any) => e.primary && e.verified) || emailsList[0];
      email = primaryEmail ? primaryEmail.email : null;
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'GitHub account does not have a verified email' });
    }

    // Link by email or find by githubId
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { githubId },
          { email }
        ]
      }
    });

    if (user) {
      // Link GitHub Account if not already linked
      const updateData: any = {};
      if (!user.githubId) {
        updateData.githubId = githubId;
      }
      if (!user.isVerified) {
        updateData.isVerified = true;
      }

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    } else {
      // Create a new User via OAuth
      user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          githubId,
          isVerified: true,
          password: null,
        },
      });
    }

    const token = generateToken({ userId: user.id, email: user.email });
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-callback`);
  } catch (error) {
    next(error);
  }
}
