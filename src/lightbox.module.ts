import { NgModule } from "@angular/core";
import { FileSaverModule } from "ngx-filesaver";

import { LightboxComponent } from "./lightbox.component";
import { Lightbox } from "./lightbox.service";
import { LightboxConfig } from "./lightbox-config.service";
import { LightboxEvent, LightboxWindowRef } from "./lightbox-event.service";
import { LightboxOverlayComponent } from "./lightbox-overlay.component";

@NgModule({
  declarations: [],
  providers: [Lightbox, LightboxConfig, LightboxEvent, LightboxWindowRef],
  imports: [FileSaverModule, LightboxOverlayComponent, LightboxComponent],
})
export class LightboxModule {}
