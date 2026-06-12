import { NgModule } from "@angular/core";

/**
 * @deprecated The lightbox no longer requires an NgModule. All services are
 * provided in root, so `inject(Lightbox)` works without importing anything.
 * To override the default config application-wide, use `provideLightbox()`
 * in your `app.config.ts`. This module is now an empty shell kept for
 * backwards compatibility and will be removed in a future major version.
 */
@NgModule({})
export class LightboxModule {}
