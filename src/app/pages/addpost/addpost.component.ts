import { Component, OnInit} from '@angular/core';
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
//services
import { AuthService } from "../../services/auth.service";

//angular form
import { NgForm } from "@angular/forms";

import { finalize } from "rxjs/operators";
//firebase
import { AngularFireStorage } from "@angular/fire/storage";
import { AngularFireDatabase } from "@angular/fire/database";

//browser image resizer
import { readAndCompressImage } from "browser-image-resizer";
import { imageconfig } from "../../../utils/config";
import { v4 as uuid } from "uuid";
@Component({
  selector: 'app-addpost',
  templateUrl: './addpost.component.html',
  styleUrls: ['./addpost.component.css']
})
export class AddpostComponent implements OnInit {
  locationName: string;
  description: string;
  picture: string = null;

  user = null;
  uploadPercent: number = null;
  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private toastr: ToastrService,
    private auth: AuthService,
    private router: Router,
  ) {
    auth.getUser().subscribe((user) =>{
      this.db.object(`/users/${user.uid}`)
      .valueChanges()
      .subscribe((user)=>{
        this.user = user;
      });
    })
   }


  ngOnInit(): void {
  }

  onSubmit(){
    const uid = uuid()

    this.db.object(`/posts/${uid}`)
    .set({
      id: uid,
      locationName: this.locationName,
      description: this.description,
      picture: this.picture,
      by: this.user.name,
      instaId: this.user.instaUserName,
      date: Date.now()
    })
    .then(()=>{
      this.toastr.success("Post added successfully");
      this.router.navigateByUrl["/"]
    })
    .catch((err) =>{
      this.toastr.error("error")
    });
  };

  async uploadFile(event){
    const file = event.target.files[0];
     let resizedImage = await readAndCompressImage(file, imageconfig)
     const filePath = file.name;
     const fileRef = this.storage.ref(filePath);
     const task = this.storage.upload(filePath, resizedImage);
     task.percentageChanges().subscribe((percentage)=>{
       this.uploadPercent = percentage
     })
     task.snapshotChanges().pipe(
       finalize(()=>{
         fileRef.getDownloadURL().subscribe((url) =>{
           this.picture = url;
           this.toastr.success("image upload sucess")
         })
       })
     ).subscribe()

  }

}
