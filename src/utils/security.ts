import { URL } from 'url';

/**
 * Validates that a URL is safe to fetch and protects against SSRF (Server-Side Request Forgery).
 * Blocks:
 * - Non-HTTP/HTTPS schemes (file:, gopher:, ftp:, etc.)
 * - Localhost and IPv4 loopbacks (127.0.0.0/8, 0.0.0.0)
 * - IPv6 loopback (::1, fe80::/10)
 * - Private networks:
 *   - 10.0.0.0/8
 *   - 172.16.0.0/12
 *   - 192.168.0.0/16
 * - Link-local / Cloud metadata:
 *   - 169.254.0.0/16 (AWS, GCP, Azure, DigitalOcean metadata)
 * - Unusual and privileged internal ports
 */
export function validateSafeUrl(urlString: string): { isValid: boolean; error?: string; parsedUrl?: URL } {
  if (!urlString || typeof urlString !== 'string') {
    return { isValid: false, error: 'الرابط فارغ أو غير صالح' };
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString.trim());
  } catch {
    return { isValid: false, error: 'صيغة الرابط غير صحيحة' };
  }

  // 1. Check scheme
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      isValid: false,
      error: `بروتوكول غير مسموح به (${parsed.protocol}). يُسمح فقط بـ http و https`,
    };
  }

  const hostname = parsed.hostname.toLowerCase().trim();

  // 2. Block localhost / internal hostnames
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname === 'ip6-localhost' ||
    hostname === 'ip6-loopback'
  ) {
    return {
      isValid: false,
      error: 'محاولة وصول غير مصرح بها إلى وجهة داخلية أو محلية (SSRF Protection)',
    };
  }

  // 3. Block IPv4 private & link-local ranges
  // Check if hostname is an IPv4 address
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const octets = ipv4Match.slice(1, 5).map(Number);
    if (octets.some((o) => o < 0 || o > 255)) {
      return { isValid: false, error: 'عنوان IP غير صالح' };
    }

    const [a, b] = octets;

    // Loopback: 127.0.0.0/8 or 0.0.0.0
    if (a === 127 || a === 0) {
      return { isValid: false, error: 'غير مسموح بالوصول إلى عناوين الاسترجاع المحلي (127.0.0.0/8)' };
    }

    // 10.0.0.0/8
    if (a === 10) {
      return { isValid: false, error: 'غير مسموح بالوصول إلى شبكات خاصة (10.0.0.0/8)' };
    }

    // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
    if (a === 172 && b >= 16 && b <= 31) {
      return { isValid: false, error: 'غير مسموح بالوصول إلى شبكات خاصة (172.16.0.0/12)' };
    }

    // 192.168.0.0/16
    if (a === 192 && b === 168) {
      return { isValid: false, error: 'غير مسموح بالوصول إلى شبكات خاصة (192.168.0.0/16)' };
    }

    // Link-local / Cloud metadata service (169.254.0.0/16)
    if (a === 169 && b === 254) {
      return { isValid: false, error: 'غير مسموح بالوصول إلى خدمات بيانات السحابة (169.254.0.0/16)' };
    }
  }

  // 4. Block IPv6 brackets like [::1] or [fe80:...]
  if (hostname.startsWith('[') || hostname.includes(':')) {
    if (
      hostname === '[::1]' ||
      hostname === '::1' ||
      hostname.includes('fe80:') ||
      hostname.includes('fc00:') ||
      hostname.includes('fd00:')
    ) {
      return { isValid: false, error: 'غير مسموح بالوصول إلى عناوين IPv6 الداخلية (SSRF Protection)' };
    }
  }

  // 5. Block dangerous ports
  if (parsed.port) {
    const portNum = Number(parsed.port);
    const blockedPorts = [22, 23, 25, 110, 143, 445, 3306, 5432, 6379, 27017, 9200, 11211];
    if (blockedPorts.includes(portNum)) {
      return { isValid: false, error: `المنفذ (${portNum}) غير مسموح بالاتصال به لأسباب أمنية` };
    }
  }

  return { isValid: true, parsedUrl: parsed };
}

/**
 * Deeply redacts sensitive keys from objects before serialization or logging
 */
export function redactSensitiveData<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData) as unknown as T;
  }

  const sensitiveKeys = [
    'apikey',
    'api_key',
    'openaikey',
    'geminikey',
    'anthropickey',
    'deepseekkey',
    'mistralkey',
    'openrouterkey',
    'elevenlabskey',
    'password',
    'secret',
    'authorization',
    'token',
    'privatekey',
  ];

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
    if (sensitiveKeys.some((s) => lowerKey.includes(s)) && typeof value === 'string' && value.length > 0) {
      result[key] = value.length > 8 ? `${value.slice(0, 4)}...[REDACTED]...${value.slice(-3)}` : '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactSensitiveData(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
