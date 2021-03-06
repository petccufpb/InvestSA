import { Investiment } from './../model/investiment';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
// import * as firebase from 'firebase/app';
import firebase from 'firebase';
import { Credential } from '../model/credential';
import { User } from '../model/user';

import { Facebook } from '@ionic-native/facebook';

@Injectable()
export class FirebaseService {

  users:AngularFireList<any>;
  usersRef: any;
  userProfile: any = null;

  constructor(public afAuth: AngularFireAuth,
              public db: AngularFireDatabase, private fb: Facebook) {      
      this.users = db.list('/users');
      this.usersRef = this.db.database.ref('/users');
  }

  loginWithCredential(credential:Credential, isSuccess){
    this.afAuth.auth.signInWithEmailAndPassword(credential.email, credential.password)
      .then(result => {
        isSuccess(true, result);
      })
      .catch(error => {
        isSuccess(false, error);
      });
  }

  loginWithFacebook(isSuccess): void{

    this.fb.login(['public_profile', 'email']).then( (response) => {
        const facebookCredential = firebase.auth.FacebookAuthProvider
            .credential(response.authResponse.accessToken);

        firebase.auth().signInWithCredential(facebookCredential)
        .then((success) => {
            console.log("Firebase success: " + JSON.stringify(success));
            this.userProfile = success;
            isSuccess(true, success);

            //Criar user no DB            
            this.usersRef.once('value')
              .then(snap => {
                let exists = false;
                snap.forEach(childSnap => {
                  if (childSnap.val().email === success.email) {
                    exists = true;
                    isSuccess(true, success);
                    return true;
                  } //Usuario ja cadastrado
                });
                if (!exists) {
                  let newUserKey = this.usersRef.push().key;
                  let u = {
                    email: success.email,
                    name: success.displayName,
                    authUid: success.uid,
                    uid: newUserKey
                  };
                  //Salva novo usuario
                  this.usersRef.child(newUserKey).update(u)
                    .then(() => {
                      isSuccess(true, success);
                    })
                    .catch(e => isSuccess(false, e));
                }
              });
        })
        .catch((error) => {
            console.log("Firebase failure: " + JSON.stringify(error));
            isSuccess(false, error);
        });

    }).catch((error) => { console.log(error); isSuccess(false, error); });

  }

  createUserWithCredential(user:User, credential:Credential, isSuccess){
    this.afAuth.auth.createUserWithEmailAndPassword(credential.email, credential.password)
      .then(result => {
        //sucesso! Registrar usuario no RealTimeDB
        console.log("User registered: "+user);
        this.users.push(user);
        isSuccess(true, result);
      })
      .catch(error => {
        isSuccess(false, error);
      });
  }

  logout(isSuccess){
    this.afAuth.auth.signOut()
      .then(isSuccess(true))
      .catch(error => {isSuccess(false, error)});
  }

  getCurrentUser(){
    return this.afAuth.auth.currentUser;
  }

  /////////// My Investiments
  saveMyInvestiments(investiment: Investiment, isSuccess) {
    this.usersRef.once('value')
              .then(snap => {
                snap.forEach(childSnap => {
                  if (childSnap.val().email === this.getCurrentUser().email) {                    
                    // usuario atual
                    let currentUserUid = childSnap.getRef().path.pieces_[1];

                    let investimentId = this.db.database.ref().push().key
                    investiment._id = investimentId                     

                    this.db.database.ref('users/' + currentUserUid + '/my_investiments')
                    .child(investimentId).set(investiment)
                        .then( isSuccess(true) )
                        .catch( error => isSuccess(false, error));
                    return true;
                  }
                });
              });
  }
  
  getMyInvestiments(ret) {

    let myInvestiments = [];
    this.usersRef.once('value')
      .then(snap => {
        snap.forEach(childSnap => {
          if (childSnap.val().email === this.getCurrentUser().email) {                    
            // usuario atual
            let currentUserUid = childSnap.getRef().path.pieces_[1];
            this.db.database.ref('users/'+currentUserUid+'/my_investiments')
              .once('value').then(snap => {
                snap.forEach(childSnap => {
                  myInvestiments.push(childSnap.val());
                });
                ret(myInvestiments);
              });
            return true;
          }
        });
      });      
  }

  removeMyInvestiment(investiment: Investiment, isSuccess) {
    this.usersRef.once('value')
    .then(snap => {
      snap.forEach(childSnap => {
        if (childSnap.val().email === this.getCurrentUser().email) {                    
          // usuario atual
          let currentUserUid = childSnap.getRef().path.pieces_[1];
          this.db.database.ref('users/' + currentUserUid + '/my_investiments/' + investiment._id)
            .remove()
              .then( isSuccess(true) )
              .catch( error => isSuccess(false, error));
          return true;
        }
      });
    });
  }
    
}
