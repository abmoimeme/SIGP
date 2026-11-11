import sherpa_onnx, wave, numpy as np, sys, json, re
voice=sys.argv[1]  # siwis or tom
name=f"vits-piper-fr_FR-{voice}-medium";f=f"fr_FR-{voice}-medium"
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=f"{name}/{f}.onnx",tokens=f"{name}/tokens.txt",data_dir=f"{name}/espeak-ng-data"),num_threads=4),max_num_sentences=1)
tts=sherpa_onnx.OfflineTts(cfg)
txt=open('SIGP-script-lecture.txt',encoding='utf-8').read().split('\n\n')
blocks=[t.split('\n',1)[1] for t in txt]
def fix(t):return t.replace('SIGP','S I G P').replace('Nioro Resources','Nioro Ressources').replace('PDF','P D F')
import os;os.makedirs(f'aud_{voice}',exist_ok=True);durs=[]
for i,b in enumerate(blocks):
    parts=re.split(r'(?<=[.!?:;])\s+',fix(b));chunks=[]
    for p in parts:
        a=tts.generate(p,sid=0,speed=0.95);chunks.append(np.array(a.samples,dtype=np.float32));chunks.append(np.zeros(int(a.sample_rate*0.25),dtype=np.float32))
    y=np.concatenate(chunks);sr=a.sample_rate
    w=wave.open(f'aud_{voice}/b{i:02d}.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes((np.clip(y,-1,1)*32767).astype(np.int16).tobytes());w.close()
    durs.append(len(y)/sr);print(i,round(len(y)/sr,1),'s')
json.dump(durs,open(f'durs_{voice}.json','w'))
