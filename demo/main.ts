import { provideBrowserGlobalErrorListeners } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideLightbox } from "ngx-lightbox";

import { AppComponent } from "./app.component";

bootstrapApplication(AppComponent, {
  providers: [provideBrowserGlobalErrorListeners(), provideLightbox({ fadeDuration: 1 })],
}).catch(err => console.error(err));
