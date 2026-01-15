import { ComponentFixture, TestBed } from "@angular/core/testing";
import { describe, it, beforeEach, expect, vi } from "vitest";

import { LIGHTBOX_EVENT, LightboxEvent } from "../../services/lightbox-event.service";
import { LightboxOverlayComponent } from "./lightbox-overlay.component";

describe("[ Unit - LightboxOverlayComponent ] (zoneless)", () => {
  let fixture: ComponentFixture<LightboxOverlayComponent>;
  let lightboxEvent: LightboxEvent;
  let mockData: any;

  beforeEach(() => {
    mockData = {
      options: {
        fadeDuration: 1,
      },
    };
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightboxOverlayComponent],
      providers: [LightboxEvent],
    }).compileComponents();

    fixture = TestBed.createComponent(LightboxOverlayComponent);

    fixture.componentInstance.options.set(mockData.options);
    // @ts-expect-error test mock
    fixture.componentInstance.cmpRef.set({ destroy: vi.fn() });

    fixture.detectChanges();

    lightboxEvent = TestBed.inject(LightboxEvent);
  });

  it("should init the component with correct styling", () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.className).toContain(
      "lightboxOverlay animation fadeInOverlay"
    );

    expect(element.getAttribute("style")).toMatch(
      new RegExp(`animation.*${mockData.options.fadeDuration}s`)
    );
  });

//   describe("{ method: close }", () => {
//     it("should self destroy and broadcast event when component is closed", async () => {
//       vi.useFakeTimers();

//       const spy = vi.spyOn(lightboxEvent, "broadcastLightboxEvent");

//       fixture.componentInstance.close();
//       fixture.detectChanges();

//       expect(spy).toHaveBeenCalledWith({
//         id: LIGHTBOX_EVENT.CLOSE,
//         data: null,
//       });

//       // fade-out class applied immediately
//       expect(fixture.nativeElement.className).toContain(
//         "lightboxOverlay animation fadeOutOverlay"
//       );

//       // advance animation timeout
//       vi.advanceTimersByTime(mockData.options.fadeDuration * 1000 + 1);

//       expect(
//         fixture.componentInstance.cmpRef()?.destroy
//       ).toHaveBeenCalledTimes(1);

//       vi.useRealTimers();
//     });
//   });

  describe("{ method: ngOnDestroy }", () => {
    it("should unsubscribe event when destroy is called", () => {
      const unsubscribeSpy = vi
        .spyOn(fixture.componentInstance["_subscription"], "unsubscribe")
        .mockImplementation(() => {});

      fixture.componentInstance.ngOnDestroy();

      expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
    });
  });
});
