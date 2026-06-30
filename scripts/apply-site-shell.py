#!/usr/bin/env python3
"""Apply shared header, fonts, and footer to all HTML pages."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

FONTS = """  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap" rel="stylesheet">"""

NAV_LINKS = """      <a href="/about.html"{about}>Story</a>
      <a href="/model.html"{model}>Model</a>
      <a href="/leaders.html"{leaders}>For leaders</a>
      <a href="/how-we-work.html"{proposal}>Proposal</a>
      <a href="/contact.html"{contact}>Contact</a>
      <a href="/#index">Human Agile Index</a>"""

FOOTER = """  <footer class="site-footer contain">
    <div class="footer-panel">
      <div class="footer-top">
        <a href="/" class="footer-logo">
          <img src="/assets/footer-wordmark.svg" alt="Agile Fragile" width="160" height="64">
        </a>
        <div class="footer-cols">
          <div class="footer-col">
            <span class="footer-label t-b-3">Explore</span>
            <ul>
              <li><a href="/model.html" class="t-h-5">Model</a></li>
              <li><a href="/about.html" class="t-h-5">Story</a></li>
              <li><a href="/leaders.html" class="t-h-5">For leaders</a></li>
              <li><a href="/how-we-work.html" class="t-h-5">Proposal</a></li>
              <li><a href="/#index" class="t-h-5">Human Agile Index</a></li>
              <li><a href="/contact.html" class="t-h-5">Contact</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <span class="footer-label t-b-3">Author</span>
            <ul>
              <li><a href="https://anjishbhondwe.com" class="t-h-5" target="_blank" rel="noopener noreferrer">anjishbhondwe.com</a></li>
              <li><a href="https://www.linkedin.com/in/anjish" class="t-h-5" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <span class="footer-label t-b-3">Email</span>
            <a href="mailto:hello@agilefragile.com" class="footer-email t-b-2">hello@agilefragile.com</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <ul class="footer-legal">
          <li><a href="/privacy.html" class="t-b-3">Privacy</a></li>
        </ul>
        <p class="footer-copy t-b-3">&copy; 2026 Agile Fragile · Proposed by <a href="https://anjishbhondwe.com" class="text-link" target="_blank" rel="noopener noreferrer">Anjish Bhondwe</a></p>
      </div>
    </div>
  </footer>"""

CURRENT_MAP = {
    "about.html": "about",
    "model.html": "model",
    "leaders.html": "leaders",
    "how-we-work.html": "proposal",
    "contact.html": "contact",
    "privacy.html": None,
    "index.html": None,
}


def header_for(page: str) -> str:
    cur = CURRENT_MAP.get(page, {})
    keys = ["about", "model", "leaders", "proposal", "contact"]
    attrs = {k: "" for k in keys}
    if isinstance(cur, str):
        attrs[cur] = ' aria-current="page"'
    links = NAV_LINKS.format(**attrs)
    return f"""  <header class="site-header">
    <a href="/" class="logo">
      <svg class="wordmark-svg logo-wordmark" viewBox="350 20 700 330" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Agile Fragile" fill="none">
        <text class="wordmark-line wordmark-line--header" x="700" y="158" text-anchor="middle">AGILE</text>
        <text class="wordmark-line wordmark-line--header" x="718" y="318" text-anchor="middle">FRAGILE</text>
      </svg>
    </a>
    <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">
      <span></span><span></span><span></span>
    </button>
    <nav class="header-links" id="site-nav">
{links}
    </nav>
  </header>"""


def patch_file(path: Path) -> None:
    text = path.read_text()
    if "fonts.googleapis.com" not in text:
        text = text.replace(
            '  <link rel="stylesheet" href="/assets/site.css">',
            FONTS + "\n  <link rel=\"stylesheet\" href=\"/assets/site.css\">",
        )
    text = re.sub(r"  <header class=\"site-header(?: contain)?\"[^>]*>.*?</header>", header_for(path.name), text, count=1, flags=re.S)
    text = re.sub(r"  <footer class=\"site-footer\"[^>]*>.*?</footer>", FOOTER, text, count=1, flags=re.S)
    path.write_text(text)
    print("patched", path.name)


for html in ROOT.glob("*.html"):
    patch_file(html)
