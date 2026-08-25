#!/usr/bin/env python3
"""Собирает весь сайт в один самодостаточный HTML-файл.

    python3 build-single.py            →  AG-Peptides.html

Стили, скрипты и все фотографии (как data:URI) вшиваются внутрь, поэтому файл
открывается двойным кликом без сервера и спокойно проходит через почту:
внутри нет ни одного вложения с расширением, которое блокирует Gmail.
"""
import base64, pathlib, re, sys

ROOT = pathlib.Path(__file__).parent
OUT = ROOT / 'AG-Peptides.html'

CSS = ROOT / 'assets/css/style.css'
JS = ['data', 'ui', 'store', 'views', 'account', 'app']   # порядок важен
IMG = ROOT / 'assets/img'


def main():
    html = (ROOT / 'index.html').read_text(encoding='utf-8')

    # фотографии → data:URI
    imgs = sorted(IMG.glob('*.jpg'))
    if not imgs:
        sys.exit('Не найдено ни одной фотографии в assets/img/')
    pairs = []
    for f in imgs:
        b64 = base64.b64encode(f.read_bytes()).decode('ascii')
        pairs.append('"%s":"data:image/jpeg;base64,%s"' % (f.name, b64))
    img_js = 'const IMG_DATA = {\n' + ',\n'.join(pairs) + '\n};'

    # превью карточек сертификатов + страницы отчётов для автономного просмотра.
    # Сами PDF (21 МБ) не вшиваем — файл перестал бы пролезать в письмо;
    # карточки на сайте всё равно ведут на отдельные PDF в assets/coa/.
    def datauri_map(folder, const):
        files = sorted((IMG.parent / 'coa' / folder).glob('*.jpg'))
        items = ['"%s":"data:image/jpeg;base64,%s"'
                 % (f.stem, base64.b64encode(f.read_bytes()).decode('ascii')) for f in files]
        return 'const %s = {\n%s\n};' % (const, ',\n'.join(items)), len(items)

    shots_js, n_shots = datauri_map('preview', 'COA_SHOTS')
    pages_js, n_pages = datauri_map('page', 'COA_PAGES')

    # стили вместо <link>
    css = CSS.read_text(encoding='utf-8')
    # lambda, а не строка: иначе \g, \s и прочие escape-последовательности
    # внутри CSS/JS будут разобраны как шаблон замены и всё сломают
    html = re.sub(r'<link rel="stylesheet" href="assets/css/style\.css[^"]*">',
                  lambda _m: '<style>\n%s\n</style>' % css, html, count=1)

    # скрипты вместо шести <script src>
    bundle = [img_js, shots_js, pages_js]
    for name in JS:
        bundle.append('/* ==== %s.js ==== */\n%s'
                      % (name, (ROOT / ('assets/js/%s.js' % name)).read_text(encoding='utf-8')))
    joined = '\n'.join(bundle)
    html = re.sub(r'<script src="assets/js/data\.js[^"]*"></script>',
                  lambda _m: '<script>\n%s\n</script>' % joined, html, count=1)
    html = re.sub(r'\s*<script src="assets/js/(?!data\.)[a-z]+\.js[^"]*"></script>', '', html)

    OUT.write_text(html, encoding='utf-8')
    print('%s — %.1f МБ · фотографий %d · сертификатов %d'
          % (OUT.name, OUT.stat().st_size / 1048576, len(imgs), n_pages))


if __name__ == '__main__':
    main()
