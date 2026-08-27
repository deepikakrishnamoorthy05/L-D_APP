/**
 * Authentication Service Module
 * 
 * Decoupled authentication service.
 * Validates demo administrator credentials for local prototype and can be swapped
 * with real Enterprise SSO / OAuth2 / Azure AD later without UI changes.
 */

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'LD_ADMIN' | 'TRAINER' | 'COORDINATOR' | 'TRAINEE';
  tenantId: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  token?: string;
  errorMessage?: string;
  statusMessage?: string;
}

export const DEMO_CREDENTIALS = {
  email: 'admin@ldplatform.com',
  password: 'Admin@123',
};

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  logout(): Promise<void>;
}

class DemoAuthService implements IAuthService {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const cleanEmail = (credentials.email || '').trim();
    const cleanPassword = (credentials.password || '').trim();

    if (cleanEmail === DEMO_CREDENTIALS.email && cleanPassword === DEMO_CREDENTIALS.password) {
      return {
        success: true,
        token: 'systech_jwt_demo_token_2026',
        statusMessage: '✓ Login Successful',
        user: {
          id: 'usr_demo_admin',
          email: DEMO_CREDENTIALS.email,
          name: 'Demo Administrator',
          role: 'LD_ADMIN',
          tenantId: 'systech-inc',
        },
      };
    }

    return {
      success: false,
      errorMessage: 'Invalid email or password.',
    };
  }

  async logout(): Promise<void> {
    localStorage.removeItem('ld_platform_authenticated');
    localStorage.removeItem('ld_platform_user');
  }
}

export const authService: IAuthService = new DemoAuthService();
