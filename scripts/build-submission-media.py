"""Create the narrated 1080p product demo, thumbnail, captions and PDF presentation.

All product imagery is captured from the real local app. No live voice call is
fabricated. Neural narration is clearly a presentation voiceover.
"""
import asyncio
import json
import os
from pathlib import Path
import subprocess
import sys
import textwrap

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts' / 'submission'
sys.path.insert(0, str(ROOT / 'artifacts' / 'tools'))
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
import edge_tts
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

FFDIR = Path(r'S:\Current projects\Paytm Design Hackathon\tools\ffmpeg-static\ffmpeg-n9.0-latest-win64-lgpl-9.0\bin')
FFMPEG, FFPROBE = str(FFDIR / 'ffmpeg.exe'), str(FFDIR / 'ffprobe.exe')
FONTDIR = Path(r'C:\Windows\Fonts')
REG, BOLD = str(FONTDIR/'segoeui.ttf'), str(FONTDIR/'segoeuib.ttf')
SCENES = json.loads((ROOT/'scripts'/'submission-scenes.json').read_text(encoding='utf-8'))
BG, INK, MUTED, LIME, PURPLE = '#101016', '#FFFFFF', '#B5ADC5', '#C9F36A', '#7657FF'
OUT.mkdir(parents=True,exist_ok=True)
for directory in ['audio','frames','clips','qa']:
    (OUT/directory).mkdir(exist_ok=True)

def run(args):
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL)

def probe(file):
    data=json.loads(subprocess.check_output([FFPROBE,'-v','error','-show_format','-show_streams','-of','json',str(file)]))
    return data

def font(size,bold=False):
    return ImageFont.truetype(BOLD if bold else REG,size)

def draw_wrapped(draw,text,xy,size,fill,width,bold=False,gap=1.35):
    x,y=xy
    f=font(size,bold)
    for paragraph in text.split('\n'):
        words=paragraph.split()
        line=''
        for word in words:
            trial=(line+' '+word).strip()
            if draw.textlength(trial,font=f)>width and line:
                draw.text((x,y),line,font=f,fill=fill)
                y+=int(size*gap)
                line=word
            else: line=trial
        draw.text((x,y),line,font=f,fill=fill)
        y+=int(size*gap)
    return y

def paste_logo(img,filename,box):
    logo=Image.open(filename).convert('RGBA')
    logo.thumbnail(box[2:])
    img.paste(logo,(box[0],box[1]),logo)

def frame(scene,index,with_phone=True):
    img=Image.new('RGB',(1920,1080),BG)
    d=ImageDraw.Draw(img)
    d.rectangle((0,0,14,1080),fill=PURPLE)
    paste_logo(img,ROOT/'mobile/assets/branding/roundtable-app-icon-v3.png',(85,58,62,62))
    d.text((165,68),'RoundTable AI',font=font(34,True),fill=INK)
    d.text((85,167),scene['label'],font=font(22,True),fill=LIME)
    if scene.get('kind') == 'conversation':
        draw_wrapped(d,scene['title'],(85,228),70,INK,1170,True,1.16)
        for person_index,(person_id,person_name) in enumerate([('ayaan','Ayaan'),('priya','Priya'),('host','You')]):
            x=85+380*person_index
            selected=scene['speaker']==person_id
            photo=ImageOps.fit(Image.open(OUT/'photos'/f'{person_id}-source.jpg').convert('RGB'),(350,245),centering=(.5,.4),method=Image.Resampling.LANCZOS)
            mask=Image.new('L',(350,245));ImageDraw.Draw(mask).rounded_rectangle((0,0,350,245),radius=20,fill=255)
            img.paste(photo,(x,365),mask)
            d.rounded_rectangle((x,365,x+350,665),radius=20,outline=LIME if selected else '#514567',width=5 if selected else 2)
            d.rounded_rectangle((x+2,610,x+348,663),radius=12,fill='#292333')
            d.text((x+16,624),person_name,font=font(24,True),fill=INK)
            d.text((x+214,628),'Speaking' if selected else 'Listening',font=font(17,True),fill=LIME if selected else MUTED)
        d.text((85,699),scene['speakerName'].upper()+' /',font=font(21,True),fill=LIME)
        draw_wrapped(d,'“'+scene['body']+'”',(85,740),38,INK,1135,False,1.2)
        draw_wrapped(d,scene['proof'],(85,882),20,MUTED,1110)
    else:
        y=draw_wrapped(d,scene['title'],(85,228),70,INK,1170,True,1.16)
        y=draw_wrapped(d,scene['body'],(87,y+43),32,MUTED,1120,False,1.5)
        d.line((85,785,1190,785),fill='#3D344E',width=2)
        draw_wrapped(d,scene['proof'],(85,809),24,LIME,1110)
    d.text((85,984),'AGORA VOICE AI HACKATHON 2026',font=font(19,True),fill=MUTED)
    d.text((1113,984),f'{index+1:02d} / {len(SCENES):02d}',font=font(19),fill=MUTED)
    d.rounded_rectangle((1351,67,1804,1014),radius=38,fill='#08080B',outline='#514567',width=3)
    if with_phone:
        shot=Image.open(OUT/'screenshots'/f"{scene['shot']}.png").convert('RGB').resize((430,900),Image.Resampling.LANCZOS)
        img.paste(shot,(1363,90))
    d.text((1370,30),'ACTUAL PRODUCT WALKTHROUGH',font=font(16,True),fill=MUTED)
    paste_logo(img,ROOT/'mobile/assets/branding/agora-wordmark.webp',(650,960,150,52))
    d.text((650,929),'BUILT FOR',font=font(14,True),fill=MUTED)
    return img

async def narrate():
    semaphore=asyncio.Semaphore(3)
    async def one(scene):
        filename=OUT/'audio'/f"{scene['id']}.mp3"
        if filename.exists() and filename.stat().st_size>1000:return
        async with semaphore:
            for attempt in range(3):
                try:
                    await edge_tts.Communicate(scene['narration'],scene.get('voice','en-IN-NeerjaNeural'),rate='+4%').save(str(filename))
                    print('Narrated '+scene['id'],flush=True)
                    return
                except Exception:
                    if attempt==2: raise
                    await asyncio.sleep(1)
    await asyncio.gather(*(one(s) for s in SCENES))

def subtitles(durations):
    cursor=0
    lines=[]
    number=1
    def stamp(seconds):
        ms=round(seconds*1000)
        return f'{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d},{ms%1000:03d}'
    for scene,duration in zip(SCENES,durations):
        words=scene['narration'].split()
        chunks=[' '.join(words[i:i+13]) for i in range(0,len(words),13)]
        spoken=duration-.8
        for i,chunk in enumerate(chunks):
            start=cursor+.2+i*spoken/len(chunks)
            end=cursor+.2+(i+1)*spoken/len(chunks)
            lines.append(f'{number}\n{stamp(start)} --> {stamp(end)}\n{chunk}\n')
            number+=1
        cursor+=duration
    (OUT/'roundtable-demo-captions.srt').write_text('\n'.join(lines),encoding='utf-8')

def video():
    raw=OUT/'raw'/'roundtable-product-walkthrough.webm'
    durations=[]
    for index,scene in enumerate(SCENES):
        audio=OUT/'audio'/f"{scene['id']}.mp3"
        duration=float(probe(audio)['format']['duration'])+.8
        durations.append(duration)
        plate=OUT/'frames'/f"{scene['id']}-plate.png"
        frame(scene,index,False).save(plate)
        still=OUT/'frames'/f"{scene['id']}.png"
        frame(scene,index).save(still)
        clip=OUT/'clips'/f"{scene['id']}.mp4"
        if clip.exists() and clip.stat().st_size>1000:continue
        source_duration=scene['end']-scene['start']
        phone_source = ['-loop','1','-framerate','30','-i',str(OUT/'screenshots'/f"{scene['shot']}.png")] if scene['id'] in ['09-agora','10-pipeline'] or scene.get('kind') == 'conversation' else ['-ss',str(scene['start']),'-t',str(source_duration),'-i',str(raw)]
        filters=f'[1:v]scale=430:900,setsar=1,tpad=stop_mode=clone:stop_duration={duration},trim=duration={duration},setpts=PTS-STARTPTS[phone];[0:v][phone]overlay=1363:90:shortest=1,format=yuv420p[v]'
        run([FFMPEG,'-hide_banner','-loglevel','error','-y','-loop','1','-framerate','30','-i',str(plate),*phone_source,'-i',str(audio),'-filter_complex',filters,'-map','[v]','-map','2:a','-t',str(duration),'-c:v','libopenh264','-b:v','6M','-g','60','-c:a','aac','-b:a','192k','-ar','48000',str(clip)])
        print('Rendered '+scene['id'],flush=True)
    concat=OUT/'clips'/'concat.txt'
    concat.write_text('\n'.join("file '"+s['id']+".mp4'" for s in SCENES),encoding='utf-8')
    joined=OUT/'raw'/'joined.mp4'
    run([FFMPEG,'-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(concat),'-c','copy',str(joined)])
    final=OUT/'roundtable-ai-demo-1080p.mp4'
    run([FFMPEG,'-hide_banner','-loglevel','error','-y','-i',str(joined),'-af','loudnorm=I=-16:TP=-1.5:LRA=7','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',str(final)])
    subtitles(durations)
    metadata=probe(final)
    (OUT/'video-verification.json').write_text(json.dumps({'duration':sum(durations),'sceneDurations':durations,'bytes':final.stat().st_size,'probe':metadata,'source':'Actual local app interaction recording','voiceover':'Synthetic presentation narration and distinct scripted participant voices','illustrativeConversation':True,'liveAgoraCallShown':False},indent=2),encoding='utf-8')
    frame(SCENES[0],0).resize((1600,900),Image.Resampling.LANCZOS).save(OUT/'roundtable-ai-thumbnail.png')
    print(f'Video ready: {sum(durations):.1f} seconds',flush=True)

def presentation():
    pdfmetrics.registerFont(TTFont('Segoe',REG))
    pdfmetrics.registerFont(TTFont('SegoeBold',BOLD))
    slides=[
        ('RoundTable AI','Talk together. Decide together. Get it done.',['A mobile decision room for the whole group','Shared Smart Stage, voting, approval and receipts','Built by Shivam Mahendru for the Agora Voice AI Hackathon'], '01-home'),
        ('The group planning problem','Every participant has different constraints',['Budgets, diets, travel time and availability conflict','A chat thread makes the trade-offs difficult to compare','RoundTable makes the brief and decision process visible'], '03-brief'),
        ('The complete guided journey','One goal becomes a reviewable decision',['Create → brief → search → comparison','Voting → approval → local receipt','Budget, rain and early-departure scenarios'], '07-compare'),
        ('People stay in control','The agent proposes; application state governs',['All three simulated votes must be recorded','Host reviews the exact proposed action','Agent pause, captions and activity log stay visible'], '10-approve'),
        ('Agora integration','Real-time voice foundation in the native client',['RTC: microphone publication and agent audio','RTM: live transcripts and agent state','Agent Client Toolkit: lifecycle and state events','FastAPI: short-lived tokens; start and stop sessions'], '14-agora'),
        ('Conversational AI pipeline','Live backend verified with the Agora Python SDK',['Deepgram STT → OpenAI model → MiniMax speech','Voice activity detection and interruption configuration','Live token generation and agent start/stop verified','Android microphone and audible playback test pending'], '14-agora'),
        ('Implementation and evaluation','A working mobile prototype with clear boundaries',['React Native + TypeScript; Android packaging workflow','17 Jest tests, TypeScript and web production build pass','2 backend tests pass; actual browser journey captured','Group sync, live venues and external calendar are next'], '11-receipt'),
        ('Try RoundTable','Evaluate the decision journey in minutes',['Run the public preview or install the latest Android build','Use the guided budget scenario through the receipt','Native voice: Me → Open Agora voice → backend URL','Public source: shhhivam12/roundtable-ai-hackathon'], '01-home'),
    ]
    c=canvas.Canvas(str(OUT/'roundtable-ai-project-presentation.pdf'),pagesize=(960,540))
    c.setTitle('RoundTable AI — Agora Voice AI Hackathon Project Presentation')
    c.setAuthor('Shivam Mahendru')
    for i,(title,sub,body,shot) in enumerate(slides):
        c.setFillColor(BG);c.rect(0,0,960,540,fill=1,stroke=0)
        c.setFillColor(PURPLE);c.rect(0,0,7,540,fill=1,stroke=0)
        c.setFont('SegoeBold',11);c.setFillColor(LIME);c.drawString(40,483,'ROUNDTABLE AI / AGORA VOICE AI HACKATHON 2026')
        c.setFont('SegoeBold',32);c.setFillColor('#FFFFFF');c.drawString(40,421,title)
        c.setFont('Segoe',16);c.setFillColor(MUTED);c.drawString(40,383,sub)
        y=324
        for text in body:
            c.setFillColor(LIME);c.setFont('SegoeBold',14);c.drawString(40,y,'•')
            c.setFillColor('#E1DAEC');c.setFont('Segoe',16)
            parts=textwrap.wrap(text,width=61)
            for part in parts:
                c.drawString(58,y,part);y-=24
            y-=18
        c.drawImage(ImageReader(str(OUT/'screenshots'/f'{shot}.png')),705,48,width=215,height=450,mask='auto')
        c.drawImage(ImageReader(str(ROOT/'mobile/assets/branding/agora-wordmark.webp')),40,36,width=83,height=28,preserveAspectRatio=True,mask='auto')
        c.setFillColor(MUTED);c.setFont('Segoe',10);c.drawString(151,45,'Talk together. Decide together. Get it done.');c.drawRightString(677,45,f'{i+1:02d} / {len(slides):02d}')
        c.showPage()
    c.save()
    print('8-page project presentation ready',flush=True)

if __name__=='__main__':
    mode=sys.argv[1] if len(sys.argv)>1 else 'all'
    if mode in ['all','audio']:asyncio.run(narrate())
    if mode in ['all','video']:video()
    if mode in ['all','pdf']:presentation()
