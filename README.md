# Ngx-Lightbox

<img width="100px" src="./demo/img/ngx-lightbox-logo.svg">

A [lightbox2](https://github.com/lokesh/lightbox2) implementation port to use with Angular >= 18 (zoneless)  

## Installation

`npm install @jjmhalew/ngx-lightbox`  
`20.X.X` is for Angular 20  
`19.X.X` is for Angular 19  
`18.X.X` is for Angular 18  

Update your `angular.json`

```
{
  "styles": [
    "./node_modules/@jjmhalew/ngx-lightbox/lib/styles/lightbox.scss",
    ...
  ],
}
```

## Usage

### Module:

Import `LightboxModule` from `@jjmhalew/ngx-lightbox` in your `NgModule` or `Component`

```javascript
import { LightboxModule } from '@jjmhalew/ngx-lightbox';

@NgModule({
  imports: [ LightboxModule ]
})
```

### Component

1. Markup

```html
@for (image of albums(); track $index) {
  <div>
    <img [src]="image.thumb" (click)="open($index)" />
  </div>
}
```

2. Component method

```javascript
import { Lightbox } from '@jjmhalew/ngx-lightbox';

export class AppComponent {
  private _album: IAlbum[] = [];
  constructor(private _lightbox: Lightbox) {
    for (let i = 1; i <= 4; i++) {
      const src = 'demo/img/image' + i + '.jpg';
      const caption = 'Image ' + i + ' caption here';
      const thumb = 'demo/img/image' + i + '-thumb.jpg';
      const album = {
         src: src,
         caption: caption,
         thumb: thumb
      };

      this._albums.push(album);
    }
  }

  open(index: number): void {
    // open lightbox
    this._lightbox.open(this._albums, index);
  }

  close(): void {
    // close lightbox programmatically
    this._lightbox.close();
  }
}

```

Each `object` of `album` array inside your component may contains 3 properties :

| Properties | Requirement | Description                                                                                                        |
| ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| src        | Required    | The source image to your thumbnail that you want to with use lightbox when user click on `thumbnail` image         |
| caption    | Optional    | Your caption corresponding with your image                                                                         |
| thumb      | Optional    | Source of your thumbnail. It is being used inside your component markup so this properties depends on your naming. |

3. Listen to lightbox event

You can listen to 3 events, which are either **CHANGE_PAGE**, **CLOSE** or **OPEN**.

```javascript
import { LightboxEvent, LIGHTBOX_EVENT } from '@jjmhalew/ngx-lightbox';
import { Subscription } from 'rxjs';

export class AppComponent {
  private _subscription: Subscription;

  constructor(private _lightboxEvent: LightboxEvent) {}

  public open(index: number): void {
    // register your subscription and callback whe open lightbox is fired
    this._subscription = this._lightboxEvent.lightboxEvent$
      .subscribe(event => this._onReceivedEvent(event));
  }

  private _onReceivedEvent(event: any): void {
    // remember to unsubscribe the event when lightbox is closed
    if (event.id === LIGHTBOX_EVENT.CLOSE) {
      // event CLOSED is fired
      this._subscription.unsubscribe();
    }

    if (event.id === LIGHTBOX_EVENT.OPEN) {
      // event OPEN is fired
    }

    if (event.id === LIGHTBOX_EVENT.CHANGE_PAGE) {
      // event change page is fired
      console.log(event.data); // -> image index that lightbox is switched to
    }
  }
}
```

## Lightbox options

Available options based on lightbox2 options

| Properties                  | Default          | Description                                                                                                                                                                                                                                 |
| --------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fadeDuration                | **0.7** seconds  | _duration_ starting when the **src** image is **loaded** to **fully appear** onto screen.                                                                                                                                                   |
| resizeDuration              | **0.5** seconds  | _duration_ starting when Lightbox container **change** its dimension from a _default/previous image_ to the _current image_ when the _current image_ is **loaded**.                                                                         |
| fitImageInViewPort          | **true**         | Determine whether lightbox will use the natural image _width/height_ or change the image _width/height_ to fit the view of current window. Change this option to **true** to prevent problem when image too big compare to browser windows. |
| positionFromTop             | **20** px        | The position of lightbox from the top of window browser                                                                                                                                                                                     |
| showImageNumberLabel        | **false**        | Determine whether to show the image number to user. The default text shown is `Image IMAGE_NUMBER of ALBUM_LENGTH`                                                                                                                          |
| alwaysShowNavOnTouchDevices | **false**        | Determine whether to show `left/right` arrow to user on Touch devices.                                                                                                                                                                      |
| wrapAround                  | **false**        | Determine whether to move to the start of the album when user reaches the end of album and vice versa. Set it to **true** to enable this feature.                                                                                           |
| disableKeyboardNav          | **false**        | Determine whether to disable navigation using keyboard event.                                                                                                                                                                               |
| disableScrolling            | **false**        | If **true**, prevent the page from scrolling while Lightbox is open. This works by settings overflow hidden on the body.                                                                                                                    |
| centerVertically            | **false**        | If **true**, images will be centered vertically to the screen.                                                                                                                                                                              |
| albumLabel                  | "Image %1 of %2" | The text displayed below the caption when viewing an image set. The default text shows the current image number and the total number of images in the set.                                                                                  |
| enableTransition            | **true**         | Transition animation between images will be disabled if this flag set to **false**                                                                                                                                                          |
| showZoom            | **false**         | Zoom Buttons will be shown if this flag set to **true**                                                                                                                                                          |
| showRotate            | **false**         | Rotate Buttons will be shown if this flag set to **true**                                                                                                                                                                                                    |
| showDownloadButton  | **false**         | Download button will be shown if this flag set to **true**    |
| showDownloadExtButton  | **false**         | Download button will be shown if this flag set to **true** and the download should be handled when the event LIGHTBOX_EVENT.DOWNLOAD is received    |
| containerElementResolver | () => document.body | Resolves the element that will contain the lightbox | 


**NOTE**: You can either override default config or during a specific opening window

1. Override default config

```javascript
import { LightboxConfig } from '@jjmhalew/ngx-lightbox';

export class AppComponent {
  constructor(private _lightboxConfig: LightboxConfig) {
    // override default config
    _lightboxConfig.fadeDuration = 1;
  }
}
```

2. Set config in a specific opening window

```javascript
import { LightboxConfig, Lightbox } from '@jjmhalew/ngx-lightbox';

export class AppComponent {
  constructor(private _lightboxConfig: LightboxConfig, private _lightbox: Lightbox) {}
  public open(index: number): void {
    // override the default config on second parameter
    this._lightbox.open(this._albums, index, { wrapAround: true, showImageNumberLabel: true });
  }
}
```

### Overriding lightbox parent elements

If you want to use any other parent element than your `<body>`, please override the `containerElementResolver` property of your `LightboxConfig`.
This can be used, e.g. if you are opening the lightbox from within a Shadow DOM based web component.

```js
export class MyLightBoxTrigger {
  constructor(
    private _lightbox: Lightbox,
    private _lighboxConfig: LightboxConfig,
  ) {
    _lighboxConfig.containerElementResolver = (doc: Document) => doc.getElementById('my-lightbox-host');
  }

  public open(index: number): void {
    this._lightbox.open(this.images, index); // will put the lightbox child into e.g. <div id="my-lightbox-host"></div>
  }
}
```

## Angular Universal

This project works with universal out of the box with no additional configuration.

## License

MIT


