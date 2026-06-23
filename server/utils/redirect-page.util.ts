export function passwordPage(slug: string, error = '') {
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>需要密碼｜Web Lab</title>
  <style>
    body{display:grid;min-height:100vh;place-items:center;margin:0;background:#f8f2df;color:#171714;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    form{width:min(420px,calc(100vw - 32px));border:2px solid #171714;background:#fff;padding:28px;box-shadow:8px 8px 0 #ad9cff}
    h1{margin:0 0 10px;font-size:32px;line-height:1;font-weight:900;letter-spacing:-.04em}
    p{margin:0 0 20px;color:rgba(23,23,20,.68);line-height:1.7}
    input,button{box-sizing:border-box;width:100%;border:2px solid #171714;padding:14px 16px;font:inherit}
    input{background:#f8f2df}
    button{margin-top:12px;background:#171714;color:#fff;font-weight:900;cursor:pointer}
    .error{margin:0 0 14px;border-left:4px solid #ff6b57;background:rgba(255,107,87,.15);padding:10px 12px;color:#171714;font-weight:700}
    code{font-weight:800}
  </style>
</head>
<body>
  <form method="post" action="/s/${slug}">
    <h1>這個短網址有鎖</h1>
    <p>輸入建立者設定的密碼後，才會前往 <code>/s/${slug}</code>。</p>
    ${error ? `<div class="error">${error}</div>` : ''}
    <input name="password" type="password" autocomplete="current-password" placeholder="輸入密碼" autofocus required>
    <button>解鎖前往</button>
  </form>
</body>
</html>`
}

export function imagePasswordPage(slug: string, error = '') {
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>受保護的圖片</title>
  <style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f5f0df;color:#171714;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    form{width:min(420px,calc(100vw - 32px));background:white;border:2px solid #171714;box-shadow:8px 8px 0 #ad9cff;padding:28px}
    h1{margin:0 0 12px;font-size:28px;line-height:1;font-weight:900}
    p{margin:0 0 20px;color:rgb(23 23 20 / .65);font-weight:700;line-height:1.6}
    input,button{box-sizing:border-box;width:100%;border:2px solid #171714;padding:14px 16px;font:inherit;font-weight:800}
    input{background:#f5f0df}
    button{margin-top:12px;background:#171714;color:white;cursor:pointer}
    .error{margin-top:12px;border-left:4px solid #ff6b57;background:rgb(255 107 87 / .16);padding:10px 12px;color:#171714}
  </style>
</head>
<body>
  <form method="post" action="/image/${slug}">
    <h1>這張圖片受到保護</h1>
    <p>請輸入密碼，通過後才會顯示圖片內容。</p>
    <input name="password" type="password" autocomplete="current-password" placeholder="輸入密碼" autofocus required>
    <button type="submit">查看圖片</button>
    ${error ? `<p class="error">${error}</p>` : ''}
  </form>
</body>
</html>`
}

export function imagePage(imageUrl: string, title = '圖片分享', description = '', slug = '') {
  const safeTitle = escapeHtml(title)
  const safeDescription = escapeHtml(description)
  const safeImageUrl = escapeHtml(imageUrl)
  const safeSlug = escapeHtml(slug)
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:image" content="${safeImageUrl}">
  <style>
    :root{--ink:#171714;--paper:#f5f0df;--violet:#ad9cff;--sky:#9be7ff}
    body{margin:0;min-height:100vh;background:linear-gradient(135deg,#f5f0df,#edf8ff);color:var(--ink);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    header{display:flex;align-items:center;justify-content:space-between;max-width:1080px;margin:0 auto;padding:24px}
    .brand{display:inline-flex;align-items:center;gap:10px;font-weight:900;letter-spacing:-.04em}
    .dot{width:28px;height:28px;border:2px solid var(--ink);border-radius:999px;background:#b6ff4d;display:grid;place-items:center;font-size:10px}
    main{max-width:1080px;margin:0 auto;padding:24px 24px 64px;box-sizing:border-box}
    article{border:2px solid var(--ink);background:white;box-shadow:10px 10px 0 var(--violet);overflow:hidden}
    .image-wrap{background:var(--paper);border-bottom:2px solid var(--ink);padding:24px}
    img{display:block;max-width:100%;max-height:62vh;margin:auto;border:2px solid var(--ink);background:white;object-fit:contain}
    .content{padding:24px}
    .eyebrow{margin:0 0 12px;font-size:12px;font-weight:900;letter-spacing:.22em;color:rgb(23 23 20 / .55)}
    h1{margin:0;font-size:clamp(32px,5vw,64px);line-height:.95;font-weight:900;letter-spacing:-.06em}
    p{margin:14px 0 0;color:rgb(23 23 20 / .68);font-weight:700;line-height:1.7}
    a{color:inherit;font-weight:900;text-decoration-thickness:2px;text-underline-offset:4px}
  </style>
  ${safeSlug ? `<script>history.replaceState(null, '', '/image/${safeSlug}')</script>` : ''}
</head>
<body>
  <header>
    <div class="brand"><span class="dot">38</span><span>3854335 WEB LAB</span></div>
    <a href="/links">建立自己的分享連結</a>
  </header>
  <main>
    <article>
      <div class="image-wrap">
        <img src="${safeImageUrl}" alt="${safeTitle}">
      </div>
      <div class="content">
        <p class="eyebrow">PROTECTED IMAGE SHARE</p>
        <h1>${safeTitle}</h1>
        ${safeDescription ? `<p>${safeDescription}</p>` : ''}
      </div>
    </article>
  </main>
</body>
</html>`
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
