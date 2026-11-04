import { UserRole } from '../context/AuthContext';

export interface DecodedTokenPayload {
  email: string;
  role: UserRole;
  tenantId?: string;
  tenantSlug?: string;
  exp?: number;
}

/**
 * Base64 JWT parser that works for both real .NET JWTs and demo tokens
 */
export function parseJwt(token: string): DecodedTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      // If it's a fallback json string or simple token
      return null;
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const parsed = JSON.parse(jsonPayload);

    // .NET Identity claim type or standard claim
    const role =
      parsed.role ||
      parsed['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      'Receptionist';

    return {
      email: parsed.email || parsed['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '',
      role: role as UserRole,
      tenantId: parsed.tenantId || parsed.tenant_id,
      tenantSlug: parsed.tenantSlug || parsed.tenant_slug,
      exp: parsed.exp,
    };
  } catch (e) {
    console.error('Failed to parse JWT token', e);
    return null;
  }
}

/**
 * Helper to generate valid Base64 JWT format for client test sessions
 */
export function createMockJwt(email: string, role: UserRole, tenantSlug = 'hotel-resort'): string {
  const header = window.btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = window.btoa(
    JSON.stringify({
      email,
      role,
      tenantId: 'd140e691-1234-4567-8901-abcdef123456',
      tenantSlug,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    })
  );
  const signature = window.btoa('mock_signature');
  return `${header}.${payload}.${signature}`;
}

