
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ElementRef,
  HostListener,
  inject,
  model,
  OnDestroy,
  Renderer2,
  DOCUMENT,
  signal
} from "@angular/core";
import { Subscription } from "rxjs";

import { LightboxConfig } from "../../services/lightbox-config.service";
import { IEvent, LIGHTBOX_EVENT, LightboxEvent } from "../../services/lightbox-event.service";

@Component({
    selector: "[lb-overlay]",
    template: "",
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LightboxOverlayComponent implements AfterViewInit, OnDestroy {
  private _elemRef = inject(ElementRef);
  private _rendererRef = inject(Renderer2);
  private _lightboxEvent = inject(LightboxEvent);
  private _documentRef: Document = inject(DOCUMENT);

  public options = model<Partial<LightboxConfig>>();
  public cmpRef = model<ComponentRef<LightboxOverlayComponent>>();

  private _subscription: Subscription;

  private _isClosing = signal<boolean>(false);

  constructor() {
    this._elemRef.nativeElement.className = "lightboxOverlay animation fadeInOverlay";
    this._subscription = this._lightboxEvent.lightboxEvent$.subscribe((event: IEvent) => this._onReceivedEvent(event));
  }

  @HostListener("click")
  public close(): void {
    // broadcast to itself and all others subscriber including the components
    this._lightboxEvent.broadcastLightboxEvent({ id: LIGHTBOX_EVENT.CLOSE, data: null });
  }

  public ngAfterViewInit(): void {
    const fadeDuration = this.options()!.fadeDuration;

    this._rendererRef.setStyle(this._elemRef.nativeElement, "animation-duration", `${fadeDuration}s`);
    this._sizeOverlay();
  }

  @HostListener("window:resize")
  public onResize(): void {
    if (!this._isClosing()) {
      this._sizeOverlay();
    }
  }

  public ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  private _sizeOverlay(): void {
    const width = this._documentRef.body.scrollWidth;
    const height = this._documentRef.body.scrollHeight;

    this._rendererRef.setStyle(this._elemRef.nativeElement, "width", `${width}px`);
    this._rendererRef.setStyle(this._elemRef.nativeElement, "height", `${height}px`);
  }

  private _onReceivedEvent(event: IEvent): void {
    switch (event.id) {
      case LIGHTBOX_EVENT.CLOSE:
        this._end();
        break;
      default:
        break;
    }
  }

  private _end(): void {
     this._isClosing.set(true);

    this._elemRef.nativeElement.className = "lightboxOverlay animation fadeOutOverlay";

    // queue self destruction after the animation has finished
    this._rendererRef.listen(this._elemRef.nativeElement, 'animationend', () => {
      this.cmpRef()?.destroy();
    });
  }
}
