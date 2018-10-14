import os from 'os';

import { SpotifyDarwin, SpotifyDefault, SpotifyLinux } from './services';

export type SpotifyAction = 'togglePlayPause' | 'previousTrack' | 'nextTrack';

export interface SpotifyState {
  state: string;
}

export interface SpotifyTrack {
  [key: string]: any;
}

export interface SpotifyService {
  supportedActions: SpotifyAction[];

  isRunning(): Promise<boolean>;

  getState(): Promise<SpotifyState>;

  getTrack(): Promise<SpotifyTrack>;

  togglePlayPause(): Promise<SpotifyState>;

  previousTrack(): Promise<SpotifyTrack>;

  nextTrack(): Promise<SpotifyTrack>;
}

class SpotifyManager {
  private spotifyService: SpotifyService;

  constructor() {
    switch (os.platform()) {
      case 'darwin':
        this.spotifyService = new SpotifyDarwin();
        break;

      case 'linux':
        this.spotifyService = new SpotifyLinux();
        break;

      default:
        this.spotifyService = new SpotifyDefault();
    }
  }

  public supportedActions() {
    return this.spotifyService.supportedActions;
  }

  public isRunning() {
    return this.spotifyService.isRunning();
  }

  public getState() {
    return this.spotifyService.getState();
  }

  public togglePlayPause() {
    return this.spotifyService.togglePlayPause();
  }

  public previousTrack() {
    return this.spotifyService.previousTrack();
  }

  public nextTrack() {
    return this.spotifyService.nextTrack();
  }

  public getTrack() {
    return this.spotifyService.getTrack();
  }
}

export default SpotifyManager;
