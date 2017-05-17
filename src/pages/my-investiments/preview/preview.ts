import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

import { Investiment } from '../../../model/investiment';

@Component({
  selector: 'modal-preview-investiment',
  templateUrl: 'preview.html'
})
export class PreviewInvestimentModal {
  investiment: Investiment;

  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
    this.investiment = navParams.get('investiment');
  }

  close() {
    this.viewCtrl.dismiss();
  }
}