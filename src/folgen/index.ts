// Jede neue Folge: JSON-Datei in diesem Ordner anlegen und hier eintragen.
import { Folge } from '../types';
import folge01 from './folge-01.json';
import folge02 from './folge-02.json';

export const folgen: Folge[] = [folge01 as Folge, folge02 as Folge];
