import { auth } from '@/lib/auth';
import { generateQuarterMessages } from '@/lib/generate-messages';
import * as path from 'path';
import * as fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  return new Response(`
<html>
  <head>
    <title>Generate Weekly Messages</title>
    <style>
      body { font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
      h1 { color: #333; }
      form { margin: 20px 0; }
      select, button { padding: 8px 12px; font-size: 14px; }
      button { background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
      button:hover { background: #0056b3; }
      #output { background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; padding: 12px; margin-top: 20px; font-family: monospace; font-size: 12px; max-height: 400px; overflow-y: auto; white-space: pre-wrap; }
      .loading { color: #666; }
      .success { color: #28a745; }
      .error { color: #dc3545; }
      .warning { color: #ffc107; font-weight: bold; }
    </style>
  </head>
  <body>
    <h1>🌙 Generate Weekly Messages</h1>
    <p>Generate cosmic messages for a quarter. This will take 1–2 minutes.</p>
    <form id="form">
      <label for="quarter">Quarter:</label>
      <select id="quarter" name="quarter">
        <option value="">Current Quarter</option>
        <option value="1">Q1 (Jan–Mar)</option>
        <option value="2">Q2 (Apr–Jun)</option>
        <option value="3">Q3 (Jul–Sep)</option>
        <option value="4">Q4 (Oct–Dec)</option>
      </select>
      <button type="submit">Generate</button>
    </form>
    <div id="output"></div>

    <script>
      const form = document.getElementById('form');
      const output = document.getElementById('output');

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const quarter = form.quarter.value || '';
        output.textContent = '';
        output.innerHTML = '<span class="loading">Generating...</span>\n';

        try {
          const resp = await fetch('/api/admin/generate-messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quarter: quarter ? parseInt(quarter) : null }),
          });

          if (!resp.ok) {
            output.innerHTML = \`<span class="error">Error: \${resp.status} \${resp.statusText}</span>\`;
            return;
          }

          const data = await resp.json();
          if (data.success) {
            output.innerHTML = \`<span class="success">✓ \${data.message}</span>\`;
          } else {
            output.innerHTML = \`<span class="error">✗ \${data.message}</span>\`;
          }
        } catch (err) {
          output.innerHTML = \`<span class="error">Error: \${err.message}</span>\`;
        }
      });
    </script>

    <p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
      <span class="warning">⚠ Temporary endpoint</span> — Delete \`src/app/api/admin/generate-messages/route.ts\` after running.
    </p>
  </body>
</html>
  `, { headers: { 'Content-Type': 'text/html' } });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const quarter = body.quarter;

    if (!quarter || quarter < 1 || quarter > 4) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid quarter. Provide 1, 2, 3, or 4.',
        messagesGenerated: 0,
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    const dataPath = path.join(process.cwd(), 'src', 'data', 'weekly-messages.json');
    const result = await generateQuarterMessages(quarter, dataPath);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({
      success: false,
      message: `Generation failed: ${err}`,
      messagesGenerated: 0,
    }), { headers: { 'Content-Type': 'application/json' } });
  }
}
