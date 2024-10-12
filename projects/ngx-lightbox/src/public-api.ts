/*
 * Public API Surface of ngx-lightbox
 */

export { Lightbox } from "./lib/services/lightbox.service";
export { LightboxConfig } from "./lib/services/lightbox-config.service";
export { LightboxEvent, LIGHTBOX_EVENT } from "./lib/services/lightbox-event.service";
export type { IAlbum, IEvent } from "./lib/services/lightbox-event.service";

export { LightboxModule } from "./lib/lightbox.module";