from pathlib import Path
import html
import json

ROOT=Path(__file__).resolve().parents[1]
PUB=ROOT/'artifacts'/'public-submission'/'roundtable-ai'
OUT=ROOT/'artifacts'/'submission'
REPO='https://github.com/shhhivam12/agora-decision-rooms'
PREVIEW='https://shhhivam12.github.io/agora-decision-rooms/evaluator/'
VIDEO=PREVIEW+'video.html'

description=(ROOT/'docs'/'submission.md').read_text(encoding='utf-8').split('## Polished project description\n',1)[1].split('\n## Video metadata',1)[0].strip()
description=description.replace('14 Jest tests','17 Jest tests')
paragraphs=[]
for part in description.split('\n\n'):
    if part.startswith('### '):paragraphs.append('<h2>'+html.escape(part[4:])+'</h2>')
    else:paragraphs.append('<p>'+html.escape(part).replace('**','')+'</p>')
description_html='\n'.join(paragraphs)
iframe=f'<iframe src="{VIDEO}" title="RoundTable AI product demo" width="960" height="540" allow="fullscreen; autoplay; picture-in-picture" allowfullscreen></iframe>'
fields={'name':'RoundTable AI — Shared Voice Decisions with Agora','build_type':'project','description_plain':description.replace('### ','').replace('**',''),'description_html':description_html,'link':REPO,'live_app_link':PREVIEW,'video_iframe':iframe,'tags':['Agora','Conversational AI','React Native','Voice AI','TypeScript','Android','FastAPI','Collaboration'],'parent_type':'HackathonTeam','parent_id':8033,'status':'Prepared; not filled or submitted'}
(OUT/'commudle-fields.json').write_text(json.dumps(fields,indent=2,ensure_ascii=False),encoding='utf-8')
(OUT/'commudle-description.html').write_text(description_html,encoding='utf-8')
(OUT/'commudle-video-embed.txt').write_text(iframe,encoding='utf-8')
video_html='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RoundTable AI — Agora Hackathon Demo</title><style>html,body{margin:0;width:100%;height:100%;background:#101016;color:white;font-family:system-ui}video{display:block;width:100%;height:100%;object-fit:contain}a{color:#C9F36A}</style></head><body><video controls playsinline preload="metadata" poster="roundtable-ai-thumbnail.png"><source src="roundtable-ai-demo-1080p.mp4" type="video/mp4">Your browser cannot play this video. <a href="roundtable-ai-demo-1080p.mp4">Download demo</a></video></body></html>'''
(PUB/'docs'/'evaluator'/'video.html').write_text(video_html,encoding='utf-8')
(PUB/'docs'/'index.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=evaluator/"><title>RoundTable AI</title></head><body><a href="evaluator/">Open RoundTable AI</a> · <a href="evaluator/video.html">Watch demo</a> · <a href="evaluator/roundtable-ai-project-presentation.pdf">Project presentation</a></body></html>',encoding='utf-8')

for file in [PUB/'docs'/'submission.md',PUB/'README.md']:
    text=file.read_text(encoding='utf-8')
    if file.name=='README.md':
        text=text.replace('> Talk together. Decide together. Get it done.','> Talk together. Decide together. Get it done.\n\n**Evaluator links:** [Try the app]('+PREVIEW+') · [Watch the narrated demo]('+VIDEO+') · [Project presentation]('+PREVIEW+'roundtable-ai-project-presentation.pdf)\n\nThis public repository contains the sanitized hackathon snapshot. Server credentials and generated dependency folders are excluded. The included Android debug signing key is only for test builds.')
    file.write_text(text,encoding='utf-8')

rows=''.join('<label>'+html.escape(key)+'</label><textarea readonly>'+html.escape(value)+'</textarea>' for key,value in [('Project name',fields['name']),('Source code',fields['link']),('Live preview',fields['live_app_link']),('Video iframe',fields['video_iframe']),('Tags',', '.join(fields['tags'])),('Description',fields['description_plain'])])
sheet='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RoundTable — Submission Fields</title><style>body{font-family:system-ui;max-width:850px;margin:40px auto;padding:20px;background:#fff;color:#111}h1{font-size:32px}label{display:block;font-weight:700;margin:24px 0 8px}textarea{width:100%;height:72px;box-sizing:border-box;padding:12px;border:1px solid #bbb;border-radius:8px;font:15px system-ui}textarea:last-child{height:540px}p{line-height:1.6}a{color:#6345ee}</style></head><body><h1>RoundTable AI submission</h1><p>Prepared for the Commudle form. These fields have not been entered or submitted. Click a field and copy its complete value.</p><p><a href="https://www.commudle.com/builds/create?parent_type=HackathonTeam&amp;parent_id=8033">Open your submission form</a></p>'+rows+'<script>document.querySelectorAll("textarea").forEach(e=>e.addEventListener("click",()=>e.select()))</script></body></html>'
(OUT/'submission-fields.html').write_text(sheet,encoding='utf-8')
print('Public preview files and exact submission field values prepared.')
