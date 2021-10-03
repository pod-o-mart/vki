# vki: Virtual Keyboard Interface
[*GreyWywern's* Virtual Keyboard Interface](http://www.greywyvern.com/code/javascript/keyboard) improved and extended 

## Improvements and updates
The new version in the root folder has additionally keyboards for Amharic, Tigrinya, Glagolitic, Old Church Slavonic, Crimean Tatar and Turkmen.

Bulgarian, Serbian, Chinese (Pinyin), Turkish Q, Ukrainian and Russian have been updated.

Russian has been extended with old characters and an own meta key (on Ѣ instead of AltGr).

Folder `1.49` contains the latest original files from [GreyWyvern](http://www.greywyvern.com/code/javascript/keyboard).

### CDN
```
<script src="https://cdn.jsdelivr.net/gh/pod-o-mart/vki/keyboard.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/pod-o-mart/vki/keyboard.css"/>
```

## Mobile usage (experimental)
The optional file `keyboard-touch.js` prevents touch keyboards on mobile devices from opening, so the virtual keyboard will be used. `keyboard-touch.css` is the according stylesheet, making the keyboard mobile friendly.

In order to make the mobile script work, add the declaration
`data-disable-touch-keyboard=""` to your input field or textarea, e.g. `<input data-disable-touch-keyboard="" id="example" name="example">`.
 The mobile function also needs [JQUERY](https://jquery.com/) and [modernizr.js](https://modernizr.com/) embedded on the website.
 
 ### CDN for mobile usage (optional)
 ```
<script src="https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/pod-o-mart/vki/keyboard-touch.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/pod-o-mart/vki/keyboard-touch.css"/>
```
 
 ## Bookmarklet
 There is a [ready-to-use bookmarklet](https://github.com/pod-o-mart/keyboardBookmarklets) available.

Credits
-------

[*GreyWyvern*](http://www.greywyvern.com/code/javascript/keyboard)
