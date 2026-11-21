# Schritt 1: Adobe-WAV auf den Zeitverlauf der bisherigen szene-N.mp3 bringen (Tempo + gekürzte Pausen nachbauen).
# Aufruf: python3 scripts/adobe/warp.py 02 /tmp/arbeit   -> /tmp/arbeit/tN.f32 (48 kHz mono float)
import numpy as np,subprocess,sys,glob,os,re
SR=48000
def dec(f,sr=SR): return np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",f,"-ar",str(sr),"-ac","1","-f","f32le","-"],capture_output=True).stdout,dtype=np.float32).copy()
def stretch(x,L):
    if len(x)<64: return np.zeros(L,np.float32)
    r=len(x)/L
    if abs(r-1)<1e-4: y=x
    else:
        y=np.frombuffer(subprocess.run(["ffmpeg","-v","error","-f","f32le","-ar",str(SR),"-ac","1","-i","-","-af",f"atempo={r:.6f}","-f","f32le","-"],input=x.tobytes(),capture_output=True).stdout,dtype=np.float32)
    y=y[:L]; 
    if len(y)<L: y=np.concatenate([y,np.zeros(L-len(y),np.float32)])
    return y
def fade(y,n=240):
    n=min(n,len(y)//2); 
    if n>0: y[:n]*=np.linspace(0,1,n); y[-n:]*=np.linspace(1,0,n)
    return y
def points(c,o,sr=16000,W=3200,step=800):
    pts=[]
    n=1<<int(np.ceil(np.log2(len(o)+W))); O=np.fft.rfft(o,n); e=np.sqrt(np.convolve(o*o,np.ones(W),'valid')+1e-9)
    for s in range(0,len(c)-W,step):
        a=c[s:s+W]
        if np.sqrt((a*a).mean())<0.01: continue
        r=np.fft.irfft(O*np.conj(np.fft.rfft(a,n)),n)[:len(e)]
        v=r/(e*np.sqrt((a*a).sum())); k=int(np.argmax(v))
        if v[k]>0.7: pts.append(((s+W/2)/sr,(k+W/2)/sr,v[k]))
    return np.array(pts)
def chunks(c,sr=SR):
    F=int(0.01*sr); m=len(c)//F; rms=np.sqrt((c[:m*F].reshape(m,F)**2).mean(1)); thr=rms.max()*10**(-40/20)
    sp=rms>thr; out=[]; i=0
    while i<m:
        if sp[i]:
            j=i
            while j<m and (sp[j] or (j+1<m and not sp[j] and np.any(sp[j:j+8]))): j+=1   # bridge gaps <80ms
            out.append([i*F/sr,j*F/sr]); i=j
        else: i+=1
    return out
nr=sys.argv[1]; D=sys.argv[3] if len(sys.argv)>3 else f"public/audio/folge-{nr}"; T=sys.argv[2]; os.makedirs(T,exist_ok=True)
for f in sorted(glob.glob(f"{D}/szene-*.mp3")):
    i=re.search(r"szene-(\d+)",f).group(1)
    wav=[w for w in glob.glob(f"{D}/*.wav") if re.search(rf"(?i)(szene|script)-?{i}-",os.path.basename(w).replace(' ',''))][0]
    c=dec(f); o=dec(glob.glob(f"{D}/original/szene-{i}.*")[0]); w=dec(wav)
    c16=dec(f,16000); o16=dec(glob.glob(f"{D}/original/szene-{i}.*")[0],16000)
    P=points(c16,o16); ch=chunks(c)
    sl=[]
    for cs,ce in ch:
        q=P[(P[:,0]>=cs)&(P[:,0]<=ce)]
        if len(q)>=8: sl.append(np.polyfit(q[:,0],q[:,1],1)[0])
    bglob=float(np.median(sl)) if sl else 1.0
    maps=[]
    for cs,ce in ch:
        q=P[(P[:,0]>=cs)&(P[:,0]<=ce)]
        if ce-cs<0.1: continue
        if len(q)>=4 and q[-1,0]-q[0,0]>0.15:
            for _ in range(4):
                b,a=np.polyfit(q[:,0],q[:,1],1)
                r=np.abs(q[:,1]-(a+b*q[:,0])); keep=r<max(0.02,np.median(r)*3)
                if keep.all() or keep.sum()<4: break
                q=q[keep]
            if abs(b-bglob)>0.02: b=bglob; a=np.median(q[:,1]-b*q[:,0])
        elif len(q)>=1: b=bglob; a=np.median(q[:,1]-b*q[:,0])
        else: b=bglob; a=None
        maps.append((cs,ce,a,b))
    out=np.zeros(len(c),np.float32); log=[]
    prev_oe=None; prev_ce=0.0
    for k,(cs,ce,a,b) in enumerate(maps):
        if a is None: continue
        os_,oe=a+b*cs,a+b*ce
        # gap before chunk
        gs,ge=int(prev_ce*SR),int(cs*SR); go_s=int((prev_oe if prev_oe is not None else os_-(cs-prev_ce))*SR); go_e=int(os_*SR)
        L=ge-gs
        if L>0:
            seg=w[max(0,go_s):max(0,go_e)]
            if len(seg)>=L: seg=np.concatenate([seg[:L//2],seg[len(seg)-(L-L//2):]])
            else: seg=np.concatenate([seg[:len(seg)//2],np.zeros(L-len(seg),np.float32),seg[len(seg)//2:]])
            out[gs:ge]=fade(seg.copy(),48)
        L=int(ce*SR)-int(cs*SR)
        out[int(cs*SR):int(cs*SR)+L]=fade(stretch(w[int(os_*SR):int(oe*SR)],L).copy(),48)
        log.append(f"{cs:.2f}-{ce:.2f}:x{b:.3f}")
        prev_oe,prev_ce=oe,ce
    # tail
    L=len(c)-int(prev_ce*SR); seg=w[int(prev_oe*SR):int(prev_oe*SR)+L]; out[len(c)-L:len(c)-L+len(seg)]=seg
    out[:int(0.02*SR)]*=np.linspace(0,1,int(0.02*SR)); out[-int(0.03*SR):]*=np.linspace(1,0,int(0.03*SR))
    out.tofile(f"{T}/t{i}.f32")
    print(f"szene {i}: {wav.split('/')[-1]} chunks={len(ch)} "+" ".join(log))
