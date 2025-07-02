import { DOCUMENT } from "@angular/common";
import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  inputBinding,
} from "@angular/core";

import { LightboxComponent } from "../components/lightbox/lightbox.component";
import { LightboxOverlayComponent } from "../components/lightbox-overlay/lightbox-overlay.component";
import { LightboxConfig } from "./lightbox-config.service";
import { IAlbum, LIGHTBOX_EVENT, LightboxEvent } from "./lightbox-event.service";

@Injectable()
export class Lightbox {
  private _applicationRef = inject(ApplicationRef);
  private environmentInjector = inject(EnvironmentInjector);

  private _lightboxConfig = inject(LightboxConfig);
  private _lightboxEvent = inject(LightboxEvent);
  private _documentRef: Document = inject(DOCUMENT);

  public open(album: IAlbum[], curIndex = 0, options = {}): void {
    const newOptions: Partial<LightboxConfig> = {
      ...this._lightboxConfig,
      ...options
    };

    const overlayComponentRef: ComponentRef<LightboxOverlayComponent>
    = createComponent(LightboxOverlayComponent, {
      environmentInjector: this._applicationRef.injector,
      elementInjector: this.environmentInjector,
      bindings: [
        inputBinding("options", () => newOptions),
        inputBinding("cmpRef", () => overlayComponentRef)
      ],
    });

    const componentRef: ComponentRef<LightboxComponent>
    = createComponent(LightboxComponent, {
      environmentInjector: this._applicationRef.injector,
      elementInjector: this.environmentInjector,
      bindings: [
        inputBinding("albums", () => album),
        inputBinding("currentImageIndex", () => curIndex),
        inputBinding("options", () => newOptions),
        inputBinding("cmpRef", () => componentRef)
      ],
    });

    this._applicationRef.attachView(overlayComponentRef.hostView);
    this._applicationRef.attachView(componentRef.hostView);

    overlayComponentRef.onDestroy(() =>
      this._applicationRef.detachView(overlayComponentRef.hostView)
    );
    componentRef.onDestroy(() =>
      this._applicationRef.detachView(componentRef.hostView)
    );

    const containerElement = newOptions.containerElementResolver!(this._documentRef);
    containerElement.appendChild(overlayComponentRef.location.nativeElement);
    containerElement.appendChild(componentRef.location.nativeElement);

    this._lightboxEvent.broadcastLightboxEvent({ id: LIGHTBOX_EVENT.OPEN });
  }
}
