import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { IAlbum, IEvent, Lightbox, LIGHTBOX_EVENT, LightboxConfig, LightboxEvent, LightboxModule } from "ngx-lightbox";
import { Subscription } from "rxjs";

@Component({
  selector: "demo",
  template: `
    <div class="column has-text-centered">
      @for (image of albums(); track $index) {
        <div class="img-row">
          <img class="img-frame" [src]="image.thumb" (click)="open($index)" />
        </div>
      }
    </div>
    <div class="huge-margin-top column has-text-centered">
      @for (image of albums(); track $index) {
        <div class="img-row">
          <img class="img-frame" [src]="image.thumb" (click)="open($index)" />
        </div>
      }
    </div>
  `,
  host: {
    class: "columns",
  },
  imports: [LightboxModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private _lightbox = inject(Lightbox);
  private _lightboxEvent = inject(LightboxEvent);
  private _lighboxConfig = inject(LightboxConfig);

  protected albums = signal<IAlbum[]>([]);
  private _subscription: Subscription | null = null;

  constructor() {
    for (let i = 1; i <= 4; i++) {
      const src = "demo/img/image" + i + ".jpg";
      const caption = "Image " + i + " caption here";
      const thumb = "demo/img/image" + i + "-thumb.jpg";
      const album = {
        src: src,
        caption: caption,
        thumb: thumb,
      };

      this.albums().push(album);
    }

    // set default config
    this._lighboxConfig.fadeDuration = 1;
  }

  protected open(index: number): void {
    this._subscription = this._lightboxEvent.lightboxEvent$.subscribe((event: IEvent) => this._onReceivedEvent(event));

    // override the default config
    this._lightbox.open(this.albums(), index, {
      wrapAround: true,
      showImageNumberLabel: true,
      disableScrolling: true,
      showZoom: true,
      showRotate: true,
      showDownloadButton: true,
      showDownloadExtButton: true,
    });
  }

  private _onReceivedEvent(event: IEvent): void {
    if (event.id === LIGHTBOX_EVENT.DOWNLOAD) {
      console.log("Implement the download of the picture");
    } else if (event.id === LIGHTBOX_EVENT.CLOSE) {
      this._subscription?.unsubscribe();
    }
  }
}
