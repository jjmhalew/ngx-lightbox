
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  inject,
  model,
  OnDestroy,
  OnInit,
  Renderer2,
  SecurityContext,
  signal,
  viewChild,
  DOCUMENT
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { FileSaverService } from "ngx-filesaver";

import { LightboxConfig } from "../../services/lightbox-config.service";
import { IAlbum, IEvent, LIGHTBOX_EVENT, LightboxEvent, LightboxWindowRef } from "../../services/lightbox-event.service";
import { LightboxUiConfig } from "../../services/lightbox-ui-config";

@Component({
    templateUrl: "./lightbox.component.html",
    selector: "[lb-content]",
    host: {
        "(click)": "close($event)",
        "[class]": "ui().classList",
    },
    styleUrl: "./lightbox.component.scss",
    imports: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LightboxComponent implements OnInit, AfterViewInit, OnDestroy, OnInit {
  private _elemRef = inject(ElementRef);
  private _rendererRef = inject(Renderer2);
  private _lightboxEvent = inject(LightboxEvent);
  public _lightboxElem = inject(ElementRef);
  private _lightboxWindowRef = inject(LightboxWindowRef);
  private _fileSaverService = inject(FileSaverService);
  private _sanitizer = inject(DomSanitizer);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _documentRef: Document = inject(DOCUMENT);

  public albums = model<IAlbum[]>([]);
  public currentImageIndex = model<number>(0);
  public options = model<Partial<LightboxConfig>>({});
  public cmpRef = model<ComponentRef<LightboxComponent>>();

  protected _outerContainerElem = viewChild<ElementRef<HTMLDivElement>>("outerContainer");
  protected _containerElem = viewChild<ElementRef<HTMLDivElement>>("container");
  protected _leftArrowElem = viewChild<ElementRef<HTMLAnchorElement>>("leftArrow");
  protected _rightArrowElem = viewChild<ElementRef<HTMLAnchorElement>>("rightArrow");
  protected _navArrowElem = viewChild<ElementRef<HTMLDivElement>>("navArrow");
  protected _dataContainerElem = viewChild<ElementRef<HTMLDivElement>>("dataContainer");
  protected _imageElem = viewChild<ElementRef<HTMLImageElement>>("image");
  protected _captionElem = viewChild<ElementRef<HTMLSpanElement>>("caption");
  protected _numberElem = viewChild<ElementRef<HTMLSpanElement>>("number");

  public contentPageNumber = signal<string>("");
  /* control the interactive of the directive */
  public ui = signal<LightboxUiConfig>(new LightboxUiConfig());
  private _cssValue: any; /* {
    containerTopPadding: number;
    containerRightPadding: number;
    containerBottomPadding: number;
    containerLeftPadding: number;
    imageBorderWidthTop: number;
    imageBorderWidthBottom: number;
    imageBorderWidthLeft: number;
    imageBorderWidthRight: number;
  }; */
  private _event: any;
  private _windowRef: Window & typeof globalThis;
  private rotate = signal<number>(0);

  constructor() {
    // initialize data
    this._windowRef = this._lightboxWindowRef.nativeWindow;

    this._event = {};
    this._lightboxElem = this._elemRef;
    this._event.subscription = this._lightboxEvent.lightboxEvent$.subscribe((event: IEvent) => this._onReceivedEvent(event));
  }

  public ngOnInit(): void {
    this.albums()?.forEach(album => {
      if (album.caption) {
        album.caption = this._sanitizer.sanitize(SecurityContext.HTML, album.caption) ?? "";
      }
    });
  }

  public ngAfterViewInit(): void {
    // need to init css value here, after the view ready
    // actually these values are always 0
    this._cssValue = {
      containerTopPadding: Math.round(this._getCssStyleValue(this._containerElem()!, "padding-top")),
      containerRightPadding: Math.round(this._getCssStyleValue(this._containerElem()!, "padding-right")),
      containerBottomPadding: Math.round(this._getCssStyleValue(this._containerElem()!, "padding-bottom")),
      containerLeftPadding: Math.round(this._getCssStyleValue(this._containerElem()!, "padding-left")),
      imageBorderWidthTop: Math.round(this._getCssStyleValue(this._imageElem()!, "border-top-width")),
      imageBorderWidthBottom: Math.round(this._getCssStyleValue(this._imageElem()!, "border-bottom-width")),
      imageBorderWidthLeft: Math.round(this._getCssStyleValue(this._imageElem()!, "border-left-width")),
      imageBorderWidthRight: Math.round(this._getCssStyleValue(this._imageElem()!, "border-right-width")),
    };

    if (this._validateInputData()) {
      this._prepareComponent();
      this._registerImageLoadingEvent();
    }
  }

  public ngOnDestroy(): void {
    if (!this.options().disableKeyboardNav) {
      // unbind keyboard event
      this._disableKeyboardNav();
    }

    this._event.subscription.unsubscribe();
  }

  public close($event: any): void {
    $event.stopPropagation();
    if (
      $event.target.classList.contains("lightbox") ||
      $event.target.classList.contains("lb-loader") ||
      $event.target.classList.contains("lb-close")
    ) {
      this._lightboxEvent.broadcastLightboxEvent({ id: LIGHTBOX_EVENT.CLOSE, data: null });
    }
  }

  public downloadExt(): void {
    this._lightboxEvent.broadcastLightboxEvent({
      id: LIGHTBOX_EVENT.DOWNLOAD,
      data: this.albums()[this.currentImageIndex()],
    });
  }

  public download($event: any): void {
    $event.stopPropagation();
    const url = this.albums()[this.currentImageIndex()].src;
    const downloadUrl = this.albums()[this.currentImageIndex()].downloadUrl;
    const parts = url.split("/");
    const fileName = parts[parts.length - 1];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const preloader = new Image();
    const _this = this;

    preloader.onload = function () {
      // @ts-ignore
      canvas.width = this.naturalWidth;
      // @ts-ignore
      canvas.height = this.naturalHeight;

      // @ts-ignore
      ctx.drawImage(this, 0, 0);
      canvas.toBlob(
        blob => {
          _this._fileSaverService.save(blob, fileName);
        },
        "image/jpeg",
        0.75
      );
    };
    preloader.crossOrigin = "";
    if (downloadUrl && downloadUrl.length > 0) preloader.src = this._sanitizer.sanitize(SecurityContext.URL, downloadUrl) ?? "";
    else preloader.src = this._sanitizer.sanitize(SecurityContext.URL, url) ?? "";
  }

  public control($event: any): void {
    $event.stopPropagation();
    let height: number;
    let width: number;
    if ($event.target.classList.contains("lb-turnLeft")) {
      this.rotate.set(this.rotate() - 90);
      this._rotateContainer();
      this._calcTransformPoint();
      this._imageElem()!.nativeElement.style.transform = `rotate(${this.rotate()}deg)`;
      this._lightboxEvent.broadcastLightboxEvent({ id: LIGHTBOX_EVENT.ROTATE_LEFT, data: null });
    } else if ($event.target.classList.contains("lb-turnRight")) {
      this.rotate.set(this.rotate() + 90);
      this._rotateContainer();
      this._calcTransformPoint();
      this._imageElem()!.nativeElement.style.transform = `rotate(${this.rotate()}deg)`;
      this._lightboxEvent.broadcastLightboxEvent({ id: LIGHTBOX_EVENT.ROTATE_RIGHT, data: null });
    } else if ($event.target.classList.contains("lb-zoomOut")) {
      height = parseInt(this._outerContainerElem()!.nativeElement.style.height, 10) / 1.5;
      width = parseInt(this._outerContainerElem()!.nativeElement.style.width, 10) / 1.5;
      this._outerContainerElem()!.nativeElement.style.height = height + "px";
      this._outerContainerElem()!.nativeElement.style.width = width + "px";
      height = parseInt(this._imageElem()!.nativeElement.style.height, 10) / 1.5;
      width = parseInt(this._imageElem()!.nativeElement.style.width, 10) / 1.5;
      this._imageElem()!.nativeElement.style.height = height + "px";
      this._imageElem()!.nativeElement.style.width = width + "px";
      this._lightboxEvent.broadcastLightboxEvent({ id: LIGHTBOX_EVENT.ZOOM_OUT, data: null });
    } else if ($event.target.classList.contains("lb-zoomIn")) {
      height = parseInt(this._outerContainerElem()!.nativeElement.style.height, 10) * 1.5;
      width = parseInt(this._outerContainerElem()!.nativeElement.style.width, 10) * 1.5;
      this._outerContainerElem()!.nativeElement.style.height = height + "px";
      this._outerContainerElem()!.nativeElement.style.width = width + "px";
      height = parseInt(this._imageElem()!.nativeElement.style.height, 10) * 1.5;
      width = parseInt(this._imageElem()!.nativeElement.style.width, 10) * 1.5;
      this._imageElem()!.nativeElement.style.height = height + "px";
      this._imageElem()!.nativeElement.style.width = width + "px";
      this._lightboxEvent.broadcastLightboxEvent({ id: LIGHTBOX_EVENT.ZOOM_IN, data: null });
    }
  }

  private _rotateContainer(): void {
    let temp = this.rotate();
    if (temp < 0) {
      temp *= -1;
    }
    if ((temp / 90) % 4 === 1 || (temp / 90) % 4 === 3) {
      this._outerContainerElem()!.nativeElement.style.height = this._imageElem()!.nativeElement.style.width;
      this._outerContainerElem()!.nativeElement.style.width = this._imageElem()!.nativeElement.style.height;
      this._containerElem()!.nativeElement.style.height = this._imageElem()!.nativeElement.style.width;
      this._containerElem()!.nativeElement.style.width = this._imageElem()!.nativeElement.style.height;
    } else {
      this._outerContainerElem()!.nativeElement.style.height = this._imageElem()!.nativeElement.style.height;
      this._outerContainerElem()!.nativeElement.style.width = this._imageElem()!.nativeElement.style.width;
      this._containerElem()!.nativeElement.style.height = this._imageElem()!.nativeElement.style.width;
      this._containerElem()!.nativeElement.style.width = this._imageElem()!.nativeElement.style.height;
    }
  }

  private _resetImage(): void {
    this.rotate.set(0);
    this._imageElem()!.nativeElement.style.transform = `rotate(${this.rotate()}deg)`;
  }

  private _calcTransformPoint(): void {
    const height = parseInt(this._imageElem()!.nativeElement.style.height, 10);
    const width = parseInt(this._imageElem()!.nativeElement.style.width, 10);
    let temp = this.rotate() % 360;
    if (temp < 0) {
      temp = 360 + temp;
    }
    if (temp === 90) {
      this._imageElem()!.nativeElement.style.transformOrigin = height / 2 + "px " + height / 2 + "px";
    } else if (temp === 180) {
      this._imageElem()!.nativeElement.style.transformOrigin = width / 2 + "px " + height / 2 + "px";
    } else if (temp === 270) {
      this._imageElem()!.nativeElement.style.transformOrigin = width / 2 + "px " + width / 2 + "px";
    }
  }

  public nextImage(): void {
    if (this.albums().length === 1) {
      return;
    } else if (this.currentImageIndex() === this.albums().length - 1) {
      this._changeImage(0);
    } else {
      this._changeImage(this.currentImageIndex() + 1);
    }
  }

  public prevImage(): void {
    if (this.albums().length === 1) {
      return;
    } else if (this.currentImageIndex() === 0 && this.albums().length > 1) {
      this._changeImage(this.albums().length - 1);
    } else {
      this._changeImage(this.currentImageIndex() - 1);
    }
  }

  private _validateInputData(): boolean {
    if (this.albums() && this.albums() instanceof Array && this.albums().length > 0) {
      for (let i = 0; i < this.albums().length; i++) {
        // check whether each _nside
        // album has src data or not
        if (this.albums()[i].src) {
          continue;
        }

        throw new Error("One of the album data does not have source data");
      }
    } else {
      throw new Error("No album data or album data is not correct in type");
    }

    // to prevent data understand as string
    // convert it to number
    if (isNaN(this.currentImageIndex())) {
      throw new Error("Current image index is not a number");
    } else {
      this.currentImageIndex.set(Number(this.currentImageIndex()));
    }

    return true;
  }

  private _registerImageLoadingEvent(): void {
    const preloader = new Image();

    preloader.onload = (): void => {
      this._onLoadImageSuccess();
    };

    const src: string = this.albums()[this.currentImageIndex()].src;
    preloader.src = this._sanitizer.sanitize(SecurityContext.URL, src) ?? "";
  }

  /**
   * Fire when the image is loaded
   */
  private _onLoadImageSuccess(): void {
    if (!this.options().disableKeyboardNav) {
      // unbind keyboard event during transition
      this._disableKeyboardNav();
    }

    let imageHeight;
    let imageWidth;
    let maxImageHeight;
    let maxImageWidth;
    let windowHeight;
    let windowWidth;
    let naturalImageWidth;
    let naturalImageHeight;

    // set default width and height of image to be its natural
    imageWidth = naturalImageWidth = this._imageElem()!.nativeElement.naturalWidth;
    imageHeight = naturalImageHeight = this._imageElem()!.nativeElement.naturalHeight;
    if (this.options().fitImageInViewPort) {
      windowWidth = this._windowRef.innerWidth;
      windowHeight = this._windowRef.innerHeight;
      maxImageWidth =
        windowWidth -
        this._cssValue.containerLeftPadding -
        this._cssValue.containerRightPadding -
        this._cssValue.imageBorderWidthLeft -
        this._cssValue.imageBorderWidthRight -
        20;
      maxImageHeight =
        windowHeight -
        this._cssValue.containerTopPadding -
        this._cssValue.containerTopPadding -
        this._cssValue.imageBorderWidthTop -
        this._cssValue.imageBorderWidthBottom -
        120;
      if (naturalImageWidth > maxImageWidth || naturalImageHeight > maxImageHeight) {
        if (naturalImageWidth / maxImageWidth > naturalImageHeight / maxImageHeight) {
          imageWidth = maxImageWidth;
          imageHeight = Math.round(naturalImageHeight / (naturalImageWidth / imageWidth));
        } else {
          imageHeight = maxImageHeight;
          imageWidth = Math.round(naturalImageWidth / (naturalImageHeight / imageHeight));
        }
      }

      this._rendererRef.setStyle(this._imageElem()!.nativeElement, "width", `${imageWidth}px`);
      this._rendererRef.setStyle(this._imageElem()!.nativeElement, "height", `${imageHeight}px`);
    }

    this._sizeContainer(imageWidth, imageHeight);

    if (this.options().centerVertically) {
      this._centerVertically(imageWidth, imageHeight);
    }
  }

  private _centerVertically(imageWidth: number, imageHeight: number): void {
    const scrollOffset = this._documentRef.documentElement.scrollTop;
    const windowHeight = this._windowRef.innerHeight;

    const viewOffset = windowHeight / 2 - imageHeight / 2;
    const topDistance = scrollOffset + viewOffset;

    this._rendererRef.setStyle(this._lightboxElem.nativeElement, "top", `${topDistance}px`);
  }

  private _sizeContainer(imageWidth: number, imageHeight: number): void {
    const oldWidth = this._outerContainerElem()!.nativeElement.offsetWidth;
    const oldHeight = this._outerContainerElem()!.nativeElement.offsetHeight;
    const newWidth =
      imageWidth +
      this._cssValue.containerRightPadding +
      this._cssValue.containerLeftPadding +
      this._cssValue.imageBorderWidthLeft +
      this._cssValue.imageBorderWidthRight;
    const newHeight =
      imageHeight +
      this._cssValue.containerTopPadding +
      this._cssValue.containerBottomPadding +
      this._cssValue.imageBorderWidthTop +
      this._cssValue.imageBorderWidthBottom;

    // make sure that distances are large enough for transitionend event to be fired, at least 5px.
    if (Math.abs(oldWidth - newWidth) + Math.abs(oldHeight - newHeight) > 5) {
      this._rendererRef.setStyle(this._outerContainerElem()!.nativeElement, "width", `${newWidth}px`);
      this._rendererRef.setStyle(this._outerContainerElem()!.nativeElement, "height", `${newHeight}px`);

      // bind resize event to outer container
      // use enableTransition to prevent infinite loader
      if (this.options().enableTransition) {
        this._event.transition = this._rendererRef.listen(
          this._outerContainerElem()!.nativeElement,
          "transitionend",
          (event: TransitionEvent) => {
            if (event.target === event.currentTarget) {
              this._postResize(newWidth, newHeight);
            }
          }
        );
      } else {
        this._postResize(newWidth, newHeight);
      }
    } else {
      this._postResize(newWidth, newHeight);
    }
  }

  private _postResize(newWidth: number, newHeight: number): void {
    // unbind resize event
    if (this._event.transition !== undefined) {
      this._event.transition(); // Remove the listener
      this._event.transition = undefined; // Clean up
    }

    this._rendererRef.setStyle(this._dataContainerElem()!.nativeElement, "width", `${newWidth}px`);
    this._showImage();
  }

  private _showImage(): void {
    this.ui().showReloader = false;
    this._updateNav();
    this._updateDetails();
    if (!this.options().disableKeyboardNav) {
      this._enableKeyboardNav();
    }
    this._changeDetectorRef.detectChanges(); // needed due to zoneless, otherwise reload icon will stay in-screen until user clicks
  }

  private _prepareComponent(): void {
    // add css animation
    this._addCssAnimation();

    // position the image according to user's option
    this._positionLightBox();

    // update controls visibility on next view generation
    setTimeout(() => {
      this.ui().showZoomButton = this.options().showZoom!;
      this.ui().showRotateButton = this.options().showRotate!;
      this.ui().showDownloadButton = this.options().showDownloadButton!;
      // this.ui().showDownloadExtButton = this.options().showDownloadExtButton; // TODO: re-enable
    }, 0);
  }

  private _positionLightBox(): void {
    // @see https://stackoverflow.com/questions/3464876/javascript-get-window-x-y-position-for-scroll
    const top = (this._windowRef.scrollY || this._documentRef.documentElement.scrollTop) + this.options().positionFromTop!;
    const left = this._windowRef.scrollX || this._documentRef.documentElement.scrollLeft;

    if (!this.options().centerVertically) {
      this._rendererRef.setStyle(this._lightboxElem.nativeElement, "top", `${top}px`);
    }

    this._rendererRef.setStyle(this._lightboxElem.nativeElement, "left", `${left}px`);
    this._rendererRef.setStyle(this._lightboxElem.nativeElement, "display", "block");

    // disable scrolling of the page while open
    if (this.options().disableScrolling) {
      this._rendererRef.addClass(this._documentRef.documentElement, "lb-disable-scrolling");
    }
  }

  /**
   * addCssAnimation add classes for animate lightbox
   */
  private _addCssAnimation(): void {
    const resizeDuration = this.options().resizeDuration;
    const fadeDuration = this.options().fadeDuration;

    this._rendererRef.setStyle(this._lightboxElem.nativeElement, "animation-duration", `${fadeDuration}s`);
    this._rendererRef.setStyle(this._outerContainerElem()!.nativeElement, "transition-duration", `${resizeDuration}s`);
    this._rendererRef.setStyle(this._dataContainerElem()!.nativeElement, "animation-duration", `${fadeDuration}s`);
    this._rendererRef.setStyle(this._imageElem()!.nativeElement, "animation-duration", `${fadeDuration}s`);
    this._rendererRef.setStyle(this._captionElem()!.nativeElement, "animation-duration", `${fadeDuration}s`);
    this._rendererRef.setStyle(this._numberElem()!.nativeElement, "animation-duration", `${fadeDuration}s`);
  }

  private _end(): void {
    this.ui().classList = "lightbox animation fadeOut";
    if (this.options().disableScrolling) {
      this._rendererRef.removeClass(this._documentRef.documentElement, "lb-disable-scrolling");
    }
    setTimeout(() => {
      this.cmpRef()?.destroy();
    }, this.options().fadeDuration! * 1000);
  }

  private _updateDetails(): void {
    // update the caption
    if (typeof this.albums()[this.currentImageIndex()].caption !== "undefined" && this.albums()[this.currentImageIndex()].caption !== "") {
      this.ui().showCaption = true;
    }

    // update the page number if user choose to do so
    // does not perform numbering the page if the
    // array length in album <= 1
    if (this.albums().length > 1 && this.options().showImageNumberLabel) {
      this.ui().showPageNumber = true;
      this.contentPageNumber.set(this._albumLabel());
    }
  }

  private _albumLabel(): string {
    // due to {this.currentImageIndex()} is set from 0 to {this.album().length} - 1
    return this.options()
      .albumLabel!.replace(/%1/g, (this.currentImageIndex() + 1).toString())
      .replace(/%2/g, this.albums().length.toString());
  }

  private _changeImage(newIndex: number): void {
    this._resetImage();
    this.currentImageIndex.set(newIndex);
    this._hideImage();
    this._registerImageLoadingEvent();
    this._lightboxEvent.broadcastLightboxEvent({ id: LIGHTBOX_EVENT.CHANGE_PAGE, data: newIndex });
  }

  private _hideImage(): void {
    this.ui().showReloader = true;
    this.ui().showArrowNav = false;
    this.ui().showLeftArrow = false;
    this.ui().showRightArrow = false;
    this.ui().showPageNumber = false;
    this.ui().showCaption = false;
  }

  private _updateNav(): void {
    let alwaysShowNav = false;

    // check to see the browser support touch event
    try {
      this._documentRef.createEvent("TouchEvent");
      alwaysShowNav = this.options().alwaysShowNavOnTouchDevices ? true : false;
    } catch (e) {
      // noop
    }

    // initially show the arrow nav
    // which is the parent of both left and right nav
    this._showArrowNav();
    if (this.albums().length > 1) {
      if (this.options().wrapAround) {
        if (alwaysShowNav) {
          this._rendererRef.setStyle(this._leftArrowElem()!.nativeElement, "opacity", "1");
          this._rendererRef.setStyle(this._rightArrowElem()!.nativeElement, "opacity", "1");
        }

        this._showLeftArrowNav();
        this._showRightArrowNav();
      } else {
        if (this.currentImageIndex() > 0) {
          this._showLeftArrowNav();
          if (alwaysShowNav) {
            this._rendererRef.setStyle(this._leftArrowElem()!.nativeElement, "opacity", "1");
          }
        }

        if (this.currentImageIndex() < this.albums().length - 1) {
          this._showRightArrowNav();
          if (alwaysShowNav) {
            this._rendererRef.setStyle(this._rightArrowElem()!.nativeElement, "opacity", "1");
          }
        }
      }
    }
  }

  private _showLeftArrowNav(): void {
    this.ui().showLeftArrow = true;
  }

  private _showRightArrowNav(): void {
    this.ui().showRightArrow = true;
  }

  private _showArrowNav(): void {
    this.ui().showArrowNav = this.albums().length !== 1;
  }

  private _enableKeyboardNav(): void {
    this._event.keyup = this._rendererRef.listen("document", "keyup", (event: KeyboardEvent) => {
      this._keyboardAction(event);
    });
  }

  private _disableKeyboardNav(): void {
    if (this._event.keyup) {
      this._event.keyup();
    }
  }

  private _keyboardAction($event: KeyboardEvent): void {
    const KEYCODE_ESC = 27;
    const KEYCODE_LEFTARROW = 37;
    const KEYCODE_RIGHTARROW = 39;
    const keycode = $event.keyCode;
    const key = String.fromCharCode(keycode).toLowerCase();

    if (keycode === KEYCODE_ESC || key.match(/x|o|c/)) {
      this._lightboxEvent.broadcastLightboxEvent({ id: LIGHTBOX_EVENT.CLOSE, data: null });
    } else if (key === "p" || keycode === KEYCODE_LEFTARROW) {
      if (this.currentImageIndex() !== 0) {
        this._changeImage(this.currentImageIndex() - 1);
      } else if (this.options().wrapAround && this.albums().length > 1) {
        this._changeImage(this.albums().length - 1);
      }
    } else if (key === "n" || keycode === KEYCODE_RIGHTARROW) {
      if (this.currentImageIndex() !== this.albums().length - 1) {
        this._changeImage(this.currentImageIndex() + 1);
      } else if (this.options().wrapAround && this.albums().length > 1) {
        this._changeImage(0);
      }
    }
  }

  private _getCssStyleValue(elem: ElementRef, propertyName: string): number {
    return parseFloat(this._windowRef.getComputedStyle(elem.nativeElement, null).getPropertyValue(propertyName));
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
}
