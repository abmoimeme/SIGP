import json,re,subprocess,sys,os
voice=sys.argv[1];SRC='/mnt/user-data/uploads/2026-11-08_12-16-31.mp4'
durs=json.load(open(f'durs_{voice}.json'))
blocks=[t.split('\n',1)[1] for t in open('SIGP-script-lecture.txt',encoding='utf-8').read().split('\n\n')]
win=[(0,20),(20,70),(70,110),(110,178),(180,240),(240,292),(300,344),(415,50),(558,72),(868,66),(935,30)]
os.makedirs(f'clips_{voice}',exist_ok=True);cues=[];t0=0.0;lst=[]
def ts(x):
    ms=int(round(x*1000));h,r=divmod(ms,3600000);m,r=divmod(r,60000);s,ms=divmod(r,1000);return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
for i,(d,(a,l)) in enumerate(zip(durs,win)):
    T=d+2.0;sp=min(max(l/T,1.0),4.0);use=min(l,T*sp)
    out=f'clips_{voice}/c{i:02d}.mp4'
    vf=f"crop=2006:960:0:90,scale=1920:919,pad=1920:1080:0:80:color=0x182420,setpts=PTS/{sp:.4f},fps=30,tpad=stop_mode=clone:stop_duration=3,trim=duration={T:.3f},setsar=1"
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(a),'-t',str(use),'-i',SRC,'-i',f'aud_{voice}/b{i:02d}.wav','-filter_complex',f"[0:v]{vf}[v];[1:a]adelay=500|500,apad,atrim=duration={T:.3f},aresample=44100[a]",'-map','[v]','-map','[a]','-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-t',f'{T:.3f}',out],check=True)
    lst.append(out)
    sents=re.split(r'(?<=[.!?])\s+',blocks[i]);ch=[]
    for s in sents:
        w=s.split()
        while len(w)>13:ch.append(' '.join(w[:12]));w=w[12:]
        ch.append(' '.join(w))
    tot=sum(len(c) for c in ch);x=t0+0.5
    for c in ch:
        dd=d*len(c)/tot;cues.append((x,x+dd-0.1,c));x+=dd
    t0+=T
def wrap(t,w=60):
    o=[];cur=''
    for word in t.split():
        if len(cur)+len(word)+1>w and cur:o.append(cur);cur=word
        else:cur=(cur+' '+word).strip()
    o.append(cur);return '\n'.join(o)
with open(f'final_{voice}.srt','w',encoding='utf-8') as f:
    for k,(a,b,c) in enumerate(cues,1):f.write(f"{k}\n{ts(a)} --> {ts(b)}\n{wrap(c)}\n\n")
open(f'list_{voice}.txt','w').write(''.join(f"file '{p}'\n" for p in lst))
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',f'list_{voice}.txt','-c','copy',f'joined_{voice}.mp4'],check=True)
style="FontName=DejaVu Sans,FontSize=10,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=1,Outline=1,Shadow=0,Alignment=2,MarginV=14"
subprocess.run(['ffmpeg','-v','error','-y','-i',f'joined_{voice}.mp4','-vf',f"subtitles=final_{voice}.srt:force_style='{style}'",'-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-c:a','copy',f'SIGP_Demo_FR_{voice}.mp4'],check=True)
print('total',round(t0,1),'s')
