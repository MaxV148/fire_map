import { createHmac, randomInt, timingSafeEqual } from 'crypto';

/**
 * Utility class for signing and verifying invitation identifiers and tokens.
 */
export default class SignUtils {
  /**
   * Create a base64url-encoded HMAC-SHA256 signature over the provided UUID using the given secret.
   */
  public static signInvitationId(inviteUuid: string, secret: string): string {
    const signatureBase64: string = createHmac('sha256', Buffer.from(secret, 'utf8'))
      .update(Buffer.from(String(inviteUuid), 'utf8'))
      .digest('base64');
    return SignUtils.convertBase64ToBase64UrlWithoutPadding(signatureBase64);
  }

  /**
   * Verify that the provided signature matches the expected signature for the given invitation identifier.
   */
  public static verifyInvitationSignature(invitationId: string, signature: string, secret: string): boolean {
    const expectedSignature: string = SignUtils.signInvitationId(invitationId, secret);
    const expectedBuffer: Buffer = Buffer.from(expectedSignature, 'utf8');
    const providedBuffer: Buffer = Buffer.from(signature, 'utf8');
    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }
    return timingSafeEqual(expectedBuffer, providedBuffer);
  }

  /**
   * Create a signed token in the form "{inviteUuid}.{signature}".
   */
  public static createSignedToken(inviteUuid: string, secret: string): string {
    const signature: string = SignUtils.signInvitationId(inviteUuid, secret);
    return `${inviteUuid}.${signature}`;
  }

  /**
   * Verify a signed token and extract the invite UUID when valid.
   *
   * Returns an object with validity and optional inviteUuid.
   */
  public static verifySignedToken(
    token: string,
    secret: string,
  ): { isValid: boolean; inviteUuid: string | null } {
    const lastDotIndex: number = token.lastIndexOf('.');
    if (lastDotIndex < 0) {
      return { isValid: false, inviteUuid: null };
    }
    const inviteUuid: string = token.slice(0, lastDotIndex);
    const providedSignature: string = token.slice(lastDotIndex + 1);
    const isValid: boolean = SignUtils.verifyInvitationSignature(inviteUuid, providedSignature, secret);
    return { isValid, inviteUuid: isValid ? inviteUuid : null };
  }

  /**
   * Generate a numeric forgot-password code of the requested length.
   */
  public static generateForgotPasswordCode(length: number = 6): string {
    if (length <= 0) {
      return '';
    }
    let code: string = '';
    for (let i: number = 0; i < length; i += 1) {
      code += String(randomInt(0, 10));
    }
    return code;
  }

  private static convertBase64ToBase64UrlWithoutPadding(base64: string): string {
    const base64Url: string = base64.replace(/\+/g, '-').replace(/\//g, '_');
    return base64Url.replace(/=+$/u, '');
  }
}


