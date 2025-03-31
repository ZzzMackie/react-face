import { ViewHelper as ViewHelperBase } from 'three/examples/jsm/helpers/ViewHelper.js';
class ViewHelper extends ViewHelperBase {
  constructor(camera, containerDom, viewHelperDom) {
    super(camera, containerDom);
    viewHelperDom.addEventListener('pointerup', event => {
      event.stopPropagation();

      this.handleClick(event);
    });

    viewHelperDom.addEventListener('pointerdown', function (event) {
      event.stopPropagation();
    });
  }
  setViewHelperVisible(value) {
    this.visible = value;
  }
}

export { ViewHelper };
