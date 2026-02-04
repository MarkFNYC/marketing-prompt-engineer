import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { requireUserId, getUserIdIfPresent } from '../src/lib/auth-server';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

const mockedCreateClient = vi.mocked(createClient);

const setEnv = () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
};

describe('auth-server helpers', () => {
  beforeEach(() => {
    setEnv();
    mockedCreateClient.mockReset();
  });

  it('requireUserId returns 401 when no bearer token', async () => {
    const request = new NextRequest('http://localhost');
    const result = await requireUserId(request);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error.status).toBe(401);
    }
  });

  it('requireUserId returns userId when token is valid', async () => {
    mockedCreateClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    } as any);

    const request = new NextRequest('http://localhost', {
      headers: { Authorization: 'Bearer test-token' },
    });

    const result = await requireUserId(request);
    expect('userId' in result).toBe(true);
    if ('userId' in result) {
      expect(result.userId).toBe('user-123');
    }
  });

  it('requireUserId returns 401 when token is invalid', async () => {
    mockedCreateClient.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Invalid token'),
        }),
      },
    } as any);

    const request = new NextRequest('http://localhost', {
      headers: { Authorization: 'Bearer bad-token' },
    });

    const result = await requireUserId(request);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error.status).toBe(401);
    }
  });

  it('getUserIdIfPresent returns null when no token', async () => {
    const request = new NextRequest('http://localhost');
    const result = await getUserIdIfPresent(request);
    expect('userId' in result).toBe(true);
    if ('userId' in result) {
      expect(result.userId).toBe(null);
    }
  });
});
