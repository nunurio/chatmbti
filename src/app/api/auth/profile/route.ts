import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';

type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

const ALLOWED_UPDATE_FIELDS = ['display_name', 'mbti_type', 'bio', 'is_public'] as const;
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized',
  PROFILE_NOT_FOUND: 'Profile not found',
  INVALID_REQUEST_BODY: 'Invalid request body',
  FETCH_FAILED: 'Failed to fetch profile',
  CREATE_FAILED: 'Failed to create profile',
  UPDATE_FAILED: 'Failed to update profile',
  SERVER_ERROR: 'Internal server error'
} as const;

function isValidBody(body: unknown): body is Record<string, unknown> {
  return typeof body === 'object' && body !== null;
}

const VALID_MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP', 
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
] as const;

type ValidMBTIType = typeof VALID_MBTI_TYPES[number];

function isValidMBTIType(value: unknown): value is ValidMBTIType {
  return typeof value === 'string' && VALID_MBTI_TYPES.includes(value as ValidMBTIType);
}

function isValidCreateBody(body: unknown): body is { display_name: string; mbti_type: ValidMBTIType } {
  return isValidBody(body) && 
         typeof body.display_name === 'string' && 
         isValidMBTIType(body.mbti_type);
}

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return Response.json({ error: ERROR_MESSAGES.PROFILE_NOT_FOUND }, { status: 404 });
      }
      return Response.json({ error: ERROR_MESSAGES.FETCH_FAILED }, { status: 500 });
    }

    return Response.json({ data: profile }, { status: 200 });
  } catch (error) {
    console.error('Profile GET error:', error);
    return Response.json({ error: ERROR_MESSAGES.SERVER_ERROR }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 });
    }

    const body: unknown = await request.json();
    
    if (!isValidCreateBody(body)) {
      return Response.json({ error: ERROR_MESSAGES.INVALID_REQUEST_BODY }, { status: 400 });
    }

    const profileData: ProfileInsert = {
      id: user.id,
      display_name: body.display_name,
      mbti_type: body.mbti_type,
    };

    const { data: profile, error: insertError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (insertError) {
      return Response.json({ error: ERROR_MESSAGES.CREATE_FAILED }, { status: 500 });
    }

    return Response.json({ data: profile }, { status: 201 });
  } catch (error) {
    console.error('Profile POST error:', error);
    return Response.json({ error: ERROR_MESSAGES.SERVER_ERROR }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 });
    }

    const body: unknown = await request.json();
    
    const updateData: ProfileUpdate = {};
    
    let hasValidFields = false;
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (isValidBody(body) && field in body) {
        const value = body[field];
        if (value !== undefined) {
          // Validate MBTI type if it's being updated
          if (field === 'mbti_type' && value !== null && !isValidMBTIType(value)) {
            return Response.json({ error: ERROR_MESSAGES.INVALID_REQUEST_BODY }, { status: 400 });
          }
          (updateData as Record<string, unknown>)[field] = value;
          hasValidFields = true;
        }
      }
    }

    if (!hasValidFields) {
      return Response.json({ error: ERROR_MESSAGES.INVALID_REQUEST_BODY }, { status: 400 });
    }

    updateData.updated_at = new Date().toISOString();

    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      return Response.json({ error: ERROR_MESSAGES.UPDATE_FAILED }, { status: 500 });
    }

    return Response.json({ data: profile }, { status: 200 });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return Response.json({ error: ERROR_MESSAGES.SERVER_ERROR }, { status: 500 });
  }
}