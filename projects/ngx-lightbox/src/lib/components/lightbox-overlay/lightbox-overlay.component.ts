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
} from "@angular/core";
import { Subscription } from "rxjs";

import { LightboxConfig } from "../../services/lightbox-config.service";
import { IEvent, LIGHTBOX_EVENT, LightboxEvent } from "../../services/lightbox-event.service";

@Component({
  selector: "[lb-overlay]",
  template: "",
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LightboxOverlayComponent implements AfterViewInit, OnDestroy {
  private _lightboxEvent = inject(LightboxEvent);

  public options = model<Partial<LightboxConfig>>();
  public cmpRef = model<ComponentRef<LightboxOverlayComponent>>();

  private _subscription: Subscription;

  constructor(private _elemRef: ElementRef<HTMLDivElement>) {
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

    this._elemRef.nativeElement.style.animationDuration = `${fadeDuration}s`;
    this._sizeOverlay();
  }

  @HostListener("window:resize")
  public onResize(): void {
    this._sizeOverlay();
  }

  public ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  private _sizeOverlay(): void {
    const width = document.body.scrollWidth;
    const height = document.body.scrollHeight;

    this._elemRef.nativeElement.style.width = `${width}px`;
    this._elemRef.nativeElement.style.height = `${height}px`;
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
    this._elemRef.nativeElement.className = "lightboxOverlay animation fadeOutOverlay";

    // queue self destruction after the animation has finished
    // FIXME: not sure if there is any way better than this
    setTimeout(() => {
      this.cmpRef()?.destroy();
    }, this.options()!.fadeDuration! * 1000);
  }
}
