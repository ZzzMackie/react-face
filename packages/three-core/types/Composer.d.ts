 

import { ThreeEngine } from "../main";

declare class Composer {
  threeEngine: ThreeEngine;
  composer: null;
  constructor(threeEngine: ThreeEngine);

  initComposer(): void;

  render(): void;
}
