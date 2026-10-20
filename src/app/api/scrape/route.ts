import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { YoutubeTranscript } from 'youtube-transcript';
import { validateSafeUrl } from '@/utils/security';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { success: false, error: 'يرجى تزويد رابط صحيح' },
        { status: 400 }
      );
    }

    const trimmedUrl = url.trim();

    // SSRF Security Check
    const securityCheck = validateSafeUrl(trimmedUrl);
    if (!securityCheck.isValid) {
      return NextResponse.json(
        { success: false, error: securityCheck.error || 'الرابط غير آمن أو غير مسموح بالوصول إليه' },
        { status: 400 }
      );
    }

    // 1. Check if URL is YouTube
    const ytVideoId = extractYoutubeId(trimmedUrl);

    if (ytVideoId) {
      return await handleYoutubeScraping(trimmedUrl, ytVideoId);
    }

    // 2. Handle general Web / Article scraping
    return await handleWebScraping(trimmedUrl);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'فشل سحب المحتوى من الرابط' },
      { status: 500 }
    );
  }
}

function extractYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

async function handleYoutubeScraping(url: string, videoId: string) {
  let title = 'فيديو يوتيوب';
  let author = '';
  let description = '';

  // 1. Get video metadata via YouTube oEmbed
  try {
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (oembedRes.ok) {
      const oembed = await oembedRes.json();
      if (oembed.title) title = oembed.title;
      if (oembed.author_name) author = oembed.author_name;
    }
  } catch {
    // Ignore oembed failure
  }

  // 2. Attempt to fetch transcript
  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

    if (transcriptItems && transcriptItems.length > 0) {
      const fullTranscript = transcriptItems
        .map((item) => item.text)
        .filter(Boolean)
        .join(' ')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ');

      if (fullTranscript.trim().length > 0) {
        const formatted = `📺 تفريغ فيديو يوتيوب: ${title}
${author ? `القناة: ${author}\n` : ''}الرابط: ${url}

=== النص المفرغ (Transcript) ===
${fullTranscript.slice(0, 10000)}`;

        return NextResponse.json({
          success: true,
          type: 'youtube',
          title,
          text: formatted,
          url,
        });
      }
    }
  } catch (err: any) {
    console.warn('[YouTube Scrape] Transcript fetch failed, falling back to Cheerio page extraction:', err?.message || err);
  }

  // 3. Fallback when transcript disabled/unavailable: fetch video page with cheerio to extract Title, Channel, & Full Description
  try {
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (pageRes.ok) {
      const html = await pageRes.text();
      const $ = cheerio.load(html);

      const parsedTitle =
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="title"]').attr('content') ||
        $('title').text().replace('- YouTube', '').trim();
      if (parsedTitle && parsedTitle !== 'YouTube') title = parsedTitle;

      const parsedAuthor =
        $('link[itemprop="name"]').attr('content') ||
        $('meta[name="author"]').attr('content') ||
        $('meta[property="og:video:actor"]').attr('content');
      if (parsedAuthor) author = parsedAuthor;

      let parsedDesc =
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        '';

      const matchDesc = html.match(/"shortDescription":"(.*?)(?<!\\)"/);
      if (matchDesc && matchDesc[1]) {
        try {
          parsedDesc = JSON.parse(`"${matchDesc[1]}"`);
        } catch {
          parsedDesc = matchDesc[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }
      }

      description = parsedDesc.trim();
    }
  } catch (e: any) {
    console.warn('[YouTube Scrape] Cheerio page extraction error:', e?.message || e);
  }

  const fallbackText = `[تنبيه: لا يتوفر تفريغ صوتي تلقائي لهذا الفيديو، تم استخراج العنوان والوصف التاليين]

📺 فيديو يوتيوب: ${title}
${author ? `القناة: ${author}\n` : ''}الرابط: ${url}

=== وصف الفيديو (Description) ===
${description || 'لا يوجد وصف متاح لهذا الفيديو.'}`;

  return NextResponse.json({
    success: true,
    type: 'youtube',
    title,
    text: fallbackText,
    url,
  });
}

async function handleWebScraping(url: string) {
  // Method A: Try r.jina.ai first for clean AI-ready markdown
  try {
    const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        Accept: 'text/plain',
        'User-Agent': 'PFStudio/1.0',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (jinaRes.ok) {
      const markdown = await jinaRes.text();
      if (
        markdown &&
        markdown.length > 150 &&
        !markdown.includes('AbuseAlleviationError') &&
        !markdown.includes('Blocked')
      ) {
        return NextResponse.json({
          success: true,
          type: 'web',
          text: markdown.slice(0, 10000),
          url,
        });
      }
    }
  } catch (err: any) {
    console.warn('Jina scraping error, falling back to cheerio:', err.message);
  }

  // Method B: Direct fetch with Cheerio
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
      },
      signal: AbortSignal.timeout(9000),
    });

    if (!res.ok) {
      throw new Error(`تعذر الوصول إلى الموقع (HTTP ${res.status})`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove noise
    $(
      'script, style, noscript, nav, header, footer, aside, svg, iframe, form, button, input, select, .ad, .advertisement'
    ).remove();

    const title =
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim() ||
      'مقال بدون عنوان';

    let content =
      $('article').text().trim() ||
      $('main').text().trim() ||
      $('.article-content').text().trim() ||
      $('.post-content').text().trim();

    if (!content || content.length < 150) {
      content = $('p')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter((p) => p.length > 25)
        .join('\n\n');
    }

    const cleanContent = content.replace(/\s+/g, ' ').trim();

    if (!cleanContent) {
      throw new Error('لم يتم العثور على نص كافٍ في هذه الصفحة');
    }

    const formatted = `🌐 مقال مستخرج: ${title}
الرابط: ${url}

--- المحتوى المستخرج ---
${cleanContent.slice(0, 10000)}`;

    return NextResponse.json({
      success: true,
      type: 'web',
      title,
      text: formatted,
      url,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: `تعذر سحب المحتوى: ${err.message || 'حدث خطأ أثناء فحص الرابط'}`,
      },
      { status: 500 }
    );
  }
}
