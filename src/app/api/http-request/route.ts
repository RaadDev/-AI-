import { NextRequest, NextResponse } from 'next/server';
import { validateSafeUrl } from '@/utils/security';

interface HttpRequestPayload {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

export async function POST(req: NextRequest) {
  try {
    const payload: HttpRequestPayload = await req.json();
    const { url, method = 'GET', headers = {}, body, timeoutMs = 10000 } = payload;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { success: false, error: 'الرابط (URL) مطلوب لتنفيذ طلب HTTP' },
        { status: 400 }
      );
    }

    const trimmedUrl = url.trim();

    // 1. SSRF Safety Check
    const securityCheck = validateSafeUrl(trimmedUrl);
    if (!securityCheck.isValid) {
      return NextResponse.json(
        { success: false, error: securityCheck.error || 'الرابط غير مسموح بالوصول إليه لأسباب أمنية' },
        { status: 400 }
      );
    }

    // 2. Validate HTTP method
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const normalizedMethod = method.toUpperCase();
    if (!allowedMethods.includes(normalizedMethod)) {
      return NextResponse.json(
        { success: false, error: `طريقة الطلب (${method}) غير مدعومة` },
        { status: 400 }
      );
    }

    // 3. Prepare headers
    const sanitizedHeaders: Record<string, string> = {
      'User-Agent': 'PFStudio-Workflow-Engine/1.0',
      Accept: 'application/json, text/plain, */*',
    };

    if (headers && typeof headers === 'object') {
      for (const [k, v] of Object.entries(headers)) {
        if (k && v && typeof k === 'string' && typeof v === 'string') {
          // Block host overriding for SSRF mitigation
          if (k.toLowerCase() === 'host') continue;
          sanitizedHeaders[k] = v;
        }
      }
    }

    // 4. Execute fetch with bounded timeout and size limit
    const controller = new AbortController();
    const timeout = Math.min(Math.max(timeoutMs, 1000), 30000); // 1s to 30s
    const timer = setTimeout(() => controller.abort(), timeout);

    const startTime = performance.now();

    try {
      const fetchOptions: RequestInit = {
        method: normalizedMethod,
        headers: sanitizedHeaders,
        signal: controller.signal,
        redirect: 'follow',
      };

      if (['POST', 'PUT', 'PATCH'].includes(normalizedMethod) && body !== undefined && body !== null) {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
        if (!sanitizedHeaders['Content-Type'] && !sanitizedHeaders['content-type']) {
          fetchOptions.headers = {
            ...sanitizedHeaders,
            'Content-Type': 'application/json',
          };
        }
      }

      const response = await fetch(trimmedUrl, fetchOptions);
      clearTimeout(timer);

      const durationMs = Math.round(performance.now() - startTime);

      // Enforce 2MB size limit
      const rawText = await response.text();
      const MAX_BYTES = 2 * 1024 * 1024; // 2MB
      const isTruncated = rawText.length > MAX_BYTES;
      const textToReturn = isTruncated ? rawText.slice(0, MAX_BYTES) : rawText;

      let parsedData: unknown = null;
      try {
        parsedData = JSON.parse(textToReturn);
      } catch {
        parsedData = textToReturn;
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        responseHeaders[key] = val;
      });

      return NextResponse.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        durationMs,
        headers: responseHeaders,
        data: parsedData,
        rawText: textToReturn,
        isTruncated,
      });
    } catch (fetchErr: unknown) {
      clearTimeout(timer);
      const isAbort = (fetchErr as { name?: string })?.name === 'AbortError';
      const durationMs = Math.round(performance.now() - startTime);

      return NextResponse.json(
        {
          success: false,
          error: isAbort ? `انتهت مهلة الطلب (${timeout}ms)` : (fetchErr as Error)?.message || 'فشل الاتصال بالخادم',
          durationMs,
        },
        { status: 504 }
      );
    }
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: (err as Error)?.message || 'خطأ غير متوقع في معالجة طلب HTTP',
      },
      { status: 500 }
    );
  }
}
