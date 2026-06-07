import { NgModule } from "@angular/core";

import { LightboxComponent } from "./components/lightbox/lightbox.component";
import { LightboxOverlayComponent } from "./components/lightbox-overlay/lightbox-overlay.component";
import { Lightbox } from "./services/lightbox.service";
import { LightboxConfig } from "./services/lightbox-config.service";
import { LightboxEvent, LightboxWindowRef } from "./services/lightbox-event.service";
import { FileSaverService } from "ngx-filesaver";

@NgModule({
  providers: [Lightbox, LightboxConfig, LightboxEvent, LightboxWindowRef, FileSaverService],
  imports: [LightboxOverlayComponent, LightboxComponent],
})
export class LightboxModule {}
