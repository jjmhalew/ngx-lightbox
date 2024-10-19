import { DOCUMENT } from "@angular/common";
import { ApplicationRef, inject, Injectable, Injector, ViewContainerRef } from "@angular/core";

import { LightboxComponent } from "../components/lightbox/lightbox.component";
import { LightboxOverlayComponent } from "../components/lightbox-overlay/lightbox-overlay.component";
import { LightboxConfig } from "./lightbox-config.service";
import { IAlbum, LIGHTBOX_EVENT, LightboxEvent } from "./lightbox-event.service";

@Injectable()
export class Lightbox {
  private _applicationRef = inject(ApplicationRef);
  private _lightboxConfig = inject(LightboxConfig);
  private _lightboxEvent = inject(LightboxEvent);
  private _documentRef: Document = inject(DOCUMENT);
  private _injector = inject(Injector);
  private _viewContainerRef = inject(ViewContainerRef);

  public open(album: IAlbum[], curIndex = 0, options = {}): void {
    const overlayComponentRef = this._viewContainerRef.createComponent(LightboxOverlayComponent, {
      injector: this._injector
    });
    const componentRef = this._viewContainerRef.createComponent(LightboxComponent, {
      injector: this._injector
    });

    const newOptions: Partial<LightboxConfig> = {};

    // broadcast open event
    this._lightboxEvent.broadcastLightboxEvent({ id: LIGHTBOX_EVENT.OPEN });
    Object.assign(newOptions, this._lightboxConfig, options);

    // attach input to lightbox
    componentRef.instance.albums.set(album);
    componentRef.instance.currentImageIndex.set(curIndex);
    componentRef.instance.options.set(newOptions);
    componentRef.instance.cmpRef.set(componentRef);

    // attach input to overlay
    overlayComponentRef.instance.options.set(newOptions);
    overlayComponentRef.instance.cmpRef.set(overlayComponentRef);

    // FIXME: not sure why last event is broadcasted (which is CLOSED) and make
    // lightbox can not be opened the second time.
    // Need to timeout so that the OPEN event is set before component is initialized
    setTimeout(() => {
      this._applicationRef.attachView(overlayComponentRef.hostView);
      this._applicationRef.attachView(componentRef.hostView);
      overlayComponentRef.onDestroy(() => {
        this._applicationRef.detachView(overlayComponentRef.hostView);
      });
      componentRef.onDestroy(() => {
        this._applicationRef.detachView(componentRef.hostView);
      });

      const containerElement = newOptions.containerElementResolver!(this._documentRef);
      containerElement.appendChild(overlayComponentRef.location.nativeElement);
      containerElement.appendChild(componentRef.location.nativeElement);
    });
  }
}
