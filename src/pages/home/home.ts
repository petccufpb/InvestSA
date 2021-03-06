import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GraphMaker } from '../../util/graph-maker'

import { FirebaseService } from '../../providers/firebase-service';

@Component({
  selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage implements AfterViewInit {
	@ViewChild('barCanvas') barCanvas;
	barChart: any;
	labels : any;
	label : String;
	data : any;
	ano: string;
	dateHora: string;
  dateMinutos: string;
  dateSegundos: string;


	constructor(public navCtrl: NavController, public firebaseService: FirebaseService) {
		let date = new Date();
    this.dateHora = date.getHours().toString();
    this.dateMinutos = date.getMinutes().toString();
		this.dateSegundos = date.getSeconds().toString();
	
    if(date.getSeconds() < 10) {
      this.dateSegundos = '0' + this.dateSegundos;
    }
    if(date.getMinutes() < 10) {
      this.dateMinutos = '0' + this.dateMinutos;
    }
    if(date.getHours() < 10) {
      this.dateHora = '0' + this.dateHora;
		}
		this.ano = "2017";
		
	}

	ionViewDidLoad(){}

	ngAfterViewInit(){
		this.labels = ["Selic", "CDI", "CDB", "Renda Fixa", "LCA/LCI", "Prefixado"];
		this.label = "Porcentagem";
		this.data = [2.77, 3.75, 2.12, -1.69, 2.60, 0.46];

		this.barChart = new GraphMaker(this.labels, this.label, this.data).makeBarGraph(this.barCanvas);

		this.firebaseService.getCurrentUser().providerData.forEach(function(profile){
			console.log("  Sign-in provider: "+profile.providerId);
			console.log("  Provider-specific UID: "+profile.uid);
			console.log("  Name: "+profile.displayName);
			console.log("  Email: "+profile.email);
			console.log("  Photo URL: "+profile.photoURL);
		});
	}


}
