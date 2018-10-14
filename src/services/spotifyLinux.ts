import dbus, { DBusInterface, DBusService, SessionBus } from 'dbus-native';
import { join, reduce, split, toLower } from 'lodash';

import { SpotifyAction, SpotifyService, SpotifyState, SpotifyTrack } from '../index';

interface SpotifyDBusInterface extends DBusInterface {
  PlaybackStatus(callback: (err: string, status: string) => void): void;

  PlayPause(callback: () => void): void;

  Next(callback: () => void): void;

  Previous(callback: () => void): void;

  Metadata(callback: (err: string, metada: SpotifyTrack) => void): void;
}

class SpotifyLinux implements SpotifyService {
  public supportedActions: SpotifyAction[] = ['togglePlayPause', 'previousTrack', 'nextTrack'];

  private sessionBus: SessionBus;

  private spotifyService: DBusService;

  constructor() {
    this.sessionBus = dbus.sessionBus();
    this.spotifyService = this.sessionBus.getService('org.mpris.MediaPlayer2.spotify');
  }

  public async isRunning(): Promise<boolean> {
    return this._getSpotifyInterface()
      .then(() => Promise.resolve(true))
      .catch(() => Promise.resolve(false));
  }

  public async getState(): Promise<SpotifyState> {
    const s = await this._getSpotifyInterface();
    const st = await this._getPlaybackStatus(s);

    return {
      state: toLower(st)
    };
  }

  public async getTrack(): Promise<SpotifyTrack> {
    const s = await this._getSpotifyInterface();
    return this._getMetadata(s);
  }

  public async togglePlayPause(): Promise<SpotifyState> {
    const s = await this._getSpotifyInterface();

    await this._playPause(s);

    const st = await this._getPlaybackStatus(s);

    return {
      state: toLower(st)
    };
  }

  public async previousTrack(): Promise<SpotifyTrack> {
    const s = await this._getSpotifyInterface();

    await this._previous(s);

    return this._getMetadata(s);
  }

  public async nextTrack(): Promise<SpotifyTrack> {
    const s = await this._getSpotifyInterface();

    await this._next(s);

    return this._getMetadata(s);
  }

  // Internal methods
  private _getSpotifyInterface(): Promise<SpotifyDBusInterface> {
    return new Promise((resolve, reject) => {
      this.spotifyService.getInterface<SpotifyDBusInterface>(
        '/org/mpris/MediaPlayer2',
        'org.mpris.MediaPlayer2.Player',
        (err, spotify) => {
          if (err) {
            reject(err);
          } else {
            resolve(spotify);
          }
        }
      );
    });
  }

  private _getPlaybackStatus(spotifyInterface: SpotifyDBusInterface): Promise<string> {
    return new Promise((resolve, reject) => {
      spotifyInterface.PlaybackStatus((err, status) => {
        if (err) {
          reject(err);
        } else {
          resolve(toLower(status));
        }
      });
    });
  }

  private _getMetadata(spotifyInterface: SpotifyDBusInterface): Promise<SpotifyTrack> {
    return new Promise((resolve, reject) => {
      spotifyInterface.Metadata((err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const trackMeta: SpotifyTrack = reduce(
            metadata,
            (dst, m) => {
              const [k, v] = m;
              const [, values] = v;
              const key: string = split(k, ':')[1];
              const val: string = values[0];
              dst[key] = Array.isArray(val) ? join(val, ' & ') : val;
              return dst;
            },
            {}
          );

          trackMeta.name = trackMeta.title;

          resolve(trackMeta);
        }
      });
    });
  }

  private _playPause(spotifyInterface: SpotifyDBusInterface): Promise<SpotifyDBusInterface> {
    return new Promise((resolve, reject) => {
      try {
        spotifyInterface.PlayPause(() => {
          setTimeout(() => resolve(spotifyInterface), 500);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  private _next(spotifyInterface: SpotifyDBusInterface): Promise<SpotifyDBusInterface> {
    return new Promise((resolve, reject) => {
      try {
        spotifyInterface.Next(() => {
          setTimeout(() => resolve(spotifyInterface), 500);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  private _previous(spotifyInterface: SpotifyDBusInterface): Promise<SpotifyDBusInterface> {
    return new Promise((resolve, reject) => {
      try {
        spotifyInterface.Previous(() => {
          setTimeout(() => resolve(spotifyInterface), 500);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default SpotifyLinux;
