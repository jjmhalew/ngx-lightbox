import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";

import { LightboxConfig } from "./services/lightbox-config.service";

/**
 * Configures the lightbox for an application.
 *
 * Calling this function is optional: all lightbox services are provided in root,
 * so injecting {@link Lightbox} works without any setup. Use this function to
 * override the default {@link LightboxConfig} application-wide.
 *
 * ```ts
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideLightbox({ fadeDuration: 1, wrapAround: true })],
 * };
 * ```
 */
export function provideLightbox(config?: Partial<LightboxConfig>): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: LightboxConfig,
      useFactory: () => Object.assign(new LightboxConfig(), config),
    },
  ]);
}
