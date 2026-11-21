# Schritt 2: auf -19,3 LUFS bringen, MP3 schreiben, Versatz zur alten MP3 prüfen.
# Aufruf: python3 scripts/adobe/fin.py 02 /tmp/arbeit   -> /tmp/arbeit/szene-N.mp3
import numpy as np,subprocess,sys,glob,re
nr=sys.argv[1]; T=sys.argv[2]; D=sys.argv[3] if len(sys.argv)>3 else f"public/audio/folge-{nr}"
def dec(f,sr): return np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",f,"-ar",str(sr),"-ac","1","-f","f32le","-"],capture_output=True).stdout,dtype=np.float32)
def meas(f,raw=False):
    a=(["-f","f32le","-ar","48000","-ac","1"] if raw else [])
    o=subprocess.run(["ffmpeg","-nostats"]+a+["-i",f,"-af","ebur128=peak=true","-f","null","-"],capture_output=True,text=True).stderr
    o=o[o.rfind("Summary"):]; return float(re.search(r"I:\s+(-?[\d.]+)",o).group(1)), float(re.search(r"Peak:\s+(-?[\d.]+)",o).group(1))
for f in sorted(glob.glob(f"{D}/szene-*.mp3")):
    i=re.search(r"szene-(\d+)",f).group(1); t=f"{T}/t{i}.f32"; out=f"{T}/szene-{i}.mp3"
    I,_=meas(t,True); g=-19.3-I
    for _ in range(2):
        subprocess.run(["ffmpeg","-v","error","-y","-f","f32le","-ar","48000","-ac","1","-i",t,"-af",f"volume={g:.2f}dB,alimiter=limit=0.84:level=false:attack=2:release=50,aresample=44100","-c:a","libmp3lame","-b:a","160k",out],check=True)
        I2,P2=meas(out); g+=-19.3-I2
    a16=dec(f,16000); n16=dec(out,16000); lags=[]
    for s in range(0,len(a16)-8000,4000):
        a=a16[s:s+8000]
        if np.abs(a).max()<0.02: continue
        best=max(((a*n16[s+l:s+l+8000]).sum()/np.sqrt((a*a).sum()*(n16[s+l:s+l+8000]**2).sum()+1e-9),l) for l in range(-1200,1201,4) if 0<=s+l and s+l+8000<=len(n16))
        lags.append((abs(best[1])/16,best[0]))
    L=np.array(lags)
    print(f"szene {i}: LUFS={I2} TP={P2} drift max={L[:,0].max():.1f}ms median={np.median(L[:,0]):.1f}ms windows>25ms={int((L[:,0]>25).sum())}/{len(L)} dur {len(a16)/16000:.3f}->{len(n16)/16000:.3f}")
