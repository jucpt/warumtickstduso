import React from 'react';
import { Composition, Still } from 'remotion';
import { BREITE, FPS, HOEHE, ladeSchrift } from './brand';
import { Cover } from './Cover';
import { FolgeVideo, folgenFrames } from './Folge';
import { folgen } from './folgen';

ladeSchrift();

const nr = (n: number) => String(n).padStart(2, '0');

export const RemotionRoot: React.FC = () => (
  <>
    {folgen.map((folge) => (
      <React.Fragment key={folge.nummer}>
        <Composition
          id={`Folge-${nr(folge.nummer)}`}
          component={FolgeVideo}
          durationInFrames={folgenFrames(folge)}
          fps={FPS}
          width={BREITE}
          height={HOEHE}
          defaultProps={{ folge }}
        />
        <Still id={`Cover-${nr(folge.nummer)}`} component={Cover} width={BREITE} height={HOEHE} defaultProps={{ folge }} />
      </React.Fragment>
    ))}
  </>
);
