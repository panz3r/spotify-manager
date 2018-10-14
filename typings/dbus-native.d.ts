// Type definitions for dbus-native 0.2.5
// Project: dbus-native
// Definitions by: Mattia Panzeri <https://github.com/panz3r>

declare module 'dbus-native' {
  export class DBusInterface {}

  export type InterfaceCallbackFn<T extends DBusInterface> = (error: string, interface: T) => void;

  export class DBusService {
    public getInterface<T extends DBusInterface>(
      interfacePath: string,
      interfaceName: string,
      callbackFn: InterfaceCallbackFn<T>
    ): void;
  }

  export class SessionBus {
    public getService(serviceName: string): DBusService;
  }

  export function sessionBus(): SessionBus;
}
