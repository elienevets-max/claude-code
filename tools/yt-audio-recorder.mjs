#!/usr/bin/env node
/**
 * yt-audio-recorder.mjs
 *
 * Downloads audio from YouTube playlist videos and transcribes with Whisper.
 *
 * Two download methods:
 *   1. Direct: Extracts audio stream URL from YouTube's player data and downloads
 *      through the browser (fast, works behind proxies)
 *   2. MediaRecorder fallback: Plays the video in-browser and records audio via
 *      captureStream() + MediaRecorder API (slower, real-time playback)
 *
 * Prerequisites:
 *   - Node.js 18+
 *   - npm install playwright && npx playwright install chromium
 *   - pip install openai-whisper
 *   - ffmpeg (apt install ffmpeg / brew install ffmpeg)
 *
 * Usage:
 *   node tools/yt-audio-recorder.mjs [OPTIONS]
 *
 * Options:
 *   --start N     Start from video index N (0-based, default: 0)
 *   --count N     Process N videos in this batch (default: 5)
 *   --headed      Run with visible browser
 *   --download    Download audio only, skip transcription
 *   --transcribe  Transcribe existing audio only, skip download
 *   --model M     Whisper model: tiny|base|small|medium|large (default: base)
 *   --speed N     Playback speed for MediaRecorder fallback (default: 1)
 *
 * Quick start (run locally on your machine):
 *   1. First login to YouTube:
 *        node tools/yt-transcript-scraper.mjs --login
 *   2. Download audio for first 5 videos:
 *        node tools/yt-audio-recorder.mjs --start 0 --count 5
 *   3. Continue with next batch:
 *        node tools/yt-audio-recorder.mjs --start 5 --count 5
 *   4. Or download all at once, then transcribe separately:
 *        node tools/yt-audio-recorder.mjs --start 0 --count 41 --download
 *        node tools/yt-audio-recorder.mjs --transcribe --model medium
 *
 * Alternative (if yt-dlp works on your network):
 *   bash tools/youtube-audio-download.sh -c cookies.txt -m base
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { execSync } from 'child_process';

let chromium;
try {
    ({ chromium } = await import('playwright'));
} catch {
    try {
        const { createRequire } = await import('module');
        const require = createRequire(import.meta.url);
        ({ chromium } = require('playwright'));
    } catch {
        try {
            // Try global install (e.g. /opt/node22/lib/node_modules/playwright)
            const { createRequire } = await import('module');
            const require = createRequire(import.meta.url);
            ({ chromium } = require('/opt/node22/lib/node_modules/playwright'));
        } catch {
            console.error('ERROR: Playwright not found. Install: npm install playwright');
            process.exit(1);
        }
    }
}

// ===== Configuration =====
const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PL3KSApovQlbnOM2QWLWQgg_Bd_qhPusxR';
const AUDIO_DIR = join(process.cwd(), 'audio');
const TRANSCRIPT_DIR = join(process.cwd(), 'transcripts');
const AUTH_FILE = join(process.cwd(), 'transcripts', '.yt-auth.json');
const PROGRESS_FILE = join(process.cwd(), 'transcripts', '.audio-progress.json');

// Parse CLI args
const args = process.argv.slice(2);
const getArg = (flag, def) => {
    const idx = args.indexOf(flag);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : def;
};
const START_INDEX = parseInt(getArg('--start', '0'));
const BATCH_COUNT = parseInt(getArg('--count', '5'));
const HEADED = args.includes('--headed');
const DOWNLOAD_ONLY = args.includes('--download');
const TRANSCRIBE_ONLY = args.includes('--transcribe');
const WHISPER_MODEL = getArg('--model', 'base');
const PLAYBACK_SPEED = parseFloat(getArg('--speed', '1'));

mkdirSync(AUDIO_DIR, { recursive: true });
mkdirSync(TRANSCRIPT_DIR, { recursive: true });

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function sanitize(title) {
    return title.replace(/[^a-zA-Z0-9\s\-_]/g, '').replace(/\s+/g, '_').substring(0, 80);
}

function loadProgress() {
    try { return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8')); }
    catch { return { downloaded: [], transcribed: [], failed: [], videoList: [] }; }
}

function saveProgress(progress) {
    writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// ===== Method 1: Extract audio stream URL and download =====
async function downloadAudioDirect(page, videoUrl, outputPath) {
    await page.goto(videoUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await delay(3000);

    // Dismiss any popups
    try {
        const dismiss = page.locator('button:has-text("Dismiss"), button:has-text("No thanks"), button:has-text("Skip")');
        if (await dismiss.count() > 0) await dismiss.first().click({ timeout: 2000 });
    } catch {}

    // Extract audio URL from ytInitialPlayerResponse
    const audioInfo = await page.evaluate(() => {
        try {
            const pr = window.ytInitialPlayerResponse;
            if (!pr || !pr.streamingData) return null;

            const formats = pr.streamingData.adaptiveFormats || [];

            // Find best audio-only format (prefer medium quality for speed)
            const audioFormats = formats.filter(f =>
                f.mimeType && f.mimeType.startsWith('audio/')
            ).sort((a, b) => (a.bitrate || 0) - (b.bitrate || 0));

            if (audioFormats.length === 0) return null;

            // Pick middle quality (not too large, not too small)
            const picked = audioFormats[Math.min(1, audioFormats.length - 1)];

            return {
                url: picked.url || null,
                mimeType: picked.mimeType,
                bitrate: picked.bitrate,
                contentLength: picked.contentLength,
                approxDurationMs: picked.approxDurationMs,
                // If URL needs signature, we need signatureCipher
                signatureCipher: picked.signatureCipher || null
            };
        } catch (e) {
            return { error: e.message };
        }
    });

    if (!audioInfo || audioInfo.error) {
        console.log(`    Direct download: no audio URL found (${audioInfo?.error || 'unknown'})`);
        return false;
    }

    if (!audioInfo.url && audioInfo.signatureCipher) {
        console.log('    Direct download: audio requires signature decryption, falling back...');
        return false;
    }

    if (!audioInfo.url) {
        console.log('    Direct download: no usable audio URL');
        return false;
    }

    const durationSec = audioInfo.approxDurationMs ? Math.round(audioInfo.approxDurationMs / 1000) : '?';
    const sizeMB = audioInfo.contentLength ? (parseInt(audioInfo.contentLength) / 1024 / 1024).toFixed(1) : '?';
    console.log(`    Audio: ${audioInfo.mimeType} | ${audioInfo.bitrate}bps | ~${durationSec}s | ~${sizeMB}MB`);

    // Download the audio through the browser (bypasses proxy)
    console.log('    Downloading audio via browser fetch...');

    const audioData = await page.evaluate(async (url) => {
        try {
            const resp = await fetch(url);
            if (!resp.ok) return { error: `HTTP ${resp.status}` };

            const buffer = await resp.arrayBuffer();
            // Convert to base64
            const bytes = new Uint8Array(buffer);
            let binary = '';
            // Process in chunks to avoid stack overflow
            const chunkSize = 8192;
            for (let i = 0; i < bytes.length; i += chunkSize) {
                const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
                binary += String.fromCharCode.apply(null, chunk);
            }
            return { base64: btoa(binary), size: buffer.byteLength };
        } catch (e) {
            return { error: e.message };
        }
    }, audioInfo.url);

    if (!audioData || audioData.error) {
        console.log(`    Download failed: ${audioData?.error || 'unknown'}`);
        return false;
    }

    // Save the audio file
    const ext = audioInfo.mimeType.includes('webm') ? 'webm' : 'mp4';
    const finalPath = outputPath.replace(/\.[^.]+$/, `.${ext}`);
    const buffer = Buffer.from(audioData.base64, 'base64');
    writeFileSync(finalPath, buffer);
    console.log(`    Saved: ${basename(finalPath)} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
    return finalPath;
}

// ===== Method 2: MediaRecorder fallback =====
async function downloadAudioRecorder(page, videoUrl, outputPath) {
    console.log('    Using MediaRecorder fallback (plays video in browser)...');

    await page.goto(videoUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await delay(3000);

    // Dismiss popups
    try {
        const dismiss = page.locator('button:has-text("Dismiss"), button:has-text("No thanks")');
        if (await dismiss.count() > 0) await dismiss.first().click({ timeout: 2000 });
    } catch {}

    // Get video duration
    const duration = await page.evaluate(() => {
        const video = document.querySelector('video');
        return video ? video.duration : 0;
    });

    if (!duration || duration <= 0) {
        console.log('    Could not determine video duration');
        return false;
    }

    console.log(`    Video duration: ${Math.round(duration)}s — recording at ${PLAYBACK_SPEED}x speed...`);

    // Set up audio recording via MediaRecorder
    const recordingResult = await page.evaluate(async (speed) => {
        return new Promise(async (resolve) => {
            try {
                const video = document.querySelector('video');
                if (!video) { resolve({ error: 'No video element' }); return; }

                // Unmute and play
                video.muted = false;
                video.volume = 1;
                video.playbackRate = speed;
                video.currentTime = 0;

                // Wait a moment for the video to be ready
                await new Promise(r => setTimeout(r, 1000));

                // Capture the video's audio stream
                let stream;
                try {
                    stream = video.captureStream();
                } catch (e) {
                    // Try mozCaptureStream for Firefox
                    try { stream = video.mozCaptureStream(); }
                    catch { resolve({ error: 'captureStream not supported' }); return; }
                }

                const audioTracks = stream.getAudioTracks();
                if (audioTracks.length === 0) {
                    resolve({ error: 'No audio tracks in stream' });
                    return;
                }

                const audioStream = new MediaStream(audioTracks);
                const recorder = new MediaRecorder(audioStream, {
                    mimeType: 'audio/webm;codecs=opus'
                });

                const chunks = [];
                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunks.push(e.data);
                };

                recorder.onstop = async () => {
                    const blob = new Blob(chunks, { type: 'audio/webm' });
                    const buffer = await blob.arrayBuffer();
                    const bytes = new Uint8Array(buffer);
                    let binary = '';
                    const chunkSize = 8192;
                    for (let i = 0; i < bytes.length; i += chunkSize) {
                        const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
                        binary += String.fromCharCode.apply(null, chunk);
                    }
                    resolve({ base64: btoa(binary), size: buffer.byteLength });
                };

                // Start recording
                recorder.start(1000); // Collect data every second

                // Play the video
                try { await video.play(); } catch {}

                // Wait for video to end or timeout
                const maxWait = (video.duration / speed + 10) * 1000;
                await new Promise(r => {
                    video.onended = () => r();
                    video.onpause = () => {
                        if (video.currentTime >= video.duration - 1) r();
                    };
                    setTimeout(r, maxWait);
                });

                // Stop recording
                recorder.stop();
            } catch (e) {
                resolve({ error: e.message });
            }
        });
    }, PLAYBACK_SPEED);

    if (!recordingResult || recordingResult.error) {
        console.log(`    Recording failed: ${recordingResult?.error || 'unknown'}`);
        return false;
    }

    const finalPath = outputPath.replace(/\.[^.]+$/, '.webm');
    const buffer = Buffer.from(recordingResult.base64, 'base64');
    writeFileSync(finalPath, buffer);
    console.log(`    Saved: ${basename(finalPath)} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
    return finalPath;
}

// ===== Transcribe with Whisper =====
function transcribeAudio(audioPath, outputDir, model) {
    const stem = basename(audioPath).replace(/\.[^.]+$/, '');
    const transcriptPath = join(outputDir, `${stem}.txt`);

    // Skip if already transcribed
    if (existsSync(transcriptPath)) {
        const content = readFileSync(transcriptPath, 'utf-8').trim();
        if (content.length > 50) {
            console.log(`    Already transcribed: ${stem}.txt`);
            return transcriptPath;
        }
    }

    console.log(`    Transcribing with Whisper (model: ${model})...`);
    try {
        execSync(
            `whisper "${audioPath}" --model ${model} --language en --output_format txt --output_dir "${outputDir}/"`,
            { stdio: 'pipe', timeout: 600000 } // 10 min timeout
        );
        console.log(`    Transcribed: ${stem}.txt`);
        return transcriptPath;
    } catch (err) {
        console.error(`    Whisper error: ${err.stderr?.toString().substring(0, 200) || err.message}`);
        return null;
    }
}

// ===== Transcribe-only mode =====
async function transcribeExistingAudio() {
    const audioFiles = readdirSync(AUDIO_DIR)
        .filter(f => f.match(/\.(webm|mp4|mp3|wav|m4a)$/))
        .sort();

    if (audioFiles.length === 0) {
        console.log('No audio files found in audio/. Run without --transcribe first.');
        return;
    }

    console.log(`\nFound ${audioFiles.length} audio files to transcribe.\n`);

    let succeeded = 0, skipped = 0, failed = 0;

    for (let i = 0; i < audioFiles.length; i++) {
        const audioFile = audioFiles[i];
        const audioPath = join(AUDIO_DIR, audioFile);
        const stem = audioFile.replace(/\.[^.]+$/, '');
        const transcriptPath = join(TRANSCRIPT_DIR, `${stem}.txt`);

        if (existsSync(transcriptPath) && readFileSync(transcriptPath, 'utf-8').trim().length > 50) {
            console.log(`  [${i + 1}/${audioFiles.length}] SKIP: ${stem}`);
            skipped++;
            continue;
        }

        console.log(`  [${i + 1}/${audioFiles.length}] Transcribing: ${stem}`);
        const result = transcribeAudio(audioPath, TRANSCRIPT_DIR, WHISPER_MODEL);
        if (result) succeeded++;
        else failed++;
    }

    console.log(`\nTranscription complete: ${succeeded} succeeded, ${skipped} skipped, ${failed} failed`);
}

// ===== Main =====
async function main() {
    if (TRANSCRIBE_ONLY) {
        await transcribeExistingAudio();
        return;
    }

    const progress = loadProgress();
    const hasAuth = existsSync(AUTH_FILE);

    console.log('\n========================================');
    console.log('  YouTube Audio Recorder + Transcriber');
    console.log('========================================');
    console.log(`Batch: videos ${START_INDEX + 1} to ${START_INDEX + BATCH_COUNT}`);
    console.log(`Mode: ${HEADED ? 'visible' : 'headless'} | Model: ${WHISPER_MODEL}`);
    console.log(`Auth: ${hasAuth ? 'LOGGED IN' : 'not logged in'}`);
    console.log(`Audio: ${AUDIO_DIR}/`);
    console.log(`Transcripts: ${TRANSCRIPT_DIR}/`);
    console.log('');

    // Launch browser — try channels first, then fall back to known Chromium paths
    let browser;
    const launchOpts = {
        headless: !HEADED,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--autoplay-policy=no-user-gesture-required'
        ]
    };

    // Try: real Chrome, Edge, default Playwright, then direct executable paths
    const strategies = [
        () => chromium.launch({ ...launchOpts, channel: 'chrome' }),
        () => chromium.launch({ ...launchOpts, channel: 'msedge' }),
        () => chromium.launch(launchOpts),
        // Fallback: use existing Chromium binaries directly
        () => chromium.launch({ ...launchOpts, executablePath: '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome' }),
        () => chromium.launch({ ...launchOpts, executablePath: '/usr/bin/chromium-browser' }),
        () => chromium.launch({ ...launchOpts, executablePath: '/usr/bin/chromium' }),
    ];

    for (const launch of strategies) {
        try { browser = await launch(); break; }
        catch {}
    }
    if (!browser) { console.error('ERROR: No browser found.'); process.exit(1); }

    const ctxOpts = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 900 }
    };
    if (hasAuth) {
        try { ctxOpts.storageState = JSON.parse(readFileSync(AUTH_FILE, 'utf-8')); }
        catch { console.log('  WARNING: Could not load auth state.'); }
    }

    const context = await browser.newContext(ctxOpts);
    const page = await context.newPage();

    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    // Step 1: Get playlist
    console.log('[1/3] Loading playlist...');
    await page.goto(PLAYLIST_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(3000);

    // Dismiss consent
    try {
        const btn = page.locator('button:has-text("Accept"), button:has-text("Reject all")');
        if (await btn.count() > 0) { await btn.first().click(); await delay(1000); }
    } catch {}

    // Scroll to load all videos
    for (let i = 0; i < 10; i++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await delay(800);
    }

    const videos = await page.evaluate(() => {
        const items = document.querySelectorAll('ytd-playlist-video-renderer, a#video-title');
        const results = [];
        const seen = new Set();
        items.forEach(item => {
            let link, title;
            if (item.tagName === 'A') {
                link = item.href;
                title = item.textContent.trim();
            } else {
                const a = item.querySelector('a#video-title');
                if (!a) return;
                link = a.href;
                title = a.textContent.trim();
            }
            if (link && link.includes('watch') && !seen.has(link)) {
                seen.add(link);
                const match = link.match(/[?&]v=([^&]+)/);
                if (match) results.push({ id: match[1], title, url: link });
            }
        });
        return results;
    });

    if (videos.length === 0) {
        console.error('ERROR: No videos found in playlist.');
        await browser.close();
        process.exit(1);
    }

    console.log(`Found ${videos.length} videos.\n`);
    progress.videoList = videos;
    saveProgress(progress);

    // Step 2: Download and transcribe each video
    const endIndex = Math.min(START_INDEX + BATCH_COUNT, videos.length);
    console.log(`[2/3] Processing videos ${START_INDEX + 1} to ${endIndex}...\n`);

    let downloaded = 0, transcribed = 0, skipped = 0, failed = 0;

    for (let i = START_INDEX; i < endIndex; i++) {
        const video = videos[i];
        const padded = String(i + 1).padStart(3, '0');
        const safeName = sanitize(video.title);
        const audioBasename = `${padded}_-_${safeName}`;
        const audioPath = join(AUDIO_DIR, `${audioBasename}.webm`);
        const transcriptPath = join(TRANSCRIPT_DIR, `${audioBasename}.txt`);

        // Check if transcript already exists
        if (existsSync(transcriptPath) && readFileSync(transcriptPath, 'utf-8').trim().length > 50) {
            console.log(`  [${i + 1}/${videos.length}] SKIP (already done): ${video.title.substring(0, 55)}`);
            skipped++;
            continue;
        }

        console.log(`  [${i + 1}/${videos.length}] ${video.title.substring(0, 60)}`);

        // Check if audio already downloaded (any extension)
        let existingAudio = null;
        for (const ext of ['webm', 'mp4', 'mp3']) {
            const p = join(AUDIO_DIR, `${audioBasename}.${ext}`);
            if (existsSync(p)) { existingAudio = p; break; }
        }

        let audioFile = existingAudio;

        if (!audioFile) {
            // Try Method 1: Direct download
            audioFile = await downloadAudioDirect(page, video.url, audioPath);

            // Try Method 2: MediaRecorder fallback
            if (!audioFile) {
                audioFile = await downloadAudioRecorder(page, video.url, audioPath);
            }
        } else {
            console.log(`    Audio exists: ${basename(audioFile)}`);
        }

        if (audioFile) {
            downloaded++;

            if (!DOWNLOAD_ONLY) {
                const result = transcribeAudio(
                    typeof audioFile === 'string' ? audioFile : audioPath,
                    TRANSCRIPT_DIR,
                    WHISPER_MODEL
                );
                if (result) {
                    transcribed++;
                    if (!progress.transcribed.includes(i)) progress.transcribed.push(i);
                } else {
                    failed++;
                    if (!progress.failed.includes(i)) progress.failed.push(i);
                }
            }
            if (!progress.downloaded.includes(i)) progress.downloaded.push(i);
        } else {
            console.log('    FAILED: Could not download audio');
            failed++;
            if (!progress.failed.includes(i)) progress.failed.push(i);
        }

        saveProgress(progress);
        await delay(2000); // Pause between videos
    }

    await browser.close();

    // Summary
    console.log('\n========================================');
    console.log('  Batch Complete');
    console.log('========================================');
    console.log(`  Downloaded:   ${downloaded}`);
    console.log(`  Transcribed:  ${transcribed}`);
    console.log(`  Skipped:      ${skipped} (already done)`);
    console.log(`  Failed:       ${failed}`);
    console.log(`  Audio dir:    ${AUDIO_DIR}/`);
    console.log(`  Transcripts:  ${TRANSCRIPT_DIR}/`);

    if (endIndex < videos.length) {
        console.log(`\n  Next batch: node tools/yt-audio-recorder.mjs --start ${endIndex} --count ${BATCH_COUNT}`);
    } else {
        console.log('\n  All videos processed!');
    }
    console.log('');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
