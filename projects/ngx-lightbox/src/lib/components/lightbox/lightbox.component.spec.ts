import { ComponentFixture, TestBed } from "@angular/core/testing";
import { describe, it, beforeEach, expect, vi } from "vitest";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";

import {
  LIGHTBOX_EVENT,
  LightboxEvent,
  LightboxWindowRef,
} from "../../services/lightbox-event.service";
import { LightboxComponent } from "./lightbox.component";

describe("[ Unit - LightboxComponent ]", () => {
  let fixture: ComponentFixture<LightboxComponent>;
  let lightboxEvent: LightboxEvent;
  let mockData: any;

  beforeEach(() => {
    mockData = {
      options: {
        fadeDuration: 1,
        resizeDuration: 0.5,
        fitImageInViewPort: true,
        positionFromTop: 20,
        showImageNumberLabel: false,
        alwaysShowNavOnTouchDevices: false,
        wrapAround: false,
        disableKeyboardNav: false,
      },
      currentIndex: 1,
      albums: [
        {
          src: "src/img/next.png",
          thumb: "thumb1",
          caption: "caption1",
        },
        {
          src: "src/img/prev.png",
          thumb: "thumb2",
          caption: "caption2",
        },
      ],
    };
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightboxComponent],
      providers: [
        LightboxEvent,
        LightboxWindowRef,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    createComponent();
    lightboxEvent = TestBed.inject(LightboxEvent);
  });

  it("should initialize component with correct styling and default value", () => {
    expect(fixture.componentInstance.ui()).toEqual({
      showReloader: true,
      showLeftArrow: false,
      showRightArrow: false,
      showArrowNav: false,
      showPageNumber: false,
      showCaption: false,
      showZoomButton: false,
      showRotateButton: false,
      showDownloadButton: false,
      showDownloadExtButton: false,
      classList: "lightbox animation fadeIn",
    });

    expect(fixture.componentInstance.contentPageNumber()).toEqual("");
    expect(fixture.componentInstance.albums()).toEqual(mockData.albums);
    expect(fixture.componentInstance.options()).toEqual(mockData.options);
    expect(fixture.componentInstance.currentImageIndex()).toEqual(
      mockData.currentIndex
    );
  });

  describe("{ method: ngOnDestroy }", () => {
    beforeEach(() => {
      fixture.componentInstance["_event"].keyup = vi.fn();
      fixture.componentInstance["_event"].load = vi.fn();
      vi.spyOn(
        fixture.componentInstance["_event"].subscription,
        "unsubscribe"
      );
    });

    it("should call correct method if enable keyboard event", () => {
      fixture.componentInstance.options().disableKeyboardNav = false;

      fixture.componentInstance.ngOnDestroy();

      expect(
        fixture.componentInstance["_event"].keyup
      ).toHaveBeenCalledTimes(1);

      expect(
        fixture.componentInstance["_event"].subscription.unsubscribe
      ).toHaveBeenCalledTimes(1);
    });

    it("should not call if keyboard event is disabled", () => {
      fixture.componentInstance.options().disableKeyboardNav = true;

      fixture.componentInstance.ngOnDestroy();

      expect(
        fixture.componentInstance["_event"].keyup
      ).not.toHaveBeenCalled();
    });
  });

  describe("{ method: close }", () => {
    it("should call broadcastLightboxEvent when clicking overlay", () => {
      const eventMock: any = {
        stopPropagation: vi.fn(),
        target: {
          classList: {
            contains: vi.fn().mockReturnValue(true),
          },
        },
      };

      const spy = vi.spyOn(lightboxEvent, "broadcastLightboxEvent");

      fixture.componentInstance.close(eventMock);

      expect(eventMock.stopPropagation).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({
        id: LIGHTBOX_EVENT.CLOSE,
        data: null,
      });
    });
  });

  describe("{ method: nextImage }", () => {
    it("should change to correct state", () => {
      mockData.currentIndex = 0;
      createComponent();

      fixture.componentInstance["_event"].load = vi.fn();
      const spy = vi.spyOn(lightboxEvent, "broadcastLightboxEvent");

      fixture.componentInstance.nextImage();

      expect(fixture.componentInstance.ui()).toEqual({
        showReloader: true,
        showLeftArrow: false,
        showRightArrow: false,
        showArrowNav: false,
        showPageNumber: false,
        showZoomButton: false,
        showRotateButton: false,
        showCaption: false,
        showDownloadButton: false,
        showDownloadExtButton: false,
        classList: "lightbox animation fadeIn",
      });

      expect(spy).toHaveBeenCalledWith({
        id: LIGHTBOX_EVENT.CHANGE_PAGE,
        data: 1,
      });
    });

    it("should wrap to first image when index is last", () => {
      fixture.componentInstance["_event"].load = vi.fn();
      const spy = vi.spyOn(lightboxEvent, "broadcastLightboxEvent");

      fixture.componentInstance.nextImage();

      expect(fixture.componentInstance.ui()).toEqual({
        showReloader: true,
        showLeftArrow: false,
        showRightArrow: false,
        showArrowNav: false,
        showPageNumber: false,
        showCaption: false,
        showZoomButton: false,
        showRotateButton: false,
        showDownloadButton: false,
        showDownloadExtButton: false,
        classList: "lightbox animation fadeIn",
      });

      expect(spy).toHaveBeenCalledWith({
        id: LIGHTBOX_EVENT.CHANGE_PAGE,
        data: 0,
      });
    });
  });

  describe("{ method: prevImage }", () => {
    it("should change to correct state", () => {
      fixture.componentInstance["_event"].load = vi.fn();
      const spy = vi.spyOn(lightboxEvent, "broadcastLightboxEvent");

      fixture.componentInstance.prevImage();

      expect(fixture.componentInstance.ui()).toEqual({
        showReloader: true,
        showLeftArrow: false,
        showRightArrow: false,
        showArrowNav: false,
        showPageNumber: false,
        showZoomButton: false,
        showRotateButton: false,
        showCaption: false,
        showDownloadButton: false,
        showDownloadExtButton: false,
        classList: "lightbox animation fadeIn",
      });

      expect(spy).toHaveBeenCalledWith({
        id: LIGHTBOX_EVENT.CHANGE_PAGE,
        data: 0,
      });
    });

    it("should wrap to last image when index is first", () => {
      mockData.currentIndex = 0;
      createComponent();

      fixture.componentInstance["_event"].load = vi.fn();
      const spy = vi.spyOn(lightboxEvent, "broadcastLightboxEvent");

      fixture.componentInstance.prevImage();

      expect(fixture.componentInstance.ui()).toEqual({
        showReloader: true,
        showLeftArrow: false,
        showRightArrow: false,
        showArrowNav: false,
        showPageNumber: false,
        showCaption: false,
        showZoomButton: false,
        showRotateButton: false,
        showDownloadButton: false,
        showDownloadExtButton: false,
        classList: "lightbox animation fadeIn",
      });

      expect(spy).toHaveBeenCalledWith({
        id: LIGHTBOX_EVENT.CHANGE_PAGE,
        data: 1,
      });
    });
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(LightboxComponent);

    fixture.componentInstance.options.set(mockData.options);
    fixture.componentInstance.albums.set(mockData.albums);
    fixture.componentInstance.currentImageIndex.set(
      mockData.currentIndex
    );

    // @ts-expect-error test mock
    fixture.componentInstance.cmpRef.set({ destroy: vi.fn() });

    fixture.detectChanges();
  }
});
