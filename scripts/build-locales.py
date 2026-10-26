#!/usr/bin/env python3
"""Build English, Amharic, Afaan Oromoo and Somali static pages. Requires lxml."""
from pathlib import Path
from copy import deepcopy
from lxml import html, etree
from urllib.parse import urlsplit
import json,re

ROOT=Path(__file__).resolve().parents[1]
LANGUAGES={'en':('English','en_US'),'am':('አማርኛ','am_ET'),'om':('Afaan Oromoo','om_ET'),'so':('Soomaali','so_ET')}
VERSION='20261026-portfolio-so'


def fragment(parent, value):
    wrapper=html.fragment_fromstring(value,create_parent='div')
    for child in wrapper.iterdescendants():
        if child.tag not in {'br','span'} or any(k!='class' for k in child.attrib):
            raise ValueError('Only <br> and <span class="…"> are permitted in heading copy')
    for child in list(parent):parent.remove(child)
    parent.text=wrapper.text
    for child in list(wrapper):parent.append(child)


def padded(old,value):
    return re.match(r'^\s*',old or '').group()+value+re.search(r'\s*$',old or '').group()


def local_link(path, prefix):
    if not path or path.startswith(('#','/','https:','http:','data:','mailto:')):return path
    return prefix+path.removeprefix('./')


def language_switcher(lang,copy,prefix):
    switch=html.fragment_fromstring('''<details class="language-switcher" data-language-switcher>
      <summary><svg class="language-globe" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/></svg><span class="language-current"></span><svg class="language-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></summary>
      <div class="language-options"></div>
    </details>''')
    summary=switch.find('summary')
    summary.set('aria-label',copy['language.label']+': '+LANGUAGES[lang][0])
    summary.find('span').text=LANGUAGES[lang][0]
    summary.find('span').set('lang',lang)
    options=switch.find('div');options.set('aria-label',copy['language.label'])
    for code,(name,_) in LANGUAGES.items():
        a=etree.SubElement(options,'a',href=prefix+('' if code=='en' else code+'/'),lang=code,hreflang=code)
        a.set('data-language-link',code)
        if code==lang:a.set('aria-current','page')
        label=etree.SubElement(a,'span');label.text=name
        check=html.fragment_fromstring('<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg>')
        a.append(check)
    return switch


def build(lang,catalog,english,source):
    if set(catalog)!=set(english):
        raise ValueError(f'{lang}: missing {set(english)-set(catalog)}, unexpected {set(catalog)-set(english)}')
    if any(not isinstance(v,str) or not v.strip() for v in catalog.values()):raise ValueError(f'{lang}: empty translation')
    doc=deepcopy(source)
    doc.set('lang',lang);doc.set('dir','ltr')
    for el in list(doc.iter()):
        if not isinstance(el.tag,str):continue
        for attr,key in list(el.attrib.items()):
            if not attr.startswith('data-i18n-'):continue
            kind=attr.removeprefix('data-i18n-');value=catalog[key]
            if kind=='html':fragment(el,value)
            elif kind=='text':el.text=padded(el.text,value)
            elif kind=='tail':el.tail=padded(el.tail,value)
            else:el.set(kind,value)
            del el.attrib[attr]
    # Every localized URL is a complete static document; assets remain shared.
    prefix='./' if lang=='en' else '../'
    for el in doc.iter():
        if not isinstance(el.tag,str):continue
        for attr in ('src','href'):
            if el.get(attr):el.set(attr,local_link(el.get(attr),prefix))
    # Carry the chosen language between the two company websites.
    if lang!='en':
        for link in doc.xpath('//a[@href]'):
            if link.get('href') in {'https://sharedtrucks.com/','https://marketvisiontech.com/'}:
                link.set('href',link.get('href')+lang+'/')
    head=doc.find('head')
    canonical=head.xpath('link[@rel="canonical"]')[0]
    origin=canonical.get('href').rstrip('/')+'/'
    page_url=origin+('' if lang=='en' else lang+'/')
    canonical.set('href',page_url)
    head.xpath('meta[@property="og:url"]')[0].set('content',page_url)
    og_locale=head.xpath('meta[@property="og:locale"]')
    if og_locale:og_locale[0].set('content',LANGUAGES[lang][1])
    else:etree.SubElement(head,'meta',property='og:locale',content=LANGUAGES[lang][1])
    for code,(_,og) in LANGUAGES.items():
        etree.SubElement(head,'link',rel='alternate',hreflang=code,href=origin+('' if code=='en' else code+'/'))
        if code!=lang:etree.SubElement(head,'meta',property='og:locale:alternate',content=og)
    etree.SubElement(head,'link',rel='alternate',hreflang='x-default',href=origin)
    for el in head.xpath('link[@rel="stylesheet"]|script[@src]'):
        attr='href' if el.tag=='link' else 'src'
        path=el.get(attr)
        if 'styles.css' in path or 'script.js' in path:el.set(attr,path.split('?')[0]+'?v='+VERSION)
    etree.SubElement(head,'link',rel='stylesheet',href=prefix+'languages.css?v='+VERSION)
    if lang=='am':etree.SubElement(head,'link',rel='preload',href=prefix+'assets/noto-sans-ethiopic.woff',**{'as':'font','type':'font/woff','crossorigin':''})
    runtime=etree.Element('script',type='application/json',id='site-copy')
    runtime.text=json.dumps({k:v for k,v in catalog.items() if k.startswith(('nav.','form.','validation.'))},ensure_ascii=False).replace('<','\\u003c')
    first_script=head.find('script')
    head.insert(head.index(first_script) if first_script is not None else len(head),runtime)
    language_script=etree.Element('script',src=prefix+'languages.js?v='+VERSION,defer='')
    head.insert(head.index(runtime)+1,language_script)
    header=doc.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," header-inner ")]')[0]
    toggle=header.xpath('./button')[0]
    header.remove(toggle)
    header.append(language_switcher(lang,catalog,prefix))
    header.append(toggle)
    # Normalize source brand types to retain the approved Latin lettering.
    for el in doc.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," brand-type ") or contains(concat(" ",normalize-space(@class)," ")," footer-wordmark ")]'):
        el.set('lang','en')
    for svg in doc.xpath('//svg[contains(@class,"platform-illustration")]'):
        svg.attrib.pop('aria-labelledby',None)
    # Inline SVG text uses the same font as the surrounding localized page.
    for el in doc.xpath('//svg[contains(@class,"platform-illustration")]//text'):
        el.set('font-family','inherit')
        if lang=='am':el.set('letter-spacing','0')
    destination=ROOT/('index.html' if lang=='en' else lang+'/index.html')
    destination.parent.mkdir(parents=True,exist_ok=True)
    destination.write_text('<!doctype html>\n'+etree.tostring(doc,encoding='unicode',method='html')+'\n',encoding='utf-8')
    return page_url


def build_error(source):
    doc=html.document_fromstring((ROOT/'error-template.html').read_text(encoding='utf-8'))
    origin=source.xpath('//link[@rel="canonical"]')[0].get('href').rstrip('/')+'/'
    head=doc.find('head')
    for old in doc.xpath('//script'):old.getparent().remove(old)
    if not head.xpath('meta[@name="robots"]'):etree.SubElement(head,'meta',name='robots',content='noindex')
    etree.SubElement(head,'link',rel='stylesheet',href=origin+'languages.css?v='+VERSION)
    main=doc.find('body').find('main')
    main.find('h1').set('id','error-title');main.find('p').set('id','error-description')
    home=main.xpath('./a[not(contains(@class,"brand"))]')[0]
    home.set('id','error-home');home.set('href',origin)
    nav=etree.SubElement(main,'nav',**{'class':'error-languages','aria-label':'Choose language'})
    for code,(name,_) in LANGUAGES.items():
        etree.SubElement(nav,'a',href=origin+('' if code=='en' else code+'/'),lang=code,hreflang=code).text=name
    style=etree.SubElement(head,'style')
    style.text='.error-languages{display:flex;flex-wrap:wrap;gap:8px;margin-top:28px}.error-languages a{display:inline-flex;align-items:center;min-height:44px;padding:8px 12px;border:1px solid currentColor;background:transparent;color:inherit;font-size:14px}.error-languages [lang="am"]{font-family:"Noto Sans Ethiopic",sans-serif}html[lang="am"] .error-content h1{font-size:42px;letter-spacing:0;line-height:1.35}'
    copies={code:{key:value for key,value in json.loads((ROOT/'locales'/f'{code}.json').read_text()).items() if key.startswith('error.') or key=='language.label'} for code in LANGUAGES}
    script=etree.SubElement(doc.find('body'),'script')
    script.text='(function(){const copies='+json.dumps(copies,ensure_ascii=False).replace('<','\\u003c')+';const origin='+json.dumps(origin)+';const lang=location.pathname.split("/").find(part=>Object.prototype.hasOwnProperty.call(copies,part))||"en";const copy=copies[lang];document.documentElement.lang=lang;document.querySelector(".error-languages").setAttribute("aria-label",copy["language.label"]);document.title=copy["error.title"]+" — "+'+json.dumps('SharedTrucks Logistics' if 'sharedtrucks' in origin else 'MarketVision Technology')+';document.getElementById("error-title").textContent=copy["error.title"];document.getElementById("error-description").textContent=copy["error.description"];const home=document.getElementById("error-home");home.textContent=copy["error.home"];home.href=origin+(lang==="en"?"":lang+"/");}());'
    (ROOT/'404.html').write_text('<!doctype html>\n'+etree.tostring(doc,encoding='unicode',method='html')+'\n',encoding='utf-8')


def main():
    source=html.document_fromstring((ROOT/'site-template.html').read_text(encoding='utf-8'))
    english=json.loads((ROOT/'locales/en.json').read_text(encoding='utf-8'))
    urls=[]
    for lang in LANGUAGES:
        path=ROOT/'locales'/f'{lang}.json'
        if not path.exists():raise SystemExit(f'Missing {path}; translations must be complete before building.')
        urls.append(build(lang,json.loads(path.read_text(encoding='utf-8')),english,source))
    NS='http://www.sitemaps.org/schemas/sitemap/0.9';XHTML='http://www.w3.org/1999/xhtml'
    sitemap=etree.Element('{'+NS+'}urlset',nsmap={None:NS,'xhtml':XHTML})
    for url in urls:
        entry=etree.SubElement(sitemap,'{'+NS+'}url');etree.SubElement(entry,'{'+NS+'}loc').text=url
        for code,href in zip(LANGUAGES,urls):etree.SubElement(entry,'{'+XHTML+'}link',rel='alternate',hreflang=code,href=href)
        etree.SubElement(entry,'{'+XHTML+'}link',rel='alternate',hreflang='x-default',href=urls[0])
    (ROOT/'sitemap.xml').write_bytes(etree.tostring(sitemap,xml_declaration=True,encoding='UTF-8',pretty_print=True))
    build_error(source)
    print(f'Built {len(urls)} languages with {len(english)} complete strings each.')

if __name__=='__main__':main()
